import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SyncBehanceButton from "@/components/admin/SyncBehanceButton"
import NewProjectButton from "@/components/admin/NewProjectButton"
import ProjectsTable from "@/components/admin/ProjectsTable"

async function getAdminData() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        redirect("/master-access")
    }

    const [
        projectsCount,
        usersCount,
        projects
    ] = await Promise.all([
        prisma.project.count(),
        prisma.user.count(),
        prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        })
    ])

    // Serialize Date objects for client components
    const serializedProjects = projects.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
    }))

    // Count unique categories
    const categories = await prisma.project.groupBy({
        by: ['category'],
        _count: {
            category: true
        }
    })

    return {
        projectsCount,
        categoriesCount: categories.length,
        usersCount,
        projects: serializedProjects
    }
}

export default async function AdminDashboard() {
    const { projectsCount, categoriesCount, usersCount, projects } = await getAdminData()

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Stat Cards */}
                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">Total Proyectos</h3>
                    <p className="text-4xl font-bold">{projectsCount}</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">Categorías</h3>
                    <p className="text-4xl font-bold">{categoriesCount}</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">Visitas (Mes)</h3>
                    <p className="text-4xl font-bold">-</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">Usuarios</h3>
                    <p className="text-4xl font-bold">{usersCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Proyectos Recientes</h2>
                <div className="flex items-center gap-4">
                    <SyncBehanceButton />
                    <NewProjectButton />
                </div>
            </div>

            <ProjectsTable projects={projects} />
        </div>
    )
}
