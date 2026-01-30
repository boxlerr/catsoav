
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding Dinastia Project...");

    // Datos del proyecto extraídos de la captura/conversación
    const projectData = {
        title: "Dinastia - Shoe Posters Spring Season 2024",
        description: "Shoe Posters Spring Season 2024",
        imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/1400/9b0b4b191834161.65d4d3d3d5f30.jpg", // Placeholder o URL real si la tuviera
        videoUrl: `https://www-ccv.adobe.io/v1/player/ccv/RqzfCZYVANm/embed?api_key=${process.env.BEHANCE_API_KEY || 'behance1'}&bgcolor=%23191919`,
        category: "commercial",
        published: true,
        order: 1
    };

    // Buscar si existe un usuario admin para asignar el proyecto (opcional pero recomendado)
    const user = await prisma.user.findFirst();
    if (user) {
        projectData.authorId = user.id;
    }

    // Upsert: Crear o Actualizar
    const project = await prisma.project.upsert({
        where: {
            // Asumiendo que 'title' es único o usamos findFirst logic. 
            // Prisma upsert requiere unique where. Si title no es único en schema, usamos create.
            // Para simplicidad, buscaremos primero.
            id: "dinastia-seed-id" // Intentamos usar un ID fijo si es posible, si no, buscamos por título
        },
        update: {
            videoUrl: projectData.videoUrl
        },
        create: {
            ...projectData
        }
    }).catch(async (e) => {
        // Fallback si ID no funciona (uuid), buscamos por título
        const existing = await prisma.project.findFirst({
            where: { title: { contains: "Dinastia" } }
        });

        if (existing) {
            console.log(`Updated existing project: ${existing.title}`);
            return prisma.project.update({
                where: { id: existing.id },
                data: { videoUrl: projectData.videoUrl }
            });
        } else {
            console.log("Creating new project...");
            return prisma.project.create({
                data: projectData
            });
        }
    });

    console.log("✅ Proyecto 'Dinastia' actualizado/creado correctamente con URL de Adobe CCV.");
    console.log(`Video URL: ${projectData.videoUrl}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
