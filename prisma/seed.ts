import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@catsoav.com' },
        update: {},
        create: {
            email: 'admin@catsoav.com',
            name: 'Admin',
            password: hashedPassword,
            role: 'admin'
        }
    })

    console.log('✅ Usuario admin creado:')
    console.log('   Email: admin@catsoav.com')
    console.log('   Password: admin123')
    console.log('   Role: admin')

    // Proyectos de prueba
    const projectsData = [
        {
            title: "Neon Dreams - Music Video",
            description: "High energy music video with neon aesthetics.",
            category: "videoclips",
            imageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
            clientName: "Luna Sky",
            order: 0,
        },
        {
            title: "The Grill Master - Steakhouse",
            description: "Commercial for a premium steakhouse experience.",
            category: "restaurants",
            imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
            clientName: "Iron Wood Grill",
            order: 0,
        },
        {
            title: "Underground Beats",
            description: "Aftermovie for an underground techno event.",
            category: "nightclubs",
            imageUrl: "https://images.unsplash.com/photo-1514525253361-bee8718a7c7d?auto=format&fit=crop&q=80&w=800",
            clientName: "Club X",
            order: 0,
        },
        {
            title: "Golden Hour Vibes",
            description: "Cinematic music video shot at sunset.",
            category: "videoclips",
            imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=800",
            clientName: "Solaris",
            order: 1,
        },
        {
            title: "Sushi Elegance",
            description: "Presentation video for a high-end sushi restaurant.",
            category: "restaurants",
            imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
            clientName: "Mizu Sushi",
            order: 1,
        },
        {
            title: "Urban Rhythms",
            description: "Street style hip-top music video.",
            category: "videoclips",
            imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800",
            clientName: "Block K",
            order: 2,
        }
    ]

    console.log('🌱 Seedign projects...')
    for (const data of projectsData) {
        await prisma.project.create({
            data: {
                ...data,
                authorId: admin.id
            }
        })
    }
    console.log('✅ Proyectos de prueba creados.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
