import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get token from payload-token cookie
    const token = request.cookies.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 })
    }

    try {
      // Use the current origin for local request
      // This avoids problems with external URLs and timeouts
      const origin = request.nextUrl.origin

      // Use a short timeout for local request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 seconds timeout

      const meUserReq = await fetch(`${origin}/api/users/me`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
        signal: controller.signal,
        cache: 'no-store', // Do not cache request
      })

      clearTimeout(timeoutId)

      if (!meUserReq.ok) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { user } = await meUserReq.json()

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        user: userWithoutPassword,
      })
    } catch (error: any) {
      // If this is a timeout or network error, return an error
      if (error.name === 'AbortError' || error.code === 'UND_ERR_HEADERS_TIMEOUT') {
        console.error('Request timeout when checking token:', error)
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
      }

      console.error('Token verification error:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Error checking authentication' }, { status: 500 })
  }
}
