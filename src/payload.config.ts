// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { s3Storage} from '@payloadcms/storage-s3'
import brevoAdapter from './utils/brevoAdapter'
import { Customers } from './collections/Customers'
import { Courses } from './collections/courses/Courses'
import Participations from './collections/courses/Participations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const req = (k: string) => {
  const v = process.env[k]
  if (!v) throw new Error(`Missing env ${k}`)
  return v
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: brevoAdapter(),
  collections: [Users, Media, Customers, Courses, Participations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: { media: true }, // pastikan slug koleksi = 'media' (lowercase)
      bucket: req('PAYLOAD_S3_BUCKET'),
      config: {
        endpoint: req('PAYLOAD_S3_ENDPOINT'), // http://127.0.0.1:9000
        region: req('PAYLOAD_S3_REGION'),     // us-east-1 (dummy utk MinIO)
        forcePathStyle: true,                 // wajib utk MinIO
        credentials: {
          accessKeyId: req('PAYLOAD_S3_ACCESS_KEY'),
          secretAccessKey: req('PAYLOAD_S3_SECRET_KEY'),
        },
      },
      // optional: baseUrl: 'http://127.0.0.1:9000/lms-fazaa',
    }),
  ],
})  