import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { unlink } from "fs/promises"
import { join } from "path"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const json = await request.json()
        const project = await prisma.project.update({
            where: { id },
            data: json
        })
        return NextResponse.json(project)
    } catch {
        return NextResponse.json({ error: "Error updating project" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Find project to check if it has a local file to delete
        const project = await prisma.project.findUnique({
            where: { id }
        })

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        // Optional: Delete local files if they exist in /public/uploads
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

        await deleteFile(project.imageUrl)
        await deleteFile(project.videoUrl)

        await prisma.project.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Error deleting project" }, { status: 500 })
    }
}
