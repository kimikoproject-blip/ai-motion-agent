import { spawn } from "node:child_process";

const theme =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!theme) {
  console.error(
    "❌ Theme kosong."
  );

  process.exit(1);
}

function runStep(
  command,
  args
) {
  return new Promise(
    (resolve, reject) => {
      console.log("");
      console.log(
        `▶ ${command} ${args.join(" ")}`
      );

      const child =
        spawn(
          command,
          args,
          {
            stdio:
              "inherit",
          }
        );

      child.on(
        "error",
        reject
      );

      child.on(
        "close",
        (code) => {
          if (
            code === 0
          ) {
            resolve();
          } else {
            reject(
              new Error(
                `${command} exit code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

async function main() {
  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "🎬 THEME PIPELINE"
  );
  console.log(
    "================================"
  );
  console.log(
    `Theme: ${theme}`
  );

  /*
   * STORY
   */
  await runStep(
    "node",
    [
      "scripts/generate-story.mjs",
      theme,
    ]
  );

  /*
   * TTS
   */
  await runStep(
    "node",
    [
      "scripts/generate-tts.mjs",
    ]
  );

  /*
   * TIMING
   */
  await runStep(
    "node",
    [
      "scripts/sync-text-beats.mjs",
    ]
  );

  /*
   * IMAGE
   *
   * Image provider sengaja dipisahkan.
   * Kalau quota habis, nanti tinggal
   * ganti provider.
   */
  try {
    await runStep(
      "node",
      [
        "scripts/generate-scenes.mjs",
      ]
    );
  } catch (error) {
    console.log("");
    console.log(
      "⚠️ Image generation gagal."
    );
    console.log(
      "Pipeline image akan diganti provider-nya nanti."
    );
  }

  /*
   * RENDER
   */
  await runStep(
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
    "✅ SELESAI"
  );
  console.log(
    "================================"
  );
  console.log(
    "Output: out/final.mp4"
  );
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "❌ PIPELINE ERROR"
    );
    console.error(
      error.message
    );

    process.exit(1);
  }
);
