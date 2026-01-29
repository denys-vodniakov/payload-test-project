import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { TestsListBlock as TestsListBlockType } from '@/payload-types'
import { TestsListClient } from './Component.client'

export type TestsListBlockProps = TestsListBlockType & {
  id?: string
}

export const TestsListBlock: React.FC<TestsListBlockProps> = async (props) => {
  const {
    title,
    subtitle,
    showSearch = true,
    showCategoryFilter = true,
    showDifficultyFilter = true,
    showSortOptions = true,
    showViewToggle = true,
    collapsibleFilters = true,
    defaultCategory = 'all',
    defaultDifficulty = 'all',
    defaultSort = '-createdAt',
    defaultView = 'grid',
    loadMode = 'pagination',
    allowLoadModeSwitch = false,
    itemsPerPage = 12,
    showBackground = true,
    cardsPerRow = '3',
    cardStyle = 'default',
  } = props

  // Fetch initial data on server
  const payload = await getPayload({ config: configPromise })

  const where: any = {
    isActive: {
      equals: true,
    },
  }

  if (defaultCategory && defaultCategory !== 'all') {
    where.category = { equals: defaultCategory }
  }

  if (defaultDifficulty && defaultDifficulty !== 'all') {
    where.difficulty = { equals: defaultDifficulty }
  }

  const initialData = await payload.find({
    collection: 'tests',
    where,
    limit: itemsPerPage ?? 12,
    page: 1,
    sort: (defaultSort ?? '-createdAt') as '-createdAt' | 'createdAt' | 'title' | '-title',
    depth: 1,
  })

  // Transform to include question count
  const transformedDocs = initialData.docs.map((test: any) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    category: test.category,
    difficulty: test.difficulty,
    timeLimit: test.timeLimit,
    passingScore: test.passingScore,
    questionsCount: Array.isArray(test.questions) ? test.questions.length : 0,
    createdAt: test.createdAt,
  }))

  return (
    <TestsListClient
      title={title || undefined}
      subtitle={subtitle || undefined}
      showSearch={showSearch ?? true}
      showCategoryFilter={showCategoryFilter ?? true}
      showDifficultyFilter={showDifficultyFilter ?? true}
      showSortOptions={showSortOptions ?? true}
      showViewToggle={showViewToggle ?? true}
      collapsibleFilters={collapsibleFilters ?? true}
      defaultCategory={defaultCategory || 'all'}
      defaultDifficulty={defaultDifficulty || 'all'}
      defaultSort={defaultSort || '-createdAt'}
      defaultView={(defaultView as 'grid' | 'list') || 'grid'}
      loadMode={(loadMode as 'pagination' | 'infinite' | 'loadMore') || 'pagination'}
      allowLoadModeSwitch={allowLoadModeSwitch ?? false}
      itemsPerPage={itemsPerPage || 12}
      showBackground={showBackground ?? true}
      cardsPerRow={cardsPerRow || '3'}
      cardStyle={(cardStyle as 'default' | 'compact' | 'detailed') || 'default'}
      initialTests={transformedDocs}
      initialTotalPages={initialData.totalPages ?? 0}
      initialTotalDocs={initialData.totalDocs ?? 0}
      initialHasNextPage={initialData.hasNextPage ?? false}
    />
  )
}
