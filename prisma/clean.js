const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Cleaning database...')
    const deletedProjects = await prisma.project.deleteMany({})
    console.log(`✅ Deleted ${deletedProjects.count} projects.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
