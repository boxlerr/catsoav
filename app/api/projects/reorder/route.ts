import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { items } = await request.json()

        // Update items efficiently
        // We expect an array of { id: string, order: number, category: string }
        const transaction = items.map((item: any) =>
            prisma.project.update({
                where: { id: item.id },
                data: {
                    order: item.order,
                    category: item.category
                }
            })
        )

        await prisma.$transaction(transaction)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reorder error:", error)
        return NextResponse.json({ error: "Error reordering projects" }, { status: 500 })
    }
}
