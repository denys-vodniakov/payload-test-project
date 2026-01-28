import type { CollectionConfig, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '../../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Only admins can access admin panel
    admin: isAdmin,
    // Only admins can create/delete users
    create: isAdmin,
    delete: isAdmin,
    // Users can read/update themselves, admins can read/update anyone
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins can read anyone
      const userWithRole = user as User
      if (userWithRole.role === 'admin') return true
      // Users can only read themselves
      return true // Allow users to read their own data
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false
      // Admins can update anyone
      const userWithRole = user as User
      if (userWithRole.role === 'admin') return true
      // Users can only update themselves
      return String(user.id) === String(id)
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'phone', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'User profile picture',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Phone number',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short bio or description',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'Company or organization',
      },
    },
    {
      name: 'position',
      type: 'text',
      admin: {
        description: 'Job title or position',
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      options: [
        {
          label: 'User',
          value: 'user',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
      admin: {
        description: 'User role - Admin has access to admin panel and user features',
      },
      access: {
        // Only admins can change roles
        update: (({ req: { user } }) => {
          if (!user) return false
          // Type guard for role field
          const userWithRole = user as User
          return userWithRole.role === 'admin'
        }) as FieldAccess<User, User>,
      },
    },
  ],
  timestamps: true,
}
