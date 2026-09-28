import fs from "fs";
import path from "path";

const theme = process.argv.slice(2).join(" ").trim();

if (!theme) {
  console.error('Contoh: node scripts/generate-scenes.mjs "fakta unik hewan cheetah"');
  process.exit(1);
}

const outputPath = path.resolve("remotion/data/scenes.json");

function buildScenes(theme) {
  const lower = theme.toLowerCase();

  if (lower.includes("cheetah")) {
    return {
      title: "Fakta Unik Cheetah",
      scenes: [
        {
          duration: 4,
          text: "CHEETAH SECEPAT APA?",
          narration:
            "Cheetah dikenal sebagai hewan darat yang sangat cepat. Tapi ternyata, ada alasan kenapa kecepatan ini cuma bisa dipakai sebentar.",
          emphasis: "SECEPAT APA?",
          motion: "pop",
          layout: "center",
          visualQuery: "wild cheetah sprinting African savanna",
          assetType: "video"
        },
        {
          duration: 8,
          text: "BISA NGEGAS HINGGA 100 KM/JAM",
          narration:
            "Dalam sprint pendek, cheetah bisa mencapai kecepatan sekitar seratus kilometer per jam.",
          emphasis: "100 KM/JAM",
          motion: "zoom_in",
          layout: "bottom",
          visualQuery: "cheetah running full speed African savanna",
          assetType: "video"
        },
        {
          duration: 8,
          text: "TUBUHNYA DIRANCANG UNTUK SPRINT",
          narration:
            "Tubuh cheetah punya sejumlah adaptasi untuk berlari cepat, termasuk tulang belakang yang sangat fleksibel dan ekor yang membantu menjaga keseimbangan.",
          emphasis: "SPRINT",
          motion: "slide_left",
          layout: "top",
          visualQuery: "cheetah running side view flexible spine tail",
          assetType: "video"
        },
        {
          duration: 8,
          text: "TAPI NGGAK BISA LARI LAMA",
          narration:
            "Masalahnya, kecepatan ekstrem itu membutuhkan energi besar. Karena itu cheetah hanya melakukan sprint dalam waktu yang relatif singkat.",
          emphasis: "NGGAK BISA LARI LAMA",
          motion: "bounce",
          layout: "center",
          visualQuery: "cheetah stopping after sprint resting savanna",
          assetType: "video"
        },
        {
          duration: 7,
          text: "JADI SENJATANYA BUKAN MARATON",
          narration:
            "Jadi cheetah bukan pelari jarak jauh. Senjata utamanya adalah ledakan kecepatan untuk mengejar mangsa sebelum tenaganya habis.",
          emphasis: "LEDAKAN KECEPATAN",
          motion: "shake",
          layout: "bottom",
          visualQuery: "cheetah chasing prey African grassland",
          assetType: "video"
        }
      ]
    };
  }

  return {
    title: theme,
    scenes: [
      {
        duration: 5,
        text: theme.toUpperCase(),
        narration: `Tahukah kamu? ${theme} punya fakta menarik yang mungkin belum banyak diketahui.`,
        emphasis: "FAKTA MENARIK",
        motion: "pop",
        layout: "center",
        visualQuery: theme,
        assetType: "video"
      }
    ]
  };
}

const data = buildScenes(theme);

fs.writeFileSync(
  outputPath,
  JSON.stringify(data, null, 2)
);

console.log("");
console.log("SCENE GENERATOR SELESAI");
console.log("");
console.log(`Theme : ${theme}`);
console.log(`Title : ${data.title}`);
console.log(`Scenes: ${data.scenes.length}`);
console.log(`Output: ${outputPath}`);
console.log("");

for (const [i, scene] of data.scenes.entries()) {
  console.log(
    `${i + 1}. ${scene.text} → ${scene.visualQuery}`
  );
}
