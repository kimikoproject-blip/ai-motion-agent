import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const ROUTER_URL =
  process.env.ROUTER_URL ||
  "http://127.0.0.1:20128/v1";

const ROUTER_KEY = process.env.ROUTER_KEY;

const MODEL =
  "cf/@cf/black-forest-labs/flux-2-klein-4b";

const OUTPUT_DIR = "remotion/assets/scenes";

const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "scene-01-three-hearts-simple.png"
);

const PROMPT = `
Create a simple cute vertical 9:16 cartoon illustration.

SUBJECT:
ONE cute friendly purple octopus underwater.

The octopus has:
- two large white cartoon eyes
- small dark pupils
- bright eye highlights
- friendly cute expression
- simple clean cartoon design

MAIN VISUAL IDEA:

The octopus has EXACTLY THREE RED HEARTS.

Show THREE simple red heart-shaped organs clearly visible INSIDE the octopus body.

Arrange them very clearly:

LEFT HEART
CENTER HEART
RIGHT HEART

The three hearts must be:
- large
- red
- clearly separated
- equally visible
- easy to count
- inside the octopus body

Use a simple semi-transparent body so the three hearts can be seen.

IMPORTANT:
Make the three hearts extremely obvious.

The viewer must immediately see:

1 octopus
3 hearts

DO NOT create complicated anatomy.

DO NOT draw blood vessels.

DO NOT draw gills.

DO NOT draw other organs.

DO NOT draw realistic anatomy.

DO NOT add anatomical details.

Keep the anatomy extremely simple.

STYLE:

Cute modern cartoon.
Soft rounded shapes.
Playful educational illustration.
Clean polished animation style.
Friendly and colorful.
Simple composition.
Soft underwater blue background.

The octopus should NOT look scary.

Eyes must be white with small pupils.

================================================
STRICT RULES
================================================

EXACTLY ONE OCTOPUS.

EXACTLY THREE RED HEARTS.

THREE HEARTS ONLY.

NO EXTRA HEARTS.

NO MISSING HEARTS.

NO HEART EMOJIS.

NO DECORATIVE HEARTS.

NO OTHER ORGANS.

NO BLOOD VESSELS.

NO GILLS.

NO TEXT.

NO WORDS.

NO LETTERS.

NO NUMBERS.

NO LABELS.

NO CAPTIONS.

NO LOGOS.

NO WATERMARK.

NO SPEECH BUBBLES.

NO INFOGRAPHIC.

NO COLLAGE.

NO SPLIT SCREEN.

NO SECOND OCTOPUS.

NO HORROR.

NO SCARY EYES.

NO BLACK EYES.

NO GORE.

The final illustration must be simple and immediately communicate:

ONE CUTE OCTOPUS WITH THREE VISIBLE HEARTS.
`;

if (!ROUTER_KEY) {
  throw new Error("ROUTER_KEY belum ada di .env");
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log("🎨 Generating SIMPLE 3 HEART scene...");

const response = await fetch(
  `${ROUTER_URL}/images/generations?response_format=binary`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: PROMPT,
      size: "1024x1792",
    }),
  }
);

if (!response.ok) {
  const errorText = await response.text();

  throw new Error(
    `Image generation gagal (${response.status}): ${errorText}`
  );
}

const buffer = Buffer.from(
  await response.arrayBuffer()
);

fs.writeFileSync(OUTPUT_FILE, buffer);

console.log("");
console.log("========================================");
console.log("✅ SIMPLE SCENE BERHASIL");
console.log("========================================");
console.log(`📁 ${OUTPUT_FILE}`);
console.log(
  `📦 ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
);
