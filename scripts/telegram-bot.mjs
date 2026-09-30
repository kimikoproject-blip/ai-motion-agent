import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

import { Bot, InputFile } from "grammy";

const TOKEN =
  process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN belum ada di .env"
  );
}

const bot =
  new Bot(TOKEN);

const OUTPUT =
  path.resolve(
    "out/final.mp4"
  );

const running =
  new Map();

function runPipeline(
  theme,
  chatId
) {
  return new Promise(
    (resolve, reject) => {
      const child =
        spawn(
          "node",
          [
            "scripts/theme-pipeline.mjs",
            theme,
          ],
          {
            cwd:
              process.cwd(),
            env:
              process.env,
            stdio:
              [
                "ignore",
                "pipe",
                "pipe",
              ],
          }
        );

      child.stdout.on(
        "data",
        (data) => {
          console.log(
            `[PIPELINE ${chatId}] ${data.toString()}`
          );
        }
      );

      child.stderr.on(
        "data",
        (data) => {
          console.error(
            `[PIPELINE ${chatId}] ${data.toString()}`
          );
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
                `Pipeline exit code ${code}`
              )
            );
          }
        }
      );
    }
  );
}

bot.command(
  "start",
  async (ctx) => {
    await ctx.reply(
      [
        "🤖 AI Motion Shorts siap.",
        "",
        "Kirim:",
        "/create <tema>",
        "",
        "Contoh:",
        "/create kenapa gurita punya tiga jantung",
      ].join("\n")
    );
  }
);

bot.command(
  "create",
  async (ctx) => {
    const chatId =
      ctx.chat.id;

    const theme =
      ctx.match
        ?.trim();

    if (!theme) {
      await ctx.reply(
        "Masukkan tema setelah /create."
      );

      return;
    }

    if (
      running.has(chatId)
    ) {
      await ctx.reply(
        "⏳ Masih ada video yang sedang dibuat. Tunggu yang ini selesai dulu."
      );

      return;
    }

    running.set(
      chatId,
      true
    );

    try {
      await ctx.reply(
        [
          "🎬 Oke.",
          "",
          `Tema: ${theme}`,
          "",
          "🧠 Menyiapkan script...",
        ].join("\n")
      );

      const status =
        await ctx.reply(
          "⏳ Pipeline dimulai..."
        );

      await runPipeline(
        theme,
        chatId
      );

      if (
        !fs.existsSync(
          OUTPUT
        )
      ) {
        throw new Error(
          "Pipeline selesai tetapi final.mp4 tidak ditemukan."
        );
      }

      await ctx.api.editMessageText(
        chatId,
        status.message_id,
        "🎬 Video selesai. Mengirim MP4..."
      );

      await ctx.replyWithVideo(
        new InputFile(
          OUTPUT
        ),
        {
          caption:
            `✅ Selesai\n\n${theme}`,
        }
      );
    } catch (error) {
      console.error(
        error
      );

      await ctx.reply(
        [
          "❌ Gagal membuat video.",
          "",
          error.message,
        ].join("\n")
      );
    } finally {
      running.delete(
        chatId
      );
    }
  }
);

bot.catch(
  (error) => {
    console.error(
      "Telegram error:",
      error
    );
  }
);

console.log("");
console.log(
  "================================"
);
console.log(
  "🤖 TELEGRAM BOT"
);
console.log(
  "================================"
);
console.log(
  "Bot sedang online..."
);
console.log("");

await bot.start();
