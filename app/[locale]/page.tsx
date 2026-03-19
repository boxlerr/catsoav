import { prisma } from "@/lib/prisma"
import HomeClient from "@/components/HomeClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "admin"

  // Fetch initial data on the server for better SEO and performance
  const [initialProjects, initialCategories] = await Promise.all([
    prisma.project.findMany({
      where: isAdmin ? {} : { published: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' }
    })
  ])

  // Map Prisma models to plain objects for the client
  const projects = JSON.parse(JSON.stringify(initialProjects))
  const categories = JSON.parse(JSON.stringify(initialCategories))

  return (
    <HomeClient
      initialProjects={projects}
      initialCategories={categories}
    />
  )
}
