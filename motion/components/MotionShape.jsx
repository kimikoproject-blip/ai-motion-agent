import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionShape({
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
      damping: 14,
      stiffness: 180,
      mass: 0.7,
    },
  });

  // =========================================================
  // ANIMATION
  // =========================================================

  const animation =
    element.animation || "pop";

  let opacity = 1;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;

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
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.7, 1],
      [0.6, 1.08, 1]
    );
  }

  if (animation === "impact") {
    opacity = interpolate(
      progress,
      [0, 0.45, 0.75, 1],
      [0, 1, 1, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.45, 0.75, 1],
      [0.25, 1.15, 0.94, 1]
    );

    rotate = interpolate(
      progress,
      [0, 1],
      [-6, 0]
    );
  }

  if (animation === "slide") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    translateX = interpolate(
      progress,
      [0, 1],
      [-200, 0]
    );
  }

  if (animation === "bounce") {
    opacity = interpolate(
      progress,
      [0, 0.45, 0.7, 1],
      [0, 1, 1, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.45, 0.7, 1],
      [0.3, 1.2, 0.92, 1]
    );
  }

  if (animation === "float") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 1],
      [0.9, 1]
    );

    translateY =
      Math.sin(frame * 0.08) * 8;
  }

  // =========================================================
  // POSITION
  // =========================================================

  const x =
    Number(element.x ?? 50);

  const y =
    Number(element.y ?? 50);

  // =========================================================
  // SHAPE TYPE
  // =========================================================

  const shape =
    element.shape || "circle";

  const width =
    Number(element.width ?? element.size ?? 100);

  const height =
    Number(element.height ?? element.size ?? 100);

  const radius =
    Number(element.radius ?? 999);

  const borderWidth =
    Number(element.borderWidth ?? 0);

  const color =
    element.color || "white";

  const opacityValue =
    Number(element.opacity ?? 1);

  const borderColor =
    element.borderColor || color;

  const transform =
    `translate(-50%, -50%) ` +
    `translateX(${translateX}px) ` +
    `translateY(${translateY}px) ` +
    `scale(${scale}) ` +
    `rotate(${rotate}deg)`;

  // =========================================================
  // SHAPE STYLE
  // =========================================================

  const baseStyle = {
    position: "absolute",

    left: `${x}%`,
    top: `${y}%`,

    width: `${width}px`,
    height: `${height}px`,

    opacity:
      opacity * opacityValue,

    transform,

    background:
      shape === "ring" ||
      shape === "line" ||
      shape === "highlight"
        ? "transparent"
        : color,

    border:
      borderWidth > 0
        ? `${borderWidth}px solid ${borderColor}`
        : "none",

    borderRadius:
      shape === "circle" ||
      shape === "dot" ||
      shape === "ring"
        ? "50%"
        : shape === "pill"
          ? "999px"
          : `${radius}px`,

    boxSizing:
      "border-box",

    pointerEvents:
      "none",
  };

  // =========================================================
  // SPECIAL SHAPES
  // =========================================================

  if (shape === "line") {
    return (
      <div
        style={{
          ...baseStyle,

          height:
            Number(
              element.thickness ?? 8
            ),

          background:
            color,

          borderRadius:
            999,

          transform:
            `translate(-50%, -50%) ` +
            `translateX(${translateX}px) ` +
            `translateY(${translateY}px) ` +
            `rotate(${Number(element.rotation ?? 0) + rotate}deg) ` +
            `scaleX(${scale})`,
        }}
      />
    );
  }

  if (shape === "highlight") {
    return (
      <div
        style={{
          ...baseStyle,

          background:
            color,

          borderRadius:
            Number(element.radius ?? 20),

          transform:
            `translate(-50%, -50%) ` +
            `translateX(${translateX}px) ` +
            `translateY(${translateY}px) ` +
            `scale(${scale})`,
        }}
      />
    );
  }

  return (
    <div
      style={baseStyle}
    />
  );
}
