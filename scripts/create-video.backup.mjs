import { execFileSync } from "child_process";

const theme = process.argv.slice(2).join(" ").trim();

if (!theme) {
  console.error("");
  console.error('Contoh:');
  console.error('node scripts/create-video.mjs "fakta unik hewan cheetah"');
  console.error("");
  process.exit(1);
}

function run(label, command, args) {
  console.log("");
  console.log("========================================");
  console.log(label);
  console.log("========================================");

  execFileSync(command, args, {
    stdio: "inherit",
  });
}

try {
  // STEP 1
  run(
    "1/4 GENERATE SCENE",
    "node",
    [
      "scripts/generate-scenes.mjs",
      theme,
    ]
  );

  // STEP 2
  run(
    "2/4 RESOLVE B-ROLL",
    "node",
    [
      "scripts/resolve-broll.mjs",
    ]
  );

  // STEP 3
  run(
    "3/4 NORMALIZE B-ROLL",
    "node",
    [
      "scripts/normalize-broll.mjs",
    ]
  );

  // STEP 4
  run(
    "4/4 RENDER VIDEO",
    "npx",
    [
      "remotion",
      "render",
      "remotion/src/index.jsx",
      "MotionDemo",
      "out/final.mp4",
      "--concurrency=1",
      "--timeout=120000",
      "--codec=h264",
      "--overwrite",
    ]
  );

  console.log("");
  console.log("========================================");
  console.log("🎬 VIDEO GENERATION SELESAI");
  console.log("========================================");
  console.log(`Theme : ${theme}`);
  console.log("Output: out/final.mp4");
  console.log("========================================");
  console.log("");
} catch (error) {
  console.error("");
  console.error("❌ VIDEO GENERATION GAGAL");
  console.error(error.message);
  process.exit(1);
}
