import fs from "node:fs";
import path from "node:path";

import {
  askAI,
  extractJSON,
} from "./ai-provider.mjs";

const theme =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!theme) {
  console.error(
    '❌ Masukkan tema.\nContoh:\nnode scripts/generate-story.mjs "kenapa gurita punya tiga jantung"'
  );

  process.exit(1);
}

const OUTPUT =
  path.resolve(
    "remotion/data/scenes.json"
  );

const prompt = `
Kamu adalah AI storyteller untuk video TikTok / YouTube Shorts
edukasi Indonesia.

TEMA:
${theme}

Buat video pendek sekitar 25–45 detik.

TUJUAN:
- Hook kuat di awal.
- Fakta harus benar.
- Bahasa Indonesia natural seperti narator Shorts.
- Jangan terasa seperti artikel.
- Setiap scene harus menjelaskan bagian narration secara visual.
- Jangan membuat visual yang tidak berhubungan dengan narration.

ATURAN SCENE:

Setiap scene adalah SATU komposisi visual utuh.

Jangan membuat:
- collage
- split screen
- kumpulan gambar
- tempelan objek acak
- panel komik
- diagram rumit

Visual boleh berupa:
- cartoon educational illustration
- karakter + lingkungan
- anatomy sederhana
- proses
- perbandingan
- peta
- objek dengan visual explanation

Pilih visual_type dari:

CHARACTER_FACT
SIMPLE_ANATOMY
PROCESS
COMPARISON
MAP_LOCATION
OBJECT_EXPLANATION

Setiap scene harus punya:

scene_id
narration
visual_type
visual
subject
environment
focus
visual_relationship
action
emphasis
motion
animation
motion_target
motion_intensity
duration_seconds
overlay_text
caption
text_beats

MOTION:

motion:
zoom_in | zoom_out | pan_left | pan_right | focus | reveal | none

animation:
none | pulse | breathe | highlight | flow | pop | reveal | shake

motion_target harus menjelaskan bagian visual
yang menjadi fokus kamera atau animasi.

KINETIC TEXT:

Maksimal 4 text_beats per scene.

Setiap text beat:
{
  "text": "maksimal 4 kata",
  "start": 0.5,
  "duration": 1.5,
  "style": "normal"
}

style hanya:
normal
emphasis
question
number

Gunakan:
question → hook / pertanyaan
number → angka penting
emphasis → fakta utama
normal → teks pendukung

Jangan membuat text beat untuk setiap kata.
Gunakan phrase yang memang penting.

PENTING:
AI IMAGE GENERATOR NANTI AKAN MEMBUAT SELURUH VISUAL SCENE.

Karena itu visual harus menjelaskan narration
secara langsung.

Contoh buruk:
"gurita + random laut + tulisan"

Contoh bagus:
"gurita transparan terlihat dari samping,
tiga bentuk jantung terlihat jelas di dalam tubuh,
dengan aliran darah sederhana yang menghubungkan organ."

JANGAN masukkan teks, angka, huruf, caption,
logo, atau watermark ke dalam visual image.

OUTPUT:
JSON VALID SAJA.

Format:

{
  "title": "...",
  "hook": "...",
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
      "animation": "pulse",
      "motion_target": "...",
      "motion_intensity": "medium",
      "duration_seconds": 5,
      "overlay_text": "...",
      "caption": "...",
      "text_beats": [
        {
          "text": "...",
          "start": 0.5,
          "duration": 1.5,
          "style": "question"
        }
      ]
    }
  ]
}
`;

console.log("");
console.log(
  "================================"
);
console.log(
  "GENERATING STORY"
);
console.log(
  "================================"
);
console.log(
  `🎯 Theme: ${theme}`
);
console.log("");

try {
  const response =
    await askAI(prompt);

  const data =
    extractJSON(response);

  if (
    !Array.isArray(
      data.scenes
    ) ||
    !data.scenes.length
  ) {
    throw new Error(
      "AI tidak menghasilkan scenes."
    );
  }

  data.scenes =
    data.scenes.map(
      (scene, index) => ({
        ...scene,

        scene_id:
          index + 1,

        narration:
          String(
            scene.narration || ""
          ).trim(),

        text_beats:
          Array.isArray(
            scene.text_beats
          )
            ? scene.text_beats
            : [],
      })
    );

  fs.mkdirSync(
    path.dirname(OUTPUT),
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      data,
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "✅ STORY BERHASIL"
  );
  console.log(
    "================================"
  );

  console.log(
    `Title: ${data.title || "-"}`
  );

  console.log(
    `Scenes: ${data.scenes.length}`
  );

  for (
    const scene of data.scenes
  ) {
    console.log(
      `  Scene ${scene.scene_id}: ${scene.narration}`
    );
  }

  console.log("");
  console.log(
    `📄 ${OUTPUT}`
  );
} catch (error) {
  console.error("");
  console.error(
    "❌ Story generation gagal:"
  );
  console.error(
    error.message
  );

  process.exit(1);
}
