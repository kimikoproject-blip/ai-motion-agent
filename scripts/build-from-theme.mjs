import "dotenv/config";

import fs from "node:fs";
import { spawn } from "node:child_process";

import {
  askAI,
  extractJSON,
} from "./ai-provider.mjs";

const theme = process.argv
  .slice(2)
  .join(" ")
  .trim();

if (!theme) {
  console.error("");
  console.error(
    'Contoh: node scripts/build-from-theme.mjs "Kenapa gurita punya tiga jantung?"'
  );
  console.error("");
  process.exit(1);
}

const SCENES_FILE =
  "remotion/data/scenes.json";

const prompt = `
Kamu adalah AI Visual Scene Planner untuk video Shorts/TikTok edukasi.

Buat video pendek berdasarkan tema berikut:

"${theme}"

Tujuan:
- fakta harus jelas
- visual harus mudah dipahami
- setiap scene memiliki SATU komposisi visual utuh
- visual harus menjelaskan narasi
- jangan membuat visual seperti kumpulan gambar tempelan
- jangan meminta image generator membuat teks

Untuk setiap scene tentukan:

- scene_id
- narration
- visual_type
- visual
- subject
- environment
- focus
- visual_relationship
- action
- emphasis
- motion
- overlay_text

visual_type WAJIB salah satu:

CHARACTER_FACT
SIMPLE_ANATOMY
PROCESS
COMPARISON
MAP_LOCATION
OBJECT_EXPLANATION

motion WAJIB salah satu:

zoom_in
zoom_out
pan_left
pan_right
focus
reveal
none

ATURAN PENTING:

1. Buat narasi natural dalam bahasa Indonesia.
2. Buat sekitar 30-45 detik.
3. Gunakan 3-6 scene.
4. Jangan membuat scene baru hanya karena kalimat berubah.
5. Buat scene baru ketika informasi visual benar-benar berubah.
6. Setiap scene harus bisa dipahami tanpa overlay_text.
7. Image generator tidak boleh membuat:
   - text
   - letters
   - numbers
   - labels
   - captions
   - subtitles
   - logos
   - watermark
8. Overlay_text harus pendek.
9. Hindari visual yang terlalu rumit.
10. Jangan menggunakan istilah visual yang membutuhkan tulisan agar bisa dipahami.
11. Jika sebuah fakta membutuhkan perbandingan, buat perbandingan visual.
12. Jika sebuah fakta membutuhkan proses, tampilkan proses dalam satu komposisi.
13. Jika sebuah fakta membutuhkan anatomi, gunakan anatomi kartun sederhana.
14. Jangan membuat diagram ilmiah rumit.

STYLE:

Cute modern animated educational illustration.
Polished cartoon style.
Clear shapes.
Strong visual hierarchy.
Friendly.
Colorful.
Professional Shorts/TikTok explainer aesthetic.

Keluarkan JSON VALID SAJA:

{
  "title": "judul pendek",
  "scenes": [
    {
      "scene_id": 1,
      "narration": "...",
      "visual_type": "CHARACTER_FACT",
      "visual": "...",
      "subject": "...",
      "environment": "...",
      "focus": "...",
      "visual_relationship": "...",
      "action": "...",
      "emphasis": "...",
      "motion": "zoom_in",
      "overlay_text": "..."
    }
  ]
}
`;

async function run(
  command,
  args,
  env = {}
) {
  return new Promise(
    (resolve, reject) => {
      console.log("");
      console.log(
        `▶️ ${command} ${args.join(" ")}`
      );
      console.log("");

      const child = spawn(
        command,
        args,
        {
          stdio: "inherit",
          env: {
            ...process.env,
            ...env,
          },
        }
      );

      child.on(
        "close",
        (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `${command} gagal dengan exit code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

console.log("");
console.log("========================================");
console.log("🚀 AI MOTION VIDEO BUILDER");
console.log("========================================");
console.log("");
console.log(`Tema: ${theme}`);
console.log("");

/*
|--------------------------------------------------------------------------
| STEP 1 — AI PLANNER
|--------------------------------------------------------------------------
*/

console.log("STEP 1/4");
console.log("🧠 Membuat script + visual plan...");

let plan;

try {
  const result =
    await askAI(prompt);

  plan =
    extractJSON(result);
} catch (error) {
  console.error("");
  console.error(
    "❌ Planner gagal:"
  );
  console.error(
    error.message
  );
  process.exit(1);
}

if (
  !plan ||
  !Array.isArray(plan.scenes) ||
  plan.scenes.length === 0
) {
  throw new Error(
    "Planner tidak menghasilkan scenes."
  );
}

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

const allowedTypes = new Set([
  "CHARACTER_FACT",
  "SIMPLE_ANATOMY",
  "PROCESS",
  "COMPARISON",
  "MAP_LOCATION",
  "OBJECT_EXPLANATION",
]);

const allowedMotion = new Set([
  "zoom_in",
  "zoom_out",
  "pan_left",
  "pan_right",
  "focus",
  "reveal",
  "none",
]);

for (
  let i = 0;
  i < plan.scenes.length;
  i++
) {
  const scene =
    plan.scenes[i];

  scene.scene_id =
    i + 1;

  if (
    !allowedTypes.has(
      scene.visual_type
    )
  ) {
    scene.visual_type =
      "CHARACTER_FACT";
  }

  if (
    !allowedMotion.has(
      scene.motion
    )
  ) {
    scene.motion =
      "zoom_in";
  }

  scene.overlay_text =
    String(
      scene.overlay_text || ""
    ).slice(0, 60);
}

fs.writeFileSync(
  SCENES_FILE,
  JSON.stringify(
    plan,
    null,
    2
  )
);

console.log("");
console.log("✅ Scene plan tersimpan");
console.log(
  `📁 ${SCENES_FILE}`
);
console.log(
  `🎬 ${plan.scenes.length} scene`
);

/*
|--------------------------------------------------------------------------
| STEP 2 — GENERATE IMAGES
|--------------------------------------------------------------------------
*/

console.log("");
console.log("STEP 2/4");
console.log("🎨 Generate scene images...");

await run(
  "node",
  [
    "scripts/generate-scenes.mjs",
  ]
);

/*
|--------------------------------------------------------------------------
| STEP 3 — CHECK ASSETS
|--------------------------------------------------------------------------
*/

console.log("");
console.log("STEP 3/4");
console.log("🔎 Memeriksa scene images...");

for (
  const scene of plan.scenes
) {
  const filename =
    `scene-${String(
      scene.scene_id
    ).padStart(2, "0")}.png`;

  const file =
    `remotion/assets/scenes/${filename}`;

  if (
    !fs.existsSync(file)
  ) {
    throw new Error(
      `Asset tidak ditemukan: ${file}`
    );
  }

  const stat =
    fs.statSync(file);

  if (
    stat.size < 1000
  ) {
    throw new Error(
      `Asset terlalu kecil / kemungkinan rusak: ${file}`
    );
  }

  console.log(
    `✓ ${file}`
  );
}

/*
|--------------------------------------------------------------------------
| STEP 4 — RENDER
|--------------------------------------------------------------------------
*/

console.log("");
console.log("STEP 4/4");
console.log("🎬 Render video...");

await run(
  "npx",
  [
    "remotion",
    "render",
    "remotion/src/index.jsx",
    "AutoMotionShort",
    "out/auto-motion-short.mp4",
  ]
);

console.log("");
console.log("========================================");
console.log("🎉 VIDEO SELESAI");
console.log("========================================");
console.log("");
console.log(
  `📁 out/auto-motion-short.mp4`
);
console.log(
  `📝 ${plan.title || "AI Motion Short"}`
);
console.log("");
