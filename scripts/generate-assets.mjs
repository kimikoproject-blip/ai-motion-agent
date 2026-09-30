import "dotenv/config";
import fs from "fs";
import path from "path";

const ROUTER_URL =
  process.env.ROUTER_URL ||
  "http://127.0.0.1:20128/v1";

const ROUTER_KEY =
  process.env.ROUTER_KEY;

const IMAGE_MODEL =
  process.env.IMAGE_MODEL ||
  "cf/@cf/black-forest-labs/flux-2-klein-4b";

const SCENES_PATH =
  path.resolve("remotion/data/scenes.json");

const OUTPUT_DIR =
  path.resolve("remotion/assets/generated");

const MAX_RETRIES = 5;
const DELAY_BETWEEN_ASSETS = 10000;

if (!ROUTER_KEY) {
  throw new Error(
    "❌ ROUTER_KEY belum ada di .env"
  );
}

if (!fs.existsSync(SCENES_PATH)) {
  throw new Error(
    `❌ scenes.json tidak ditemukan:\n${SCENES_PATH}`
  );
}

fs.mkdirSync(
  OUTPUT_DIR,
  { recursive: true }
);

const scenes = JSON.parse(
  fs.readFileSync(
    SCENES_PATH,
    "utf8"
  )
);

const assets =
  Array.isArray(scenes.assets)
    ? scenes.assets
    : [];

if (!assets.length) {
  throw new Error(
    "❌ Tidak ada assets di scenes.json"
  );
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

function safeFilename(id) {
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function buildPrompt(asset) {
  const globalStyle =
    scenes.globalStyle || {};

  return [
    "Create a single premium visual asset for a vertical short-form motion infographic.",
    "",
    `Asset type: ${asset.kind || "object"}`,
    `Asset ID: ${asset.id}`,
    `Description: ${asset.description || ""}`,
    "",
    "Visual direction:",
    asset.prompt || "",
    "",
    `Overall visual style: ${
      globalStyle.visualStyle ||
      "premium stylized 3D motion infographic"
    }`,
    `Lighting: ${
      globalStyle.lighting ||
      "cinematic studio lighting"
    }`,
    "",
    "Requirements:",
    "- premium professional visual quality",
    "- clean stylized 3D look",
    "- realistic proportions but visually polished",
    "- cinematic studio lighting",
    "- strong depth and subtle rim light",
    "- centered and clearly readable subject",
    "- isolated subject",
    "- transparent background if supported",
    "- no text",
    "- no letters",
    "- no subtitles",
    "- no captions",
    "- no watermark",
    "- no UI",
    "- no arrows",
    "- no infographic labels",
    "- no complex background",
    "- suitable for compositing in a 9:16 motion graphics video",
    "- keep the entire subject inside the frame",
    "- do not crop important parts"
  ].join("\n");
}

async function requestImage(asset) {
  const response =
    await fetch(
      `${ROUTER_URL}/images/generations?response_format=binary`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${ROUTER_KEY}`,
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt:
            buildPrompt(asset)
        })
      }
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (!response.ok) {
    let message =
      buffer.toString("utf8");

    try {
      const json =
        JSON.parse(message);

      message =
        JSON.stringify(
          json,
          null,
          2
        );
    } catch {}

    const error =
      new Error(
        `HTTP ${response.status}\n${message}`
      );

    error.status =
      response.status;

    throw error;
  }

  if (!buffer.length) {
    throw new Error(
      "Response image kosong."
    );
  }

  return {
    buffer,
    contentType
  };
}

async function generateImage(asset) {
  const filename =
    `${safeFilename(asset.id)}.png`;

  const outputPath =
    path.join(
      OUTPUT_DIR,
      filename
    );

  if (
    fs.existsSync(outputPath) &&
    fs.statSync(outputPath).size > 1000
  ) {
    console.log(
      `⏭️  SKIP | ${asset.id} | sudah ada`
    );

    return {
      id: asset.id,
      path: outputPath,
      skipped: true
    };
  }

  const prompt =
    buildPrompt(asset);

  console.log("");
  console.log(
    `🎨 GENERATE | ${asset.id}`
  );

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `   attempt ${attempt}/${MAX_RETRIES}`
      );

      const {
        buffer,
        contentType
      } =
        await requestImage(
          asset
        );

      /*
       * Binary response
       */
      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        fs.writeFileSync(
          outputPath,
          buffer
        );

        console.log(
          `   ✅ saved: ${outputPath}`
        );

        console.log(
          `   📦 size : ${(buffer.length / 1024).toFixed(1)} KB`
        );

        return {
          id: asset.id,
          path: outputPath,
          skipped: false
        };
      }

      /*
       * JSON response fallback
       */
      const data =
        JSON.parse(
          buffer.toString("utf8")
        );

      if (data?.error) {
        throw new Error(
          JSON.stringify(
            data.error,
            null,
            2
          )
        );
      }

      const item =
        data?.data?.[0];

      if (item?.b64_json) {
        const imageBuffer =
          Buffer.from(
            item.b64_json,
            "base64"
          );

        fs.writeFileSync(
          outputPath,
          imageBuffer
        );

        console.log(
          `   ✅ saved: ${outputPath}`
        );

        return {
          id: asset.id,
          path: outputPath,
          skipped: false
        };
      }

      if (item?.url) {
        const imageResponse =
          await fetch(
            item.url
          );

        if (
          !imageResponse.ok
        ) {
          throw new Error(
            `Gagal download image URL: HTTP ${imageResponse.status}`
          );
        }

        const imageBuffer =
          Buffer.from(
            await imageResponse.arrayBuffer()
          );

        fs.writeFileSync(
          outputPath,
          imageBuffer
        );

        console.log(
          `   ✅ saved: ${outputPath}`
        );

        return {
          id: asset.id,
          path: outputPath,
          skipped: false
        };
      }

      throw new Error(
        "Format response image tidak dikenali."
      );

    } catch (error) {
      const status =
        error.status;

      const isRateLimit =
        status === 429 ||
        error.message.includes(
          "429"
        ) ||
        error.message.includes(
          "quota"
        ) ||
        error.message.includes(
          "rate limit"
        );

      console.log(
        `   ⚠️ ${error.message}`
      );

      if (
        !isRateLimit ||
        attempt === MAX_RETRIES
      ) {
        throw error;
      }

      const wait =
        attempt === 1
          ? 15000
          : attempt === 2
          ? 30000
          : attempt === 3
          ? 60000
          : 90000;

      console.log(
        `   ⏳ Rate limit. Tunggu ${wait / 1000}s...`
      );

      await sleep(
        wait
      );
    }
  }
}

console.log("");
console.log(
  "========================================"
);
console.log(
  "        AI ASSET GENERATOR"
);
console.log(
  "========================================"
);
console.log(
  `📄 Storyboard : ${SCENES_PATH}`
);
console.log(
  `🎨 Model      : ${IMAGE_MODEL}`
);
console.log(
  `🧩 Assets     : ${assets.length}`
);
console.log(
  `📁 Output     : ${OUTPUT_DIR}`
);
console.log(
  "========================================"
);

const results = [];
const failures = [];

for (
  let i = 0;
  i < assets.length;
  i++
) {
  const asset =
    assets[i];

  console.log("");
  console.log(
    `[${i + 1}/${assets.length}]`
  );

  try {
    const result =
      await generateImage(
        asset
      );

    results.push(
      result
    );

  } catch (error) {
    console.error("");
    console.error(
      `❌ FAILED | ${asset.id}`
    );
    console.error(
      error.message
    );

    failures.push({
      id: asset.id,
      error:
        error.message
    });
  }

  if (
    i < assets.length - 1
  ) {
    console.log("");
    console.log(
      `⏳ Jeda ${DELAY_BETWEEN_ASSETS / 1000}s sebelum asset berikutnya...`
    );

    await sleep(
      DELAY_BETWEEN_ASSETS
    );
  }
}

console.log("");
console.log(
  "========================================"
);
console.log(
  "              HASIL"
);
console.log(
  "========================================"
);

console.log(
  `✅ Berhasil : ${results.length}`
);

console.log(
  `❌ Gagal   : ${failures.length}`
);

console.log(
  `📁 Folder   : ${OUTPUT_DIR}`
);

if (results.length) {
  console.log("");
  console.log(
    "Generated assets:"
  );

  for (
    const result of results
  ) {
    console.log(
      `  ✓ ${result.id} → ${result.path}`
    );
  }
}

if (failures.length) {
  console.log("");
  console.log(
    "Failed assets:"
  );

  for (
    const failure of failures
  ) {
    console.log(
      `  ✗ ${failure.id}`
    );
  }
}

console.log("");

if (
  failures.length
) {
  process.exitCode = 1;
} else {
  console.log(
    "🎉 SEMUA ASSET BERHASIL!"
  );
}
