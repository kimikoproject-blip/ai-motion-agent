const ROUTER_URL =
  process.env.ROUTER_URL || "http://127.0.0.1:20128/v1";

const ROUTER_KEY = process.env.ROUTER_KEY;

const MODELS = [
  "gemini/gemini-3.8-flash",
  "gemini/gemini-3.7-flash",
  "gemini/gemini-3.6-flash",
  "gemini/gemini-3.5-flash-lite",
];

export async function askAI(prompt) {
  if (!ROUTER_KEY) {
    throw new Error(
      "ROUTER_KEY belum diset. Jalankan: export ROUTER_KEY='API_KEY_9ROUTER'"
    );
  }

  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`AI → ${model}`);

      const response = await fetch(`${ROUTER_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          stream: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || `HTTP ${response.status}`
        );
      }

      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text;

      if (!content) {
        throw new Error("AI tidak mengembalikan content.");
      }

      return content;
    } catch (error) {
      lastError = error;
      console.log(`⚠️ ${model} gagal: ${error.message}`);
    }
  }

  throw new Error(
    `Semua model Gemini gagal. Terakhir: ${lastError?.message}`
  );
}

export function extractJSON(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI tidak mengembalikan JSON yang valid.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}
