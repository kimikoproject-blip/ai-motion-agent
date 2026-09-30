import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionArrow({
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
    element.animation || "slide";

  let opacity = 1;
  let scaleX = 1;
  let translateX = 0;

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

    scaleX = interpolate(
      progress,
      [0, 0.7, 1],
      [0, 1.08, 1]
    );
  }

  if (animation === "slide") {
    opacity = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );

    scaleX = interpolate(
      progress,
      [0, 1],
      [0, 1]
    );
  }

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
    Number(element.width ?? 240);

  const thickness =
    Number(element.thickness ?? 10);

  const headSize =
    Number(element.headSize ?? 28);

  const rotation =
    Number(element.rotation ?? 0);

  const color =
    element.color || "white";

  // =========================================================
  // ARROW
  // =========================================================

  return (
    <div
      style={{
        position: "absolute",

        left: `${x}%`,
        top: `${y}%`,

        width: `${width}px`,
        height: `${headSize * 2}px`,

        opacity,

        transform:
          `translate(-50%, -50%) ` +
          `translateX(${translateX}px) ` +
          `rotate(${rotation}deg) ` +
          `scaleX(${scaleX})`,

        transformOrigin:
          "center center",

        pointerEvents:
          "none",
      }}
    >
      {/* LINE */}
      <div
        style={{
          position: "absolute",

          left: 0,
          top: "50%",

          width:
            `calc(100% - ${headSize}px)`,

          height:
            `${thickness}px`,

          transform:
            "translateY(-50%)",

          background:
            color,

          borderRadius:
            "999px",
        }}
      />

      {/* ARROW HEAD */}
      <div
        style={{
          position: "absolute",

          right: 0,
          top: "50%",

          width:
            `${headSize}px`,

          height:
            `${headSize}px`,

          borderTop:
            `${thickness}px solid ${color}`,

          borderRight:
            `${thickness}px solid ${color}`,

          transform:
            "translateY(-50%) rotate(45deg)",

          transformOrigin:
            "center center",

          boxSizing:
            "border-box",
        }}
      />
    </div>
  );
}
