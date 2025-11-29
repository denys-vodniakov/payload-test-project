import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'group',
      label: 'Логотип',
      fields: [
        {
          name: 'light',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo for light theme',
          admin: {
            description: 'Logo that will be displayed on the light background',
          },
        },
        {
          name: 'dark',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo for dark theme',
          admin: {
            description: 'Logo that will be displayed on the dark background',
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description:
          'Short description of the company or project that will be displayed under the logo in the footer',
        placeholder: 'Modern platform for assessing knowledge and skills...',
      },
    },
    {
      name: 'navBlocks',
      type: 'array',
      label: 'Navigation Blocks',
      admin: {
        description:
          'Navigation blocks that will be displayed in the footer. You can add up to 3 blocks.',
        initCollapsed: false,
      },
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Block Title',
          required: true,
          admin: {
            placeholder: 'Navigation',
            description: 'Title of the navigation block',
          },
          defaultValue: 'Navigation',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 8,
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/Footer/RowLabel#RowLabel',
            },
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      admin: {
        description: 'Social media links that will be displayed in the footer',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'GitHub', value: 'github' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'Discord', value: 'discord' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'https://...',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Optional custom label (if not provided, platform name will be used)',
            placeholder: 'Follow us on...',
          },
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright',
      admin: {
        description: 'Text of the copyright, which will be displayed in the footer',
        placeholder: '© 2025 Your Company. All rights reserved.',
      },
      defaultValue: '© 2025',
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
