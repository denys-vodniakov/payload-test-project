import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Successfully logged out' })

    // Clear payload-token cookie
    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete cookie
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Error logging out' }, { status: 500 })
  }
}

