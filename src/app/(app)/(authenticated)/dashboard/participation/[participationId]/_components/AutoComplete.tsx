'use client'

import { useEffect, useTransition } from 'react'
import { markProgress } from '../_actions/MarkProgress'

export default function AutoComplete({ id }: { id: string }) {
  const [, start] = useTransition()

  useEffect(() => {
    start(() => {
      void markProgress({ id, mode: 'complete' })
    })
  }, [id, start])

  return null
}
