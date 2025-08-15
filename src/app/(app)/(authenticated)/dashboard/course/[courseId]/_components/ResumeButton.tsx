import { Course, Participation } from "@/payload-types";
import Link from "next/link";
import { HiPlay } from "react-icons/hi";

export default function ResumeButton({ participation }: { participation: Participation }) {
  const course = participation.course as Course;
  const total = course?.curriculum?.length ?? 0;

  // Asumsi: progress = jumlah modul selesai (0..total).
  const completed = Math.max(0, Math.min(total, participation.progress ?? 0));
  const percent = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <Link
      href={`/dashboard/participation/${participation.id}`}
      className="group relative block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 
                 text-white transition-colors hover:bg-white/[0.08] focus:outline-none 
                 focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold">{course.title}</p>

        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-500 
                     transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          <HiPlay className="h-5 w-5" />
        </span>
      </div>

      {/* progress */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-teal-400"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
