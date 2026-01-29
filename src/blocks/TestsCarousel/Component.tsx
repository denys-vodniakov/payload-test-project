import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { TestsCarouselBlock as TestsCarouselBlockProps } from '@/payload-types'
import { TestsCarouselClient } from './Component.client'

export const TestsCarouselBlock: React.FC<TestsCarouselBlockProps> = async ({
  title,
  subtitle,
  testSelectionMode,
  manualTests,
  categoryFilter,
  difficultyFilter,
  sortOrder,
  limit,
  slidesToShow,
  autoplay,
  autoplaySpeed,
}) => {
  const payload = await getPayload({ config: configPromise })

  let tests: any[] = []

  try {
    if (testSelectionMode === 'manual' && manualTests && manualTests.length > 0) {
      // Manual test selection
      const testIds = manualTests
        .map((test) => (typeof test === 'object' && test !== null ? test.id : test))
        .filter(Boolean)

      if (testIds.length > 0) {
        const result = await payload.find({
          collection: 'tests',
          where: {
            id: {
              in: testIds,
            },
            isActive: {
              equals: true,
            },
          },
          limit: limit || 50,
          pagination: false,
        })
        tests = result.docs || []

        // Preserve order from manual selection
        const testMap = new Map(tests.map((test) => [test.id, test]))
        tests = testIds
          .map((id) => testMap.get(id))
          .filter(Boolean) as any[]
      }
    } else {
      // Automatic test selection
      const where: any = {
        isActive: {
          equals: true,
        },
      }

      if (testSelectionMode === 'category' && categoryFilter) {
        where.category = {
          equals: categoryFilter,
        }
      }

      if (testSelectionMode === 'difficulty' && difficultyFilter) {
        where.difficulty = {
          equals: difficultyFilter,
        }
      }

      // Determine sorting
      let sort: string | undefined
      if (sortOrder) {
        const [field, direction] = sortOrder.split('-')
        sort = direction === 'asc' ? field : `-${field}`
      } else {
        sort = '-createdAt' // Default: newest first
      }

      const result = await payload.find({
        collection: 'tests',
        where,
        sort,
        limit: limit || 10,
        pagination: false,
      })

      tests = result.docs || []
    }
  } catch (error) {
    console.error('Error fetching tests for carousel:', error)
    tests = []
  }

  return (
    <TestsCarouselClient
      tests={tests}
      title={title || 'Available Tests'}
      subtitle={subtitle || "Choose a test for the technology you're interested in and test your knowledge"}
      slidesToShow={slidesToShow || 3}
      autoplay={autoplay !== false}
      autoplaySpeed={autoplaySpeed || 4000}
    />
  )
}

