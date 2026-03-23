import mongoose from 'mongoose'

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')
    cached.promise = mongoose.connect(uri, { dbName: 'smartbank' })
  }
  cached.conn = await cached.promise
  return cached.conn
}
