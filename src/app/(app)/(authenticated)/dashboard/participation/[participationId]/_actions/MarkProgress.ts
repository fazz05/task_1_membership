'use server'

import { headers } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUser } from '@/app/(app)/(authenticated)/_actions/getUsers'
import { countLearnables } from './learnables'

type Input = string | { id?: string; mode?: 'bump' | 'complete' }

export async function markProgress(input: Input) {
  const participationId = typeof input === 'string' ? input : input?.id
  const mode = typeof input === 'string' ? 'bump' : (input?.mode ?? 'bump')
  if (!participationId) return null

  const payload = await getPayload({ config })
  const h = await headers()
  const reqHeaders = Object.fromEntries(h.entries())
  const user = await getUser()
  if (!user?.id) return null

  const doc = await payload.findByID({
    collection: 'participation',
    id: participationId,
    depth: 1,
    overrideAccess: true,
  })

  const ownerId = typeof doc.customer === 'string' ? doc.customer : (doc.customer as any)?.id
  if (ownerId !== user.id) return null

  const total = countLearnables(doc.course)
  const current = typeof doc.progress === 'number' ? doc.progress : 0
  const next = mode === 'complete' ? total : Math.min(current + 1, total)

  if (next !== current) {
    await payload.update({
      collection: 'participation',
      id: participationId,
      data: { progress: next },
      overrideAccess: true,
      req: { headers: reqHeaders as any },
    })
  }

  revalidateTag(`participation:${ownerId}`)
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/participation/${participationId}`)

  return { progress: next }
}
