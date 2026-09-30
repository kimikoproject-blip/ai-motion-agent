/*
 * Visual Scene Types
 *
 * AI Planner menentukan TYPE.
 * Template di file ini menentukan CARA VISUALNYA.
 *
 * Image model tidak boleh bebas mengubah struktur visual.
 */

const GLOBAL_RULES = `
STYLE:

Cute modern animated educational illustration.

Clean polished cartoon style.
Soft rounded shapes.
Clear readable composition.
Friendly visual language.
Strong visual hierarchy.
Simple but visually interesting.

The image must explain the idea by itself.

Create ONE unified illustration.

Everything belongs to the same scene.

NO collage.
NO split screen.
NO multiple panels.

NO text.
NO letters.
NO numbers.
NO labels.
NO captions.
NO subtitles.
NO logos.
NO watermark.
NO speech bubbles.

ABSOLUTELY NO GENERATED WRITING:

The image must contain ZERO text-like elements.

Do not generate:
- random letters
- fake words
- pseudo-text
- title text
- headings
- diagram labels
- interface text
- decorative typography
- watermark-like writing

If the image model wants to place writing,
replace it with a simple shape, object, glow,
or visual effect instead.

NO unnecessary anatomical detail.
NO complicated scientific diagram.
NO horror.
NO gore.
NO scary eyes.

Use clear shapes and visual relationships.

The most important information must be immediately visible.
`;

const TEMPLATES = {

  CHARACTER_FACT: (scene) => `
TYPE:
CHARACTER FACT

Create one complete illustration centered around the main character.

MAIN SUBJECT:
${scene.subject}

ENVIRONMENT:
${scene.environment}

MAIN FACT:
${scene.focus}

VISUAL STRUCTURE:

The character must be large and easy to recognize.

The important fact must be represented visually
inside or around the character.

If the fact involves a quantity,
show the exact quantity as physical visual objects.

If the fact involves an unusual body feature,
make that feature clearly visible.

Do not use labels to explain the fact.

The viewer should understand the main fact
from the illustration itself.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`,

  SIMPLE_ANATOMY: (scene) => `
TYPE:
SIMPLE ANATOMY

Create one complete simplified educational illustration
showing the character and ONE specific body function.

MAIN SUBJECT:
${scene.subject}

ENVIRONMENT:
${scene.environment}

BODY FEATURE:
${scene.focus}

VISUAL RELATIONSHIP:
${scene.visual_relationship}

VISUAL STRUCTURE:

Show the character's body clearly.

Show only the body parts needed
to understand the explanation.

Use simplified cartoon shapes.

Make the important organs large enough to see.

Show the relationship between the organs
using simple visual positioning or simple flowing shapes.

Do NOT create realistic anatomy.

Do NOT create detailed blood vessels.

Do NOT create complicated internal anatomy.

The viewer should immediately understand
which body part is doing what.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`,

  PROCESS: (scene) => `
TYPE:
PROCESS

Create one complete educational illustration
showing a simple process.

MAIN SUBJECT:
${scene.subject}

ENVIRONMENT:
${scene.environment}

PROCESS:
${scene.focus}

RELATIONSHIP:
${scene.visual_relationship}

VISUAL STRUCTURE:

Show the starting point,
the important middle step,
and the result
as one connected visual composition.

Use simple arrows,
flow shapes,
glowing paths,
or directional movement
ONLY when they are visually necessary.

Keep the process extremely simple.

Maximum three major visual steps.

Do not create a technical diagram.

Do not create a flowchart.

Do not create labels.

The viewer should understand
where something starts,
what happens,
and where it goes.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`,

  COMPARISON: (scene) => `
TYPE:
COMPARISON

Create one unified illustration
that clearly compares two things.

SUBJECT:
${scene.subject}

ENVIRONMENT:
${scene.environment}

COMPARISON:
${scene.focus}

RELATIONSHIP:
${scene.visual_relationship}

VISUAL STRUCTURE:

Show both subjects clearly
within the same environment.

Make the difference visually obvious
through size, shape, position,
quantity, distance, or behavior.

Use simple visual contrast.

Do NOT create a split-screen infographic.

Do NOT use written labels.

The viewer should immediately understand
what is different between the two subjects.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`,

  MAP_LOCATION: (scene) => `
TYPE:
MAP / LOCATION

Create one complete educational map-style illustration.

MAIN SUBJECT:
${scene.subject}

LOCATION:
${scene.focus}

ENVIRONMENT:
${scene.environment}

VISUAL RELATIONSHIP:
${scene.visual_relationship}

VISUAL STRUCTURE:

Show the relevant geographic area clearly.

Use recognizable land shapes,
ocean,
islands,
borders,
routes,
or location markers
when relevant.

Make the important location visually dominant.

Use simplified geography.

Do not create a realistic satellite image.

Do not create complicated map labels.

Do not generate written place names.

The viewer should understand
where the subject is located.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`,

  OBJECT_EXPLANATION: (scene) => `
TYPE:
OBJECT EXPLANATION

Create one complete illustration
explaining how the main object works.

MAIN OBJECT:
${scene.subject}

ENVIRONMENT:
${scene.environment}

MAIN FUNCTION:
${scene.focus}

VISUAL RELATIONSHIP:
${scene.visual_relationship}

VISUAL STRUCTURE:

Show the object large and clearly.

Show only the internal parts
needed to understand its function.

Use simplified cutaway geometry
when necessary.

Make the important mechanism
visually obvious.

Use simple motion cues,
flow shapes,
or highlighted components
when useful.

Do NOT create technical blueprints.

Do NOT create engineering diagrams.

Do NOT add labels or text.

The viewer should understand
what the object does
from the illustration itself.

ACTION:
${scene.action}

EMPHASIS:
${scene.emphasis}
`
};

export function getVisualTypes() {
  return Object.keys(TEMPLATES);
}

export function buildVisualPrompt(scene) {
  const type = scene.visual_type;

  if (!type) {
    throw new Error(
      `Scene ${scene.scene_id} tidak memiliki visual_type.`
    );
  }

  const template =
    TEMPLATES[type];

  if (!template) {
    throw new Error(
      `Visual type "${type}" tidak dikenal.`
    );
  }

  return `
Create ONE vertical 9:16 image.

${template(scene)}

${GLOBAL_RULES}

IMPORTANT:

The image is a visual explanation,
not a background.

Prioritize clarity over realism.

Prioritize recognizable shapes
over complex details.

The viewer should understand
the main idea within one second.

Do not generate explanatory text.

Do not generate typography.

Do not generate labels.

Do not generate numbers.

FINAL VISUAL GOAL:

${scene.focus}
`;
}

export { TEMPLATES };
