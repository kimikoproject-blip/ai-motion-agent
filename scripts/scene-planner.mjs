import "dotenv/config";

import {
  askAI,
  extractJSON,
} from "./ai-provider.mjs";

const narration =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!narration) {
  console.error(
    'Contoh: node scripts/scene-planner.mjs "Pernah kepikiran kenapa gurita punya tiga jantung?"'
  );

  process.exit(1);
}

const prompt = `
Kamu adalah AI Visual Scene Planner untuk video Shorts/TikTok edukasi.

Tugasmu mengubah narasi menjadi beberapa scene visual yang sangat jelas.

================================================
PRINSIP UTAMA
================================================

1. Setiap scene memiliki SATU komposisi visual utuh.

2. Character, environment, objek, dan elemen penjelasan
   harus menyatu dalam satu ilustrasi.

3. Visual harus menjelaskan narasi walaupun tidak ada teks.

4. Jangan membuat scene seperti kumpulan gambar tempelan.

5. Image generator TIDAK BOLEH membuat:
   - text
   - letters
   - numbers
   - labels
   - captions
   - subtitles
   - logos
   - watermark

6. Semua typography dibuat oleh Motion Engine.

7. Jangan membuat visual terlalu kompleks.

8. Gunakan kartun/animated educational illustration
   yang jelas dan mudah dipahami.

================================================
VISUAL TYPES
================================================

Pilih SATU:

CHARACTER_FACT
SIMPLE_ANATOMY
PROCESS
COMPARISON
MAP_LOCATION
OBJECT_EXPLANATION

================================================
SCENE
================================================

Untuk setiap scene tentukan:

narration
visual_type
visual
subject
environment
focus
visual_relationship
action
emphasis

================================================
CAMERA MOTION
================================================

Pilih SATU:

zoom_in
zoom_out
pan_left
pan_right
focus
reveal
none

================================================
MOTION ANIMATION
================================================

Pilih SATU:

none
pulse
breathe
highlight
flow
pop
reveal
shake

Gunakan:

pulse
untuk organ, objek penting, atau fakta utama.

breathe
untuk character hidup tetapi tenang.

highlight
untuk menonjolkan bagian penting.

flow
untuk hubungan/proses/aliran.

pop
untuk objek yang perlu terasa muncul.

reveal
untuk informasi yang ingin dibuka bertahap.

shake
hanya untuk impact kecil.

none
jika gerakan tidak diperlukan.

================================================
MOTION TARGET
================================================

Tentukan bagian visual yang harus terasa menjadi fokus.

Contoh:

"three red hearts"

"two hearts and gills"

"main central heart"

"the map location"

"the object transformation"

Jangan membuat target yang tidak ada di gambar.

================================================
MOTION INTENSITY
================================================

Pilih:

subtle
medium
strong

Untuk educational Shorts biasanya gunakan subtle atau medium.

================================================
OVERLAY TEXT
================================================

Teks harus sangat pendek.

Contoh:

"3 JANTUNG"

"2 KE INSANG"

"1 KE SELURUH TUBUH"

Jangan membuat kalimat panjang.

================================================
CAPTION
================================================

Boleh kosong.

Jika digunakan, buat maksimal satu kalimat pendek.

================================================
SCENE BREAK RULE
================================================

Jangan membuat scene baru hanya karena kalimat berubah.

Buat scene baru jika:

- informasi visual berubah
- objek utama berubah
- hubungan objek berubah
- lokasi berubah
- diperlukan visual baru agar penonton memahami fakta

Biasanya 3-6 scene untuk video 30-45 detik.

================================================
IMPORTANT
================================================

Visual harus bisa dipahami tanpa overlay text.

Jangan bergantung pada tulisan.

Jika fakta dapat dijelaskan menggunakan objek,
gunakan objek.

Jika fakta membutuhkan hubungan,
buat hubungan tersebut terlihat.

Jika fakta membutuhkan proses,
buat proses terlihat dalam satu komposisi.

Jika fakta membutuhkan anatomi,
gunakan anatomi kartun sederhana.

Jangan membuat diagram ilmiah rumit.

================================================
NARASI
================================================

${narration}

================================================
KINETIC TEXT RULES

text_beats bersifat opsional.

Jika digunakan:
- Maksimal 4 beat per scene.
- Setiap beat 1–4 kata.
- start = detik sejak awal scene.
- duration = lama teks tampil dalam detik.
- style hanya boleh: normal | emphasis | question | number.
- Gunakan emphasis untuk fakta penting.
- Gunakan question untuk pertanyaan/hook.
- Gunakan number untuk angka penting.
- Jangan mengulang teks yang sama.
- Jangan memasukkan fakta baru yang tidak ada di narration.
- text_beats harus membantu visualisasi, bukan menggantikan narration.
- Semua beat harus selesai sebelum scene berakhir.

OUTPUT
================================================


ATURAN MOTION ENGINE:

AI WAJIB memilih motion dan animation berdasarkan isi scene,
bukan secara random.

PRINSIP UTAMA:
- Motion harus membantu menjelaskan narration.
- Animation harus menekankan informasi paling penting.
- Jangan memakai terlalu banyak efek.
- Satu scene = satu fokus utama.
- motion_target WAJIB menunjuk objek/fakta paling penting.
- motion_intensity biasanya "medium".
- Gunakan "strong" hanya untuk fakta atau perubahan yang sangat penting.
- Gunakan "subtle" untuk scene yang tenang atau informatif.

PEMILIHAN MOTION:

CHARACTER_FACT:
- fakta utama diperkenalkan → zoom_in
- fakta sudah terlihat jelas → focus
- fakta mengejutkan → zoom_in

SIMPLE_ANATOMY:
- organ/fungsi penting → focus
- hubungan organ → zoom_in
- memperlihatkan konteks tubuh → zoom_out

PROCESS:
- proses dimulai dari objek → zoom_in
- proses bergerak/berubah → focus
- memperlihatkan keseluruhan proses → zoom_out

COMPARISON:
- membandingkan dua objek → pan_left atau pan_right
- perbedaan sangat penting → focus

MAP_LOCATION:
- memperkenalkan lokasi → zoom_in
- memperlihatkan area luas → zoom_out
- lokasi sudah dekat/jelas → focus

OBJECT_EXPLANATION:
- memperkenalkan objek → zoom_in
- menjelaskan bagian tertentu → focus
- memperlihatkan objek secara keseluruhan → zoom_out

PEMILIHAN ANIMATION:

- fakta penting berupa objek/angka → pulse
- area tertentu harus diperhatikan → highlight
- objek baru muncul → pop
- scene membuka informasi baru → reveal
- proses atau aliran → flow
- karakter/objek hidup tetapi tidak berubah → breathe
- perubahan/impact sangat kuat → shake
- tidak ada kebutuhan efek → none

BATASAN:

- Jangan gunakan shake kecuali ada impact/perubahan kuat.
- Jangan gunakan flow kecuali ada proses/aliran yang benar-benar terlihat.
- Jangan gunakan pulse dan highlight sekaligus.
- Jangan gunakan animation hanya supaya scene terlihat ramai.
- motion_target harus berupa deskripsi objek konkret,
  bukan kata seperti "scene", "visual", atau "everything".
- overlay_text harus singkat dan mendukung narration.
- Jangan memasukkan penjelasan panjang ke overlay_text.



ATURAN DURASI SCENE:

Setiap scene WAJIB memiliki duration_seconds.

Durasi harus mengikuti panjang narration.

Gunakan panduan:

- narration sangat pendek → 3.5–4.5 detik
- narration normal → 4.5–6 detik
- narration panjang → 6–8 detik
- jangan lebih dari 8 detik untuk satu scene

Target pacing:
- narration harus selesai sebelum scene berakhir.
- sisakan sedikit waktu visual setelah kalimat selesai.
- jangan membuat scene terlalu cepat hanya demi mengejar durasi.
- jangan membuat scene panjang tanpa alasan.

Gunakan angka desimal jika diperlukan.


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
      "animation": "pulse",
      "motion_target": "...",
      "motion_intensity": "medium",
      "duration_seconds": 5,

      "overlay_text": "...",
      "text_beats": [
        {
          "text": "...",
          "start": 0,
          "duration": 1,
          "style": "normal"
        }
      ],
      "caption": ""
    }
  ]
}
`;

console.log("");
console.log(
  "========================================"
);
console.log(
  "🧠 SCENE + MOTION PLANNER"
);
console.log(
  "========================================"
);
console.log("");

try {
  const result =
    await askAI(prompt);

  const data =
    extractJSON(result);

  if (
    !data.scenes ||
    !Array.isArray(
      data.scenes
    )
  ) {
    throw new Error(
      "AI tidak menghasilkan scenes[]."
    );
  }

  const allowedTypes =
    new Set([
      "CHARACTER_FACT",
      "SIMPLE_ANATOMY",
      "PROCESS",
      "COMPARISON",
      "MAP_LOCATION",
      "OBJECT_EXPLANATION",
    ]);

  const allowedMotion =
    new Set([
      "zoom_in",
      "zoom_out",
      "pan_left",
      "pan_right",
      "focus",
      "reveal",
      "none",
    ]);

  const allowedAnimation =
    new Set([
      "none",
      "pulse",
      "breathe",
      "highlight",
      "flow",
      "pop",
      "reveal",
      "shake",
    ]);

  const allowedIntensity =
    new Set([
      "subtle",
      "medium",
      "strong",
    ]);

  data.scenes =
    data.scenes.map(
      (scene, index) => {
        scene.scene_id =
          index + 1;

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

        if (
          !allowedAnimation.has(
            scene.animation
          )
        ) {
          scene.animation =
            "none";
        }

        if (
          !allowedIntensity.has(
            scene.motion_intensity
          )
        ) {
          scene.motion_intensity =
            "medium";
        }

        const narrationLength =
          String(
            scene.narration || ""
          ).trim().length;

        let estimatedDuration =
          4.5;

        if (narrationLength <= 45) {
          estimatedDuration = 4;
        } else if (
          narrationLength <= 80
        ) {
          estimatedDuration = 5;
        } else if (
          narrationLength <= 120
        ) {
          estimatedDuration = 6;
        } else {
          estimatedDuration = 7;
        }

        const requestedDuration =
          Number(
            scene.duration_seconds
          );

        scene.duration_seconds =
          Number.isFinite(
            requestedDuration
          )
            ? Math.min(
                8,
                Math.max(
                  3.5,
                  requestedDuration
                )
              )
            : estimatedDuration;

        /*
         * Normalize kinetic text beats.
         *
         * Planner boleh mengembalikan
         * text_beats kosong atau tidak valid.
         * Di sini kita rapikan supaya
         * Motion Engine selalu mendapat
         * struktur yang aman.
         */

        if (
          !Array.isArray(
            scene.text_beats
          )
        ) {
          scene.text_beats = [];
        }

        scene.text_beats =
          scene.text_beats
            .slice(0, 4)
            .map(
              (beat) => {
                const text =
                  String(
                    beat?.text ||
                      ""
                  )
                    .trim()
                    .slice(0, 60);

                const start =
                  Number(
                    beat?.start
                  );

                const duration =
                  Number(
                    beat?.duration
                  );

                const allowedStyles =
                  new Set([
                    "normal",
                    "emphasis",
                    "question",
                    "number",
                  ]);

                const style =
                  allowedStyles.has(
                    beat?.style
                  )
                    ? beat.style
                    : "normal";

                if (
                  !text ||
                  !Number.isFinite(
                    start
                  ) ||
                  !Number.isFinite(
                    duration
                  )
                ) {
                  return null;
                }

                return {
                  text,
                  start:
                    Math.max(
                      0,
                      Math.min(
                        scene.duration_seconds -
                          0.2,
                        start
                      )
                    ),
                  duration:
                    Math.max(
                      0.25,
                      Math.min(
                        3,
                        duration
                      )
                    ),
                  style,
                };
              }
            )
            .filter(Boolean)
            .filter(
              (beat) =>
                beat.start <
                scene.duration_seconds
            );

        scene.overlay_text =
          String(
            scene.overlay_text ||
              ""
          ).slice(
            0,
            50
          );

        scene.caption =
          String(
            scene.caption ||
              ""
          ).slice(
            0,
            100
          );

        scene.motion_target =
          String(
            scene.motion_target ||
              scene.focus ||
              ""
          );

        return scene;
      }
    );

  console.log(
    JSON.stringify(
      data,
      null,
      2
    )
  );

  console.log("");
  console.log(
    `Total scene: ${data.scenes.length}`
  );

} catch (error) {
  console.error("");
  console.error(
    "❌ Scene Planner gagal:"
  );

  console.error(
    error.message
  );

  process.exit(1);
}
