import "dotenv/config";
import fs from "fs";
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

const prompt = `
Kamu adalah AI director untuk video YouTube Shorts/TikTok
berformat 9:16 dengan gaya MODERN EXPLAINER / MOTION INFOGRAPHIC.

TOPIK:
${theme}

TUGAS:
Buat video pendek informatif berbahasa Indonesia dengan
visual motion graphics yang mengikuti isi narasi.

HASIL HARUS BERUPA JSON VALID SAJA.

STRUKTUR:

{
  "title": "...",
  "totalDuration": 40,
  "scenes": [
    {
      "id": 1,
      "duration": 5,

      "narration": "...",

      "visualConcept": "...",

      "motionPlan": {
        "background": "#101522",

        "elements": [
          {
            "type": "emoji",
            "value": "🐙",
            "position": "center",
            "size": 240,
            "start": 0,
            "animation": "pop"
          },

          {
            "type": "text",
            "value": "3 JANTUNG",
            "position": "bottom",
            "size": 70,
            "weight": 900,
            "color": "white",
            "start": 2,
            "animation": "impact"
          }
        ]
      }
    }
  ]
}

========================================
ATURAN KONTEN
========================================

1. Gunakan fakta yang benar.

2. Jangan mengarang fakta.

3. Jangan mengubah teori, dugaan, atau interpretasi
   menjadi fakta.

4. Hindari klaim viral yang belum terbukti.

5. Jika sebuah detail tidak yakin benar, jangan masukkan.

6. Gunakan bahasa Indonesia natural seperti narasi Shorts.

7. Jangan terlalu formal.

8. Buat hook kuat pada scene pertama.

9. Setiap scene harus punya informasi baru.

10. Hindari pengulangan.

11. Total durasi sekitar 35–45 detik.

12. Buat sekitar 5–7 scene.

13. Setiap narration harus dapat dibacakan dengan natural
    dalam durasi scene.

14. Ending harus memberikan payoff atau fakta menarik.

========================================
ATURAN VISUAL
========================================

Visual harus menjelaskan narasi.

JANGAN membuat:
- background kosong
- teks statis sepanjang scene
- slideshow
- dekorasi random
- visual yang tidak berhubungan dengan narasi

Jika narasi menyebut:
"3 jantung"

maka visual harus benar-benar menunjukkan:
- tiga elemen jantung
- angka 3
- atau diagram yang menggambarkan tiga jantung.

Jika narasi menyebut:
"bergerak"

gunakan animasi gerakan.

Jika narasi menyebut:
"lebih besar"

gunakan scale / zoom.

Jika narasi menyebut:
"dua bagian"

gunakan dua objek atau pembagian visual.

Jika narasi menyebut:
"menyebar"

gunakan objek yang bergerak menyebar.

========================================
MOTION ELEMENTS
========================================

Hanya gunakan type berikut:

emoji
text
number

Untuk sekarang jangan menggunakan tipe lain.

========================================
POSITION
========================================

Hanya:

top
center
bottom

========================================
ANIMATION
========================================

Gunakan salah satu:

pop
impact
slide
fade
bounce
float

========================================
MOTION RULES
========================================

1. Jangan semua elemen muncul bersamaan.

2. Gunakan timing bertahap.

3. Hook harus punya gerakan yang kuat.

4. Informasi penting harus mendapatkan emphasis.

5. Angka/statistik gunakan type "number".

6. Kata penting gunakan type "text".

7. Gunakan emoji sebagai representasi objek
   jika emoji tersebut cukup jelas.

8. Maksimal sekitar 8 elemen per scene.

9. Hindari terlalu banyak elemen.

10. Motion harus terasa cepat dan modern.

========================================
JSON RULES
========================================

- JSON harus valid.
- Tidak boleh markdown.
- Tidak boleh komentar.
- Tidak boleh teks di luar JSON.
- Semua scene wajib punya motionPlan.
- Semua motionPlan wajib punya elements.
- Semua element wajib punya type.
- Semua element wajib punya value.
- start menggunakan DETIK, bukan frame.
- duration menggunakan DETIK.

Sekarang buat video berdasarkan topik tersebut.
`;

console.log("");
console.log("========================================");
console.log("🤖 AI MOTION PLANNER");
console.log("========================================");
console.log("");
console.log(`🎯 Theme: ${theme}`);
console.log("");

try {
  const raw = await askAI(prompt);

  const result = extractJSON(raw);

  if (!result || !Array.isArray(result.scenes)) {
    throw new Error(
      "AI tidak menghasilkan struktur scenes yang valid."
    );
  }

  if (result.scenes.length < 4) {
    throw new Error(
      "AI menghasilkan terlalu sedikit scene."
    );
  }

  for (const scene of result.scenes) {
    if (!scene.narration) {
      throw new Error(
        `Scene ${scene.id} tidak memiliki narration.`
      );
    }

    if (
      !scene.motionPlan ||
      !Array.isArray(scene.motionPlan.elements)
    ) {
      throw new Error(
        `Scene ${scene.id} tidak memiliki motionPlan yang valid.`
      );
    }
  }

  fs.mkdirSync("remotion/data", {
    recursive: true,
  });

  fs.writeFileSync(
    "remotion/data/scenes.json",
    JSON.stringify(result, null, 2)
  );

  console.log("");
  console.log("========================================");
  console.log("✅ AI MOTION PLAN BERHASIL");
  console.log("========================================");
  console.log("");

  console.log(`Title: ${result.title || "-"}`);
  console.log(
    `Scenes: ${result.scenes.length}`
  );
  console.log("");

  for (const scene of result.scenes) {
    console.log(
      `Scene ${scene.id} | ${scene.duration}s`
    );

    console.log(
      `Narration: ${scene.narration}`
    );

    console.log(
      `Motion elements: ${scene.motionPlan.elements.length}`
    );

    console.log("");
  }

  console.log(
    "Output: remotion/data/scenes.json"
  );

  console.log("");
} catch (error) {
  console.error("");
  console.error("========================================");
  console.error("❌ AI MOTION PLANNER GAGAL");
  console.error("========================================");
  console.error("");
  console.error(error.message);
  console.error("");
  process.exit(1);
}
