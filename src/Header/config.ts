import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'group',
      label: 'Logo',
      fields: [
        {
          name: 'light',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo for light theme',
          admin: {
            description: 'Logo that will be displayed on light background',
          },
        },
        {
          name: 'dark',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo for dark theme',
          admin: {
            description: 'Logo that will be displayed on dark background',
          },
        },
        {
          name: 'mobile',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo for mobile devices (optional)',
          admin: {
            description:
              'Optional logo for mobile devices. If not specified, the light theme logo will be used',
          },
          required: false,
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
