const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        where: {
            videoUrl: { not: null }
        },
        select: {
            title: true,
            videoUrl: true
        }
    })

    console.log('Projects with videoUrl:');
    projects.forEach(p => {
        console.log(`- ${p.title}: ${p.videoUrl}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
