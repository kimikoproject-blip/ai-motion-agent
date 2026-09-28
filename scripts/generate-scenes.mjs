import fs from "fs";
import path from "path";
import { askAI, extractJSON } from "./ai-provider.mjs";

const theme = process.argv.slice(2).join(" ").trim();

if (!theme) {
  console.error("");
  console.error("❌ Theme belum diberikan.");
  console.error("");
  console.error("Contoh:");
  console.error(
    'node scripts/generate-scenes.mjs "fakta unik tentang gurita"'
  );
  console.error("");
  process.exit(1);
}

const outputPath = path.resolve(
  "remotion/data/scenes.json"
);

const prompt = `
Kamu adalah AI scriptwriter sekaligus visual director untuk video YouTube Shorts/TikTok berbahasa Indonesia.

TEMA:
${theme}

TUGAS:
Buat 1 video pendek berdurasi sekitar 35–45 detik.

Buat 5–7 scene.

Tujuan:
- stop-scroll dalam 1–2 detik pertama
- fakta harus benar
- narasi natural saat dibacakan TTS
- setiap scene punya visual yang sangat spesifik
- visual harus benar-benar mendukung isi narasi
- hindari footage generik yang tidak berhubungan

ATURAN FAKTA:
1. Jangan mengarang fakta.
2. Jangan mengubah dugaan, hipotesis, atau interpretasi menjadi fakta pasti.
3. Hindari klaim viral yang belum terbukti.
4. Jika sebuah fakta sering disalahpahami, gunakan wording yang akurat.
5. Jangan menggunakan angka/detail spesifik jika tidak yakin.
6. Lakukan fact-check internal sebelum menghasilkan JSON.
7. Jika ada bagian yang masih diperdebatkan secara ilmiah, tuliskan sebagai "diduga", "diperkirakan", atau wording yang sesuai.
8. Jangan membuat ending yang menyatakan sesuatu sebagai fakta jika sebenarnya hanya spekulasi.

ATURAN SCRIPT:
- Bahasa Indonesia natural, bukan bahasa buku.
- Jangan terlalu formal.
- Jangan menggunakan emoji.
- Jangan menggunakan markdown.
- Narasi harus enak untuk TTS.
- Setiap scene 3–9 detik.
- Scene pertama harus menjadi hook.
- Jangan mengulang fakta yang sama.
- Ending harus memberikan payoff/twist.
- Total narasi sekitar 80–110 kata.

ATURAN VISUAL:
Setiap scene harus memiliki visual yang benar-benar menggambarkan narasinya.

visualQuery:
- Bahasa Inggris.
- 5–12 kata.
- Sangat spesifik.
- Sebutkan objek utama.
- Sebutkan aksi jika ada.
- Sebutkan lokasi jika relevan.
- Sebutkan "close up", "macro", "wide shot", atau "side view" bila membantu.
- Jangan gunakan query terlalu umum seperti "animal video", "nature video", "ocean video".
- Jangan memasukkan kata-kata yang tidak berhubungan dengan objek utama.

visualMustHave:
Berisi 1–5 objek/elemen yang WAJIB terlihat agar footage dianggap relevan.

visualAvoid:
Berisi 1–5 objek/elemen yang sebaiknya TIDAK muncul karena bisa membuat footage salah konteks.

visualType:
Pilih salah satu:
- closeup
- macro
- action
- environment
- portrait
- wide
- detail

CONTOH:

Jika narasi:
"Alat hisap gurita ternyata bisa membantu mereka merasakan benda yang disentuh."

Maka visual:

visualQuery:
"octopus tentacle suction cups close up underwater"

visualMustHave:
["octopus", "tentacle", "suction cups"]

visualAvoid:
["human", "fish", "mannequin"]

visualType:
"macro"

Jika narasi:
"Gurita bisa menyamarkan diri di antara batu karang."

Maka:

visualQuery:
"octopus camouflage coral reef underwater close up"

visualMustHave:
["octopus", "coral reef"]

visualAvoid:
["human", "fish tank"]

visualType:
"closeup"

FORMAT OUTPUT WAJIB JSON VALID.

Jangan menambahkan penjelasan di luar JSON.

Format:

{
  "title": "Judul video",
  "scenes": [
    {
      "duration": 5,
      "text": "Teks pendek di layar",
      "narration": "Narasi yang dibacakan",
      "emphasis": "Kata penting",
      "motion": "pop",
      "layout": "center",
      "visualQuery": "specific English visual search query",
      "visualMustHave": ["object1", "object2"],
      "visualAvoid": ["object1", "object2"],
      "visualType": "closeup",
      "assetType": "video"
    }
  ]
}

MOTION YANG DIPERBOLEHKAN:
- pop
- zoom_in
- slide_left
- slide_right
- fade
- shake
- bounce

LAYOUT YANG DIPERBOLEHKAN:
- top
- center
- bottom
`;

try {
  console.log("");
  console.log("========================================");
  console.log("🤖 AI SCENE GENERATOR");
  console.log("========================================");
  console.log("");
  console.log(`Theme: ${theme}`);
  console.log("");

  const response = await askAI(prompt);

  const data = extractJSON(response);

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.scenes)
  ) {
    throw new Error(
      "Format JSON dari AI tidak valid."
    );
  }

  if (!data.title) {
    throw new Error(
      "AI tidak menghasilkan title."
    );
  }

  if (
    data.scenes.length < 5 ||
    data.scenes.length > 7
  ) {
    throw new Error(
      `Jumlah scene tidak valid: ${data.scenes.length}. Harus 5–7.`
    );
  }

  const allowedMotions = new Set([
    "pop",
    "zoom_in",
    "slide_left",
    "slide_right",
    "fade",
    "shake",
    "bounce",
  ]);

  const allowedLayouts = new Set([
    "top",
    "center",
    "bottom",
  ]);

  const allowedVisualTypes = new Set([
    "closeup",
    "macro",
    "action",
    "environment",
    "portrait",
    "wide",
    "detail",
  ]);

  const normalizedScenes =
    data.scenes.map((scene, index) => {
      let duration = Number(
        scene.duration
      );

      if (!Number.isFinite(duration)) {
        duration = 6;
      }

      duration = Math.max(
        3,
        Math.min(9, duration)
      );

      let motion = String(
        scene.motion || "pop"
      );

      if (
        !allowedMotions.has(motion)
      ) {
        motion = "pop";
      }

      let layout = String(
        scene.layout || "center"
      );

      if (
        !allowedLayouts.has(layout)
      ) {
        layout = "center";
      }

      let visualType = String(
        scene.visualType ||
          "environment"
      ).toLowerCase();

      if (
        !allowedVisualTypes.has(
          visualType
        )
      ) {
        visualType = "environment";
      }

      let visualMustHave =
        Array.isArray(
          scene.visualMustHave
        )
          ? scene.visualMustHave
              .map((x) =>
                String(x).trim()
              )
              .filter(Boolean)
              .slice(0, 5)
          : [];

      let visualAvoid =
        Array.isArray(
          scene.visualAvoid
        )
          ? scene.visualAvoid
              .map((x) =>
                String(x).trim()
              )
              .filter(Boolean)
              .slice(0, 5)
          : [];

      const visualQuery =
        String(
          scene.visualQuery || ""
        ).trim();

      if (!visualQuery) {
        throw new Error(
          `Scene ${index + 1} tidak memiliki visualQuery.`
        );
      }

      if (
        !visualMustHave.length
      ) {
        console.warn(
          `⚠️ Scene ${index + 1}: visualMustHave kosong.`
        );
      }

      return {
        duration,
        text: String(
          scene.text || ""
        ).trim(),

        narration: String(
          scene.narration || ""
        ).trim(),

        emphasis: String(
          scene.emphasis || ""
        ).trim(),

        motion,
        layout,

        visualQuery,

        visualMustHave,

        visualAvoid,

        visualType,

        assetType: "video",
      };
    });

  for (
    let i = 0;
    i < normalizedScenes.length;
    i++
  ) {
    const scene =
      normalizedScenes[i];

    if (!scene.text) {
      throw new Error(
        `Scene ${i + 1} tidak memiliki text.`
      );
    }

    if (!scene.narration) {
      throw new Error(
        `Scene ${i + 1} tidak memiliki narration.`
      );
    }
  }

  const output = {
    title: String(
      data.title
    ).trim(),

    scenes:
      normalizedScenes,
  };

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      output,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );
  console.log(
    "✅ AI SCENE GENERATOR SELESAI"
  );
  console.log(
    "========================================"
  );
  console.log("");
  console.log(
    `Title: ${output.title}`
  );
  console.log(
    `Scenes: ${output.scenes.length}`
  );
  console.log("");

  output.scenes.forEach(
    (scene, index) => {
      console.log(
        `${index + 1}. ${scene.text}`
      );
      console.log(
        `   Visual: ${scene.visualQuery}`
      );
      console.log(
        `   Must: ${scene.visualMustHave.join(", ")}`
      );
      console.log(
        `   Avoid: ${scene.visualAvoid.join(", ")}`
      );
      console.log(
        `   Type: ${scene.visualType}`
      );
      console.log("");
    }
  );

  console.log(
    `Output: ${outputPath}`
  );
  console.log("");
} catch (error) {
  console.error("");
  console.error(
    "❌ AI SCENE GENERATOR GAGAL"
  );
  console.error(
    error.message
  );
  console.error("");
  process.exit(1);
}
