export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <img src="/logo-white.png" alt="CATSO AV" className="h-6 w-auto" />
                                <span className="text-xs font-sans font-normal text-white/40 uppercase tracking-widest">Admin</span>
                            </div>
                            <div className="hidden md:flex gap-6">
                                <a href="/admin" className="text-sm font-medium hover:text-red-600 transition-colors">Dashboard</a>
                                <a href="/admin/projects" className="text-sm font-medium hover:text-red-600 transition-colors">Proyectos</a>
                                <a href="/admin/users" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Usuarios</a>
                            </div>
                        </div>
                        <div>
                            <a href="/" className="text-sm text-white/60 hover:text-white mr-4">Ver Sitio</a>
                            <button className="bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs uppercase tracking-wider font-bold py-2 px-4 rounded border border-red-600/20 transition-all">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
