import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../(app)/(authenticated)/_actions/getUsers'
import * as ejs from 'ejs'                           // <-- aman tanpa esModuleInterop
import type { Course, Participation } from '@/payload-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Helper: Buffer -> ArrayBuffer murni (bukan SharedArrayBuffer)
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength)
  new Uint8Array(ab).set(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength))
  return ab
}

export const GET = async (
  _req: NextRequest,
  { params }: { params: { id: string } }      // <-- langsung object, bukan Promise
) => {
  let browser: import('playwright').Browser | null = null

  try {
    const participationId = params.id

    // Auth + data
    const user = await getUser()
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = await getPayload({ config: configPromise })
    const participation = (await payload.findByID({
      collection: 'participation',
      id: participationId,
      overrideAccess: false,
      user,
    })) as Participation | null

    if (!participation) {
      return NextResponse.json({ message: 'Participation not found' }, { status: 404 })
    }

    const course = participation.course as Course
    const last = course.curriculum.at(-1)
    if (last?.blockType !== 'finish') {
      return NextResponse.json({ message: 'No certificate' }, { status: 400 })
    }
    if (!('template' in last) || !last.template) {
      return NextResponse.json({ message: 'Template missing' }, { status: 400 })
    }
    if (participation.progress !== course.curriculum.length - 1) {
      return NextResponse.json({ message: 'Course not finished' }, { status: 400 })
    }

    // Render HTML (pastikan template sudah pakai tag EJS: <%= name %> dst)
    const htmlRaw = ejs.render(last.template, {
      name: user.email,
      courseTitle: course.title,
      date: new Date(participation.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      issuer: 'All About Payload',
    })

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
</html>`

    // Generate PDF via Playwright
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'screen' })

    const pdfBuffer: Buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: false,
    })

    const body = bufferToArrayBuffer(pdfBuffer)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${course.title}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    console.error('generate-pdf error:', e)
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(e?.message ?? e) },
      { status: 500 }
    )
  } finally {
    try { await browser?.close() } catch {}
  }
}
