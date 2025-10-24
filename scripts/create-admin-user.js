const { getPayload } = require('payload')
const configPromise = require('@payload-config')
const crypto = require('crypto')

async function createAdminUser() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Generate a secure random password
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com'

    // Check if admin user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: adminEmail,
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
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
      },
    })

    console.log('Admin user created successfully:', adminUser.email)
    console.log('Login credentials:')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log('⚠️  Change the password after first login!')
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdminUser()
