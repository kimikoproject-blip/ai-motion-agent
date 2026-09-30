import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionNumber({
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
      damping: 10,
      stiffness: 160,
      mass: 0.8,
    },
  });

  // =========================================================
  // ANIMATION
  // =========================================================

  const animation =
    element.animation || "impact";

  let opacity = 1;
  let scale = 1;
  let rotate = 0;
  let translateX = 0;
  let translateY = 0;

  if (animation === "impact") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.45, 0.75, 1],
      [0.15, 1.25, 0.92, 1]
    );

    rotate = interpolate(
      progress,
      [0, 1],
      [-8, 0]
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
      [0.2, 1.18, 1]
    );
  }

  if (animation === "bounce") {
    opacity = interpolate(
      progress,
      [0, 0.5, 0.75, 1],
      [0, 1, 1, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.4, 0.65, 1],
      [0.2, 1.3, 0.9, 1]
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
      [-250, 0]
    );

    scale = interpolate(
      progress,
      [0, 1],
      [0.8, 1]
    );
  }

  if (animation === "fade") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
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
      [0.85, 1]
    );

    translateY +=
      Math.sin(frame * 0.08) * 10;
  }

  // =========================================================
  // POSITION
  // =========================================================

  const hasCustomPosition =
    element.x !== undefined ||
    element.y !== undefined;

  let left = "50%";
  let top = "50%";

  if (hasCustomPosition) {
    const x = Number(element.x ?? 50);
    const y = Number(element.y ?? 50);

    left = `${x}%`;
    top = `${y}%`;
  } else {
    const position =
      element.position || "center";

    if (position === "top") {
      top = "25%";
    }

    if (position === "center") {
      top = "50%";
    }

    if (position === "bottom") {
      top = "70%";
    }
  }

  // =========================================================
  // STYLE
  // =========================================================

  const size =
    Number(element.size) || 320;

  const weight =
    Number(element.weight) || 900;

  const color =
    element.color || "white";

  const transform =
    `translate(-50%, -50%) ` +
    `translateX(${translateX}px) ` +
    `translateY(${translateY}px) ` +
    `scale(${scale}) ` +
    `rotate(${rotate}deg)`;

  return (
    <div
      style={{
        position: "absolute",

        left,
        top,

        opacity,

        transform,

        fontFamily:
          "Arial, Helvetica, sans-serif",

        fontSize: size,

        fontWeight: weight,

        color,

        lineHeight: 0.9,

        textAlign: "center",

        whiteSpace: "nowrap",

        textShadow:
          "0 20px 45px rgba(0,0,0,0.35)",

        userSelect: "none",
      }}
    >
      {element.value || "0"}
    </div>
  );
}
