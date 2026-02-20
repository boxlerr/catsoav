import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany()
    const categories = await prisma.category.findMany()

    console.log('Projects with empty IDs or titles:')
    console.log(projects.filter(p => !p.id || !p.title || p.id.trim() === '' || p.title.trim() === ''))

    console.log('Categories with empty IDs or names:')
    console.log(categories.filter(c => !c.id || !c.name || c.id.trim() === '' || c.name.trim() === ''))

    console.log('Total counts:', { projects: projects.length, categories: categories.length })
}

main().catch(console.error).finally(() => prisma.$disconnect())
