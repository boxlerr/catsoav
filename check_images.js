const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        if (!p.imageUrl) continue;
        try {
            const res = await fetch(p.imageUrl, { method: 'HEAD' });
            console.log(`${p.title}: ${p.imageUrl} -> ${res.status}`);
        } catch (e) {
            console.log(`${p.title}: ${p.imageUrl} -> ERROR: ${e.message}`);
        }
    }
    process.exit(0);
}

check();
