import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";

const FPS = 30;

function SceneImage({ src }) {
  const frame = useCurrentFrame();

  const enter = spring({
    frame,
    fps: FPS,
    config: {
      damping: 18,
      stiffness: 80,
      mass: 1,
    },
  });

  const scale = interpolate(
    frame,
    [0, 150],
    [1.02, 1.10],
    { extrapolateRight: "clamp" }
  );

  const x = interpolate(
    frame,
    [0, 150],
    [0, -25],
    { extrapolateRight: "clamp" }
  );

  const y = interpolate(
    frame,
    [0, 150],
    [20, -20],
    { extrapolateRight: "clamp" }
  );

  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform:
          `translate(${x}px, ${y}px) scale(${scale * enter})`,
        transformOrigin: "center center",
      }}
    />
  );
}

function TextReveal({ children, style = {}, delay = 0 }) {
  const frame = useCurrentFrame();

  const local = frame - delay;

  const progress = spring({
    frame: Math.max(0, local),
    fps: FPS,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.7,
    },
  });

  const y = interpolate(
    progress,
    [0, 1],
    [45, 0]
  );

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Highlight({ x, y, width, height, delay = 0 }) {
  const frame = useCurrentFrame();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    config: {
      damping: 18,
      stiffness: 120,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: "50%",
        border: "5px solid rgba(91,231,255,0.9)",
        boxShadow:
          "0 0 25px rgba(91,231,255,0.65)",
        transform: `scale(${progress})`,
        opacity: progress,
        pointerEvents: "none",
      }}
    />
  );
}

export default function FullSceneRenderer({
  image,
}) {
  return (
    <AbsoluteFill
      style={{
        background: "#050B12",
        overflow: "hidden",
      }}
    >
      <SceneImage src={image} />

      {/* cinematic readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 35%, rgba(0,0,0,0.7))",
        }}
      />

      {/* MAIN EXPLANATION */}
      <TextReveal
        delay={8}
        style={{
          position: "absolute",
          left: 65,
          right: 65,
          top: 100,
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.05,
          textShadow:
            "0 5px 25px rgba(0,0,0,0.7)",
        }}
      >
        GURITA PUNYA
        <div
          style={{
            color: "#5BE7FF",
            fontSize: 96,
          }}
        >
          3 JANTUNG
        </div>
      </TextReveal>

      {/* CALLOUT 1 */}
      <TextReveal
        delay={48}
        style={{
          position: "absolute",
          left: 70,
          bottom: 360,
          padding: "22px 28px",
          borderRadius: 24,
          background: "rgba(3,12,20,0.88)",
          border:
            "2px solid rgba(91,231,255,0.45)",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: 32,
          fontWeight: 700,
          maxWidth: 700,
        }}
      >
        <span style={{ color: "#5BE7FF" }}>
          2
        </span>{" "}
        membantu memompa darah ke insang
      </TextReveal>

      {/* CALLOUT 2 */}
      <TextReveal
        delay={78}
        style={{
          position: "absolute",
          left: 70,
          bottom: 220,
          padding: "22px 28px",
          borderRadius: 24,
          background: "rgba(3,12,20,0.88)",
          border:
            "2px solid rgba(255,100,130,0.45)",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: 32,
          fontWeight: 700,
          maxWidth: 700,
        }}
      >
        <span style={{ color: "#FF7894" }}>
          1
        </span>{" "}
        mengalirkan darah ke seluruh tubuh
      </TextReveal>

      {/* VISUAL FOCUS */}
      <Highlight
        x={350}
        y={700}
        width={380}
        height={300}
        delay={105}
      />
    </AbsoluteFill>
  );
}
