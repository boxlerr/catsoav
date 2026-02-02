import { prisma } from "./prisma"
import { unstable_cache } from "next/cache"

export const getProjects = unstable_cache(
    async (isAdmin: boolean = false) => {
        return prisma.project.findMany({
            where: isAdmin ? {} : { published: true },
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                imageUrl: true,
                videoUrl: true,
                extraVideos: true,
                clientName: true,
                published: true,
                order: true,
                createdAt: true,
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })
    },
    ['projects-list'],
    { revalidate: 3600, tags: ['projects'] }
)

export const getCategories = unstable_cache(
    async () => {
        return prisma.category.findMany({
            select: {
                id: true,
                name: true,
                title: true,
                description: true,
                order: true,
            },
            orderBy: { order: 'asc' }
        })
    },
    ['categories-list'],
    { revalidate: 3600, tags: ['categories'] }
)
