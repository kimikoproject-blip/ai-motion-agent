import fs from "fs";
import path from "path";

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
  console.error("ERROR: PEXELS_API_KEY belum tersedia.");
  process.exit(1);
}

const query = process.argv.slice(2).join(" ") || "octopus underwater";

const outputDir = path.resolve("public/assets");
fs.mkdirSync(outputDir, { recursive: true });

console.log(`Searching Pexels: "${query}"`);

const searchUrl =
  "https://api.pexels.com/v1/videos/search" +
  `?query=${encodeURIComponent(query)}` +
  "&orientation=portrait" +
  "&size=medium" +
  "&per_page=10";

const response = await fetch(searchUrl, {
  headers: {
    Authorization: API_KEY
  }
});

if (!response.ok) {
  console.error(`Pexels API error: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const data = await response.json();

if (!data.videos?.length) {
  console.error("Tidak ada video ditemukan.");
  process.exit(1);
}

console.log(`Found ${data.videos.length} videos.`);

const video = data.videos[0];

console.log(`Video ID: ${video.id}`);
console.log(`Pexels URL: ${video.url}`);

const files = (video.video_files || [])
  .filter(file => file.link && file.width && file.height);

if (!files.length) {
  console.error("Tidak ada file video yang tersedia.");
  process.exit(1);
}

const portraitFiles = files
  .filter(file => file.height >= file.width)
  .sort((a, b) => {
    const aRatio = Math.abs((a.width / a.height) - 9 / 16);
    const bRatio = Math.abs((b.width / b.height) - 9 / 16);

    if (aRatio !== bRatio) {
      return aRatio - bRatio;
    }

    return (b.width * b.height) - (a.width * a.height);
  });

const selected =
  portraitFiles[0] ||
  files.sort(
    (a, b) => (b.width * b.height) - (a.width * a.height)
  )[0];

console.log(
  `Selected: ${selected.width}x${selected.height}`
);

console.log("Downloading...");

const videoResponse = await fetch(selected.link);

if (!videoResponse.ok) {
  console.error(`Download gagal: ${videoResponse.status}`);
  process.exit(1);
}

const buffer = Buffer.from(
  await videoResponse.arrayBuffer()
);

const safeName = query
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const filename = `${safeName || "broll"}-${video.id}.mp4`;
const outputPath = path.join(outputDir, filename);

fs.writeFileSync(outputPath, buffer);

console.log("");
console.log("SUCCESS!");
console.log(`Saved: ${outputPath}`);
console.log(
  `Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
);
