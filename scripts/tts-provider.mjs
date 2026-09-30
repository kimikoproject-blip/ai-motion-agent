import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const VOICE =
  process.env.TTS_VOICE ||
  "id-ID-GadisNeural";

export async function generateSpeech({
  text,
  outputPath,
}) {
  if (!text?.trim()) {
    throw new Error("Teks TTS kosong.");
  }

  console.log(
    `🔊 TTS → ${VOICE}`
  );

  await execFileAsync(
    "edge-tts",
    [
      "--voice",
      VOICE,
      "--text",
      text.trim(),
      "--write-media",
      outputPath,
    ],
    {
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  return outputPath;
}
