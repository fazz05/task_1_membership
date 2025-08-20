// src/app/(app)/(authenticated)/dashboard/components/ResumeButton.tsx
import type { Course, Participation } from '@/payload-types'
import Link from 'next/link'
import { HiPlay } from 'react-icons/hi'
import { countLearnables } from '../../../participation/[participationId]/_actions/learnables'

type Props = { participation: Participation }

export default function ResumeButton({ participation }: Props) {
  const course = participation.course as Course | undefined

  const totalLearnable = countLearnables(course)
  const completedRaw = typeof participation.progress === 'number' ? participation.progress : 0
  const completed = Math.max(0, Math.min(totalLearnable, completedRaw))

  const percent = totalLearnable === 0 ? 100 : Math.round((completed / totalLearnable) * 100)

  return (
    <Link
      href={`/dashboard/participation/${participation.id}`}
      className="group relative block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3
                 text-white transition-colors hover:bg-white/[0.08] focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold">{course?.title ?? 'Untitled course'}</p>

        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-500
                     transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          <HiPlay className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Course progress"
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"
        >
          <div className="h-full rounded-full bg-teal-400" style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-1 text-xs text-white/60">
          {totalLearnable > 0 ? `${completed}/${totalLearnable} • ${percent}%` : '0/0 • 100%'}
        </div>
      </div>
    </Link>
  )
}
