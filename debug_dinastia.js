async function debug() {
    const profileUrl = "https://www.behance.net/catsoav";
    console.log(`Fetching ${profileUrl}...`);

    try {
        const response = await fetch(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            }
        });

        const html = await response.text();
        console.log(`Length: ${html.length}`);

        const pattern = /gallery\/(\d+)\/([^"\\ ]+)/g;
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const id = match[1];
            const slug = match[2].replace(/\\/g, '');

            if (slug.toLowerCase().includes('dinastia')) {
                console.log(`Found Dinastia: ID=${id}, Slug=${slug}`);
                const contextStart = Math.max(0, match.index - 500);
                const contextEnd = Math.min(html.length, match.index + 2000);
                const context = html.substring(contextStart, contextEnd);

                const nameMatch = context.match(/"name":"([^"]+)"/);
                const coverMatch = context.match(/"(404|808|original|max_808|max_1200)":"([^"]+)"/);

                console.log("Extracted Name:", nameMatch ? nameMatch[1] : "NOT FOUND");
                console.log("Extracted Cover:", coverMatch ? coverMatch[2] : "NOT FOUND");

                // Fetch project detail
                const projectUrl = `https://www.behance.net/gallery/${id}/${slug}`;
                console.log(`Fetching Detail: ${projectUrl}...`);
                const detailRes = await fetch(projectUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const detailHtml = await detailRes.text();
                const ytMatch = detailHtml.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/) || detailHtml.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                const vimeoMatch = detailHtml.match(/vimeo\.com\/video\/(\d{5,15})/);

                console.log("Video YT:", ytMatch ? ytMatch[1] : "NOT FOUND");
                console.log("Video Vimeo:", vimeoMatch ? vimeoMatch[1] : "NOT FOUND");
            }
        }
    } catch (e) {
        console.error(e);
    }
}

debug();
