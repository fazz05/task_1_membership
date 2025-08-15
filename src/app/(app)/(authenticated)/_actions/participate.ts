'use server'

import { getUser } from '@/app/(app)/(authenticated)/_actions/getUsers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Participation } from '@/payload-types'

const COLLECTION = 'participation'

export async function participate({ courseId }: { courseId: string }) {
  if (!courseId) throw new Error('courseId is required')

  const payload = await getPayload({ config: configPromise })
  const user = await getUser()
  if (!user?.id) throw new Error('Unauthenticated')

  // Cek duplikasi (customer+course)
  const existing = await payload.find({
    collection: COLLECTION,
    limit: 1,
    where: {
      and: [
        { course:   { equals: courseId } },
        { customer: { equals: user.id } },
      ],
    },
    overrideAccess: false,
    user,
  })
  if (existing.docs[0]) return existing.docs[0] as Participation

  // Create baru
  const created = await payload.create({
    collection: COLLECTION,
    data: {
      course: courseId,
      customer: user.id,
      progress: 0,
    },
    overrideAccess: false,
    user,
  })

  return created as Participation
}
