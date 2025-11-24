import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users.docs[0]

    // Check password (Payload automatically hashes passwords)
    // For simplicity, use built-in Payload authentication
    try {
      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })

      if (!loginResult.user || !loginResult.token) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Create JWT token for frontend use (if needed)
      const customToken = jwt.sign(
        {
          userId: loginResult.user.id,
          email: loginResult.user.email,
        },
        JWT_SECRET,
        { expiresIn: '7d' },
      )

      // Return user data without password
      const { password: _, ...userWithoutPassword } = loginResult.user

      // Create response with Payload token cookie
      const response = NextResponse.json({
        message: 'Successfully logged in',
        user: userWithoutPassword,
        token: customToken,
      })

      // Set Payload's authentication cookie
      // This is required for Payload admin panel to recognize the user
      response.cookies.set('payload-token', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    } catch (loginError) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error logging in' }, { status: 500 })
  }
}
