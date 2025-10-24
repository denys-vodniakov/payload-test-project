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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Create new test using Payload's create method
    const test = await payload.create({
      collection: 'tests',
      data: body,
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Update test using Payload's update method
    const test = await payload.update({
      collection: 'tests',
      id,
      data: body,
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Delete test using Payload's delete method
    await payload.delete({
      collection: 'tests',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}
