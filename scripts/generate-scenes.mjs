import "dotenv/config";

import fs from "node:fs";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const SCENES_FILE =
  "remotion/data/scenes.json";

const OUTPUT_DIR =
  "remotion/assets/scenes";

const PUBLIC_DIR =
  "public/scenes";

const scenesData =
  JSON.parse(
    fs.readFileSync(
      SCENES_FILE,
      "utf8"
    )
  );

const scenes =
  scenesData.scenes || [];

if (!scenes.length) {
  throw new Error(
    "Tidak ada scenes di scenes.json"
  );
}

fs.mkdirSync(
  OUTPUT_DIR,
  {
    recursive: true,
  }
);

fs.mkdirSync(
  PUBLIC_DIR,
  {
    recursive: true,
  }
);

function sceneHash(scene) {
  const relevant = {
    narration:
      scene.narration,

    visual_type:
      scene.visual_type,

    visual:
      scene.visual,

    subject:
      scene.subject,

    environment:
      scene.environment,

    focus:
      scene.focus,

    visual_relationship:
      scene.visual_relationship,

    action:
      scene.action,

    emphasis:
      scene.emphasis,
  };

  return crypto
    .createHash("sha1")
    .update(
      JSON.stringify(
        relevant
      )
    )
    .digest("hex")
    .slice(0, 10);
}

function runScene(scene) {
  return new Promise(
    (resolve, reject) => {
      const child =
        spawn(
          "node",
          [
            "scripts/scene-image-generator.mjs",
            JSON.stringify(scene),
          ],
          {
            stdio: "inherit",
          }
        );

      child.on(
        "close",
        (code) => {
          if (code !== 0) {
            reject(
              new Error(
                `Scene ${scene.scene_id} gagal. Exit code ${code}`
              )
            );

            return;
          }

          const number =
            String(
              scene.scene_id
            ).padStart(
              2,
              "0"
            );

          const resultPath =
            `${OUTPUT_DIR}/scene-${number}.result.json`;

          if (
            !fs.existsSync(
              resultPath
            )
          ) {
            reject(
              new Error(
                `Result JSON tidak ditemukan: ${resultPath}`
              )
            );

            return;
          }

          try {
            const result =
              JSON.parse(
                fs.readFileSync(
                  resultPath,
                  "utf8"
                )
              );

            Object.assign(
              scene,
              result
            );

            console.log(
              `🧠 Vision result masuk ke scene ${scene.scene_id}`
            );

            resolve();
          } catch (error) {
            reject(
              new Error(
                `Gagal membaca result scene ${scene.scene_id}: ${error.message}`
              )
            );
          }
        }
      );
    }
  );
}

function copyToPublic(
  source,
  filename
) {
  const destination =
    `${PUBLIC_DIR}/${filename}`;

  fs.copyFileSync(
    source,
    destination
  );

  console.log(
    `📦 Public → ${destination}`
  );
}

console.log("");
console.log(
  "========================================"
);
console.log(
  "🎬 SMART SCENE GENERATOR"
);
console.log(
  "========================================"
);
console.log("");

console.log(
  `Total scene: ${scenes.length}`
);

console.log("");

for (
  const scene of scenes
) {
  const number =
    String(
      scene.scene_id
    ).padStart(
      2,
      "0"
    );

  const hash =
    sceneHash(scene);

  scene.image_hash =
    hash;

  const filename =
    `scene-${number}-${hash}.png`;

  const output =
    `${OUTPUT_DIR}/${filename}`;

  const publicOutput =
    `${PUBLIC_DIR}/${filename}`;

  console.log("");
  console.log(
    "----------------------------------------"
  );

  console.log(
    `🎬 Scene ${scene.scene_id}`
  );

  console.log(
    `Hash: ${hash}`
  );

  console.log(
    `File: ${filename}`
  );

  console.log(
    "----------------------------------------"
  );

  if (
    fs.existsSync(output)
  ) {
    console.log(
      "✅ Cache hit"
    );

    const resultPath =
      `${OUTPUT_DIR}/scene-${number}.result.json`;

    if (
      fs.existsSync(resultPath)
    ) {
      try {
        const result =
          JSON.parse(
            fs.readFileSync(
              resultPath,
              "utf8"
            )
          );

        Object.assign(
          scene,
          result
        );

        console.log(
          "🧠 Vision result loaded from cache"
        );

        if (
          scene.focus_bbox
        ) {
          console.log(
            `🎯 BBox: ${JSON.stringify(scene.focus_bbox)}`
          );
        }
      } catch (error) {
        console.log(
          `⚠️ Result JSON cache tidak bisa dibaca: ${error.message}`
        );
      }
    } else {
      console.log(
        "ℹ️ Tidak ada Vision result untuk cache ini."
      );
    }

    copyToPublic(
      output,
      filename
    );

    continue;
  }

  console.log(
    "🎨 Generate + Vision QA..."
  );

  await runScene(
    scene
  );

  const generatedFile =
    `${OUTPUT_DIR}/scene-${number}.png`;

  if (
    !fs.existsSync(
      generatedFile
    )
  ) {
    throw new Error(
      `Image hasil generate tidak ditemukan: ${generatedFile}`
    );
  }

  fs.renameSync(
    generatedFile,
    output
  );

  console.log(
    `💾 Saved → ${output}`
  );

  copyToPublic(
    output,
    filename
  );
}

fs.writeFileSync(
  SCENES_FILE,
  JSON.stringify(
    scenesData,
    null,
    2
  )
);

console.log("");
console.log(
  "========================================"
);
console.log(
  "✅ SEMUA SCENE SELESAI"
);
console.log(
  "========================================"
);
console.log("");

for (
  const scene of scenes
) {
  const number =
    String(
      scene.scene_id
    ).padStart(
      2,
      "0"
    );

  console.log(
    `✓ Scene ${number} → scene-${number}-${scene.image_hash}.png`
  );
}

console.log("");
