import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
const SECRET = 'smartbank-dev-secret'

export type JWTPayload = {
  sub: string
  role: 'customer' | 'clerk' | 'manager' | 'admin'
  email: string
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as JWTPayload
}

export function getAuthTokenFromHeader(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7)
  }
  return null
}

export function getTokenFromCookies() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb_token')?.value || null
  return token
}

export function requireRole(payload: JWTPayload, roles: JWTPayload['role'][]) {
  if (!roles.includes(payload.role)) {
    const e = new Error('Forbidden') as any
    e.status = 403
    throw e
  }
}
