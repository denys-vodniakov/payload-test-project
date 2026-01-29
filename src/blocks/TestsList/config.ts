import type { Block } from 'payload'

export const TestsList: Block = {
  slug: 'testsList',
  interfaceName: 'TestsListBlock',
  labels: {
    plural: 'Tests Lists',
    singular: 'Tests List',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'All Tests',
      admin: {
        description: 'Section title (leave empty to hide)',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'Browse our collection of tests. Filter by category, difficulty, or search for specific topics.',
      admin: {
        description: 'Section subtitle (leave empty to hide)',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Filters & Display',
          fields: [
            {
              name: 'showSearch',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show search input',
              },
            },
            {
              name: 'showCategoryFilter',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show category filter',
              },
            },
            {
              name: 'showDifficultyFilter',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show difficulty filter',
              },
            },
            {
              name: 'showSortOptions',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show sort dropdown',
              },
            },
            {
              name: 'showViewToggle',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show grid/list view toggle',
              },
            },
            {
              name: 'collapsibleFilters',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Make filters collapsible (expandable panel)',
              },
            },
          ],
        },
        {
          label: 'Initial Settings',
          fields: [
            {
              name: 'defaultCategory',
              type: 'select',
              defaultValue: 'all',
              options: [
                { label: 'All Categories', value: 'all' },
                { label: 'React', value: 'react' },
                { label: 'Next.js', value: 'nextjs' },
                { label: 'JavaScript', value: 'javascript' },
                { label: 'TypeScript', value: 'typescript' },
                { label: 'CSS/HTML', value: 'css-html' },
                { label: 'General', value: 'general' },
                { label: 'Mixed', value: 'mixed' },
              ],
              admin: {
                description: 'Pre-selected category filter',
              },
            },
            {
              name: 'defaultDifficulty',
              type: 'select',
              defaultValue: 'all',
              options: [
                { label: 'All Levels', value: 'all' },
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
                { label: 'Mixed', value: 'mixed' },
              ],
              admin: {
                description: 'Pre-selected difficulty filter',
              },
            },
            {
              name: 'defaultSort',
              type: 'select',
              defaultValue: '-createdAt',
              options: [
                { label: 'Newest First', value: '-createdAt' },
                { label: 'Oldest First', value: 'createdAt' },
                { label: 'Title A-Z', value: 'title' },
                { label: 'Title Z-A', value: '-title' },
              ],
              admin: {
                description: 'Default sort order',
              },
            },
            {
              name: 'defaultView',
              type: 'select',
              defaultValue: 'grid',
              options: [
                { label: 'Grid', value: 'grid' },
                { label: 'List', value: 'list' },
              ],
              admin: {
                description: 'Default view mode',
              },
            },
          ],
        },
        {
          label: 'Pagination',
          fields: [
            {
              name: 'loadMode',
              type: 'select',
              defaultValue: 'pagination',
              options: [
                { label: 'Pagination (page numbers)', value: 'pagination' },
                { label: 'Infinite Scroll', value: 'infinite' },
                { label: 'Load More Button', value: 'loadMore' },
              ],
              admin: {
                description: 'How to load more tests',
              },
            },
            {
              name: 'allowLoadModeSwitch',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Allow users to switch between pagination modes',
              },
            },
            {
              name: 'itemsPerPage',
              type: 'number',
              defaultValue: 12,
              min: 4,
              max: 48,
              admin: {
                description: 'Number of tests per page/load',
              },
            },
          ],
        },
        {
          label: 'Styling',
          fields: [
            {
              name: 'showBackground',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show animated aurora background',
              },
            },
            {
              name: 'cardsPerRow',
              type: 'select',
              defaultValue: '3',
              options: [
                { label: '2 cards per row', value: '2' },
                { label: '3 cards per row', value: '3' },
                { label: '4 cards per row', value: '4' },
              ],
              admin: {
                description: 'Number of cards per row (desktop)',
              },
            },
            {
              name: 'cardStyle',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Compact', value: 'compact' },
                { label: 'Detailed', value: 'detailed' },
              ],
              admin: {
                description: 'Card appearance style',
              },
            },
          ],
        },
      ],
    },
  ],
}
