import type { CollectionConfig } from 'payload'

export const Participations: CollectionConfig = {
  slug: 'participation',
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      return { customer: { equals: req.user?.id } }
    },
    create: ({ req, data }) => {
      if (req.user?.collection === 'users') return true
      return data?.customer === req.user?.id
    },
    update: ({ req }) => {
      if (req.user?.collection === 'users') return true
      return { customer: { equals: req.user?.id } }
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, index: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
    },
    { name: 'progress', type: 'number', defaultValue: 0, min: 0, max: 100 },
  ],
}

export default Participations
