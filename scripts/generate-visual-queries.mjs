import fs from "fs";
import path from "path";

const scenesPath = path.resolve("remotion/data/scenes.json");
const outputPath = path.resolve("remotion/data/scenes.visual.json");

const data = JSON.parse(
  fs.readFileSync(scenesPath, "utf8")
);

function makeQuery(scene) {
  const text = scene.text.toLowerCase();

  if (text.includes("gurita") || text.includes("jantung") || text.includes("insang")) {
    if (text.includes("3 jantung")) {
      return "real octopus underwater close up";
    }

    if (text.includes("insang")) {
      return "octopus breathing underwater close up";
    }

    return "real octopus swimming underwater";
  }

  return scene.visualQuery || scene.text;
}

const scenes = data.scenes.map(scene => ({
  ...scene,
  visualQuery: makeQuery(scene),
}));

const output = {
  ...data,
  scenes,
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2)
);

console.log("");
console.log("VISUAL QUERY FALLBACK SELESAI");
console.log("");

for (const scene of scenes) {
  console.log(
    `${scene.text} → ${scene.visualQuery}`
  );
}

console.log("");
console.log(`Output: ${outputPath}`);
