async function debug() {
    const projectUrl = "https://www.behance.net/gallery/191834161/Dinastia-Shoe-Posters-Spring-Season-2024"; // ID from previous run if I had it, but let's assume it's this
    console.log(`Fetching Detail: ${projectUrl}...`);

    try {
        const response = await fetch(projectUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        const html = await response.text();
        console.log(`Length: ${html.length}`);

        // Buscamos cualquier cosa que parezca un iframe o video
        const iframes = html.match(/<iframe[^>]+src="([^"]+)"/g);
        console.log("Found Iframes:", iframes);

        const embeds = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com|vimeo\.com|youtu\.be)\/[^"'\s]+/g);
        console.log("Found Video Links:", embeds);

        // Guardar para inspección manual si es necesario
        require('fs').writeFileSync('dinastia_detail.html', html);

    } catch (e) {
        console.error(e);
    }
}

debug();
