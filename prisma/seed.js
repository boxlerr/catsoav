const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@catsoav.com' },
        update: {},
        create: {
            email: 'admin@catsoav.com',
            name: 'Admin',
            password: hashedPassword,
            role: 'admin'
        }
    })

    console.log('✅ Usuario admin creado:')
    console.log('   Email: admin@catsoav.com')
    console.log('   Password: admin123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
