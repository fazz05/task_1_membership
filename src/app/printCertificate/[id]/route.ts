import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getUser } from '@/app/(app)/(authenticated)/_actions/getUsers';
import * as ejs from 'ejs';
import type { Course, Participation } from '@/payload-types';
import { countLearnables } from '@/app/(app)/(authenticated)/dashboard/participation/[participationId]/_actions/learnables';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// helper: Buffer -> ArrayBuffer (aman untuk Response body)
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
  return ab;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }   // ⬅️ Next 15: params adalah Promise
) {
  let browser: import('playwright').Browser | null = null;

  try {
    const { id } = await ctx.params;          // ⬅️ wajib di-await

    // --- Auth
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // --- Ambil participation + course (fresh)
    const payload = await getPayload({ config });
    const reqHeaders = Object.fromEntries(new Headers(req.headers).entries());

    const doc = (await payload.findByID({
      collection: 'participation',
      id,
      depth: 1,
      overrideAccess: true,                    // ⬅️ bypass ACL, validasi owner manual
      req: { headers: reqHeaders as any },
    })) as Participation;

    if (!doc) {
      return NextResponse.json({ message: 'Participation not found' }, { status: 404 });
    }

    // --- Validasi owner
    const ownerId = typeof doc.customer === 'string' ? doc.customer : (doc.customer as any)?.id;
    if (ownerId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const course = doc.course as Course | undefined;
    if (!course) {
      return NextResponse.json({ message: 'Course missing' }, { status: 400 });
    }

    // --- Pastikan ada blok certificate/finish di akhir (opsional tapi bagus)
    const last = Array.isArray(course.curriculum) ? course.curriculum.at(-1) : undefined;
    const lastType = (last as any)?.blockType ?? (last as any)?.type;
    if (lastType !== 'finish' && lastType !== 'certificate') {
      return NextResponse.json({ message: 'No certificate block' }, { status: 400 });
    }
    if (!('template' in (last as any)) || !(last as any).template) {
      return NextResponse.json({ message: 'Template missing' }, { status: 400 });
    }

    // --- Gating: progress >= total learnable (exclude certificate)
    const totalLearnable = countLearnables(course);
    const progress = typeof doc.progress === 'number' ? doc.progress : 0;
    if (progress < totalLearnable) {
      return NextResponse.json({ message: 'Course not finished' }, { status: 400 });
    }

    // --- Render HTML dengan EJS
    const htmlRaw = ejs.render((last as any).template, {
      name: user.email,
      courseTitle: course.title,
      date: new Date(doc.updatedAt as any).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      issuer: 'All About Payload',
    });

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>@page{size:A4;margin:18mm} html,body{height:100%}</style>
  <title>Certificate</title>
</head>
<body>${htmlRaw}</body>
</html>`;

    // --- Generate PDF via Playwright
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'screen' });

    const pdfBuffer: Buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: false,
    });

    // --- Response PDF
    const fileTitle = String(course.title ?? 'Course').replace(/[\\/:*?"<>|]/g, '-');
    return new NextResponse(bufferToArrayBuffer(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${fileTitle}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error('generate-pdf error:', e);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(e?.message ?? e) },
      { status: 500 }
    );
  } finally {
    try { await browser?.close(); } catch {}
  }
}
