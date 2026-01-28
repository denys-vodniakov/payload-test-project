import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

interface JWTPayload {
  userId: string | number
  email: string
}

async function getUserFromRequest(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  // Try Authorization header first
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.userId,
      })
      return { user, payload }
    } catch (error) {
      // Token invalid, try cookie
    }
  }

  // Try Payload cookie
  const payloadToken = request.cookies.get('payload-token')?.value
  if (payloadToken) {
    try {
      const { user } = await payload.auth({ headers: request.headers })
      if (user) {
        return { user, payload }
      }
    } catch (error) {
      // Cookie invalid
    }
  }

  return { user: null, payload }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user as any

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, payload } = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, bio, company, position } = body

    // Update user
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser as any

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
