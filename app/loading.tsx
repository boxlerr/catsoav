export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="relative">
                {/* Logo Placeholder */}
                <div className="w-32 h-32 mb-8 relative animate-pulse">
                    <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
                    <div className="w-full h-full border-t-2 border-red-600 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <h2 className="text-white/20 text-xs font-black uppercase tracking-[0.5em] animate-pulse">CATSO AV</h2>
                </div>
            </div>
        </div>
    );
}
