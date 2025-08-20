'use client'

import type { Course, Participation } from '@/payload-types'
import { useEffect, useState } from 'react'
import NextButton from './NextButton'
import axios from 'axios'
import { markProgress } from '../_actions/MarkProgress'

export default function FinishModule({ participation }: { participation: Participation }) {
  const [loading, setLoading] = useState(false)
  const participationId = String(participation.id)

  useEffect(() => {
    void markProgress({ id: participationId, mode: 'complete' })
  }, [participationId])

  async function handleDownload() {
    setLoading(true)
    try {
      const course = participation.course as Course

      const res = await axios.get(`/printCertificate/${participationId}`, {
        responseType: 'blob',
        validateStatus: () => true,
      })

      if (res.status !== 200) {
        const msg = await new Response(res.data).text().catch(() => '')
        alert(msg || `Download failed (${res.status})`)
        return
      }

      const blob: Blob = res.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const title = (course?.title ?? 'Course').replace(/[\\/:*?"<>|]/g, '-')
      a.download = `Certificate-${title}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Unexpected error while downloading certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Congratulations!</h1>
      <p className="text-gray-400">You Have Complete the course.</p>
      <NextButton loading={loading} text="Download Certificate" onClick={handleDownload} />
    </div>
  )
}
