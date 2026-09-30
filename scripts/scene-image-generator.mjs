import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import {
  buildVisualPrompt,
} from "./visual-scene-types.mjs";

import {
  generateSceneImage,
} from "./image-provider.mjs";

import {
  critiqueSceneImage,
} from "./image-critic.mjs";

const OUTPUT_DIR =
  "remotion/assets/scenes";

const rawScene =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!rawScene) {
  console.error(
    'Contoh: node scripts/scene-image-generator.mjs \'{"scene_id":1,...}\''
  );

  process.exit(1);
}

let scene;

try {
  scene = JSON.parse(rawScene);
} catch {
  throw new Error(
    "JSON scene tidak valid."
  );
}

fs.mkdirSync(
  OUTPUT_DIR,
  {
    recursive: true,
  }
);

const number =
  String(scene.scene_id).padStart(2, "0");

const filename =
  `scene-${number}.png`;

const outputPath =
  path.join(
    OUTPUT_DIR,
    filename
  );

const resultPath =
  path.join(
    OUTPUT_DIR,
    `scene-${number}.result.json`
  );

const MAX_ATTEMPTS = 2;

function buildPrompt(
  scene,
  criticResult = null
) {
  const basePrompt =
    buildVisualPrompt(scene);

  if (!criticResult) {
    return basePrompt;
  }

  const issues =
    Array.isArray(
      criticResult.issues
    )
      ? criticResult.issues.join("\n- ")
      : "";

  const recommendation =
    criticResult.recommendation ||
    "Perbaiki visual agar lebih sesuai dengan scene.";

  return `
${basePrompt}

================================================
VISION CRITIC FEEDBACK
================================================

Gambar sebelumnya belum cukup sesuai.

MASALAH:

- ${issues}

REKOMENDASI:

${recommendation}

PERBAIKAN WAJIB:

1. Pertahankan konsep utama scene.
2. Perbaiki masalah yang disebutkan.
3. Jangan menambahkan objek yang tidak diperlukan.
4. Jangan membuat visual lebih kompleks.
5. Tetap satu komposisi visual utuh.
6. Tetap tanpa text, letters, numbers, labels,
   captions, subtitles, logos, atau watermark.
`;
}

function saveResult() {
  fs.writeFileSync(
    resultPath,
    JSON.stringify(
      scene,
      null,
      2
    )
  );

  console.log(
    `📄 Result → ${resultPath}`
  );
}

console.log("");
console.log(
  "========================================"
);
console.log(
  "🎨 AI SCENE IMAGE + VISION QA"
);
console.log(
  "========================================"
);
console.log("");

console.log(
  `Scene: ${scene.scene_id}`
);

console.log(
  `Target: ${
    scene.motion_target ||
    scene.focus ||
    "-"
  }`
);

let lastCritic = null;

for (
  let attempt = 1;
  attempt <= MAX_ATTEMPTS;
  attempt++
) {
  console.log("");
  console.log(
    `🎬 ATTEMPT ${attempt}/${MAX_ATTEMPTS}`
  );

  const prompt =
    buildPrompt(
      scene,
      lastCritic
    );

  console.log(
    "🎨 Generating image..."
  );

  const result =
    await generateSceneImage({
      prompt,
      size: "1024x1792",
    });

  fs.writeFileSync(
    outputPath,
    result.buffer
  );

  console.log(
    `📁 ${outputPath}`
  );

  console.log(
    "👁️ Vision QA..."
  );

  try {
    const critic =
      await critiqueSceneImage({
        scene,
        imagePath:
          outputPath,
      });

    lastCritic =
      critic;

    console.log("");
    console.log(
      "========== VISION =========="
    );

    console.log(
      `PASS: ${critic.pass}`
    );

    console.log(
      `SCORE: ${critic.score}/5`
    );

    console.log(
      `Target: ${critic.focus_target}`
    );

    console.log(
      "BBox:"
    );

    console.log(
      JSON.stringify(
        critic.focus_bbox,
        null,
        2
      )
    );

    console.log(
      "============================"
    );

    if (
      Array.isArray(
        critic.issues
      ) &&
      critic.issues.length
    ) {
      console.log("");
      console.log(
        "Issues:"
      );

      for (
        const issue of critic.issues
      ) {
        console.log(
          `- ${issue}`
        );
      }
    }

    if (
      critic.focus_bbox
    ) {
      scene.focus_bbox =
        critic.focus_bbox;
    }

    scene.focus_target =
      critic.focus_target ||
      scene.motion_target ||
      scene.focus ||
      "";

    scene.vision_score =
      critic.score;

    scene.vision_pass =
      critic.pass;

    scene.vision_main_subject_correct =
      critic.main_subject_correct;

    scene.vision_relationship_clear =
      critic.visual_relationship_clear;

    scene.vision_focus_clear =
      critic.focus_clear;

    scene.vision_object_count_correct =
      critic.object_count_correct;

    scene.vision_has_unwanted_text =
      critic.has_unwanted_text;

    scene.vision_has_visual_errors =
      critic.has_visual_errors;

    scene.image_model =
      result.model;

    scene.image_attempt =
      attempt;

    if (
      critic.pass &&
      critic.score >= 4 &&
      critic.main_subject_correct &&
      critic.visual_relationship_clear &&
      critic.focus_clear &&
      critic.object_count_correct &&
      !critic.has_unwanted_text &&
      !critic.has_visual_errors
    ) {
      console.log("");
      console.log(
        "✅ SCENE LULUS VISION QA"
      );

      saveResult();

      console.log("");
      console.log(
        "SCENE_RESULT_JSON="
      );

      console.log(
        JSON.stringify(
          scene
        )
      );

      process.exit(0);
    }

    if (
      attempt <
      MAX_ATTEMPTS
    ) {
      console.log("");
      console.log(
        "⚠️ QA gagal."
      );

      console.log(
        "🔄 Regenerate dengan feedback..."
      );
    }

  } catch (error) {
    console.log("");
    console.log(
      "⚠️ Vision Critic error:"
    );

    console.log(
      error.message
    );

    console.log(
      "Gambar tetap digunakan."
    );

    scene.vision_error =
      error.message;

    scene.image_model =
      result.model;

    scene.image_attempt =
      attempt;

    saveResult();

    console.log("");
    console.log(
      "SCENE_RESULT_JSON="
    );

    console.log(
      JSON.stringify(
        scene
      )
    );

    process.exit(0);
  }
}

console.log("");
console.log(
  "⚠️ MAX ATTEMPT TERCAPAI"
);

console.log(
  "Gambar terakhir digunakan."
);

scene.image_model =
  scene.image_model ||
  "unknown";

saveResult();

console.log("");
console.log(
  "SCENE_RESULT_JSON="
);

console.log(
  JSON.stringify(
    scene
  )
);
