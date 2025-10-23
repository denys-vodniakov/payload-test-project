import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    const where: any = {
      isActive: {
        equals: true,
      },
    }

    if (category && category !== 'all') {
      where.category = {
        equals: category,
      }
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = {
        equals: difficulty,
      }
    }

    const tests = await payload.find({
      collection: 'tests',
      where,
      limit: 100,
      pagination: false,
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}
