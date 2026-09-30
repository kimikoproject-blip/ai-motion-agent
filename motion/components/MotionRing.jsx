import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export default function MotionRing({
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
      damping: 16,
      stiffness: 150,
      mass: 0.8,
    },
  });

  // =========================================================
  // VALUE
  // =========================================================

  const value =
    Math.max(
      0,
      Math.min(
        100,
        Number(element.value ?? 75)
      )
    );

  const animatedValue =
    interpolate(
      progress,
      [0, 1],
      [0, value]
    );

  // =========================================================
  // POSITION / SIZE
  // =========================================================

  const x =
    Number(element.x ?? 50);

  const y =
    Number(element.y ?? 50);

  const size =
    Number(element.size ?? 360);

  const stroke =
    Number(element.stroke ?? 28);

  // =========================================================
  // COLORS
  // =========================================================

  const color =
    element.color || "#6C63FF";

  const backgroundColor =
    element.backgroundColor ||
    "rgba(255,255,255,0.10)";

  // =========================================================
  // CIRCLE MATH
  // =========================================================

  const radius =
    (size - stroke) / 2;

  const circumference =
    2 * Math.PI * radius;

  const dashOffset =
    circumference *
    (1 - animatedValue / 100);

  // =========================================================
  // ROTATION
  // =========================================================

  const rotation =
    Number(element.rotation ?? -90);

  // =========================================================
  // ANIMATION
  // =========================================================

  let opacity = 1;
  let scale = 1;

  const animation =
    element.animation || "pop";

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
      [0, 0.65, 1],
      [0, 1.08, 1]
    );

    scale = interpolate(
      progress,
      [0, 1],
      [0.8, 1]
    );
  }

  return (
    <div
      style={{
        position: "absolute",

        left: `${x}%`,
        top: `${y}%`,

        width: `${size}px`,
        height: `${size}px`,

        opacity,

        transform:
          `translate(-50%, -50%) ` +
          `scale(${scale})`,

        pointerEvents:
          "none",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          display: "block",
          overflow: "visible",
        }}
      >
        {/* BACKGROUND RING */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={stroke}
        />

        {/* VALUE RING */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          style={{
            filter:
              `drop-shadow(0 0 18px ${color})`,
          }}
        />
      </svg>

      {/* CENTER VALUE */}
      <div
        style={{
          position:
            "absolute",

          inset: 0,

          display:
            "flex",

          flexDirection:
            "column",

          justifyContent:
            "center",

          alignItems:
            "center",

          fontFamily:
            "Arial, Helvetica, sans-serif",

          color:
            "white",
        }}
      >
        <div
          style={{
            fontSize:
              `${Math.round(size * 0.23)}px`,

            fontWeight:
              900,

            lineHeight:
              0.9,
          }}
        >
          {Math.round(animatedValue)}%
        </div>

        {element.label && (
          <div
            style={{
              marginTop:
                "16px",

              fontSize:
                `${Math.round(size * 0.09)}px`,

              fontWeight:
                700,

              opacity:
                0.75,
            }}
          >
            {element.label}
          </div>
        )}
      </div>
    </div>
  );
}
