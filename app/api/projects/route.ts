import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(projects)
    } catch (error) {
        return NextResponse.json({ error: "Error fetching projects" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await request.json()
        const project = await prisma.project.create({
            data: {
                title: json.title,
                description: json.description,
                category: json.category,
                imageUrl: json.imageUrl,
                videoUrl: json.videoUrl,
                clientName: json.clientName,
                author: { connect: { id: session.user.id } }
            }
        })
        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Error creating project" }, { status: 500 })
    }
}
