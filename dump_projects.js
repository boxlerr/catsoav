const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            title: true,
            videoUrl: true,
            imageUrl: true,
            category: true
        }
    })

    console.log(`FOUND ${projects.length} PROJECTS`);
    projects.forEach(p => {
        console.log(`TITLE: "${p.title}"`);
        console.log(`  VIDEO: "${p.videoUrl}"`);
        console.log(`  IMAGE: "${p.imageUrl}"`);
        console.log(`  CAT:   "${p.category}"`);
        console.log('---');
    })
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
