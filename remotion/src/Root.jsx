import {
  AbsoluteFill,
  Composition,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import sceneData from "../data/scenes.generated.json";

const MOTION_MAP = {
  pop: "pop",
  zoom_in: "zoom_in",
  slide_left: "slide_left",
  slide_right: "slide_right",
  fade: "fade",
  shake: "shake",
  bounce: "bounce",
};

function getMotion(scene) {
  return MOTION_MAP[scene.motion] || "pop";
}

/* =========================
   B-ROLL
========================= */

function Asset({ scene }) {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [0, 120],
    [1.05, 1.16],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const x = interpolate(
    frame,
    [0, 120],
    [0, -30],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const style = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `translateX(${x}px) scale(${scale})`,
  };

  if (!scene.asset) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#111",
        }}
      />
    );
  }

  const src = staticFile(`assets/${scene.asset}`);

  if (scene.assetType === "video") {
    return (
      <OffthreadVideo
        src={src}
        style={style}
        muted
      />
    );
  }

  return (
    <Img
      src={src}
      style={style}
    />
  );
}

/* =========================
   TEXT LAYOUT
========================= */

function getLayoutStyle(layout) {
  switch (layout) {
    case "top":
      return {
        top: 260,
        transform: "translateY(0)",
      };

    case "bottom":
      return {
        top: "auto",
        bottom: 300,
        transform: "translateY(0)",
      };

    case "center":
    default:
      return {
        top: "50%",
        transform: "translateY(-50%)",
      };
  }
}

/* =========================
   HIGHLIGHT TEXT
========================= */

function HighlightedText({ scene }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = scene.text || "";
  const emphasis = scene.emphasis || "";

  if (!emphasis) {
    return (
      <div
        style={{
          fontSize: 82,
          fontWeight: 900,
          lineHeight: 1,
          color: "white",
          textShadow:
            "0 6px 22px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </div>
    );
  }

  const textUpper = text.toUpperCase();
  const emphasisUpper = emphasis.toUpperCase();

  const startIndex = textUpper.indexOf(
    emphasisUpper
  );

  if (startIndex === -1) {
    return (
      <div
        style={{
          fontSize: 82,
          fontWeight: 900,
          lineHeight: 1,
          color: "white",
          textShadow:
            "0 6px 22px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </div>
    );
  }

  const before = text.slice(
    0,
    startIndex
  );

  const highlighted = text.slice(
    startIndex,
    startIndex + emphasis.length
  );

  const after = text.slice(
    startIndex + emphasis.length
  );

  const emphasisSpring = spring({
    frame,
    fps,
    config: {
      damping: 10,
      stiffness: 180,
      mass: 0.55,
    },
  });

  const scale = interpolate(
    emphasisSpring,
    [0, 1],
    [0.55, 1]
  );

  const y = interpolate(
    emphasisSpring,
    [0, 1],
    [45, 0]
  );

  return (
    <div
      style={{
        fontSize: 74,
        fontWeight: 900,
        lineHeight: 1.02,
        color: "white",
        textShadow:
          "0 6px 22px rgba(0,0,0,0.9)",
      }}
    >
      {before}

      <span
        style={{
          display: "inline-block",
          fontSize: 108,
          fontWeight: 1000,
          color: "#FFD84D",
          transform:
            `translateY(${y}px) scale(${scale})`,
          textShadow:
            "0 6px 22px rgba(0,0,0,0.95)",
        }}
      >
        {highlighted}
      </span>

      {after}
    </div>
  );
}

/* =========================
   MOTION TEXT
========================= */

function MotionText({ scene, index }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = Math.max(
    1,
    Math.round(scene.duration * fps)
  );

  const motion = getMotion(scene);

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 150,
      mass: 0.7,
    },
  });

  const fadeOut = interpolate(
    frame,
    [
      Math.max(
        0,
        durationFrames - 12
      ),
      durationFrames,
    ],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let rotation = 0;

  if (motion === "pop") {
    scale = interpolate(
      entrance,
      [0, 1],
      [0.72, 1]
    );
  }

  if (motion === "zoom_in") {
    scale = interpolate(
      entrance,
      [0, 1],
      [0.5, 1]
    );
  }

  if (motion === "slide_left") {
    translateX = interpolate(
      entrance,
      [0, 1],
      [550, 0]
    );
  }

  if (motion === "slide_right") {
    translateX = interpolate(
      entrance,
      [0, 1],
      [-550, 0]
    );
  }

  if (motion === "bounce") {
    translateY = interpolate(
      entrance,
      [0, 1],
      [180, 0]
    );
  }

  if (motion === "shake") {
    translateX =
      Math.sin(frame * 1.8) *
      9;

    rotation =
      Math.sin(frame * 1.5) *
      1.5;
  }

  const layout = getLayoutStyle(
    scene.layout
  );

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          ...layout,
          textAlign: "center",
          transform:
            `${layout.transform} ` +
            `translateX(${translateX}px) ` +
            `translateY(${translateY}px) ` +
            `scale(${scale}) ` +
            `rotate(${rotation}deg)`,
        }}
      >
        <HighlightedText scene={scene} />

        {index === 0 && (
          <div
            style={{
              marginTop: 28,
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: 5,
              color: "white",
              opacity: 0.85,
            }}
          >
            FAKTA UNIK
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* =========================
   SCENE
========================= */

function Scene({ scene, index }) {
  return (
    <AbsoluteFill>
      <Asset scene={scene} />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(" +
            "to bottom," +
            "rgba(0,0,0,0.08)," +
            "rgba(0,0,0,0.18) 42%," +
            "rgba(0,0,0,0.70)" +
            ")",
        }}
      />

      <MotionText
        scene={scene}
        index={index}
      />
    </AbsoluteFill>
  );
}

/* =========================
   COMPOSITION
========================= */

function MotionDemo() {
  const scenes = sceneData.scenes || [];

  let cursor = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111",
        overflow: "hidden",
      }}
    >
      {scenes.map((scene, index) => {
        const from = cursor;

        const durationInFrames =
          Math.max(
            1,
            Math.round(
              scene.duration * 30
            )
          );

        cursor += durationInFrames;

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={
              durationInFrames
            }
          >
            <Scene
              scene={scene}
              index={index}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

/* =========================
   ROOT
========================= */

const totalDuration =
  (sceneData.scenes || []).reduce(
    (total, scene) =>
      total +
      Math.max(
        1,
        Math.round(
          scene.duration * 30
        )
      ),
    0
  );

export const RemotionRoot = () => {
  return (
    <Composition
      id="MotionDemo"
      component={MotionDemo}
      durationInFrames={totalDuration}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
