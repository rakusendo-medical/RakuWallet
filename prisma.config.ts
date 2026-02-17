import { defineConfig } from 'prisma/config'

const baseUrl = process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

// Turso クラウド接続時は URL に authToken を付与する
const url = (authToken && baseUrl.startsWith('libsql://'))
  ? `${baseUrl}?authToken=${authToken}`
  : baseUrl;

export default defineConfig({
  datasource: { url },
})
