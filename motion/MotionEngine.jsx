import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getProgress(frame, fps, delay = 0, duration = 18) {
  const localFrame = frame - delay;

  if (localFrame <= 0) return 0;

  return clamp(localFrame / duration, 0, 1);
}

function AnimatedText({
  text,
  size = 90,
  weight = 800,
  color = "white",
  align = "center",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.7,
    },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.75, 1]);
  const translateY = interpolate(progress, [0, 1], [45, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        fontSize: size,
        fontWeight: weight,
        color,
        textAlign: align,
        lineHeight: 1.05,
        fontFamily:
          "Arial, Helvetica, sans-serif",
        letterSpacing: -2,
      }}
    >
      {text}
    </div>
  );
}

function PulseCircle({
  size = 160,
  color = "rgba(255,255,255,0.95)",
  delay = 0,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = getProgress(frame, fps, delay, 16);

  const scale = interpolate(
    progress,
    [0, 0.7, 1],
    [0, 1.15, 1]
  );

  const opacity = interpolate(
    progress,
    [0, 0.15, 1],
    [0, 1, 1]
  );

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
      }}
    />
  );
}

function Heart({
  size = 130,
  delay = 0,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = getProgress(frame, fps, delay, 16);

  const enterScale = interpolate(
    progress,
    [0, 0.65, 1],
    [0, 1.25, 1]
  );

  const beat = Math.sin(frame * 0.45) * 0.035;

  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1,
        transform: `scale(${enterScale + beat})`,
        filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.2))",
      }}
    >
      ❤️
    </div>
  );
}

function BigNumber({
  value,
  delay = 0,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {
      damping: 10,
      stiffness: 160,
      mass: 0.8,
    },
  });

  const scale = interpolate(
    progress,
    [0, 1],
    [0.3, 1]
  );

  const rotate = interpolate(
    progress,
    [0, 1],
    [-8, 0]
  );

  return (
    <div
      style={{
        fontSize: 300,
        fontWeight: 900,
        color: "white",
        lineHeight: 0.9,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        textShadow:
          "0 20px 50px rgba(0,0,0,0.3)",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {value}
    </div>
  );
}

export default function MotionEngine({
  scene = {},
}) {
  const frame = useCurrentFrame();

  const background =
    scene.background || "#101522";

  const title =
    scene.title || "Fakta Menarik";

  const emphasis =
    scene.emphasis || "";

  const narration =
    scene.narration || "";

  return (
    <AbsoluteFill
      style={{
        background,
        overflow: "hidden",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.05)",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
        }}
      />

      {/* Main title */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 70,
          right: 70,
        }}
      >
        <AnimatedText
          text={title}
          size={82}
          align="center"
        />
      </div>

      {/* Main visual */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 45,
        }}
      >
        {/* Placeholder subject */}
        <div
          style={{
            fontSize: 260,
            lineHeight: 1,
            transform: `translateY(${Math.sin(frame * 0.08) * 8}px)`,
            filter:
              "drop-shadow(0 25px 30px rgba(0,0,0,0.25))",
          }}
        >
          🐙
        </div>

        {/* Three hearts */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 35,
          }}
        >
          <Heart
            size={110}
            delay={28}
          />

          <Heart
            size={110}
            delay={40}
          />

          <Heart
            size={110}
            delay={52}
          />
        </div>

        {/* Big number */}
        <BigNumber
          value="3"
          delay={70}
        />
      </div>

      {/* Emphasis */}
      <div
        style={{
          position: "absolute",
          bottom: 500,
          left: 70,
          right: 70,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "22px 40px",
            borderRadius: 999,
            background:
              "rgba(255,255,255,0.12)",
            border:
              "2px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(20px)",
          }}
        >
          <AnimatedText
            text={
              emphasis ||
              "Tiga Jantung"
            }
            size={58}
            weight={900}
          />
        </div>
      </div>

      {/* Narration caption preview */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 38,
          lineHeight: 1.25,
          color: "rgba(255,255,255,0.72)",
          fontWeight: 500,
        }}
      >
        {narration}
      </div>
    </AbsoluteFill>
  );
}
