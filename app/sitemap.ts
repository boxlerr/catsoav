import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://catsoav.com'
    const locales = ['es', 'en']

    // Fetch all projects for sitemap
    const projects = await prisma.project.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true }
    })

    const projectUrls = projects.flatMap((project) => locales.map(locale => ({
        url: `${baseUrl}/${locale}/project/${project.id}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    })))

    const staticUrls = locales.map(locale => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
    }))

    return [
        ...staticUrls,
        ...projectUrls,
    ]
}
