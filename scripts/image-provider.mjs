import "dotenv/config";

const ROUTER_URL =
  process.env.ROUTER_URL ||
  "http://127.0.0.1:20128/v1";

const ROUTER_KEY =
  process.env.ROUTER_KEY;

if (!ROUTER_KEY) {
  throw new Error(
    "ROUTER_KEY belum ada di .env"
  );
}

/*
 * IMAGE MODELS
 *
 * Urutan = prioritas.
 *
 * Nanti kalau menemukan provider/model baru,
 * cukup ubah IMAGE_MODELS di .env.
 *
 * Contoh:
 *
 * IMAGE_MODELS=model-a,model-b,model-c
 */

const DEFAULT_IMAGE_MODELS = [
  "cf/@cf/black-forest-labs/flux-2-klein-4b",
  "cf/@cf/black-forest-labs/flux-2-dev",
  "gemini/gemini-3.1-flash-image-preview",
  "openai/gpt-image-1",
];

function getImageModels() {
  const raw =
    process.env.IMAGE_MODELS;

  if (!raw) {
    return [
      ...DEFAULT_IMAGE_MODELS,
    ];
  }

  return raw
    .split(",")
    .map(
      (model) =>
        model.trim()
    )
    .filter(Boolean);
}

function prettyModelName(
  model
) {
  return model
    .replace(
      "cf/@cf/black-forest-labs/",
      ""
    )
    .replace(
      "cf/@cf/",
      ""
    )
    .replace(
      "gemini/",
      ""
    )
    .replace(
      "openai/",
      ""
    )
    .replace(
      "xai/",
      ""
    );
}

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

function isQuotaError(
  message
) {
  const text =
    String(
      message || ""
    ).toLowerCase();

  return [
    "daily free allocation",
    "used up your daily free",
    "quota",
    "credits remaining",
    "insufficient_quota",
    "billing",
    "credit",
    "rate limit",
    "too many requests",
  ].some(
    (keyword) =>
      text.includes(keyword)
  );
}

async function requestImage({
  model,
  prompt,
  size,
}) {
  const response =
    await fetch(
      `${ROUTER_URL}/images/generations?response_format=binary`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${ROUTER_KEY}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model,
          prompt,
          size,
        }),
      }
    );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `HTTP ${response.status}: ${body}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (!buffer.length) {
    throw new Error(
      "Response image kosong."
    );
  }

  return buffer;
}

export async function generateSceneImage({
  prompt,
  size = "1024x1792",
  models = getImageModels(),
  retriesPerModel = 1,
}) {
  if (!prompt) {
    throw new Error(
      "Prompt image kosong."
    );
  }

  if (!models.length) {
    throw new Error(
      "Tidak ada IMAGE_MODELS."
    );
  }

  let lastError;

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "🎨 IMAGE PROVIDER"
  );
  console.log(
    "================================"
  );

  console.log(
    `Size: ${size}`
  );

  console.log(
    `Models: ${models.length}`
  );

  for (
    const model of models
  ) {
    console.log(
      `  • ${prettyModelName(model)}`
    );
  }

  for (
    const model of models
  ) {
    for (
      let attempt = 1;
      attempt <= retriesPerModel;
      attempt++
    ) {
      console.log("");
      console.log(
        `🎨 ${prettyModelName(model)}`
      );
      console.log(
        `   Attempt ${attempt}/${retriesPerModel}`
      );

      try {
        const buffer =
          await requestImage({
            model,
            prompt,
            size,
          });

        console.log(
          `✅ ${prettyModelName(model)} berhasil`
        );

        return {
          buffer,
          model,
          attempt,
        };
      } catch (error) {
        lastError =
          error;

        const message =
          error?.message ||
          String(error);

        console.log(
          `⚠️ ${message}`
        );

        /*
         * Kalau quota habis,
         * langsung pindah model.
         */
        if (
          isQuotaError(
            message
          )
        ) {
          console.log(
            "⏭️ Quota/credit/rate-limit → pindah model."
          );

          break;
        }

        /*
         * Error biasa:
         * retry satu kali.
         */
        if (
          attempt <
          retriesPerModel
        ) {
          console.log(
            "↻ Retry..."
          );

          await sleep(
            1200
          );
        }
      }
    }
  }

  throw new Error(
    [
      "Semua image model gagal.",
      "",
      `Models: ${models.join(", ")}`,
      "",
      `Last error: ${lastError?.message}`,
    ].join("\n")
  );
}

export function getConfiguredImageModels() {
  return getImageModels();
}
