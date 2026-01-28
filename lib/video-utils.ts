export function getYouTubeId(url: string): string | null {
    if (!url) return null;

    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /^([^"&?\/\s]{11})$/ // Direct ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1] && !match[1].includes('{') && !match[1].includes('"')) {
            return match[1];
        }
    }

    // Fallback for tricky URLs like youtu.be/ID?params
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split(/[?#&]/)[0];
        if (id.length === 11) return id;
    }

    return null;
}

export function getVimeoId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return (match && match[1]) ? match[1] : null;
}

export function isDirectVideo(url: string): boolean {
    if (!url) return false;
    return url.startsWith('/uploads/') ||
        url.startsWith('blob:') ||
        /\.(mp4|webm|mov|ogg|m4v|3gp|avi)($|\?|#)/i.test(url);
}
