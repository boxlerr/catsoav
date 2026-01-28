"use client"

import DeleteProjectButton from "./DeleteProjectButton"

interface Project {
    id: string
    title: string
    category: string
    createdAt: string | Date
}

interface ProjectsTableProps {
    projects: Project[]
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
    return (
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
                        projects.map((project) => (
                            <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium">{project.title}</td>
                                <td className="px-6 py-4 text-white/60 capitalize">{project.category}</td>
                                <td className="px-6 py-4 text-white/60">{new Date(project.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <a href={`/admin/projects/${project.id}/edit`} className="text-white/60 hover:text-white mr-4 transition-colors">Editar</a>
                                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
