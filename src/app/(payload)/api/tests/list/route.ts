import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

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

    if (search && search.trim()) {
      where.or = [
        {
          title: {
            contains: search.trim(),
          },
        },
        {
          description: {
            contains: search.trim(),
          },
        },
      ]
    }

    const tests = await payload.find({
      collection: 'tests',
      where,
      limit,
      page,
      sort,
      depth: 1, // Include questions count
    })

    // Transform to include question count
    const transformedDocs = tests.docs.map((test: any) => ({
      ...test,
      questionsCount: Array.isArray(test.questions) ? test.questions.length : 0,
    }))

    return NextResponse.json({
      ...tests,
      docs: transformedDocs,
    })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}
