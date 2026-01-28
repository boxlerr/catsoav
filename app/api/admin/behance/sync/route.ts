import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { getBehanceProjects, getBehanceProjectVideo } from "@/lib/behance-sync"

export async function POST() {
    try {
        const session = await getServerSession()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const behanceProjects = await getBehanceProjects("https://www.behance.net/catsoav")

        if (behanceProjects.length === 0) {
            console.error("[SyncRoute] No se encontraron proyectos en Behance.");
            return NextResponse.json({
                error: "No se encontraron proyectos en el perfil de Behance. Esto puede deberse a un cambio en el sitio de Behance o a un bloqueo temporal."
            }, { status: 404 })
        }

        console.log(`[SyncRoute] Procesando ${behanceProjects.length} proyectos encontrados en Behance.`);

        let syncedCount = 0
        const skippedCount = []

        for (const bp of behanceProjects) {
            // Check if project already exists
            const existing = await prisma.project.findFirst({
                where: {
                    OR: [
                        { title: bp.title },
                        { videoUrl: bp.url }
                    ]
                }
            })

            if (!existing) {
                console.log(`[SyncRoute] Agregando nuevo proyecto: ${bp.title}`);
                const videoUrl = await getBehanceProjectVideo(bp.url)

                const finalCategory = videoUrl
                    ? 'videoclips'
                    : (bp.title.toLowerCase().includes('video') ? 'videoclips' : 'commercial');

                await prisma.project.create({
                    data: {
                        title: bp.title,
                        description: "Sincronizado desde Behance",
                        category: finalCategory,
                        imageUrl: bp.cover || '/placeholder-project.jpg',
                        videoUrl: videoUrl, // YA NO USAMOS bp.url COMO FALLBACK!
                        authorId: user.id,
                        published: true,
                        order: 0
                    }
                })
                syncedCount++
            } else {
                skippedCount.push(bp.title)
            }
        }

        return NextResponse.json({
            success: true,
            message: syncedCount > 0
                ? `Sincronización completada. ${syncedCount} proyectos nuevos agregados.`
                : `Todo al día. No se encontraron proyectos nuevos (${skippedCount.length} ya existen).`,
            count: syncedCount
        })

    } catch (error: any) {
        console.error("Sync error:", error)
        return NextResponse.json({ error: "Error interno: " + error.message }, { status: 500 })
    }
}
