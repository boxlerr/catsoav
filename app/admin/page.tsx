import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

async function getAdminData() {
    const [
        projectsCount,
        usersCount,
        projects
    ] = await Promise.all([
        prisma.project.count(),
        prisma.user.count(),
        prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ])

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
        projects
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
                    <p className="text-4xl font-bold">-</p> {/* Placeholder for analytics */}
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">Usuarios</h3>
                    <p className="text-4xl font-bold">{usersCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Proyectos Recientes</h2>
                <a href="/admin/projects/new" className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded font-medium text-sm transition-colors">
                    + Nuevo Proyecto
                </a>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-800 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/60 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                                    No hay proyectos aún.
                                </td>
                            </tr>
                        ) : (
                            projects.map((project: { id: string; title: string; category: string; createdAt: Date }) => (
                                <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{project.title}</td>
                                    <td className="px-6 py-4 text-white/60 capitalize">{project.category}</td>
                                    <td className="px-6 py-4 text-white/60">{new Date(project.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <a href={`/admin/projects/${project.id}/edit`} className="text-white/60 hover:text-white mr-4 transition-colors">Editar</a>
                                        {/* Delete functionality would likely require client component or server action form */}
                                        <button className="text-red-500 hover:text-red-400 transition-colors">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
