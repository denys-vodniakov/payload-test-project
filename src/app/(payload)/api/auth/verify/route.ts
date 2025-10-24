import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Токен авторизации не предоставлен' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Убираем "Bearer "

    try {
      // Проверяем токен
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

      // Получаем актуальные данные пользователя
      const payload = await getPayload({ config: configPromise })
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.userId,
      })

      if (!user) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
      }

      // Возвращаем данные пользователя без пароля
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        valid: true,
        user: userWithoutPassword,
      })
    } catch (jwtError) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ error: 'Ошибка при проверке токена' }, { status: 500 })
  }
}
