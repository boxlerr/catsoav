import fs from 'fs';

export async function getBehanceProjects(profileUrl: string) {
    try {
        console.log(`[BehanceSync] Iniciando fetch de: ${profileUrl}`);

        // Usamos una combinación de headers más "humana"
        const response = await fetch(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[BehanceSync] Error en fetch: ${response.status}`);
            return [];
        }

        const html = await response.text();
        console.log(`[BehanceSync] HTML recibido, longitud: ${html.length}.`);

        const projects: any[] = [];
        const seenIds = new Set<string>();

        // ESTRATEGIA 1: Buscar enlaces de galería (lo más fiable en HTML renderizado)
        // Soporta gallery/ID/slug y gallery/ID
        const galleryPatterns = [
            /gallery\/(\d+)\/([^"\\ ]+)/g,
            /gallery\/(\d+)/g
        ];

        for (const pattern of galleryPatterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const id = match[1];
                if (seenIds.has(id)) continue;
                seenIds.add(id);

                const slug = match[2] ? match[2].replace(/\\/g, '') : 'project';
                const url = `https://www.behance.net/gallery/${id}/${slug}`;

                // Buscar contexto para nombre y portada
                const contextStart = Math.max(0, match.index - 1000);
                const contextEnd = Math.min(html.length, match.index + 2000); // Dar más radio al final
                const context = html.substring(contextStart, contextEnd);

                const nameMatch = context.match(/"name":"([^"]+)"/) || context.match(/>([^<]{5,50})</);

                // Intento 1: Patrones estándar de Behance (Preferir los más grandes)
                let cover = null;
                const coverMatch = context.match(/"(original|max_1200|808|max_808|404|405)":"([^"]+)"/);
                if (coverMatch) {
                    cover = coverMatch[2].replace(/\\/g, '');
                } else {
                    // Intento 2: Buscar cualquier imagen de CDN de Behance en el contexto (Preferir las que contengan tamaños grandes)
                    const imgMatch = context.match(/https?:\/\/[^"']+\.behance\.net\/[^"']+\/(?:original|max_1200|808|max_808|404|405)\/[^"']+\.(?:jpg|png|webp)/i);
                    if (imgMatch) cover = imgMatch[0];
                }

                projects.push({
                    behanceId: id,
                    title: nameMatch ? nameMatch[1].trim() : slug.replace(/-/g, ' '),
                    url,
                    cover,
                    category: 'commercial', // Predeterminado a commercial
                    publishedOn: Date.now() / 1000
                });
            }
        }

        // ESTRATEGIA 2: Si no hay proyectos, buscar IDs y nombres sueltos en scripts (JS dinámico)
        if (projects.length === 0) {
            console.log("[BehanceSync] No se detectaron enlaces de galería claros. Intentando extracción de objetos JSON...");
            const objectPattern = /"id":(\d+),"name":"([^"]+)"/g;
            let match;
            while ((match = objectPattern.exec(html)) !== null) {
                const id = match[1];
                if (seenIds.has(id)) continue;
                seenIds.add(id);

                projects.push({
                    behanceId: id,
                    title: match[2],
                    url: `https://www.behance.net/gallery/${id}/project`,
                    cover: null,
                    category: 'videoclips',
                    publishedOn: Date.now() / 1000
                });
            }
        }

        // Limpiar títulos de caracteres extraños y descartar resultados basura
        const cleanProjects = projects.filter(p =>
            p.title &&
            p.title.length > 3 &&
            !p.title.includes('{') &&
            !p.title.includes('}')
        ).map(p => {
            // Decodificar unicode en títulos
            let cleanTitle = p.title.replace(/\\u([0-9a-fA-F]{4})/g, (_: string, m: string) =>
                String.fromCharCode(parseInt(m, 16)));

            // SANITIZAR URL DE PORTADA
            let cleanCover = p.cover;
            if (cleanCover) {
                // 1. Si es un srcset (lista separada por espacios o comas), tomar la primera
                cleanCover = cleanCover.split(/[\s,]+/)[0];

                // 2. Asegurar protocolo
                if (cleanCover.startsWith('//')) {
                    cleanCover = 'https:' + cleanCover;
                } else if (cleanCover.startsWith('mir-') || cleanCover.startsWith('a.thumbs')) {
                    cleanCover = 'https://' + cleanCover;
                }
            }

            return {
                ...p,
                title: cleanTitle,
                cover: cleanCover
            };
        });

        console.log(`[BehanceSync] Finalizado: ${cleanProjects.length} proyectos encontrados.`);
        return cleanProjects;

    } catch (error) {
        console.error('[BehanceSync] Error crítico:', error);
        return [];
    }
}

export async function getBehanceProjectVideo(projectUrl: string) {
    try {
        const response = await fetch(projectUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            cache: 'no-store'
        });
        const html = await response.text();

        // Regex mucho más estrictas y flexibles con el escapado de Behance

        // YouTube embed (normal y escapado)
        const ytMatch = html.match(/youtube\.com(?:\\\/|\/)embed(?:\\\/|\/)([a-zA-Z0-9_-]{11})/) ||
            html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)

        if (ytMatch && !ytMatch[1].includes('{')) {
            return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
        }

        // YouTube short/link (normal y escapado)
        const ytLinkMatch = html.match(/youtu\.be(?:\\\/|\/)([a-zA-Z0-9_-]{11})/) ||
            html.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)

        if (ytLinkMatch && !ytLinkMatch[1].includes('{')) {
            return `https://www.youtube.com/watch?v=${ytLinkMatch[1]}`;
        }

        // Vimeo embed (normal y escapado)
        const vimeoMatch = html.match(/vimeo\.com(?:\\\/|\/)video(?:\\\/|\/)(\d{5,15})/) ||
            html.match(/vimeo\.com\/video\/(\d{5,15})/)

        if (vimeoMatch) {
            return `https://vimeo.com/${vimeoMatch[1]}`;
        }

        return null;
    } catch (error) {
        return null;
    }
}
