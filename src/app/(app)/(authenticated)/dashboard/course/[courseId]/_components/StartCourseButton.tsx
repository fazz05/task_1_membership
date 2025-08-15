'use client'

import { participate } from '@/app/(app)/(authenticated)/_actions/participate'
import type { Participation } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { useState, type MouseEvent } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { HiExclamationCircle, HiPlay } from 'react-icons/hi'

type Props = {
  courseId: string
  onStarted?: () => void
}

export default function StartCourseButton({ courseId, onStarted }: Props) {
  const router = useRouter(); // <-- WAJIB PAKAI KURUNG

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleStartCourse(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setError(null)

    try {
      const participation = (await participate({ courseId })) as Participation | null
      if (!participation?.id) throw new Error('Failed to create participation')

      onStarted?.()
      router.push(`/dashboard/participation/${participation.id}`)
      // router.refresh() // kalau halaman target baca data server & perlu refresh
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to start course. Please try again.')
    }
  }

  const isLoading = status === 'loading'
  const isError = status === 'error'

  return (
    <div className="mt-6">
      <button
        onClick={handleStartCourse}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        className={[
          'relative inline-flex items-center gap-2 px-6 py-3 font-semibold rounded transition duration-300 ease-in-out',
          isError ? 'bg-red-600 text-white' : 'bg-teal-500 text-white hover:bg-teal-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'pl-9',
        ].join(' ')}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <AiOutlineLoading className="animate-spin text-xl" />
          ) : isError ? (
            <HiExclamationCircle className="text-xl" />
          ) : (
            <HiPlay className="text-xl" />
          )}
        </span>
        <span>Start Course</span>
      </button>

      {isError && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <HiExclamationCircle className="text-lg" />
          {error ?? 'Something went wrong.'}
        </p>
      )}
    </div>
  )
}
