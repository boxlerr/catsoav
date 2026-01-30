import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { unlink } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 })
        }

        // Find all projects to delete local files
        const projects = await prisma.project.findMany({
            where: {
                id: { in: ids }
            }
        })

        const deleteFile = async (url: string | null) => {
            if (url?.startsWith('/uploads/')) {
                try {
                    const path = join(process.cwd(), 'public', url)
                    await unlink(path)
                } catch (e) {
                    console.error("Error deleting file:", e)
                }
            }
        }

        // Delete files for all projects
        for (const project of projects) {
            await deleteFile(project.imageUrl)
            await deleteFile(project.videoUrl)
        }

        // Bulk delete from database
        await prisma.project.deleteMany({
            where: {
                id: { in: ids }
            }
        })

        return NextResponse.json({ success: true, deletedCount: projects.length })
    } catch (error) {
        console.error("Bulk delete error:", error)
        return NextResponse.json({ error: "Error during bulk delete" }, { status: 500 })
    }
}
