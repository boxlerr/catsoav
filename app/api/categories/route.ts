import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(categories)
    } catch {
        return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await request.json()
        const nameToUse = json.name || json.title

        if (!nameToUse) {
            return NextResponse.json({ error: "Title or name is required" }, { status: 400 })
        }

        const category = await prisma.category.create({
            data: {
                name: nameToUse.toLowerCase().trim().replace(/\s+/g, '-'),
                title: json.title,
                description: json.description,
                order: json.order || 0
            }
        })
        return NextResponse.json(category, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Error creating category" }, { status: 500 })
    }
}
