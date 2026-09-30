import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT =
  path.resolve(
    process.cwd()
  );

const MEMORY_DIR =
  path.join(
    ROOT,
    "hermes/data"
  );

const MEMORY_FILE =
  path.join(
    MEMORY_DIR,
    "memory.json"
  );

fs.mkdirSync(
  MEMORY_DIR,
  {
    recursive: true,
  }
);

function loadMemory() {
  if (
    !fs.existsSync(
      MEMORY_FILE
    )
  ) {
    return {
      version: 1,
      projects: {},
      history: [],
    };
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        MEMORY_FILE,
        "utf8"
      )
    );
  } catch {
    return {
      version: 1,
      projects: {},
      history: [],
    };
  }
}

function saveMemory(
  memory
) {
  fs.writeFileSync(
    MEMORY_FILE,
    JSON.stringify(
      memory,
      null,
      2
    ) + "\n",
    "utf8"
  );
}

function run(
  command,
  args
) {
  return new Promise(
    (resolve, reject) => {
      console.log(
        `\n🤖 Hermes → ${command} ${args.join(" ")}`
      );

      const child =
        spawn(
          command,
          args,
          {
            cwd: ROOT,
            env: process.env,
            stdio: "inherit",
          }
        );

      child.on(
        "error",
        reject
      );

      child.on(
        "close",
        (code) => {
          if (
            code === 0
          ) {
            resolve();
          } else {
            reject(
              new Error(
                `${command} exited with code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

async function createProject(
  theme
) {
  const memory =
    loadMemory();

  const projectId =
    `project-${Date.now()}`;

  memory.projects[
    projectId
  ] = {
    id: projectId,
    theme,
    status: "created",
    created_at:
      new Date().toISOString(),
    updated_at:
      new Date().toISOString(),
    pipeline: {
      story: "pending",
      tts: "pending",
      images: "pending",
      render: "pending",
    },
  };

  memory.history.push({
    type: "project_created",
    project_id:
      projectId,
    theme,
    timestamp:
      new Date().toISOString(),
  });

  saveMemory(
    memory
  );

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "🧠 HERMES"
  );
  console.log(
    "================================"
  );
  console.log(
    `Project: ${projectId}`
  );
  console.log(
    `Theme: ${theme}`
  );

  try {
    /*
     * STORY
     */
    memory.projects[
      projectId
    ].pipeline.story =
      "running";

    saveMemory(
      memory
    );

    await run(
      "node",
      [
        "scripts/generate-story.mjs",
        theme,
      ]
    );

    memory.projects[
      projectId
    ].pipeline.story =
      "done";

    /*
     * TTS
     */
    memory.projects[
      projectId
    ].pipeline.tts =
      "running";

    saveMemory(
      memory
    );

    await run(
      "node",
      [
        "scripts/generate-tts.mjs",
      ]
    );

    await run(
      "node",
      [
        "scripts/sync-text-beats.mjs",
      ]
    );

    memory.projects[
      projectId
    ].pipeline.tts =
      "done";

    /*
     * IMAGE
     */
    memory.projects[
      projectId
    ].pipeline.images =
      "running";

    saveMemory(
      memory
    );

    try {
      await run(
        "node",
        [
          "scripts/generate-scenes.mjs",
        ]
      );

      memory.projects[
        projectId
      ].pipeline.images =
        "done";
    } catch (
      error
    ) {
      memory.projects[
        projectId
      ].pipeline.images =
        "failed";

      memory.projects[
        projectId
      ].image_error =
        error.message;

      console.log(
        "\n⚠️ Image provider gagal."
      );
      console.log(
        "Hermes menyimpan error ke memory."
      );
    }

    /*
     * RENDER
     */
    memory.projects[
      projectId
    ].pipeline.render =
      "running";

    saveMemory(
      memory
    );

    try {
      await run(
        "node",
        [
          "scripts/generate-video.mjs",
        ]
      );

      memory.projects[
        projectId
      ].pipeline.render =
        "done";

      memory.projects[
        projectId
      ].status =
        "completed";
    } catch (
      error
    ) {
      memory.projects[
        projectId
      ].pipeline.render =
        "failed";

      memory.projects[
        projectId
      ].render_error =
        error.message;

      memory.projects[
        projectId
      ].status =
        "failed";
    }

    memory.projects[
      projectId
    ].updated_at =
      new Date().toISOString();

    memory.history.push({
      type:
        "project_finished",
      project_id:
        projectId,
      status:
        memory.projects[
          projectId
        ].status,
      timestamp:
        new Date().toISOString(),
    });

    saveMemory(
      memory
    );

    console.log("");
    console.log(
      "================================"
    );
    console.log(
      `🧠 Hermes project status: ${memory.projects[projectId].status}`
    );
    console.log(
      "================================"
    );

    return memory.projects[
      projectId
    ];
  } catch (
    error
  ) {
    memory.projects[
      projectId
    ].status =
      "failed";

    memory.projects[
      projectId
    ].error =
      error.message;

    memory.projects[
      projectId
    ].updated_at =
      new Date().toISOString();

    saveMemory(
      memory
    );

    throw error;
  }
}

const theme =
  process.argv
    .slice(2)
    .join(" ")
    .trim();

if (!theme) {
  console.log(
    "Usage:"
  );

  console.log(
    'node hermes/index.mjs "tema video"'
  );

  process.exit(1);
}

await createProject(
  theme
);
