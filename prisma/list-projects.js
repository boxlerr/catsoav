const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const projects = await prisma.project.findMany();
        console.log('--- PROJECTS ---');
        console.log(JSON.stringify(projects, null, 2));
        console.log('----------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
