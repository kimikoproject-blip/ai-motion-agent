import { execFileSync } from "node:child_process";

const scene = {
  scene_id: 1,

  narration:
    "Pernah kepikiran kenapa gurita punya tiga jantung?",

  subject:
    "Gurita kartun ungu yang lucu dengan tubuh semi-transparan",

  environment:
    "Bawah laut biru cerah dengan latar sederhana dan terumbu karang lembut",

  focus:
    "Tiga jantung merah yang terlihat jelas di dalam tubuh gurita",

  visual_relationship:
    "Tiga jantung berada terpisah di dalam tubuh gurita dan semuanya mudah terlihat",

  action:
    "Gurita melayang santai menghadap penonton dengan ekspresi penasaran",

  emphasis:
    "Tiga jantung harus menjadi elemen visual paling mudah dikenali",

  visual:
    `
A cute friendly purple octopus floating underwater,
facing the viewer with a curious expression.

The octopus has a simple semi-transparent body.

Inside the body are EXACTLY THREE large red cartoon heart-shaped organs.

The three hearts are clearly separated from each other
and positioned so all three can be counted immediately.

The three hearts are the main visual focus.

The anatomy is extremely simple and educational.

No blood vessels.
No gills.
No extra organs.
No complicated anatomy.

The viewer should immediately understand:

ONE OCTOPUS.
THREE HEARTS.

Cute modern animation style.
Soft rounded shapes.
Friendly character.
Clean polished educational illustration.
Simple blue underwater background.
`
};

const json = JSON.stringify(scene);

execFileSync(
  "node",
  [
    "scripts/scene-image-generator.mjs",
    json
  ],
  {
    stdio: "inherit"
  }
);
