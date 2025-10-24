import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { name, email, password } = body

    // Валидация
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Все поля обязательны для заполнения' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 },
      )
    }

    // Проверяем, существует ли пользователь
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 },
      )
    }

    // Создаем нового пользователя
    const user = await payload.create({
      collection: 'users',
      data: {
        name: name.trim(),
        email: email.trim(),
        password,
      },
    })

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    // Возвращаем данные пользователя без пароля
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Пользователь успешно зарегистрирован',
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Ошибка при регистрации пользователя' }, { status: 500 })
  }
}
