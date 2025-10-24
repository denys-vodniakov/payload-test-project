import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function createAdminUser() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check if admin user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@test.com',
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      console.log('Admin user already exists:', existingUsers.docs[0].email)
      return
    }

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Admin User',
      },
    })

    console.log('Admin user created successfully:', adminUser.email)
    console.log('Login credentials:')
    console.log('Email: admin@test.com')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdminUser()
