import { execFileSync } from "child_process";

const theme = process.argv.slice(2).join(" ").trim();

if (!theme) {
  console.error("");
  console.error("❌ Theme belum diberikan.");
  console.error("");
  console.error("Contoh:");
  console.error(
    'node scripts/create-video.mjs "fakta unik tentang gurita"'
  );
  console.error("");
  process.exit(1);
}

function run(label, command, args) {
  console.log("");
  console.log("========================================");
  console.log(label);
  console.log("========================================");
  console.log("");

  execFileSync(command, args, {
    stdio: "inherit",
  });
}

try {
  // ========================================
  // 1. AI GENERATE SCENES
  // ========================================

  run(
    "1/4 🤖 GENERATE AI SCENES",
    "node",
    [
      "scripts/generate-scenes.mjs",
      theme,
    ]
  );

  // ========================================
  // 2. RESOLVE B-ROLL
  // ========================================

  run(
    "2/4 🎥 RESOLVE B-ROLL",
    "node",
    [
      "scripts/resolve-broll.mjs",
    ]
  );

  // ========================================
  // 3. NORMALIZE B-ROLL
  // ========================================

  run(
    "3/4 📐 NORMALIZE B-ROLL",
    "node",
    [
      "scripts/normalize-broll.mjs",
    ]
  );

  // ========================================
  // 4. RENDER REMOTION
  // ========================================

  run(
    "4/4 🎬 RENDER FINAL VIDEO",
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
  console.log("🎉 VIDEO GENERATION SELESAI");
  console.log("========================================");
  console.log("");
  console.log(`🎯 Theme : ${theme}`);
  console.log("🎬 Output: out/final.mp4");
  console.log("");
  console.log("========================================");
  console.log("");
} catch (error) {
  console.error("");
  console.error("========================================");
  console.error("❌ VIDEO GENERATION GAGAL");
  console.error("========================================");
  console.error("");
  console.error(error.message);
  console.error("");
  process.exit(1);
}
