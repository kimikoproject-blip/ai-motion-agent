import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/*
  VisualPrimitives
  ----------------
  Characterful motion-graphic primitives for the AI Visual Storyteller.

  These are intentionally rendered as vectors/CSS/SVG instead of AI images,
  so arrows, highlights, connectors, energy trails, etc. stay crisp and
  animate cleanly at any resolution.
*/

const COLORS = {
  white: "#F8FAFC",
  muted: "#94A3B8",
  cyan: "#38BDF8",
  blue: "#60A5FA",
  purple: "#A78BFA",
  pink: "#F472B6",
  red: "#FB7185",
  orange: "#FB923C",
  yellow: "#FACC15",
  green: "#4ADE80",
};

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(value) {
  const t = clamp(value);
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function progressFor(
  frame,
  start = 0,
  duration = 0.6,
  fps = 30
) {
  const startFrame = Number(start || 0) * fps;
  const durationFrames = Math.max(
    1,
    Number(duration || 0.6) * fps
  );

  return clamp(
    (frame - startFrame) / durationFrames
  );
}

function color(value, fallback = COLORS.cyan) {
  return value || fallback;
}

/* -------------------------------------------------------
   CurvedArrow
------------------------------------------------------- */

export function CurvedArrow({
  x1 = 20,
  y1 = 50,
  x2 = 80,
  y2 = 50,
  color: strokeColor = COLORS.cyan,
  width = 7,
  curvature = 0.22,
  start = 0,
  duration = 0.8,
  opacity = 1,
  dashed = false,
}) {
  const frame = useCurrentFrame();
  const { width: canvasWidth, height: canvasHeight, fps } =
    useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const sx = (x1 / 100) * canvasWidth;
  const sy = (y1 / 100) * canvasHeight;
  const ex = (x2 / 100) * canvasWidth;
  const ey = (y2 / 100) * canvasHeight;

  const dx = ex - sx;
  const dy = ey - sy;

  const distance = Math.sqrt(dx * dx + dy * dy) || 1;

  const nx = -dy / distance;
  const ny = dx / distance;

  const curveAmount = distance * curvature;

  const cx =
    (sx + ex) / 2 +
    nx * curveAmount;

  const cy =
    (sy + ey) / 2 +
    ny * curveAmount;

  const arrowLength = Math.min(
    distance * 0.12,
    52
  );

  const angle =
    Math.atan2(
      ey - cy,
      ex - cx
    ) *
    (180 / Math.PI);

  const pathLength = 1000;

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
    >
      <path
        d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={
          dashed ? "18 14" : pathLength
        }
        strokeDashoffset={
          dashed
            ? 0
            : pathLength * (1 - progress)
        }
        style={{
          filter: `drop-shadow(0 0 8px ${strokeColor}55)`,
        }}
      />

      {progress > 0.72 && (
        <g
          transform={`
            translate(${ex} ${ey})
            rotate(${angle})
          `}
          opacity={clamp(
            (progress - 0.72) / 0.28
          )}
        >
          <path
            d={`
              M ${-arrowLength} ${-arrowLength * 0.55}
              L 0 0
              L ${-arrowLength} ${arrowLength * 0.55}
            `}
            fill="none"
            stroke={strokeColor}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

/* -------------------------------------------------------
   ScribbleCircle
------------------------------------------------------- */

export function ScribbleCircle({
  x = 50,
  y = 50,
  size = 260,
  color: strokeColor = COLORS.yellow,
  width = 8,
  start = 0,
  duration = 0.8,
  opacity = 1,
  rotations = 2,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const points = 64;

  const buildPath = (phase = 0) => {
    let path = "";

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle =
        t * Math.PI * 2;

      const wobble =
        1 +
        Math.sin(
          angle * 3 +
            phase
        ) *
          0.045 +
        Math.sin(
          angle * 7 +
            phase * 1.4
        ) *
          0.025;

      const px =
        Math.cos(angle) *
        (size / 2) *
        wobble;

      const py =
        Math.sin(angle) *
        (size / 2) *
        wobble;

      const xx =
        (x / 100) * 1080 +
        px;

      const yy =
        (y / 100) * 1920 +
        py;

      path +=
        i === 0
          ? `M ${xx} ${yy}`
          : ` L ${xx} ${yy}`;
    }

    return path;
  };

  const pathLength = 1400;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      {[0, 0.8].map((phase, index) => (
        <path
          key={index}
          d={buildPath(phase)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={
            index === 0
              ? width
              : width * 0.55
          }
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={
            pathLength *
            (1 - progress)
          }
          opacity={
            index === 0
              ? 0.95
              : 0.45
          }
          style={{
            filter: `drop-shadow(0 0 7px ${strokeColor}55)`,
          }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------
   ScribbleUnderline
------------------------------------------------------- */

export function ScribbleUnderline({
  x = 50,
  y = 50,
  width = 400,
  color: strokeColor = COLORS.yellow,
  thickness = 9,
  start = 0,
  duration = 0.55,
  opacity = 1,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const centerX = (x / 100) * 1080;
  const centerY = (y / 100) * 1920;

  const startX =
    centerX - width / 2;

  const endX =
    centerX + width / 2;

  const path = `
    M ${startX} ${centerY}
    C ${startX + width * 0.18} ${centerY - 7},
      ${startX + width * 0.32} ${centerY + 8},
      ${startX + width * 0.5} ${centerY}
    S ${startX + width * 0.82} ${centerY - 8},
      ${endX} ${centerY}
  `;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={width * 1.4}
        strokeDashoffset={
          width *
          1.4 *
          (1 - progress)
        }
        style={{
          filter: `drop-shadow(0 0 6px ${strokeColor}55)`,
        }}
      />
    </svg>
  );
}

/* -------------------------------------------------------
   EnergyTrail
------------------------------------------------------- */

export function EnergyTrail({
  x1 = 20,
  y1 = 50,
  x2 = 80,
  y2 = 50,
  color: trailColor = COLORS.cyan,
  width = 10,
  start = 0,
  duration = 1,
  opacity = 1,
  particles = 5,
}) {
  const frame = useCurrentFrame();
  const { width: canvasWidth, height: canvasHeight, fps } =
    useVideoConfig();

  const progress = easeInOut(
    progressFor(frame, start, duration, fps)
  );

  const sx = (x1 / 100) * canvasWidth;
  const sy = (y1 / 100) * canvasHeight;
  const ex = (x2 / 100) * canvasWidth;
  const ey = (y2 / 100) * canvasHeight;

  const points = [];

  for (let i = 0; i < particles; i++) {
    const offset =
      ((frame - start * fps) / 30 +
        i / particles) %
      1;

    const t = clamp(offset);

    points.push({
      x:
        sx +
        (ex - sx) * t,
      y:
        sy +
        (ey - sy) * t +
        Math.sin(
          t * Math.PI * 3
        ) *
          18,
      size:
        5 +
        Math.sin(
          frame / 6 + i
        ) *
          2,
    });
  }

  const visibleEndX =
    sx + (ex - sx) * progress;

  const visibleEndY =
    sy + (ey - sy) * progress;

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
    >
      <defs>
        <linearGradient
          id="energyTrailGradient"
          x1="0%"
          x2="100%"
        >
          <stop
            offset="0%"
            stopColor={trailColor}
            stopOpacity="0"
          />
          <stop
            offset="45%"
            stopColor={trailColor}
            stopOpacity="0.45"
          />
          <stop
            offset="100%"
            stopColor={trailColor}
            stopOpacity="1"
          />
        </linearGradient>
      </defs>

      <path
        d={`
          M ${sx} ${sy}
          Q
          ${(sx + visibleEndX) / 2}
          ${(sy + visibleEndY) / 2 - 30}
          ${visibleEndX}
          ${visibleEndY}
        `}
        fill="none"
        stroke="url(#energyTrailGradient)"
        strokeWidth={width}
        strokeLinecap="round"
        opacity="0.75"
        style={{
          filter: `drop-shadow(0 0 12px ${trailColor})`,
        }}
      />

      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={point.size}
          fill={trailColor}
          opacity={
            progress *
            (0.35 + index / particles)
          }
          style={{
            filter: `drop-shadow(0 0 8px ${trailColor})`,
          }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------
   FlowLine
------------------------------------------------------- */

export function FlowLine({
  x1 = 20,
  y1 = 50,
  x2 = 80,
  y2 = 50,
  color: lineColor = COLORS.blue,
  width = 5,
  start = 0,
  duration = 1,
  opacity = 1,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const phase =
    (frame - start * fps) * 2;

  const xStart =
    (x1 / 100) * 1080;

  const yStart =
    (y1 / 100) * 1920;

  const xEnd =
    (x2 / 100) * 1080;

  const yEnd =
    (y2 / 100) * 1920;

  const dx = xEnd - xStart;
  const dy = yEnd - yStart;

  const length =
    Math.sqrt(dx * dx + dy * dy) ||
    1;

  const nx = -dy / length;
  const ny = dx / length;

  const points = 30;

  let d = "";

  for (let i = 0; i <= points; i++) {
    const t = i / points;

    if (t > progress) break;

    const wave =
      Math.sin(
        t * Math.PI * 5 +
          phase / 10
      ) *
      12;

    const px =
      xStart +
      dx * t +
      nx * wave;

    const py =
      yStart +
      dy * t +
      ny * wave;

    d +=
      i === 0
        ? `M ${px} ${py}`
        : ` L ${px} ${py}`;
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="18 12"
        style={{
          filter: `drop-shadow(0 0 7px ${lineColor}66)`,
        }}
      />
    </svg>
  );
}

/* -------------------------------------------------------
   FocusRing
------------------------------------------------------- */

export function FocusRing({
  x = 50,
  y = 50,
  size = 300,
  color: ringColor = COLORS.cyan,
  width = 8,
  start = 0,
  duration = 0.7,
  opacity = 1,
  pulse = true,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const pulseScale = pulse
    ? 1 +
      Math.sin(frame / 8) *
        0.025
    : 1;

  const scale =
    interpolate(
      progress,
      [0, 1],
      [0.55, 1]
    ) * pulseScale;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `
          translate(-50%, -50%)
          scale(${scale})
        `,
        borderRadius: "50%",
        border: `${width}px solid ${ringColor}`,
        boxShadow: `
          0 0 0 8px ${ringColor}18,
          0 0 35px ${ringColor}55,
          inset 0 0 25px ${ringColor}22
        `,
        opacity:
          progress * opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/* -------------------------------------------------------
   Highlight
------------------------------------------------------- */

export function Highlight({
  x = 50,
  y = 50,
  width = 400,
  height = 100,
  color: highlightColor = COLORS.yellow,
  start = 0,
  duration = 0.6,
  opacity = 1,
  rotate = -3,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width,
        height,
        transform: `
          translate(-50%, -50%)
          rotate(${rotate}deg)
          scaleX(${progress})
        `,
        transformOrigin: "left center",
        background: `
          linear-gradient(
            90deg,
            ${highlightColor}00,
            ${highlightColor}55 15%,
            ${highlightColor}88 50%,
            ${highlightColor}33
          )
        `,
        borderRadius: 20,
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}

/* -------------------------------------------------------
   NumberBadge
------------------------------------------------------- */

export function NumberBadge({
  value = "3",
  x = 50,
  y = 50,
  size = 130,
  color: badgeColor = COLORS.yellow,
  textColor = "#07111F",
  start = 0,
  duration = 0.6,
  opacity = 1,
  pulse = true,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const pulseScale = pulse
    ? 1 +
      Math.sin(frame / 7) *
        0.025
    : 1;

  const scale =
    interpolate(
      progress,
      [0, 0.7, 1],
      [0.5, 1.12, 1]
    ) * pulseScale;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `
          translate(-50%, -50%)
          scale(${scale})
        `,
        borderRadius: "50%",
        background: badgeColor,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.52,
        fontWeight: 900,
        fontFamily:
          "Arial, Helvetica, sans-serif",
        boxShadow: `
          0 0 0 8px ${badgeColor}22,
          0 12px 35px rgba(0,0,0,0.3),
          0 0 35px ${badgeColor}55
        `,
        opacity:
          progress * opacity,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {value}
    </div>
  );
}

/* -------------------------------------------------------
   Callout
------------------------------------------------------- */

export function Callout({
  x = 50,
  y = 50,
  text = "IMPORTANT",
  width = 420,
  color: calloutColor = COLORS.white,
  accent = COLORS.cyan,
  start = 0,
  duration = 0.7,
  opacity = 1,
  direction = "right",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  const translate =
    direction === "left"
      ? -40
      : direction === "up"
      ? -40
      : direction === "down"
      ? 40
      : 40;

  const tx =
    direction === "left" ||
    direction === "right"
      ? translate * (1 - progress)
      : 0;

  const ty =
    direction === "up" ||
    direction === "down"
      ? translate * (1 - progress)
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width,
        transform: `
          translate(-50%, -50%)
          translate(${tx}px, ${ty}px)
        `,
        opacity:
          progress * opacity,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <div
        style={{
          position: "relative",
          padding:
            "18px 24px 18px 28px",
          borderRadius: 22,
          background:
            "rgba(15,23,42,0.92)",
          border:
            `2px solid ${accent}88`,
          boxShadow: `
            0 12px 40px rgba(0,0,0,0.28),
            0 0 25px ${accent}22
          `,
          color: calloutColor,
          fontSize: 38,
          lineHeight: 1.15,
          fontWeight: 800,
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 14,
            bottom: 14,
            width: 7,
            borderRadius: 10,
            background: accent,
            boxShadow:
              `0 0 15px ${accent}`,
          }}
        />

        {text}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ImpactBurst
------------------------------------------------------- */

export function ImpactBurst({
  x = 50,
  y = 50,
  size = 220,
  color: burstColor = COLORS.yellow,
  start = 0,
  duration = 0.55,
  opacity = 1,
  rays = 12,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = clamp(
    progressFor(
      frame,
      start,
      duration,
      fps
    )
  );

  const eased = easeOutCubic(progress);

  const scale =
    interpolate(
      eased,
      [0, 0.5, 1],
      [0.25, 1.25, 1]
    );

  const rayOpacity =
    progress < 0.85
      ? 1
      : 1 -
        (progress - 0.85) /
          0.15;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity:
          rayOpacity * opacity,
      }}
    >
      <g
        transform={`
          translate(${(x / 100) * 1080}
          ${(y / 100) * 1920})
          scale(${scale})
        `}
      >
        <circle
          r={size * 0.18}
          fill={burstColor}
          opacity="0.25"
          style={{
            filter: `blur(10px)`,
          }}
        />

        {Array.from({
          length: rays,
        }).map((_, index) => {
          const angle =
            (index / rays) *
            Math.PI *
            2;

          const inner =
            size * 0.35;

          const outer =
            size *
            (0.65 +
              Math.sin(
                index * 2.3
              ) *
                0.12);

          const xStart =
            Math.cos(angle) *
            inner;

          const yStart =
            Math.sin(angle) *
            inner;

          const xEnd =
            Math.cos(angle) *
            outer;

          const yEnd =
            Math.sin(angle) *
            outer;

          return (
            <line
              key={index}
              x1={xStart}
              y1={yStart}
              x2={xEnd}
              y2={yEnd}
              stroke={burstColor}
              strokeWidth={
                8 +
                (index % 3) * 3
              }
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}

/* -------------------------------------------------------
   ParticleBurst
------------------------------------------------------- */

export function ParticleBurst({
  x = 50,
  y = 50,
  color: particleColor = COLORS.cyan,
  count = 18,
  size = 7,
  spread = 260,
  start = 0,
  duration = 0.9,
  opacity = 1,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = easeOutCubic(
    progressFor(frame, start, duration, fps)
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      {Array.from({
        length: count,
      }).map((_, index) => {
        const angle =
          (index / count) *
          Math.PI *
          2;

        const distance =
          spread *
          progress *
          (0.65 +
            ((index * 17) % 37) /
              100);

        const px =
          (x / 100) * 1080 +
          Math.cos(angle) *
            distance;

        const py =
          (y / 100) * 1920 +
          Math.sin(angle) *
            distance;

        const particleSize =
          size *
          (0.7 +
            ((index * 13) % 30) /
              100);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: particleSize,
              height: particleSize,
              borderRadius: "50%",
              background:
                particleColor,
              transform:
                "translate(-50%, -50%)",
              opacity:
                progress *
                (1 - progress * 0.55),
              boxShadow:
                `0 0 14px ${particleColor}`,
            }}
          />
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   Connector
------------------------------------------------------- */

export function Connector({
  x1 = 30,
  y1 = 50,
  x2 = 70,
  y2 = 50,
  color: connectorColor = COLORS.purple,
  width = 5,
  start = 0,
  duration = 0.65,
  opacity = 1,
  dashed = false,
}) {
  return (
    <CurvedArrow
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      color={connectorColor}
      width={width}
      curvature={0}
      start={start}
      duration={duration}
      opacity={opacity}
      dashed={dashed}
    />
  );
}

/* -------------------------------------------------------
   GlowPulse
------------------------------------------------------- */

export function GlowPulse({
  x = 50,
  y = 50,
  size = 220,
  color: glowColor = COLORS.cyan,
  start = 0,
  duration = 1,
  opacity = 1,
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = progressFor(
    frame,
    start,
    duration,
    fps
  );

  const pulse =
    1 +
    Math.sin(frame / 7) *
      0.12;

  const alpha =
    0.2 +
    Math.sin(frame / 7) *
      0.08;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `
          translate(-50%, -50%)
          scale(${pulse})
        `,
        borderRadius: "50%",
        background:
          `radial-gradient(
            circle,
            ${glowColor}${Math.round(
              alpha * 255
            )
              .toString(16)
              .padStart(2, "0")},
            transparent 70%
          )`,
        opacity:
          progress * opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/* -------------------------------------------------------
   Export collection
------------------------------------------------------- */

export default {
  CurvedArrow,
  ScribbleCircle,
  ScribbleUnderline,
  EnergyTrail,
  FlowLine,
  FocusRing,
  Highlight,
  NumberBadge,
  Callout,
  ImpactBurst,
  ParticleBurst,
  Connector,
  GlowPulse,
};
