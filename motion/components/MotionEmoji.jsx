import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionEmoji({
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

  const progress =
    Math.min(localFrame / 18, 1);

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

  if (animation === "pop") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.7, 1],
      [0, 1.2, 1]
    );
  }

  if (animation === "impact") {
    opacity = interpolate(
      progress,
      [0, 0.45, 1],
      [0, 1, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.55, 0.8, 1],
      [0.2, 1.25, 0.92, 1]
    );

    rotate = interpolate(
      progress,
      [0, 1],
      [-12, 0]
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
      [-220, 0]
    );
  }

  if (animation === "fade") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
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
      [0.3, 1.25, 0.9, 1]
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
      [0.8, 1]
    );
  }

  // =========================================================
  // IDLE MOTION
  // =========================================================

  if (animation === "float") {
    translateY +=
      Math.sin(frame * 0.08) * 10;
  } else {
    translateY +=
      Math.sin(frame * 0.05) * 3;
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
    Number(element.size) || 240;

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

        fontSize: size,

        lineHeight: 1,

        userSelect: "none",

        filter:
          "drop-shadow(0 20px 25px rgba(0,0,0,0.25))",
      }}
    >
      {element.value || "✨"}
    </div>
  );
}
