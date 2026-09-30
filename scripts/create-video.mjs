import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync =
  promisify(execFile);

const theme =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!theme) {
  console.error(
    '❌ Masukkan tema.\n\nContoh:\nnode scripts/create-video.mjs "kenapa gurita punya tiga jantung"'
  );

  process.exit(1);
}

async function run(
  command,
  args
) {
  console.log("");
  console.log(
    "================================"
  );
  console.log(
    `▶ ${command} ${args.join(" ")}`
  );
  console.log(
    "================================"
  );

  await execFileAsync(
    command,
    args,
    {
      stdio: "inherit",
    }
  );
}

try {
  /*
   * STEP 1
   * AI STORY
   */
  await run(
    "node",
    [
      "scripts/generate-story.mjs",
      theme,
    ]
  );

  /*
   * STEP 2
   * TTS
   */
  await run(
    "node",
    [
      "scripts/generate-tts.mjs",
    ]
  );

  /*
   * STEP 3
   * Sync timing
   */
  await run(
    "node",
    [
      "scripts/sync-text-beats.mjs",
    ]
  );

  /*
   * STEP 4
   * Scene images
   *
   * Untuk sementara image provider
   * boleh gagal karena quota.
   */
  try {
    await run(
      "node",
      [
        "scripts/generate-scenes.mjs",
      ]
    );
  } catch (error) {
    console.log("");
    console.log(
      "⚠️ IMAGE GENERATION DI-SKIP"
    );

    console.log(
      "Provider image bisa diganti nanti."
    );
  }

  /*
   * STEP 5
   * Render
   */
  await run(
    "node",
    [
      "scripts/generate-video.mjs",
    ]
  );

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "🎬 VIDEO SELESAI"
  );
  console.log(
    "================================"
  );

  console.log(
    "Output: out/final.mp4"
  );
} catch (error) {
  console.error("");
  console.error(
    "================================"
  );
  console.error(
    "❌ PIPELINE GAGAL"
  );
  console.error(
    "================================"
  );

  console.error(
    error.message
  );

  process.exit(1);
}
