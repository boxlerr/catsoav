import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SyncBehanceButton from "@/components/admin/SyncBehanceButton"
import NewProjectButton from "@/components/admin/NewProjectButton"
import NewCategoryButton from "@/components/admin/NewCategoryButton"
import AdminContent from "@/components/admin/AdminContent"
import { getTranslations } from "next-intl/server"

async function getAdminData() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        redirect("/master-access")
    }

    const [
        projectsCount,
        allUsers,
        projects,
        categories
    ] = await Promise.all([
        prisma.project.count().catch(() => 0),
        prisma.user.findMany({ select: { id: true } }).catch(() => []),
        prisma.project.findMany({
            orderBy: [{ category: 'asc' }, { order: 'asc' }]
        }).catch(() => []),
        prisma.category.findMany({
            orderBy: { order: 'asc' }
        }).catch(() => [])
    ])

    // Serialize Date objects for client components
    const serializedProjects = projects.map(p => ({
        ...p,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date().toISOString()
    }))

    const serializedCategories = categories.map(c => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : new Date().toISOString()
    }))

    return {
        projectsCount,
        categoriesCount: categories.length,
        usersCount: allUsers.length,
        projects: serializedProjects,
        categories: serializedCategories
    }
}

interface AdminPageProps {
    params: Promise<{ locale: string }>
}

export default async function AdminDashboard({ params }: AdminPageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Admin' })
    const { projectsCount, categoriesCount, usersCount, projects, categories } = await getAdminData()

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold mb-8">{t('dashboard')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Stat Cards */}
                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">{t('totalProjects')}</h3>
                    <p className="text-4xl font-bold">{projectsCount}</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">{t('categories')}</h3>
                    <p className="text-4xl font-bold">{categoriesCount}</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">{t('monthlyVisits')}</h3>
                    <p className="text-4xl font-bold">-</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">{t('users')}</h3>
                    <p className="text-4xl font-bold">{usersCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('contentManagement')}</h2>
                <div className="flex items-center gap-4">
                    <SyncBehanceButton />
                    <NewCategoryButton />
                    <NewProjectButton />
                </div>
            </div>

            <AdminContent initialProjects={projects} initialCategories={categories} />
        </div>
    )
}
