import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { generateSpeech } from "./tts-provider.mjs";

const execFileAsync =
  promisify(execFile);

const SCENES_PATH =
  path.resolve(
    "remotion/data/scenes.json"
  );

const AUDIO_DIR =
  path.resolve(
    "public/audio"
  );

fs.mkdirSync(
  AUDIO_DIR,
  {
    recursive: true,
  }
);

if (!fs.existsSync(SCENES_PATH)) {
  throw new Error(
    `scenes.json tidak ditemukan:\n${SCENES_PATH}`
  );
}

const scenesData =
  JSON.parse(
    fs.readFileSync(
      SCENES_PATH,
      "utf8"
    )
  );

if (
  !Array.isArray(
    scenesData.scenes
  ) ||
  !scenesData.scenes.length
) {
  throw new Error(
    "Tidak ada scenes di scenes.json"
  );
}

async function getAudioDuration(
  filePath
) {
  const { stdout } =
    await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ]
    );

  const duration =
    Number(
      stdout.trim()
    );

  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    throw new Error(
      `Durasi audio tidak valid: ${filePath}`
    );
  }

  return duration;
}

function formatSeconds(
  seconds
) {
  return `${seconds.toFixed(2)}s`;
}

console.log("");
console.log(
  "================================"
);
console.log(
  "GENERATE TTS SCENES"
);
console.log(
  "================================"
);

for (
  const scene of scenesData.scenes
) {
  const sceneNumber =
    String(
      scene.scene_id
    ).padStart(2, "0");

  const filename =
    `scene-${sceneNumber}.mp3`;

  const outputPath =
    path.join(
      AUDIO_DIR,
      filename
    );

  const publicPath =
    `audio/${filename}`;

  const narration =
    String(
      scene.narration || ""
    ).trim();

  if (!narration) {
    console.log(
      `⚠️ Scene ${scene.scene_id}: narration kosong`
    );
    continue;
  }

  console.log("");
  console.log(
    `🎬 Scene ${scene.scene_id}`
  );
  console.log(
    `📝 ${narration}`
  );

  const existing =
    fs.existsSync(
      outputPath
    ) &&
    fs.statSync(
      outputPath
    ).size > 1000;

  if (existing) {
    console.log(
      "⏭️ Audio sudah ada"
    );
  } else {
    await generateSpeech({
      text: narration,
      outputPath,
    });

    console.log(
      "✅ Audio berhasil dibuat"
    );
  }

  const duration =
    await getAudioDuration(
      outputPath
    );

  scene.audio_path =
    publicPath;

  scene.audio_duration_seconds =
    Number(
      duration.toFixed(3)
    );

  /*
   * Untuk sementara duration_seconds
   * mengikuti durasi TTS asli.
   *
   * Ini membuat visual tidak selesai
   * sebelum narasi selesai.
   */
  scene.duration_seconds =
    Number(
      duration.toFixed(3)
    );

  console.log(
    `⏱️ Duration: ${formatSeconds(duration)}`
  );
}

fs.writeFileSync(
  SCENES_PATH,
  JSON.stringify(
    scenesData,
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
  "TTS GENERATION SELESAI"
);
console.log(
  `Audio: ${AUDIO_DIR}`
);
console.log(
  `Scenes: ${SCENES_PATH}`
);
console.log(
  "================================"
);
