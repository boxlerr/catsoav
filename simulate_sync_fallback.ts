
import { getBehanceProjects, getBehanceProjectDetails } from "./lib/behance-sync";

async function testSyncLogic() {
    console.log("🔄 Testing Sync Logic Simulation...");

    // 1. Get Projects
    const projects = await getBehanceProjects("https://www.behance.net/catsoav");
    console.log(`Found ${projects.length} projects.`);

    // 2. Find Dinastia
    const dinastia = projects.find(p => p.title.includes("Dinastia"));

    if (dinastia) {
        console.log(`\n🧪 Testing project: ${dinastia.title}`);
        console.log(`   Original URL: ${dinastia.url}`);

        // 3. Try to get Details
        const details = await getBehanceProjectDetails(dinastia.url);
        let videoUrl = details.videoUrl;
        console.log(`   Extracted Video URL: ${videoUrl}`);
        console.log(`   Extracted Images: ${details.images.length}`);

        // 4. Apply Fallback Logic (Same as in route.ts)
        if (!videoUrl) {
            console.log("   ⚠️ Video not found (null). Applying fallback...");
            videoUrl = dinastia.url;
            console.log(`   ✅ FALLBACK APPLIED. Final Video URL: ${videoUrl}`);
        } else {
            console.log("   ✅ Video found natively.");
        }

        if (videoUrl === dinastia.url) {
            console.log("\n🎉 SUCCESS: Fallback logic works!");
        } else if (videoUrl && videoUrl.includes("adobe.io")) {
            console.log("\n🎉 SUCCESS: Native detection works!");
        } else {
            console.log("\n❌ FAILURE: Something weird happened.");
        }

    } else {
        console.error("❌ 'Dinastia' project not found in profile scarping.");
    }
}

testSyncLogic();
