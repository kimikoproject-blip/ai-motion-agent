import "dotenv/config";
import fs from "fs";
import path from "path";

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

if (!PEXELS_KEY && !PIXABAY_KEY) {
  throw new Error(
    "API key belum tersedia.\n" +
    "Pastikan .env berisi PEXELS_API_KEY dan/atau PIXABAY_API_KEY"
  );
}

const scenesPath = "remotion/data/scenes.json";
const outputPath = "remotion/data/scenes.generated.json";
const assetDir = "public/assets";

fs.mkdirSync(assetDir, { recursive: true });

const scenesData = JSON.parse(
  fs.readFileSync(scenesPath, "utf8")
);

const scenes = scenesData.scenes || [];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQueryKeywords(query) {
  const stopwords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "at",
    "with",
    "for",
    "shot",
    "close",
    "up",
    "view",
    "video",
    "cinematic",
    "slow",
    "motion",
    "underwater",
    "scene",
  ]);

  return normalizeText(query)
    .split(" ")
    .filter((word) => word.length >= 3)
    .filter((word) => !stopwords.has(word));
}

function scoreVisualRequirements(scene, video) {
  const mustHave = Array.isArray(scene.visualMustHave)
    ? scene.visualMustHave
    : [];

  const avoid = Array.isArray(scene.visualAvoid)
    ? scene.visualAvoid
    : [];

  const searchable = normalizeText(
    [
      video?.url,
      video?.image,
      video?.user?.name,
      video?.tags,
      video?.pageURL,
    ]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;

  // Objek yang wajib ada
  for (const item of mustHave) {
    const keyword = normalizeText(item);

    if (keyword && searchable.includes(keyword)) {
      score += 45;
    }
  }

  // Objek yang harus dihindari
  for (const item of avoid) {
    const keyword = normalizeText(item);

    if (keyword && searchable.includes(keyword)) {
      score -= 80;
    }
  }

  return score;
}

function scoreRelevance(query, video) {
  const queryWords = getQueryKeywords(query);

  if (!queryWords.length) {
    return 0;
  }

  const searchable = normalizeText(
    [
      video?.url,
      video?.image,
      video?.user?.name,
      video?.tags,
    ]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;

  for (const word of queryWords) {
    if (searchable.includes(word)) {
      score += 20;
    }
  }

  return score;
}

function scoreVideo(width, height, query, video, scene) {
  const ratio = width / height;
  const targetRatio = 9 / 16;

  const ratioDiff = Math.abs(ratio - targetRatio);

  let score = 0;

  // ========================================
  // FORMAT
  // ========================================

  score += Math.max(
    0,
    100 - ratioDiff * 100
  );

  // ========================================
  // RESOLUTION
  // ========================================

  if (width >= 1080 && height >= 1920) {
    score += 40;
  } else if (width >= 720 && height >= 1280) {
    score += 25;
  } else if (width >= 480 && height >= 854) {
    score += 10;
  }

  // ========================================
  // PORTRAIT
  // ========================================

  if (height > width) {
    score += 30;
  }

  // ========================================
  // RELEVANCE
  // ========================================

  score += scoreRelevance(
    query,
    video
  );

  score += scoreVisualRequirements(
    scene,
    video
  );

  return score;
}

async function searchPexels(query) {
  if (!PEXELS_KEY) {
    throw new Error(
      "PEXELS_API_KEY belum tersedia"
    );
  }

  const url =
    "https://api.pexels.com/v1/videos/search" +
    `?query=${encodeURIComponent(query)}` +
    "&per_page=10" +
    "&orientation=portrait";

  const response = await fetch(url, {
    headers: {
      Authorization: PEXELS_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels ${response.status}`
    );
  }

  return response.json();
}

async function searchPixabay(query) {
  if (!PIXABAY_KEY) {
    throw new Error(
      "PIXABAY_API_KEY belum tersedia"
    );
  }

  const url =
    "https://pixabay.com/api/videos/" +
    `?key=${PIXABAY_KEY}` +
    `&q=${encodeURIComponent(query)}` +
    "&per_page=10" +
    "&safesearch=true";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Pixabay ${response.status}`
    );
  }

  return response.json();
}

// ========================================
// TRACK VIDEO YANG SUDAH DIPAKAI
// ========================================

const usedVideoIds = new Set();

function getBestPexelsVideo(data, query) {
  const candidates = [];

  for (const video of data.videos || []) {
    if (
      usedVideoIds.has(
        `pexels:${video.id}`
      )
    ) {
      continue;
    }

    for (const file of video.video_files || []) {
      if (
        !file.link ||
        !file.width ||
        !file.height
      ) {
        continue;
      }

      candidates.push({
        video,
        file,
        score: scoreVideo(
          file.width,
          file.height,
          query,
          video,
          scene
        ),
      });
    }
  }

  candidates.sort(
    (a, b) => b.score - a.score
  );

  const best =
    candidates[0] || null;

  if (best) {
    usedVideoIds.add(
      `pexels:${best.video.id}`
    );
  }

  return best;
}

function scorePixabayRelevance(
  query,
  video
) {
  const queryWords =
    getQueryKeywords(query);

  const searchable =
    normalizeText(
      [
        video?.tags,
        video?.pageURL,
      ]
        .filter(Boolean)
        .join(" ")
    );

  let score = 0;

  for (const word of queryWords) {
    if (searchable.includes(word)) {
      score += 20;
    }
  }

  return score;
}

function getBestPixabayVideo(
  data,
  query
) {
  const candidates = [];

  for (const video of data.hits || []) {
    if (
      usedVideoIds.has(
        `pixabay:${video.id}`
      )
    ) {
      continue;
    }

    const files = [
      video.videos?.large,
      video.videos?.medium,
      video.videos?.small,
      video.videos?.tiny,
    ];

    for (const file of files) {
      if (
        !file?.url ||
        !file.width ||
        !file.height
      ) {
        continue;
      }

      candidates.push({
        video,
        file,
        score:
          scoreVideo(
            file.width,
            file.height,
            query,
            video,
            scene
          ) +
          scorePixabayRelevance(
            query,
            video
          ),
      });
    }
  }

  candidates.sort(
    (a, b) => b.score - a.score
  );

  const best =
    candidates[0] || null;

  if (best) {
    usedVideoIds.add(
      `pixabay:${best.video.id}`
    );
  }

  return best;
}

async function downloadVideo(
  url,
  outputPath
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download ${response.status}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  fs.writeFileSync(
    outputPath,
    buffer
  );

  return buffer.length;
}

async function resolveScene(
  scene,
  index
) {
  const query =
    scene.visualQuery ||
    scene.visual_query ||
    scene.query ||
    scene.text ||
    scene.title ||
    "";

  console.log("");
  console.log(
    "----------------------------------------"
  );
  console.log(
    `Scene ${index + 1}`
  );
  console.log(
    `Query: ${query}`
  );
  console.log(
    "----------------------------------------"
  );

  // ========================================
  // PEXELS
  // ========================================

  if (PEXELS_KEY) {
    try {
      console.log(
        "Searching Pexels..."
      );

      const result =
        await searchPexels(
          query
        );

      const best =
        getBestPexelsVideo(
          result,
          query
        );

      if (best) {
        const {
          video,
          file,
          score,
        } = best;

        console.log(
          `Pexels video: ${video.id}`
        );

        console.log(
          `Resolution: ${file.width}x${file.height}`
        );

        console.log(
          `Score: ${score.toFixed(2)}`
        );

        const filename =
          `scene-${String(
            index + 1
          ).padStart(2, "0")}` +
          `-pexels-${video.id}.mp4`;

        const outputFile =
          path.join(
            assetDir,
            filename
          );

        if (
          !fs.existsSync(
            outputFile
          )
        ) {
          console.log(
            "Downloading Pexels..."
          );

          const bytes =
            await downloadVideo(
              file.link,
              outputFile
            );

          console.log(
            `Downloaded ${(bytes / 1024 / 1024).toFixed(2)} MB`
          );
        } else {
          console.log(
            "Asset already exists."
          );
        }

        return {
          ...scene,
          asset: filename,
          assetType: "video",
          source: "pexels",
          sourceId: video.id,
          sourceUrl: video.url,
          score: Number(
            score.toFixed(2)
          ),
        };
      }

      console.log(
        "Pexels tidak menemukan kandidat unik."
      );
    } catch (error) {
      console.log(
        `Pexels gagal: ${error.message}`
      );
    }
  }

  // ========================================
  // PIXABAY FALLBACK
  // ========================================

  if (PIXABAY_KEY) {
    try {
      console.log(
        "Fallback → Pixabay..."
      );

      const result =
        await searchPixabay(
          query
        );

      const best =
        getBestPixabayVideo(
          result,
          query
        );

      if (best) {
        const {
          video,
          file,
          score,
        } = best;

        console.log(
          `Pixabay video: ${video.id}`
        );

        console.log(
          `Resolution: ${file.width}x${file.height}`
        );

        console.log(
          `Score: ${score.toFixed(2)}`
        );

        const filename =
          `scene-${String(
            index + 1
          ).padStart(2, "0")}` +
          `-pixabay-${video.id}.mp4`;

        const outputFile =
          path.join(
            assetDir,
            filename
          );

        if (
          !fs.existsSync(
            outputFile
          )
        ) {
          console.log(
            "Downloading Pixabay..."
          );

          const bytes =
            await downloadVideo(
              file.url,
              outputFile
            );

          console.log(
            `Downloaded ${(bytes / 1024 / 1024).toFixed(2)} MB`
          );
        } else {
          console.log(
            "Asset already exists."
          );
        }

        return {
          ...scene,
          asset: filename,
          assetType: "video",
          source: "pixabay",
          sourceId: video.id,
          sourceUrl: video.pageURL,
          score: Number(
            score.toFixed(2)
          ),
        };
      }

      console.log(
        "Pixabay tidak menemukan kandidat unik."
      );
    } catch (error) {
      console.log(
        `Pixabay gagal: ${error.message}`
      );
    }
  }

  // ========================================
  // TIDAK ADA B-ROLL
  // ========================================

  console.log(
    "⚠️ Tidak menemukan B-roll untuk scene ini."
  );

  return {
    ...scene,
    asset: null,
    assetType: null,
    source: null,
    sourceId: null,
    sourceUrl: null,
    score: 0,
  };
}

async function main() {
  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "🎬 B-ROLL RESOLVER"
  );
  console.log(
    "========================================"
  );

  console.log(
    `Scenes: ${scenes.length}`
  );

  console.log("");

  const resolvedScenes = [];

  for (
    let i = 0;
    i < scenes.length;
    i++
  ) {
    const resolved =
      await resolveScene(
        scenes[i],
        i
      );

    resolvedScenes.push(
      resolved
    );
  }

  const output = {
    ...scenesData,
    scenes:
      resolvedScenes,
  };

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      output,
      null,
      2
    )
  );

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "✅ B-ROLL RESOLVER SELESAI"
  );
  console.log(
    "========================================"
  );

  console.log(
    `Output: ${outputPath}`
  );

  console.log(
    `Video unik dipakai: ${usedVideoIds.size}`
  );

  console.log(
    "========================================"
  );

  console.log("");
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "❌ RESOLVE B-ROLL GAGAL"
    );
    console.error(error);
    process.exit(1);
  }
);
