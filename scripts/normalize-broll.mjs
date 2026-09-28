import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const assetDir = path.resolve("public/assets");
const fixedDir = path.resolve("public/assets/normalized");

fs.mkdirSync(fixedDir, { recursive: true });

const files = fs
  .readdirSync(assetDir)
  .filter((f) => f.toLowerCase().endsWith(".mp4"));

if (!files.length) {
  console.log("Tidak ada MP4 di public/assets");
  process.exit(0);
}

for (const file of files) {
  const input = path.join(assetDir, file);
  const output = path.join(fixedDir, file);

  console.log("");
  console.log(`Normalizing: ${file}`);

  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,

        "-vf",
        "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",

        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",

        "-an",

        output,
      ],
      {
        stdio: "inherit",
      }
    );

    console.log(`OK: ${output}`);
  } catch (error) {
    console.error(`GAGAL: ${file}`);
  }
}

console.log("");
console.log("================================");
console.log("B-ROLL NORMALIZATION SELESAI");
console.log(`Output: ${fixedDir}`);
console.log("================================");
