// src/collections/Participations.ts
import type { CollectionConfig } from 'payload'

export const Participations: CollectionConfig = {
  slug: 'participation',
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => ({ customer: { equals: req.user?.id } }),
    create: ({ req }) => !!req.user,
    update: ({ req }) => ({ customer: { equals: req.user?.id } }),
    delete: ({ req }) => ({ customer: { equals: req.user?.id } }),
  },
  fields: [
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users', // <-- ganti dari 'customers' ke 'users'
      required: true,
      index: true,
    },
    {
      name: 'progress',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
  ],
}

export default Participations
