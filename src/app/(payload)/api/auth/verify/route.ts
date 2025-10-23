import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token not provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

      // Get current user data
      const payload = await getPayload({ config: configPromise })
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.userId,
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        valid: true,
        user: userWithoutPassword,
      })
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ error: 'Error verifying token' }, { status: 500 })
  }
}
