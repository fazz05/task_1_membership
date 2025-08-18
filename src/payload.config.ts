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

import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'   
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
const reqTrim = (k: string) => req(k).trim() // hindari spasi di ENV (khususnya SMTP_PASS)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  // penting untuk generate link reset /admin/reset/:token yang benar
  serverURL: req('PAYLOAD_PUBLIC_SERVER_URL'),

  // === EMAIL via Nodemailer (Gmail App Password) ===
    email: nodemailerAdapter({
    defaultFromAddress: req('SMTP_FROM_EMAIL'),
    defaultFromName: req('SMTP_FROM_NAME'),
    transportOptions: {
      host: req('SMTP_HOST'),
      port: Number(req('SMTP_PORT')),              // 465 untuk SMTPS
      secure: Number(req('SMTP_PORT')) === 465,    // true jika 465
      auth: {
        user: req('SMTP_USER'),
        pass: reqTrim('SMTP_PASS'),                // trim untuk hindari spasi
      },
    },
  }),


  collections: [Users, Media, Customers, Courses, Participations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  sharp,

  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: { media: true },
      bucket: req('PAYLOAD_S3_BUCKET'),
      config: {
        endpoint: req('PAYLOAD_S3_ENDPOINT'),
        region: req('PAYLOAD_S3_REGION'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: req('PAYLOAD_S3_ACCESS_KEY'),
          secretAccessKey: req('PAYLOAD_S3_SECRET_KEY'),
        },
      },
    }),
  ],
})
