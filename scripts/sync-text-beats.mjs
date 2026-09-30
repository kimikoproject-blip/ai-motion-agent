import fs from "node:fs";
import path from "node:path";

const SCENES_PATH =
  path.resolve("remotion/data/scenes.json");

if (!fs.existsSync(SCENES_PATH)) {
  throw new Error(
    `scenes.json tidak ditemukan:\n${SCENES_PATH}`
  );
}

const data =
  JSON.parse(
    fs.readFileSync(
      SCENES_PATH,
      "utf8"
    )
  );

if (
  !Array.isArray(data.scenes)
) {
  throw new Error(
    "scenes.json tidak memiliki array scenes."
  );
}

const ALLOWED_STYLES =
  new Set([
    "normal",
    "emphasis",
    "question",
    "number",
  ]);

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

for (
  const scene of data.scenes
) {
  const audioDuration =
    Number(
      scene.audio_duration_seconds
    );

  if (
    !Number.isFinite(
      audioDuration
    ) ||
    audioDuration <= 0
  ) {
    console.log(
      `⚠️ Scene ${scene.scene_id}: audio duration tidak valid`
    );

    continue;
  }

  /*
   * Durasi scene mengikuti audio.
   * Tambahkan sedikit ruang di akhir
   * supaya kalimat terakhir tidak kepotong.
   */
  scene.duration_seconds =
    Number(
      (
        audioDuration +
        0.25
      ).toFixed(3)
    );

  /*
   * PENTING:
   * Jangan membuat ulang text_beats.
   * Jangan menghapus text_beats.
   * Kita hanya membersihkan timing.
   */
  if (
    !Array.isArray(
      scene.text_beats
    )
  ) {
    scene.text_beats = [];
  }

  const normalized =
    [];

  for (
    const beat of scene.text_beats
  ) {
    const text =
      String(
        beat?.text || ""
      )
        .trim()
        .slice(0, 60);

    if (!text) {
      continue;
    }

    const style =
      ALLOWED_STYLES.has(
        beat?.style
      )
        ? beat.style
        : "normal";

    let start =
      Number(
        beat?.start
      );

    let duration =
      Number(
        beat?.duration
      );

    if (
      !Number.isFinite(
        start
      ) ||
      !Number.isFinite(
        duration
      )
    ) {
      continue;
    }

    start =
      clamp(
        start,
        0,
        Math.max(
          0,
          scene.duration_seconds -
            0.25
        )
      );

    duration =
      clamp(
        duration,
        0.25,
        2.5
      );

    /*
     * Jangan sampai beat melewati
     * akhir scene.
     */
    if (
      start >=
      scene.duration_seconds
    ) {
      continue;
    }

    const remaining =
      scene.duration_seconds -
      start;

    duration =
      Math.min(
        duration,
        Math.max(
          0.25,
          remaining
        )
      );

    normalized.push({
      text,
      start:
        Number(
          start.toFixed(3)
        ),
      duration:
        Number(
          duration.toFixed(3)
        ),
      style,
    });
  }

  /*
   * Maksimal 4 kinetic beats.
   */
  scene.text_beats =
    normalized
      .slice(0, 4);

  /*
   * overlay_text tetap dipertahankan.
   */
  scene.overlay_text =
    String(
      scene.overlay_text ||
      ""
    ).trim();

  console.log("");
  console.log(
    `Scene ${scene.scene_id}: ${scene.duration_seconds}s`
  );

  console.log(
    `Text beats: ${scene.text_beats.length}`
  );

  for (
    const beat of scene.text_beats
  ) {
    console.log(
      `  [${beat.start}s → ${(
        beat.start +
        beat.duration
      ).toFixed(2)}s] ${beat.style}: ${beat.text}`
    );
  }
}

fs.writeFileSync(
  SCENES_PATH,
  JSON.stringify(
    data,
    null,
    2
  ) + "\n",
  "utf8"
);

console.log("");
console.log(
  "================================"
);
console.log(
  "TEXT BEATS SYNC SELESAI"
);
console.log(
  "================================"
);
