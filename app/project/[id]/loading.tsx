export default function ProjectLoading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="max-w-[1800px] mx-auto pt-32 px-4 md:px-8">
                {/* Header Skeleton */}
                <div className="max-w-5xl mx-auto mb-16 text-center space-y-6">
                    <div className="w-24 h-6 bg-white/5 rounded-full mx-auto animate-pulse" />
                    <div className="w-full max-w-2xl h-16 bg-white/5 rounded-lg mx-auto animate-pulse" />
                    <div className="w-48 h-4 bg-white/5 rounded-lg mx-auto animate-pulse" />
                </div>

                {/* Main Content Skeleton */}
                <div className="w-full aspect-video bg-white/5 rounded-xl border border-white/10 animate-pulse mb-24" />

                {/* Gallery Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-video bg-white/5 rounded-lg border border-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
