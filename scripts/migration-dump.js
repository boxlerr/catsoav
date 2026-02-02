const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting data dump...')

    const users = await prisma.user.findMany()
    const projects = await prisma.project.findMany()
    const categories = await prisma.category.findMany()

    const data = {
        users,
        projects,
        categories
    }

    const outputPath = path.join(__dirname, 'data-dump.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))

    console.log(`Data dumped to ${outputPath}`)
    console.log(`Users: ${users.length}`)
    console.log(`Projects: ${projects.length}`)
    console.log(`Categories: ${categories.length}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
