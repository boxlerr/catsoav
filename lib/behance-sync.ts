// No imports needed for now as fetch is global in Node 18+

export async function getBehanceProjects(profileUrl: string) {
    try {
        console.log(`[BehanceSync] Iniciando fetch de proyectos para: ${profileUrl}`);

        const projects: any[] = [];
        const seenIds = new Set<string>();

        // 1. ESTRATEGIA 1: Behance V2 API (Mucho más fiable)
        const usernameMatch = profileUrl.match(/behance\.net\/([^/?#]+)/);
        if (usernameMatch) {
            const username = usernameMatch[1];
            const apiKey = process.env.BEHANCE_API_KEY || 'behance1';
            const apiUrl = `https://www.behance.net/v2/users/${username}/projects?api_key=${apiKey}`;

            try {
                console.log(`[BehanceSync] Consultando API de proyectos: ${apiUrl}`);
                const apiRes = await fetch(apiUrl);
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (data.projects && Array.isArray(data.projects)) {
                        console.log(`[BehanceSync] API retornó ${data.projects.length} proyectos.`);
                        for (const p of data.projects) {
                            if (seenIds.has(p.id.toString())) continue;
                            seenIds.add(p.id.toString());

                            projects.push({
                                behanceId: p.id.toString(),
                                title: p.name,
                                url: p.url,
                                cover: p.covers["404"] || p.covers["original"] || Object.values(p.covers)[0],
                                category: 'commercial',
                                publishedOn: p.published_on
                            });
                        }

                        if (projects.length > 0) {
                            return projects;
                        }
                    }
                }
            } catch (e) {
                console.warn("[BehanceSync] Error consultando API, intentando scraping HTML...", e);
            }
        }

        // 2. ESTRATEGIA 2: Scraping HTML (Fallback si falla la API)
        console.log(`[BehanceSync] Realizando fallback de scraping HTML para: ${profileUrl}`);
        const response = await fetch(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[BehanceSync] Error en fetch HTML: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const galleryPatterns = [/gallery\/(\d+)\/([^"\\ ]+)/g, /gallery\/(\d+)/g];

        for (const pattern of galleryPatterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const id = match[1];
                if (seenIds.has(id)) continue;
                seenIds.add(id);

                const slug = match[2] ? match[2].replace(/\\/g, '') : 'project';
                const url = `https://www.behance.net/gallery/${id}/${slug}`;
                const context = html.substring(Math.max(0, match.index - 1000), Math.min(html.length, match.index + 2000));

                const nameMatch = context.match(/"name":"([^"]+)"/) || context.match(/>([^<]{5,50})</);
                let cover = null;
                const coverMatch = context.match(/"(original|max_1200|808|max_808|404|405)":"([^"]+)"/);
                if (coverMatch) {
                    cover = coverMatch[2].replace(/\\/g, '');
                }

                projects.push({
                    behanceId: id,
                    title: nameMatch ? nameMatch[1].trim() : slug.replace(/-/g, ' '),
                    url,
                    cover,
                    category: 'commercial',
                    publishedOn: Date.now() / 1000
                });
            }
        }

        // Limpiar resultados (Misma lógica de limpieza anterior)
        return projects.filter(p => p.title && p.title.length > 3).map(p => {
            let cleanTitle = p.title.replace(/\\u([0-9a-fA-F]{4})/g, (_: string, m: string) =>
                String.fromCharCode(parseInt(m, 16)));

            let cleanCover = p.cover;
            if (cleanCover) {
                cleanCover = cleanCover.split(/[\s,]+/)[0];
                if (cleanCover.startsWith('//')) cleanCover = 'https:' + cleanCover;
                else if (cleanCover.startsWith('mir-') || cleanCover.startsWith('a.thumbs')) cleanCover = 'https://' + cleanCover;
            }

            return { ...p, title: cleanTitle, cover: cleanCover };
        });

    } catch (error) {
        console.error('[BehanceSync] Error crítico en getBehanceProjects:', error);
        return [];
    }
}

export async function getBehanceProjectDetails(projectUrl: string) {
    const result = {
        videoUrl: null as string | null,
        images: [] as string[]
    };

    try {
        console.log(`[BehanceSync] Analizando detalles de: ${projectUrl}`);

        // 1. Intentar API V2 primero (Más fiable)
        const idMatch = projectUrl.match(/gallery\/(\d+)/);
        if (idMatch) {
            const projectId = idMatch[1];
            const apiKey = process.env.BEHANCE_API_KEY || 'behance1';
            const apiUrl = `https://www.behance.net/v2/projects/${projectId}?api_key=${apiKey}`;

            try {
                console.log(`[BehanceSync] Consultando API: ${apiUrl}`);
                const apiRes = await fetch(apiUrl);
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (data.project && data.project.modules) {
                        for (const m of data.project.modules) {
                            // Video / Embed
                            if (m.type === 'video' || m.type === 'embed') {
                                if (m.src && m.src.includes('youtube')) result.videoUrl = m.src;
                                else if (m.src && m.src.includes('vimeo')) result.videoUrl = m.src;
                                else if (m.embed) {
                                    if (m.embed.includes('adobe.io')) {
                                        const adobeMatch = m.embed.match(/adobe\.io\/v1\/player\/ccv\/([a-zA-Z0-9_-]+)/);
                                        if (adobeMatch) {
                                            const apiKey = process.env.BEHANCE_API_KEY || 'behance1';
                                            result.videoUrl = `https://www-ccv.adobe.io/v1/player/ccv/${adobeMatch[1]}/embed?api_key=${apiKey}&bgcolor=%23191919`;
                                        }
                                    }
                                }
                            }
                            // Images
                            if (m.type === 'image' && m.src) {
                                result.images.push(m.src);
                            }
                            // Media Collection (Grid)
                            if (m.type === 'media_collection' && m.components) {
                                for (const c of m.components) {
                                    if (c.type === 'image' && c.src) {
                                        result.images.push(c.src);
                                    }
                                }
                            }

                            // CCV Hidden in JSON
                            const mStr = JSON.stringify(m);
                            if (!result.videoUrl && mStr.includes('adobe.io/v1/player/ccv')) {
                                const adobeMatch = mStr.match(/adobe\.io\/v1\/player\/ccv\/([a-zA-Z0-9_-]+)/);
                                if (adobeMatch) {
                                    const apiKey = process.env.BEHANCE_API_KEY || 'behance1';
                                    result.videoUrl = `https://www-ccv.adobe.io/v1/player/ccv/${adobeMatch[1]}/embed?api_key=${apiKey}&bgcolor=%23191919`;
                                }
                            }
                        }
                        // If we found data via API, return early (preferred)
                        if (result.videoUrl || result.images.length > 0) {
                            return result;
                        }
                    }
                }
            } catch (e) {
                console.warn("[BehanceSync] Falló consulta a API, usando fallback HTML", e);
            }
        }

        // 2. Fallback: Scraping HTML
        const response = await fetch(projectUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                // Add robust headers here if needed, reused from getBehanceProjects
            },
            cache: 'no-store'
        });
        const html = await response.text();

        // Extract Video (Same logic as before)
        if (!result.videoUrl) {
            const ytMatch = html.match(/youtube\.com(?:\\\/|\/)embed(?:\\\/|\/)([a-zA-Z0-9_-]{11})/) ||
                html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
            if (ytMatch && !ytMatch[1].includes('{')) result.videoUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`;

            const ytLinkMatch = html.match(/youtu\.be(?:\\\/|\/)([a-zA-Z0-9_-]{11})/) ||
                html.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
            if (ytLinkMatch && !ytLinkMatch[1].includes('{')) result.videoUrl = `https://www.youtube.com/watch?v=${ytLinkMatch[1]}`;

            const vimeoMatch = html.match(/vimeo\.com(?:\\\/|\/)video(?:\\\/|\/)(\d{5,15})/) ||
                html.match(/vimeo\.com\/video\/(\d{5,15})/)
            if (vimeoMatch) result.videoUrl = `https://vimeo.com/${vimeoMatch[1]}`;

            const adobeCCVMatch = html.match(/adobe\.io\/v1\/player\/ccv\/([a-zA-Z0-9_-]+)/);
            if (adobeCCVMatch) {
                const apiKey = process.env.BEHANCE_API_KEY || 'behance1';
                result.videoUrl = `https://www-ccv.adobe.io/v1/player/ccv/${adobeCCVMatch[1]}/embed?api_key=${apiKey}&bgcolor=%23191919`;
            }

            const directVideoMatch = html.match(/(https?:\/\/[^"'\s]+\.behance\.net\/[^"'\s]+\.(mp4|webm|mov))/i);
            if (directVideoMatch) result.videoUrl = directVideoMatch[1];
        }

        // Extract Images (New HTML Scraping)
        // Find all img tags inside project modules or generally large images
        // Look for typical Behance image CDN URLs: mir-s3-cdn-cf.behance.net/project_modules/...
        const imgRegex = /https?:\/\/[^"']+\.behance\.net\/project_modules\/(?:fs|max_1200|1400|disp|source)\/[^"']+\.(?:jpg|png|webp|jpeg)/gi;
        const foundImages = html.match(imgRegex);
        if (foundImages) {
            // Deduplicate and filter
            const uniqueImages = Array.from(new Set(foundImages));
            result.images = uniqueImages;
        }

        return result;

    } catch (error) {
        console.error("Error getting project details:", error);
        return result;
    }
}
