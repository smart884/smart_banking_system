import { getAuthTokenFromHeader, getTokenFromCookies, verifyToken } from './auth'
import { getAllUsers } from './fsdb'

export async function getAuthContext(req: Request) {
  const headerToken = getAuthTokenFromHeader(req)
  const cookieToken = !headerToken ? getTokenFromCookies() : null
  const token = headerToken || cookieToken
  if (!token) return null
  try {
    const payload = verifyToken(token)
    const users = await getAllUsers()
    const user = users.find(u => u.id === payload.sub)
    if (!user) return null
    const { password, ...publicUser } = user as any
    return { payload, user: publicUser }
  } catch {
    return null
  }
}
