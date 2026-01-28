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

export async function POST(request: NextRequest) {
  try {
    const { user, payload } = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Avatar for ${(user as any).name || (user as any).email}`,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })

    // Update user with new avatar
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        avatar: media.id,
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser as any

    return NextResponse.json({
      message: 'Avatar updated successfully',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Update avatar error:', error)
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 })
  }
}
