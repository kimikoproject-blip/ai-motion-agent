import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionProgress({
  element = {},
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // =========================================================
  // TIMING
  // =========================================================

  const startSeconds =
    Number(element.start ?? 0);

  const startFrame =
    Math.round(startSeconds * fps);

  const localFrame =
    Math.max(0, frame - startFrame);

  const progress = spring({
    frame: localFrame,
    fps,

    config: {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    },
  });

  // =========================================================
  // VALUES
  // =========================================================

  const value =
    Math.max(
      0,
      Math.min(
        100,
        Number(element.value ?? 70)
      )
    );

  const animatedValue =
    interpolate(
      progress,
      [0, 1],
      [0, value]
    );

  // =========================================================
  // POSITION
  // =========================================================

  const x =
    Number(element.x ?? 50);

  const y =
    Number(element.y ?? 50);

  // =========================================================
  // SIZE
  // =========================================================

  const width =
    Number(element.width ?? 700);

  const height =
    Number(element.height ?? 34);

  const radius =
    Number(element.radius ?? 999);

  // =========================================================
  // COLORS
  // =========================================================

  const color =
    element.color || "#6C63FF";

  const backgroundColor =
    element.backgroundColor ||
    "rgba(255,255,255,0.12)";

  const showValue =
    element.showValue !== false;

  const label =
    element.label || "";

  // =========================================================
  // ANIMATION
  // =========================================================

  let opacity = 1;
  let scale = 1;

  const animation =
    element.animation || "slide";

  if (animation === "fade") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );
  }

  if (animation === "pop") {
    opacity = interpolate(
      progress,
      [0, 0.7, 1],
      [0.8, 1.06, 1]
    );

    scale = interpolate(
      progress,
      [0, 1],
      [0.92, 1]
    );
  }

  return (
    <div
      style={{
        position: "absolute",

        left: `${x}%`,
        top: `${y}%`,

        width: `${width}px`,

        opacity,

        transform:
          `translate(-50%, -50%) ` +
          `scale(${scale})`,

        fontFamily:
          "Arial, Helvetica, sans-serif",

        pointerEvents:
          "none",
      }}
    >
      {/* LABEL */}
      {label && (
        <div
          style={{
            marginBottom:
              "14px",

            fontSize:
              "34px",

            fontWeight:
              800,

            color:
              "white",

            textAlign:
              "left",
          }}
        >
          {label}
        </div>
      )}

      {/* BAR */}
      <div
        style={{
          position:
            "relative",

          width:
            "100%",

          height:
            `${height}px`,

          background:
            backgroundColor,

          borderRadius:
            `${radius}px`,

          overflow:
            "hidden",

          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {/* FILL */}
        <div
          style={{
            position:
              "absolute",

            left: 0,
            top: 0,
            bottom: 0,

            width:
              `${animatedValue}%`,

            background:
              color,

            borderRadius:
              `${radius}px`,

            boxShadow:
              `0 0 24px ${color}`,
          }}
        />
      </div>

      {/* VALUE */}
      {showValue && (
        <div
          style={{
            marginTop:
              "12px",

            fontSize:
              "42px",

            fontWeight:
              900,

            color,

            textAlign:
              "right",

            lineHeight:
              1,
          }}
        >
          {Math.round(animatedValue)}%
        </div>
      )}
    </div>
  );
}
