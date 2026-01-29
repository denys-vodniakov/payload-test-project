import type { Block } from 'payload'

export const TestsCarousel: Block = {
  slug: 'testsCarousel',
  interfaceName: 'TestsCarouselBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Available Tests',
      admin: {
        description: 'Carousel section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: "Choose a test for the technology you're interested in and test your knowledge",
      admin: {
        description: 'Carousel section subtitle',
      },
    },
    {
      name: 'testSelectionMode',
      type: 'select',
      required: true,
      defaultValue: 'latest',
      options: [
        {
          label: 'Latest tests (automatic)',
          value: 'latest',
        },
        {
          label: 'Manual selection',
          value: 'manual',
        },
        {
          label: 'By category',
          value: 'category',
        },
        {
          label: 'By difficulty',
          value: 'difficulty',
        },
      ],
      admin: {
        description: 'Test selection mode for display',
      },
    },
    {
      name: 'manualTests',
      type: 'relationship',
      relationTo: 'tests',
      hasMany: true,
      admin: {
        condition: (data) => data.testSelectionMode === 'manual',
        description: 'Select tests to display in the carousel',
      },
    },
    {
      name: 'categoryFilter',
      type: 'select',
      options: [
        { label: 'React', value: 'react' },
        { label: 'Next.js', value: 'nextjs' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'CSS/HTML', value: 'css-html' },
        { label: 'General questions', value: 'general' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        condition: (data) => data.testSelectionMode === 'category',
        description: 'Filter by category',
      },
    },
    {
      name: 'difficultyFilter',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        condition: (data) => data.testSelectionMode === 'difficulty',
        description: 'Filter by difficulty',
      },
    },
    {
      name: 'sortOrder',
      type: 'select',
      required: true,
      defaultValue: 'createdAt-desc',
      options: [
        {
          label: 'Newest first (by creation date)',
          value: 'createdAt-desc',
        },
        {
          label: 'Oldest first (by creation date)',
          value: 'createdAt-asc',
        },
        {
          label: 'By title (A-Z)',
          value: 'title-asc',
        },
        {
          label: 'By title (Z-A)',
          value: 'title-desc',
        },
        {
          label: 'By update date (newest)',
          value: 'updatedAt-desc',
        },
        {
          label: 'By update date (oldest)',
          value: 'updatedAt-asc',
        },
      ],
      admin: {
        description: 'Test sorting order',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 50,
      admin: {
        description: 'Maximum number of tests to display',
      },
    },
    {
      name: 'slidesToShow',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
      admin: {
        description: 'Number of visible slides at once (for desktop)',
      },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable automatic carousel scrolling',
      },
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 4000,
      min: 1000,
      max: 10000,
      admin: {
        condition: (data) => data.autoplay === true,
        description: 'Autoplay speed in milliseconds (recommended multiples of 500)',
      },
    },
  ],
  labels: {
    plural: 'Tests Carousels',
    singular: 'Tests Carousel',
  },
}

