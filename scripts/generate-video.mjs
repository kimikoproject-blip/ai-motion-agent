import { execFileSync } from "child_process";

function run(command, args) {
  console.log("");
  console.log("================================");
  console.log(`RUN: ${command} ${args.join(" ")}`);
  console.log("================================");

  execFileSync(command, args, {
    stdio: "inherit",
  });
}

try {
  // 1. Cari/download B-roll
  run("node", [
    "scripts/resolve-broll.mjs",
  ]);

  // 2. Normalisasi video agar ringan untuk Remotion
  run("node", [
    "scripts/normalize-broll.mjs",
  ]);

  // 3. Render final
  run("npx", [
    "remotion",
    "render",
    "remotion/src/index.jsx",
    "MotionDemo",
    "out/final.mp4",
    "--concurrency=1",
    "--timeout=120000",
  ]);

  console.log("");
  console.log("================================");
  console.log("VIDEO GENERATION SELESAI");
  console.log("Output: out/final.mp4");
  console.log("================================");
} catch (error) {
  console.error("");
  console.error("VIDEO GENERATION GAGAL.");
  console.error(error.message);
  process.exit(1);
}
