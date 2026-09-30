import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SCENES_PATH =
  path.resolve(
    "remotion/data/scenes.json"
  );

const AUDIO_DIR =
  path.resolve(
    "public/audio"
  );

const OUTPUT =
  path.resolve(
    "out/final.mp4"
  );

function run(command, args) {
  console.log("");
  console.log("================================");
  console.log(`RUN: ${command} ${args.join(" ")}`);
  console.log("================================");

  execFileSync(
    command,
    args,
    {
      stdio: "inherit",
    }
  );
}

function fail(message) {
  console.error("");
  console.error("❌ " + message);
  process.exit(1);
}

if (
  !fs.existsSync(
    SCENES_PATH
  )
) {
  fail(
    "remotion/data/scenes.json tidak ditemukan."
  );
}

const scenesData =
  JSON.parse(
    fs.readFileSync(
      SCENES_PATH,
      "utf8"
    )
  );

const scenes =
  scenesData.scenes;

if (
  !Array.isArray(scenes) ||
  !scenes.length
) {
  fail(
    "Tidak ada scenes di scenes.json."
  );
}

console.log("");
console.log(
  "================================"
);
console.log(
  "CHECK SCENE ASSETS"
);
console.log(
  "================================"
);

for (
  const scene of scenes
) {
  const sceneNumber =
    String(
      scene.scene_id
    ).padStart(2, "0");

  /*
   * Image hash diperlukan oleh
   * Root.jsx untuk menemukan gambar.
   */
  if (!scene.image_hash) {
    fail(
      `Scene ${scene.scene_id} belum memiliki image_hash.`
    );
  }

  const imagePath =
    path.resolve(
      "public/scenes",
      `scene-${sceneNumber}-${scene.image_hash}.png`
    );

  if (
    !fs.existsSync(
      imagePath
    )
  ) {
    fail(
      `Image Scene ${scene.scene_id} tidak ditemukan:\n${imagePath}`
    );
  }

  if (
    !scene.audio_path
  ) {
    fail(
      `Scene ${scene.scene_id} belum memiliki audio_path.`
    );
  }

  const audioPath =
    path.resolve(
      scene.audio_path
        .startsWith("/")
        ? scene.audio_path
        : scene.audio_path
    );

  if (
    !fs.existsSync(
      audioPath
    )
  ) {
    fail(
      `Audio Scene ${scene.scene_id} tidak ditemukan:\n${audioPath}`
    );
  }

  if (
    !Number.isFinite(
      Number(
        scene.audio_duration_seconds
      )
    )
  ) {
    fail(
      `Scene ${scene.scene_id} belum memiliki audio_duration_seconds.`
    );
  }

  console.log(
    `✅ Scene ${scene.scene_id} | image + audio`
  );
}

console.log("");
console.log(
  "Semua asset scene tersedia."
);

/*
 * Pastikan folder output ada.
 */
fs.mkdirSync(
  path.dirname(OUTPUT),
  {
    recursive: true,
  }
);

if (
  fs.existsSync(
    OUTPUT
  )
) {
  fs.unlinkSync(
    OUTPUT
  );
}

/*
 * Render final.
 *
 * Scene duration sekarang mengikuti
 * audio_duration_seconds dari TTS.
 */
run(
  "npx",
  [
    "remotion",
    "render",
    "remotion/src/index.jsx",
    "AutoMotionShort",
    OUTPUT,
    "--concurrency=1",
    "--timeout=120000",
  ]
);

console.log("");
console.log(
  "================================"
);
console.log(
  "VIDEO GENERATION SELESAI"
);
console.log(
  "================================"
);
console.log(
  `Output: ${OUTPUT}`
);
console.log(
  "================================"
);
