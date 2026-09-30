import "dotenv/config";
import fs from "node:fs";
import { spawn } from "node:child_process";

const ROUTER_KEY =
  process.env.ROUTER_KEY;

if (!ROUTER_KEY) {
  throw new Error(
    "ROUTER_KEY belum ada di .env"
  );
}

const scenesFile =
  "remotion/data/scenes.json";

if (!fs.existsSync(scenesFile)) {
  throw new Error(
    `File tidak ditemukan: ${scenesFile}`
  );
}

function run(command, args, env = {}) {
  return new Promise(
    (resolve, reject) => {
      console.log("");
      console.log(
        `▶️ ${command} ${args.join(" ")}`
      );
      console.log("");

      const child =
        spawn(
          command,
          args,
          {
            stdio: "inherit",
            env: {
              ...process.env,
              ...env,
            },
          }
        );

      child.on(
        "close",
        (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `${command} gagal dengan exit code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

console.log("");
console.log("========================================");
console.log("🚀 AI MOTION SHORT BUILDER");
console.log("========================================");
console.log("");

console.log("STEP 1/2");
console.log("🎨 Generate scene images");

await run(
  "node",
  [
    "scripts/generate-scenes.mjs",
  ],
  {
    ROUTER_KEY,
  }
);

console.log("");
console.log("STEP 2/2");
console.log("🎬 Render Remotion");

await run(
  "npx",
  [
    "remotion",
    "render",
    "remotion/src/index.jsx",
    "AutoMotionShort",
    "out/auto-motion-short.mp4",
  ]
);

console.log("");
console.log("========================================");
console.log("✅ SHORT SELESAI");
console.log("========================================");
console.log("");
console.log(
  "📁 out/auto-motion-short.mp4"
);
console.log("");
