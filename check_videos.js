const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            title: true,
            videoUrl: true
        }
    })

    console.log(`Total projects: ${projects.length}`);
    const withVideo = projects.filter(p => p.videoUrl);
    const withoutVideo = projects.filter(p => !p.videoUrl);

    console.log(`Projects with video: ${withVideo.length}`);
    console.log(`Projects without video: ${withoutVideo.length}`);

    console.log('\n--- Projects WITH video ---');
    withVideo.forEach(p => {
        console.log(`[VIDEO] ${p.title}: ${p.videoUrl}`);
    });

    console.log('\n--- Sample of projects WITHOUT video ---');
    withoutVideo.slice(0, 5).forEach(p => {
        console.log(`[MISSING] ${p.title}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
