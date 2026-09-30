import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  askAI,
  extractJSON,
} from "./ai-provider.mjs";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const outputPath =
  path.join(
    __dirname,
    "../remotion/data/scenes.json"
  );

const theme =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!theme) {
  console.error(
    "❌ Masukkan tema."
  );

  console.error(
    'Contoh: node scripts/generate-scenes.mjs "fakta unik gurita"'
  );

  process.exit(1);
}

// =========================================================
// MOTION PLANNER
// =========================================================

const prompt = `
Kamu adalah AI Motion Planner untuk video
TikTok / YouTube Shorts vertikal 9:16.

Tema:
"${theme}"

Tugas:
Buat script narasi pendek 30-45 detik
dan motion plan visual yang benar-benar mengikuti
isi narasi.

PRINSIP UTAMA:

1. Semua visual harus relevan dengan narasi.
2. Jangan memasukkan visual random.
3. Setiap scene harus punya perubahan visual.
4. Gunakan kinetic typography.
5. Gunakan angka besar untuk fakta numerik.
6. Gunakan emoji sebagai representasi objek sederhana.
7. Gunakan shape untuk diagram, highlight, lingkaran,
   titik, blok, atau elemen dekoratif.
8. Gunakan arrow untuk menunjukkan hubungan atau arah.
9. Gunakan progress untuk persentase/perbandingan.
10. Gunakan ring untuk statistik/persentase penting.
11. Gunakan koordinat x/y untuk membuat layout dinamis.
12. Hindari terlalu banyak elemen sekaligus.
13. Jangan menutupi elemen utama dengan elemen lain.
14. Maksimal sekitar 5-7 elemen per scene.
15. Visual harus terasa seperti motion infographic modern.
16. Jangan membuat footage video. Semua visual berasal
    dari Motion Engine.
17. Jangan menggunakan tipe elemen selain yang diizinkan.

=========================================================
ALLOWED ELEMENT TYPES
=========================================================

"text"
"emoji"
"number"
"shape"
"arrow"
"progress"
"ring"

=========================================================
TEXT
=========================================================

Format:

{
  "type": "text",
  "value": "TEKS",
  "x": 50,
  "y": 25,
  "size": 80,
  "weight": 900,
  "color": "white",
  "align": "center",
  "animation": "pop",
  "start": 0
}

Animation:
"pop"
"impact"
"slide"
"fade"
"bounce"
"float"

x/y adalah persen dari layar.

=========================================================
EMOJI
=========================================================

Format:

{
  "type": "emoji",
  "value": "🐙",
  "x": 50,
  "y": 45,
  "size": 260,
  "animation": "pop",
  "start": 0
}

Animation:
"pop"
"impact"
"slide"
"fade"
"bounce"
"float"

=========================================================
NUMBER
=========================================================

Gunakan untuk angka yang menjadi fokus.

Format:

{
  "type": "number",
  "value": "3",
  "x": 50,
  "y": 45,
  "size": 320,
  "color": "#ffffff",
  "animation": "impact",
  "start": 0
}

=========================================================
SHAPE
=========================================================

Shape yang tersedia:

"circle"
"dot"
"rect"
"pill"
"ring"
"line"
"highlight"

Format:

{
  "type": "shape",
  "shape": "circle",
  "x": 50,
  "y": 50,
  "size": 180,
  "color": "#6C63FF",
  "animation": "pop",
  "start": 0
}

Untuk line:

{
  "type": "shape",
  "shape": "line",
  "x": 50,
  "y": 50,
  "width": 500,
  "thickness": 8,
  "rotation": 0,
  "color": "white",
  "animation": "slide",
  "start": 0
}

Untuk highlight:

{
  "type": "shape",
  "shape": "highlight",
  "x": 50,
  "y": 50,
  "width": 500,
  "height": 100,
  "radius": 20,
  "color": "rgba(255,220,0,0.25)",
  "animation": "fade",
  "start": 0
}

=========================================================
ARROW
=========================================================

Gunakan ketika visual membutuhkan arah atau hubungan.

Format:

{
  "type": "arrow",
  "x": 50,
  "y": 50,
  "width": 280,
  "thickness": 10,
  "headSize": 30,
  "rotation": 0,
  "color": "white",
  "animation": "slide",
  "start": 0
}

=========================================================
PROGRESS
=========================================================

Gunakan untuk persentase atau perbandingan.

Format:

{
  "type": "progress",
  "value": 70,
  "x": 50,
  "y": 65,
  "width": 700,
  "height": 32,
  "color": "#6C63FF",
  "label": "Contoh",
  "showValue": true,
  "animation": "slide",
  "start": 0
}

=========================================================
RING
=========================================================

Gunakan untuk statistik penting.

Format:

{
  "type": "ring",
  "value": 75,
  "x": 50,
  "y": 50,
  "size": 360,
  "stroke": 28,
  "color": "#6C63FF",
  "label": "STATISTIK",
  "animation": "pop",
  "start": 0
}

=========================================================
SCENE STRUCTURE
=========================================================

Output HARUS berupa JSON valid:

{
  "title": "...",
  "totalDuration": 35,
  "scenes": [
    {
      "id": 1,
      "duration": 6,
      "narration": "...",
      "visualConcept": "...",
      "motionPlan": {
        "background": "#101522",
        "elements": []
      }
    }
  ]
}

=========================================================
TIMING
=========================================================

"start" menggunakan DETIK.

Contoh:

start: 0
start: 1.5
start: 3

Scene duration menggunakan DETIK.

Pastikan:
- total scene duration sekitar 30-45 detik
- narration cocok dengan durasi
- elemen muncul mengikuti urutan narasi

=========================================================
VISUAL STORYTELLING
=========================================================

Jangan hanya menaruh teks di tengah.

Contoh buruk:

TEXT
TEXT
EMOJI

Contoh bagus:

      3
   ❤️ ❤️ ❤️
      ↓
   🫀 🫀 🫀

atau:

   JANTUNG
       ↓
   ┌─────────┐
   │   3     │
   │ JANTUNG │
   └─────────┘

Gunakan posisi x/y untuk membuat komposisi.

=========================================================
FACTUALITY
=========================================================

Jangan mengarang fakta.

Jika sebuah fakta membutuhkan angka,
gunakan angka yang masuk akal dan konsisten
dengan narasi.

=========================================================
IMPORTANT
=========================================================

Jangan menghasilkan Markdown.

Jangan menghasilkan komentar.

Jangan menghasilkan code fence.

Output hanya JSON valid.
`;

try {
  console.log(
    "🧠 Membuat Motion Plan..."
  );

  console.log(
    `🎯 Tema: ${theme}`
  );

  const raw =
    await askAI(prompt);

  const data =
    extractJSON(raw);

  if (
    !data ||
    !Array.isArray(data.scenes)
  ) {
    throw new Error(
      "Motion Plan tidak memiliki scenes[]."
    );
  }

  // =======================================================
  // NORMALIZE
  // =======================================================

  data.title =
    String(
      data.title ||
      theme
    );

  data.scenes =
    data.scenes.map(
      (scene, sceneIndex) => {

        const normalized = {
          id:
            scene.id ??
            sceneIndex + 1,

          duration:
            Number(
              scene.duration || 5
            ),

          narration:
            String(
              scene.narration || ""
            ),

          visualConcept:
            String(
              scene.visualConcept || ""
            ),

          motionPlan: {
            background:
              scene.motionPlan?.background ||
              "#101522",

            elements:
              Array.isArray(
                scene.motionPlan?.elements
              )
                ? scene.motionPlan.elements
                : [],
          },
        };

        normalized.motionPlan.elements =
          normalized.motionPlan.elements
            .map(
              (element) => {

                if (
                  !element ||
                  typeof element !== "object"
                ) {
                  return null;
                }

                const allowedTypes = [
                  "text",
                  "emoji",
                  "number",
                  "shape",
                  "arrow",
                  "progress",
                  "ring",
                ];

                if (
                  !allowedTypes.includes(
                    element.type
                  )
                ) {
                  return null;
                }

                const result = {
                  ...element,
                };

                if (
                  result.x !== undefined
                ) {
                  result.x =
                    Number(result.x);
                }

                if (
                  result.y !== undefined
                ) {
                  result.y =
                    Number(result.y);
                }

                if (
                  result.start !== undefined
                ) {
                  result.start =
                    Number(result.start);
                }

                return result;
              }
            )
            .filter(Boolean);

        return normalized;
      }
    );

  data.totalDuration =
    data.scenes.reduce(
      (sum, scene) =>
        sum +
        Number(
          scene.duration || 0
        ),
      0
    );

  // =======================================================
  // WRITE
  // =======================================================

  fs.mkdirSync(
    path.dirname(outputPath),
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      data,
      null,
      2
    )
  );

  console.log("");
  console.log(
    "✅ Motion Plan berhasil dibuat."
  );

  console.log(
    `📄 ${outputPath}`
  );

  console.log(
    `🎬 ${data.scenes.length} scenes`
  );

  console.log(
    `⏱️ ${data.totalDuration}s`
  );

} catch (error) {
  console.error("");
  console.error(
    "❌ Gagal membuat Motion Plan."
  );

  console.error(
    error?.message ||
    error
  );

  process.exit(1);
}
