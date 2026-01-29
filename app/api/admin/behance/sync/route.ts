import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { getBehanceProjects, getBehanceProjectDetails } from "@/lib/behance-sync"

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

            const details = await getBehanceProjectDetails(bp.url);
            let videoUrl = details.videoUrl;
            const extraVideos = details.extraVideos;
            const images = details.images;

            // FALLBACK: Si no se encuentra video (null), usar el link del proyecto
            if (!videoUrl) {
                console.log(`[SyncRoute] Fallback: Usando URL del proyecto para "${bp.title}"`);
                videoUrl = bp.url;
            }

            if (!existing) {
                console.log(`[SyncRoute] Agregando nuevo proyecto: ${bp.title}`);
                // Determine category based on keywords
                const titleLower = bp.title.toLowerCase();
                let finalCategory = 'commercial'; // Default

                if (titleLower.includes('music video') ||
                    titleLower.includes('official video') ||
                    titleLower.includes('videoclip') ||
                    titleLower.includes(' mv ')) {
                    finalCategory = 'videoclips';
                } else if (titleLower.includes('commercial') ||
                    titleLower.includes('campaign') ||
                    titleLower.includes('spot') ||
                    titleLower.includes('fashion') ||
                    titleLower.includes('brand')) {
                    finalCategory = 'commercial';
                } else if (videoUrl) {
                    // Fallback: If it has video but no clear keywords, lean towards commercial for high-end work, 
                    // or videoclips if it looks like an artist name. 
                    // Let's default to commercial as it's safer for a "Production Company".
                    finalCategory = 'commercial';
                }

                await prisma.project.create({
                    data: {
                        title: bp.title,
                        description: "",
                        category: finalCategory,
                        imageUrl: bp.cover || '/placeholder-project.jpg',
                        images: JSON.stringify(images), // Store images as JSON
                        videoUrl: videoUrl,
                        // @ts-ignore
                        extraVideos: JSON.stringify(extraVideos),
                        authorId: user.id,
                        published: true,
                        order: 0
                    }
                })
                syncedCount++
            } else {
                console.log(`[SyncRoute] Actualizando proyecto existente: ${bp.title}`);
                await prisma.project.update({
                    where: { id: existing.id },
                    data: {
                        imageUrl: bp.cover, // Refresh cover
                        images: JSON.stringify(images), // Update images
                        videoUrl: videoUrl,  // Refresh video/fallback
                        // @ts-ignore
                        extraVideos: JSON.stringify(extraVideos) // Update videos
                    }
                });
                syncedCount++; // Count updates as sync activity
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
