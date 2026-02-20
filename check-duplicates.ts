import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.category.findMany()
    const names = categories.map(c => c.name)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)

    console.log('Duplicate category names:', duplicates)
    console.log('All categories:', categories.map(c => ({ id: c.id, name: c.name, title: c.title })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
