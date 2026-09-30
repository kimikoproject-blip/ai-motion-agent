import {
  askVisionAI,
  extractJSON,
} from "./ai-provider.mjs";

function normalizeBox(box) {
  if (!box || typeof box !== "object") {
    return null;
  }

  const x = Number(box.x);
  const y = Number(box.y);
  const width = Number(box.width);
  const height = Number(box.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }

  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
    width: Math.max(0, Math.min(1, width)),
    height: Math.max(0, Math.min(1, height)),
  };
}

export async function critiqueSceneImage({
  scene,
  imagePath,
}) {
  const prompt = `
Kamu adalah Visual QA dan Object Localization AI
untuk video Shorts edukasi.

Lihat gambar yang diberikan secara langsung.

Bandingkan gambar dengan spesifikasi scene berikut.

================================================
SCENE
================================================

Visual type:
${scene.visual_type}

Narration:
${scene.narration}

Visual:
${scene.visual}

Subject:
${scene.subject}

Environment:
${scene.environment}

Focus:
${scene.focus}

Visual relationship:
${scene.visual_relationship}

Action:
${scene.action}

Emphasis:
${scene.emphasis}

Motion target:
${scene.motion_target || scene.focus}

================================================
TUGAS
================================================

1. Periksa apakah gambar benar-benar sesuai scene.

2. Periksa apakah subjek utama benar.

3. Periksa jumlah objek penting.

4. Periksa hubungan antar objek.

5. Periksa apakah fokus utama mudah ditemukan.

6. Periksa apakah ada objek tambahan yang mengganggu.

7. Periksa text, letters, numbers, labels,
   captions, logos, watermark.

8. Periksa visual yang rusak, aneh,
   terpotong, atau tidak masuk akal.

9. Cari lokasi visual dari MOTION TARGET.

================================================
LOCALIZATION
================================================

Berikan bounding box NORMALIZED untuk motion target.

Gunakan koordinat 0 sampai 1.

x:
posisi kiri bounding box.

y:
posisi atas bounding box.

width:
lebar bounding box.

height:
tinggi bounding box.

Contoh:

{
  "x": 0.35,
  "y": 0.40,
  "width": 0.30,
  "height": 0.20
}

Jika motion target terdiri dari beberapa objek
yang harus difokuskan bersama, gunakan satu bounding box
yang mencakup semuanya.

Jika target tidak ditemukan:
focus_bbox harus null.

Jangan mengarang koordinat.

================================================
OUTPUT
================================================

Keluarkan JSON VALID SAJA:

{
  "pass": true,
  "score": 5,

  "main_subject_correct": true,
  "visual_relationship_clear": true,
  "focus_clear": true,
  "object_count_correct": true,

  "has_unwanted_text": false,
  "has_visual_errors": false,

  "focus_target": "...",

  "focus_bbox": {
    "x": 0.35,
    "y": 0.40,
    "width": 0.30,
    "height": 0.20
  },

  "issues": [],

  "recommendation": ""
}

ATURAN SCORE:

0 = gagal total
1 = sangat buruk
2 = buruk
3 = cukup
4 = bagus
5 = sangat bagus

Jika fakta visual utama salah,
PASS harus false.

Jika objek target tidak ditemukan,
focus_bbox harus null.

Jangan memberikan penjelasan di luar JSON.
`;

  const result =
    await askVisionAI({
      prompt,
      imagePath,
    });

  const data =
    extractJSON(result);

  return {
    pass:
      Boolean(data.pass),

    score:
      Number(data.score || 0),

    main_subject_correct:
      Boolean(
        data.main_subject_correct
      ),

    visual_relationship_clear:
      Boolean(
        data.visual_relationship_clear
      ),

    focus_clear:
      Boolean(
        data.focus_clear
      ),

    object_count_correct:
      Boolean(
        data.object_count_correct
      ),

    has_unwanted_text:
      Boolean(
        data.has_unwanted_text
      ),

    has_visual_errors:
      Boolean(
        data.has_visual_errors
      ),

    focus_target:
      data.focus_target ||
      scene.motion_target ||
      scene.focus ||
      "",

    focus_bbox:
      normalizeBox(
        data.focus_bbox
      ),

    issues:
      Array.isArray(
        data.issues
      )
        ? data.issues
        : [],

    recommendation:
      data.recommendation ||
      "",
  };
}
