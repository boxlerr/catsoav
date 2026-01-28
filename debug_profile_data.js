const fs = require('fs');

async function debug() {
    const profileUrl = "https://www.behance.net/catsoav";
    const res = await fetch(profileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();

    // Buscar el bloque de datos de proyectos
    // Behance suele tener un window.adobeid o similar, o un script con "projects"
    const projectsBlock = html.match(/{"projects":\[.*?\]}/);
    if (projectsBlock) {
        console.log("Found projects JSON block!");
        const data = JSON.parse(projectsBlock[0]);
        const dinastia = data.projects.find(p => p.name.includes('Dinastia'));
        if (dinastia) {
            console.log("Dinastia Data:", JSON.stringify(dinastia, null, 2));
        }
    } else {
        console.log("Projects JSON block NOT found. Searching for images...");
        const images = html.match(/https?:\/\/[^"']+\/(?:404|808|original|max_808|max_1200)\/[^"']+\.(?:jpg|png|webp)/g);
        console.log("Found Images (first 10):", images ? images.slice(0, 10) : "None");
    }
}

debug();
