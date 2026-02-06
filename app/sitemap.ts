import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://catsoav.com'

    // Fetch all projects for sitemap
    const projects = await prisma.project.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true }
    })

    const projectUrls = projects.map((project) => ({
        url: `${baseUrl}/project/${project.id}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...projectUrls,
    ]
}
