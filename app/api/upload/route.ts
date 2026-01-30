import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Create a unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
        const path = join(uploadDir, filename)

        await writeFile(path, buffer)

        const url = `/uploads/${filename}`
        return NextResponse.json({ url })

    } catch {
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
    }
}
