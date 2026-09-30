import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionText({
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
      [0.75, 1.08, 1]
    );

    translateY = interpolate(
      progress,
      [0, 1],
      [50, 0]
    );
  }

  if (animation === "impact") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.45, 0.75, 1],
      [0.3, 1.12, 0.95, 1]
    );

    rotate = interpolate(
      progress,
      [0, 1],
      [-5, 0]
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
      [-180, 0]
    );
  }

  if (animation === "bounce") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scale = interpolate(
      progress,
      [0, 0.45, 0.7, 1],
      [0.7, 1.15, 0.94, 1]
    );
  }

  if (animation === "float") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    translateY =
      Math.sin(frame * 0.08) * 8;
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
      top = "18%";
    }

    if (position === "center") {
      top = "50%";
    }

    if (position === "bottom") {
      top = "82%";
    }
  }

  // =========================================================
  // STYLE
  // =========================================================

  const fontSize =
    Number(element.size) || 80;

  const weight =
    Number(element.weight) || 900;

  const color =
    element.color || "white";

  const align =
    element.align || "center";

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

        width:
          element.width
            ? `${Number(element.width)}px`
            : "auto",

        maxWidth:
          element.maxWidth
            ? `${Number(element.maxWidth)}px`
            : "900px",

        opacity,

        transform,

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        fontFamily:
          "Arial, Helvetica, sans-serif",

        fontSize,

        fontWeight: weight,

        color,

        textAlign: align,

        lineHeight: 1.05,

        letterSpacing:
          Number(element.letterSpacing ?? -2),

        whiteSpace:
          element.wrap === false
            ? "nowrap"
            : "normal",

        textShadow:
          element.shadow === false
            ? "none"
            : "0 12px 30px rgba(0,0,0,0.35)",

        padding:
          "10px 20px",

        boxSizing:
          "border-box",
      }}
    >
      {element.value || ""}
    </div>
  );
}
