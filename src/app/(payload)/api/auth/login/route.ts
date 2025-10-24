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

    // Валидация
    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    // Ищем пользователя
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
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const user = users.docs[0]

    // Проверяем пароль (Payload автоматически хеширует пароли)
    // Для простоты используем встроенную аутентификацию Payload
    try {
      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })

      if (!loginResult.user) {
        return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
      }

      // Создаем JWT токен
      const token = jwt.sign(
        {
          userId: loginResult.user.id,
          email: loginResult.user.email,
        },
        JWT_SECRET,
        { expiresIn: '7d' },
      )

      // Возвращаем данные пользователя без пароля
      const { password: _, ...userWithoutPassword } = loginResult.user

      return NextResponse.json({
        message: 'Успешный вход в систему',
        user: userWithoutPassword,
        token,
      })
    } catch (loginError) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Ошибка при входе в систему' }, { status: 500 })
  }
}
