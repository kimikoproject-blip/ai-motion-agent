import React from "react";
import { resolveAsset } from "../remotion/AssetResolver.jsx";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import MotionText from "./components/MotionText";
import MotionEmoji from "./components/MotionEmoji";
import MotionNumber from "./components/MotionNumber";
import MotionShape from "./components/MotionShape";
import MotionArrow from "./components/MotionArrow";
import MotionProgress from "./components/MotionProgress";
import MotionRing from "./components/MotionRing";

import AnimatedOctopus from "./components/AnimatedOctopus";

import {
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
} from "./components/VisualPrimitives";

const COLORS = {
  white: "#F8FAFC",
  muted: "#94A3B8",
  cyan: "#38BDF8",
  blue: "#60A5FA",
  red: "#F87171",
  green: "#4ADE80",
  yellow: "#FACC15",
  purple: "#A78BFA",
  pink: "#F06BC1",
};

function clamp01(value) {
  return Math.max(
    0,
    Math.min(1, value)
  );
}

function easeOut(value) {
  const t = clamp01(value);

  return (
    1 -
    Math.pow(
      1 - t,
      3
    )
  );
}

function revealProgress(
  frame,
  startSeconds = 0,
  durationSeconds = 0.7,
  fps = 30
) {
  const startFrame =
    Number(startSeconds || 0) *
    fps;

  const durationFrames =
    Math.max(
      1,
      Number(
        durationSeconds || 0.7
      ) * fps
    );

  return easeOut(
    (frame - startFrame) /
      durationFrames
  );
}

/* =========================================================
   CAMERA
========================================================= */

function SceneCamera({
  camera,
  children,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  if (
    !camera ||
    !camera.animation ||
    camera.animation ===
      "none"
  ) {
    return children;
  }

  const from =
    Number(
      camera.from ?? 1
    );

  const to =
    Number(
      camera.to ?? from
    );

  const duration =
    Number(
      camera.duration ?? 5
    );

  const progress =
    clamp01(
      frame /
        Math.max(
          1,
          duration * fps
        )
    );

  const scale =
    interpolate(
      progress,
      [0, 1],
      [from, to]
    );

  const x =
    Number(
      camera.x ?? 50
    );

  const y =
    Number(
      camera.y ?? 50
    );

  return (
    <AbsoluteFill
      style={{
        transform:
          `scale(${scale})`,
        transformOrigin:
          `${x}% ${y}%`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/* =========================================================
   SUBJECT
========================================================= */

function VisualSubject({
  visual,
}) {
  const subject =
    String(
      visual.subject ||
        visual.value ||
        ""
    ).toLowerCase();

  /*
   * Gurita tidak lagi menggunakan emoji.
   * Semua visual subject bisa ditambah
   * resolver asset di sini nanti.
   */
  if (
    subject.includes(
      "gurita"
    ) ||
    subject.includes(
      "octopus"
    ) ||
    visual.value ===
      "🐙"
  ) {
    return (
      <AnimatedOctopus
        x={
          Number(
            visual.x ?? 50
          )
        }
        y={
          Number(
            visual.y ?? 48
          )
        }
        scale={
          Number(
            visual.scale ??
              1
          )
        }
      />
    );
  }

  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const progress =
    revealProgress(
      frame,
      visual.start,
      0.8,
      fps
    );

  const scale =
    interpolate(
      progress,
      [0, 1],
      [0.72, 1]
    );

  const float =
    Math.sin(
      frame / 18
    ) * 5;

  const size =
    Number(
      visual.size ?? 260
    );

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${visual.x ?? 50}%`,
        top: `${visual.y ?? 50}%`,
        transform:
          `translate(-50%, -50%) translateY(${float}px) scale(${scale})`,
        opacity: progress,
        fontSize: size,
        lineHeight: 1,
        filter:
          "drop-shadow(0 0 28px rgba(56,189,248,0.35))",
        zIndex: 20,
      }}
    >
      {visual.value ||
        "●"}
    </div>
  );
}

/* =========================================================
   TEXT
========================================================= */

function VisualText({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const progress =
    revealProgress(
      frame,
      visual.start,
      0.55,
      fps
    );

  const translateY =
    interpolate(
      progress,
      [0, 1],
      [18, 0]
    );

  const scale =
    visual.animation ===
    "impact"
      ? interpolate(
          progress,
          [0, 0.65, 1],
          [0.75, 1.08, 1]
        )
      : 1;

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${visual.x ?? 50}%`,
        top: `${visual.y ?? 50}%`,
        transform:
          `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity: progress,
        color:
          visual.color ||
          COLORS.white,
        fontSize:
          Number(
            visual.size ?? 54
          ),
        fontWeight:
          visual.weight ||
          800,
        textAlign:
          visual.align ||
          "center",
        maxWidth:
          visual.maxWidth ||
          "850px",
        letterSpacing:
          visual.letterSpacing ||
          "-0.03em",
        textShadow:
          "0 8px 30px rgba(0,0,0,0.35)",
        zIndex: 30,
      }}
    >
      {visual.value}
    </div>
  );
}

/* =========================================================
   COUNTER
========================================================= */

function VisualCounter({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const target =
    Number(
      visual.value ?? 0
    );

  const progress =
    revealProgress(
      frame,
      visual.start,
      1,
      fps
    );

  const value =
    Math.round(
      target * progress
    );

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${visual.x ?? 50}%`,
        top: `${visual.y ?? 50}%`,
        transform:
          `translate(-50%, -50%) scale(${0.82 + progress * 0.18})`,
        opacity: progress,
        textAlign:
          "center",
        zIndex: 25,
      }}
    >
      <div
        style={{
          fontSize:
            Number(
              visual.size ??
                170
            ),
          lineHeight:
            0.9,
          fontWeight: 900,
          color:
            visual.color ||
            COLORS.cyan,
          letterSpacing:
            "-0.06em",
          textShadow:
            "0 0 35px rgba(56,189,248,0.35)",
        }}
      >
        {value}
      </div>

      {visual.label && (
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 700,
            color:
              COLORS.muted,
            letterSpacing:
              "0.12em",
          }}
        >
          {visual.label}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DIAGRAM
========================================================= */

function DiagramNode({
  node,
  progress,
}) {
  const size =
    Number(
      node.size ?? 90
    );

  const isPrimary =
    node.role ===
    "primary";

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${node.x ?? 50}%`,
        top: `${node.y ?? 50}%`,
        transform:
          `translate(-50%, -50%) scale(${0.65 + progress * 0.35})`,
        opacity: progress,
        width: size,
        height: size,
        borderRadius:
          "50%",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        background:
          isPrimary
            ? "rgba(56,189,248,0.18)"
            : "rgba(148,163,184,0.10)",
        border:
          `2px solid ${
            isPrimary
              ? COLORS.cyan
              : "rgba(148,163,184,0.45)"
          }`,
        boxShadow:
          isPrimary
            ? "0 0 30px rgba(56,189,248,0.3)"
            : "none",
        color:
          COLORS.white,
        zIndex: 10,
      }}
    >
      <div
        style={{
          textAlign:
            "center",
          fontSize:
            Number(
              node.fontSize ??
                24
            ),
          fontWeight: 800,
          lineHeight: 1.05,
          padding: 8,
        }}
      >
        {node.value && (
          <div
            style={{
              fontSize:
                Number(
                  node.iconSize ??
                    42
                ),
            }}
          >
            {node.value}
          </div>
        )}

        {node.label && (
          <div>
            {node.label}
          </div>
        )}
      </div>
    </div>
  );
}

function DiagramConnector({
  from,
  to,
  progress,
}) {
  const x1 =
    Number(
      from?.x ?? 50
    );

  const y1 =
    Number(
      from?.y ?? 50
    );

  const x2 =
    Number(
      to?.x ?? 50
    );

  const y2 =
    Number(
      to?.y ?? 50
    );

  const dx =
    x2 - x1;

  const dy =
    y2 - y1;

  const distance =
    Math.sqrt(
      dx * dx +
        dy * dy
    );

  const angle =
    Math.atan2(
      dy,
      dx
    ) *
    (180 / Math.PI);

  const width =
    Math.max(
      0,
      distance * progress
    );

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${width}%`,
        height: 4,
        transformOrigin:
          "left center",
        transform:
          `rotate(${angle}deg)`,
        background:
          `linear-gradient(90deg, ${COLORS.cyan}, rgba(56,189,248,0.18))`,
        borderRadius: 999,
        boxShadow:
          "0 0 14px rgba(56,189,248,0.35)",
        zIndex: 5,
      }}
    />
  );
}

function VisualDiagram({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const reveal =
    revealProgress(
      frame,
      visual.start,
      0.9,
      fps
    );

  const nodes =
    Array.isArray(
      visual.nodes
    )
      ? visual.nodes
      : [];

  const connections =
    Array.isArray(
      visual.connections
    )
      ? visual.connections
      : [];

  const findNode =
    (id) =>
      nodes.find(
        (node) =>
          node.id === id
      );

  return (
    <AbsoluteFill>
      {connections.map(
        (
          connection,
          index
        ) => {
          const from =
            findNode(
              connection.from
            );

          const to =
            findNode(
              connection.to
            );

          if (
            !from ||
            !to
          ) {
            return null;
          }

          return (
            <DiagramConnector
              key={`connection-${index}`}
              from={from}
              to={to}
              progress={
                reveal
              }
            />
          );
        }
      )}

      {nodes.map(
        (
          node,
          index
        ) => {
          const nodeProgress =
            revealProgress(
              frame,
              Number(
                visual.start ||
                  0
              ) +
                index *
                  0.12,
              0.55,
              fps
            );

          return (
            <DiagramNode
              key={
                node.id ||
                `node-${index}`
              }
              node={node}
              progress={
                nodeProgress
              }
            />
          );
        }
      )}
    </AbsoluteFill>
  );
}

/* =========================================================
   COMPARE
========================================================= */

function CompareCard({
  side,
  x,
  color,
  progress,
}) {
  return (
    <div
      style={{
        position:
          "absolute",
        left: `${x}%`,
        top: "50%",
        transform:
          `translate(-50%, -50%) translateY(${(1 - progress) * 40}px)`,
        opacity: progress,
        width: "39%",
        minHeight: 330,
        borderRadius: 34,
        background:
          "rgba(15,23,42,0.86)",
        border:
          `2px solid ${color}`,
        boxShadow:
          `0 0 40px ${color}30`,
        display: "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: 30,
        zIndex: 20,
      }}
    >
      <div
        style={{
          color:
            COLORS.muted,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing:
            "0.1em",
        }}
      >
        {side.title}
      </div>

      <div
        style={{
          marginTop: 22,
          color,
          fontSize: 48,
          fontWeight: 900,
          textAlign:
            "center",
          lineHeight: 1.05,
        }}
      >
        {side.value}
      </div>
    </div>
  );
}

function VisualCompare({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const progress =
    revealProgress(
      frame,
      visual.start,
      0.8,
      fps
    );

  return (
    <AbsoluteFill>
      <CompareCard
        side={
          visual.left ||
          {}
        }
        x={27}
        color={
          COLORS.red
        }
        progress={
          progress
        }
      />

      <CompareCard
        side={
          visual.right ||
          {}
        }
        x={73}
        color={
          COLORS.blue
        }
        progress={
          progress
        }
      />

      <div
        style={{
          position:
            "absolute",
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%)",
          width: 4,
          height: 400,
          background:
            "rgba(148,163,184,0.25)",
          opacity: progress,
        }}
      />
    </AbsoluteFill>
  );
}

/* =========================================================
   SPOTLIGHT
========================================================= */

function VisualSpotlight({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const progress =
    revealProgress(
      frame,
      visual.start,
      0.7,
      fps
    );

  const pulse =
    1 +
    Math.sin(
      frame / 7
    ) *
      0.04;

  return (
    <div
      style={{
        position:
          "absolute",
        left: `${visual.x ?? 50}%`,
        top: `${visual.y ?? 50}%`,
        transform:
          `translate(-50%, -50%) scale(${pulse})`,
        opacity: progress,
        width:
          Number(
            visual.size ??
              220
          ),
        height:
          Number(
            visual.size ??
              220
          ),
        borderRadius:
          "50%",
        border:
          `4px solid ${COLORS.yellow}`,
        boxShadow:
          `0 0 0 12px rgba(250,204,21,0.10), 0 0 55px rgba(250,204,21,0.45)`,
        zIndex: 40,
        pointerEvents:
          "none",
      }}
    >
      {visual.label && (
        <div
          style={{
            position:
              "absolute",
            top:
              "calc(100% + 22px)",
            left: "50%",
            transform:
              "translateX(-50%)",
            whiteSpace:
              "nowrap",
            fontSize: 30,
            fontWeight: 900,
            color:
              COLORS.yellow,
          }}
        >
          {visual.label}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TRANSFORM
========================================================= */

function VisualTransform({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const p =
    revealProgress(
      frame,
      visual.start,
      1.4,
      fps
    );

  const before =
    visual.before ||
    {};

  const after =
    visual.after ||
    {};

  const beforeOpacity =
    1 -
    clamp01(
      (p - 0.35) /
        0.35
    );

  const afterOpacity =
    clamp01(
      (p - 0.5) /
        0.35
    );

  return (
    <AbsoluteFill>
      <div
        style={{
          position:
            "absolute",
          left: "50%",
          top: "44%",
          transform:
            `translate(-50%, -50%) scale(${1 + p * 0.12})`,
          opacity:
            beforeOpacity,
          textAlign:
            "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 240,
            lineHeight: 1,
          }}
        >
          {before.value ||
            "●"}
        </div>

        {before.label && (
          <div
            style={{
              marginTop: 18,
              fontSize: 34,
              fontWeight: 800,
              color:
                COLORS.muted,
            }}
          >
            {before.label}
          </div>
        )}
      </div>

      <div
        style={{
          position:
            "absolute",
          left: "50%",
          top: "44%",
          transform:
            `translate(-50%, -50%) scale(${0.7 + afterOpacity * 0.3})`,
          opacity:
            afterOpacity,
          textAlign:
            "center",
          zIndex: 25,
        }}
      >
        <div
          style={{
            fontSize: 240,
            lineHeight: 1,
            filter:
              "drop-shadow(0 0 30px rgba(56,189,248,0.4))",
          }}
        >
          {after.value ||
            "●"}
        </div>

        {after.label && (
          <div
            style={{
              marginTop: 18,
              fontSize: 34,
              fontWeight: 800,
              color:
                COLORS.cyan,
            }}
          >
            {after.label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* =========================================================
   LEGACY
========================================================= */

function renderLegacyElement(
  element,
  index
) {
  const key =
    element.id ||
    `${element.type}-${index}`;

  switch (
    element.type
  ) {
    case "text":
      return (
        <MotionText
          key={key}
          element={element}
        />
      );

    case "emoji":
      return (
        <MotionEmoji
          key={key}
          element={element}
        />
      );

    case "number":
      return (
        <MotionNumber
          key={key}
          element={element}
        />
      );

    case "shape":
      return (
        <MotionShape
          key={key}
          element={element}
        />
      );

    case "arrow":
      return (
        <MotionArrow
          key={key}
          element={element}
        />
      );

    case "progress":
      return (
        <MotionProgress
          key={key}
          element={element}
        />
      );

    case "ring":
      return (
        <MotionRing
          key={key}
          element={element}
        />
      );

    default:
      return null;
  }
}


/* =========================================================
   AI ASSET
========================================================= */

function VisualAsset({
  visual,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const progress =
    revealProgress(
      frame,
      visual.start,
      visual.duration ?? 0.7,
      fps
    );

  const src =
    resolveAsset(
      visual.assetId
    );

  if (!src) {
    return null;
  }

  const animation =
    visual.animation ||
    "reveal";

  let scale = 1;
  let translateY = 0;
  let rotate = 0;

  if (
    animation === "reveal" ||
    animation === "impact"
  ) {
    scale =
      animation === "impact"
        ? interpolate(
            progress,
            [0, 0.65, 1],
            [0.7, 1.08, 1]
          )
        : interpolate(
            progress,
            [0, 1],
            [0.88, 1]
          );

    translateY =
      interpolate(
        progress,
        [0, 1],
        [30, 0]
      );
  }

  if (
    animation === "float" ||
    animation === "breathe"
  ) {
    const amount =
      animation === "float"
        ? 12
        : 5;

    translateY =
      Math.sin(
        frame / 14
      ) * amount;
  }

  if (
    animation === "rotate"
  ) {
    rotate =
      interpolate(
        frame % fps,
        [0, fps],
        [0, 360]
      );
  }

  if (
    animation === "pulse"
  ) {
    scale =
      1 +
      Math.sin(
        frame / 8
      ) *
        0.045;
  }

  return (
    <div
      style={{
        position:
          "absolute",
        left:
          `${visual.x ?? 50}%`,
        top:
          `${visual.y ?? 50}%`,
        width:
          visual.width ||
          "auto",
        height:
          visual.height ||
          "auto",
        transform:
          `translate(-50%, -50%) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity:
          progress,
        zIndex:
          visual.zIndex ??
          (
            visual.role ===
            "primary"
              ? 20
              : 10
          ),
        pointerEvents:
          "none",
        transformOrigin:
          "center center",
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          display:
            "block",
          width:
            visual.width ||
            520,
          height:
            visual.height ||
            "auto",
          objectFit:
            "contain",
          filter:
            visual.glow
              ? "drop-shadow(0 0 35px rgba(56,189,248,0.35))"
              : "none",
        }}
      />
    </div>
  );
}

/* =========================================================
   V4 VISUAL ACTION ENGINE
========================================================= */

function normalizeActionName(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

function getTimelinePoint(event) {
  const point =
    event?.position ||
    event?.at ||
    event?.point ||
    {};

  return {
    x:
      Number(
        point?.x ??
        event?.x ??
        event?.targetX ??
        50
      ),
    y:
      Number(
        point?.y ??
        event?.y ??
        event?.targetY ??
        50
      ),
  };
}

function getEventTime(event) {
  return Number(
    event?.time ??
    event?.start ??
    event?.at ??
    0
  );
}

function getEventDuration(event) {
  return Number(
    event?.duration ??
    event?.length ??
    0.6
  );
}

function getEventColor(event, fallback = COLORS.cyan) {
  return (
    event?.color ||
    event?.style?.color ||
    event?.accent ||
    fallback
  );
}

function getVisualPosition(
  event,
  fallbackX = 50,
  fallbackY = 50
) {
  const position =
    event?.position ||
    {};

  return {
    x: Number(
      position.x ??
      event?.x ??
      fallbackX
    ),
    y: Number(
      position.y ??
      event?.y ??
      fallbackY
    ),
  };
}

function VisualActionTimeline({
  timeline = [],
  relationships = [],
  visuals = [],
}) {
  const frame = useCurrentFrame();

  if (!Array.isArray(timeline)) {
    return null;
  }

  /*
    Build a lookup table for visual IDs.

    This allows timeline events such as:

      {
        target: "heart-organ",
        action: "pulse"
      }

    to inherit the position of the actual visual.
  */
  const visualMap = new Map();

  for (const visual of visuals) {
    if (!visual) continue;

    const id =
      visual.id ||
      visual.assetId;

    if (id) {
      visualMap.set(
        String(id),
        visual
      );
    }
  }

  function resolveTarget(event) {
    const target =
      event?.target ||
      event?.targetId ||
      event?.visualId ||
      event?.assetId;

    if (!target) {
      return null;
    }

    return (
      visualMap.get(
        String(target)
      ) || null
    );
  }

  function getTargetPosition(event) {
    const target =
      resolveTarget(event);

    return getVisualPosition(
      target || {},
      event?.x ?? 50,
      event?.y ?? 50
    );
  }

  function isActive(event) {
    const start =
      getEventTime(event);

    const duration =
      getEventDuration(event);

    const end =
      start + duration;

    const currentSeconds =
      frame / 30;

    return (
      currentSeconds >= start &&
      currentSeconds <= end + 0.02
    );
  }

  function renderAction(
    event,
    index
  ) {
    if (!event) {
      return null;
    }

    const action =
      normalizeActionName(
        event.action ||
        event.type
      );

    const key =
      event.id ||
      `timeline-${index}-${action}`;

    const targetPosition =
      getTargetPosition(event);

    const start =
      getEventTime(event);

    const duration =
      getEventDuration(event);

    const actionColor =
      getEventColor(
        event,
        COLORS.cyan
      );

    /*
      V4 can contain "semantic" actions
      that should remain alive after their
      first activation.

      We therefore don't return null merely
      because the event is outside its local
      time range. The primitive itself handles
      its own reveal timing.
    */

    switch (action) {
      case "draw":
      case "curved_arrow":
      case "sketch_arrow":
        return (
          <CurvedArrow
            key={key}
            x1={
              Number(
                event.from?.x ??
                event.startX ??
                Math.max(
                  5,
                  targetPosition.x - 25
                )
              )
            }
            y1={
              Number(
                event.from?.y ??
                event.startY ??
                targetPosition.y
              )
            }
            x2={
              Number(
                event.to?.x ??
                event.endX ??
                targetPosition.x
              )
            }
            y2={
              Number(
                event.to?.y ??
                event.endY ??
                targetPosition.y
              )
            }
            color={actionColor}
            width={
              Number(
                event.width ??
                7
              )
            }
            curvature={
              Number(
                event.curvature ??
                0.22
              )
            }
            start={start}
            duration={duration}
          />
        );

      case "connector":
      case "connect":
      case "linking_line":
        return (
          <Connector
            key={key}
            x1={
              Number(
                event.from?.x ??
                event.startX ??
                30
              )
            }
            y1={
              Number(
                event.from?.y ??
                event.startY ??
                targetPosition.y
              )
            }
            x2={
              Number(
                event.to?.x ??
                event.endX ??
                targetPosition.x
              )
            }
            y2={
              Number(
                event.to?.y ??
                event.endY ??
                targetPosition.y
              )
            }
            color={actionColor}
            width={
              Number(
                event.width ??
                5
              )
            }
            start={start}
            duration={duration}
            dashed={
              Boolean(
                event.dashed
              )
            }
          />
        );

      case "flow":
      case "flow_line":
      case "particle_flow":
        return (
          <FlowLine
            key={key}
            x1={
              Number(
                event.from?.x ??
                event.startX ??
                Math.max(
                  5,
                  targetPosition.x - 30
                )
              )
            }
            y1={
              Number(
                event.from?.y ??
                event.startY ??
                targetPosition.y
              )
            }
            x2={
              Number(
                event.to?.x ??
                event.endX ??
                Math.min(
                  95,
                  targetPosition.x + 30
                )
              )
            }
            y2={
              Number(
                event.to?.y ??
                event.endY ??
                targetPosition.y
              )
            }
            color={actionColor}
            width={
              Number(
                event.width ??
                6
              )
            }
            start={start}
            duration={duration}
          />
        );

      case "energy_trail":
      case "glowing_path":
        return (
          <EnergyTrail
            key={key}
            x1={
              Number(
                event.from?.x ??
                event.startX ??
                20
              )
            }
            y1={
              Number(
                event.from?.y ??
                event.startY ??
                targetPosition.y
              )
            }
            x2={
              Number(
                event.to?.x ??
                event.endX ??
                targetPosition.x
              )
            }
            y2={
              Number(
                event.to?.y ??
                event.endY ??
                targetPosition.y
              )
            }
            color={actionColor}
            width={
              Number(
                event.width ??
                9
              )
            }
            start={start}
            duration={duration}
            particles={
              Number(
                event.particles ??
                6
              )
            }
          />
        );

      case "scribble_circle":
      case "circle":
      case "surrounds":
        return (
          <ScribbleCircle
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            size={
              Number(
                event.size ??
                260
              )
            }
            color={getEventColor(
              event,
              COLORS.yellow
            )}
            width={
              Number(
                event.width ??
                8
              )
            }
            start={start}
            duration={duration}
          />
        );

      case "scribble_underline":
      case "underline":
        return (
          <ScribbleUnderline
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            width={
              Number(
                event.width ??
                420
              )
            }
            color={getEventColor(
              event,
              COLORS.yellow
            )}
            thickness={
              Number(
                event.thickness ??
                9
              )
            }
            start={start}
            duration={duration}
          />
        );

      case "highlight":
      case "emphasize":
        return (
          <Highlight
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            width={
              Number(
                event.width ??
                420
              )
            }
            height={
              Number(
                event.height ??
                100
              )
            }
            color={getEventColor(
              event,
              COLORS.yellow
            )}
            start={start}
            duration={duration}
            rotate={
              Number(
                event.rotate ??
                -3
              )
            }
          />
        );

      case "focus":
      case "focus_ring":
      case "spotlight":
        return (
          <FocusRing
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            size={
              Number(
                event.size ??
                300
              )
            }
            color={getEventColor(
              event,
              COLORS.cyan
            )}
            width={
              Number(
                event.width ??
                8
              )
            }
            start={start}
            duration={duration}
          />
        );

      case "number_badge":
      case "badge":
      case "count":
        return (
          <NumberBadge
            key={key}
            value={
              event.value ??
              event.number ??
              event.text ??
              "3"
            }
            x={targetPosition.x}
            y={targetPosition.y}
            size={
              Number(
                event.size ??
                130
              )
            }
            color={getEventColor(
              event,
              COLORS.yellow
            )}
            start={start}
            duration={duration}
          />
        );

      case "callout":
      case "annotation":
      case "label":
        return (
          <Callout
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            text={
              event.text ||
              event.label ||
              event.message ||
              ""
            }
            width={
              Number(
                event.width ??
                420
              )
            }
            accent={getEventColor(
              event,
              COLORS.cyan
            )}
            start={start}
            duration={duration}
            direction={
              event.direction ||
              "right"
            }
          />
        );

      case "impact":
      case "burst":
      case "shockwave":
        return (
          <>
            <ImpactBurst
              key={`${key}-burst`}
              x={targetPosition.x}
              y={targetPosition.y}
              size={
                Number(
                  event.size ??
                  220
                )
              }
              color={getEventColor(
                event,
                COLORS.yellow
              )}
              start={start}
              duration={duration}
            />

            <ParticleBurst
              key={`${key}-particles`}
              x={targetPosition.x}
              y={targetPosition.y}
              color={getEventColor(
                event,
                COLORS.yellow
              )}
              count={
                Number(
                  event.particles ??
                  14
                )
              }
              spread={
                Number(
                  event.spread ??
                  240
                )
              }
              start={start}
              duration={
                Math.max(
                  duration,
                  0.75
                )
              }
            />
          </>
        );

      case "pulse":
      case "glow_pulse":
        return (
          <GlowPulse
            key={key}
            x={targetPosition.x}
            y={targetPosition.y}
            size={
              Number(
                event.size ??
                240
              )
            }
            color={getEventColor(
              event,
              COLORS.cyan
            )}
            start={start}
            duration={duration}
          />
        );

      case "pop":
      case "reveal":
      case "enter":
      case "bounce":
      case "squash":
      case "stretch":
      case "move":
      case "travel":
      case "orbit":
      case "rotate":
      case "transform":
      case "fade_in":
      case "exit":
      case "shake":
        /*
          These actions are primarily consumed
          by the target visual's own animation
          system.

          We intentionally do not manufacture
          a duplicate asset here.
        */
        return null;

      default:
        return null;
    }
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 80,
      }}
    >
      {timeline.map(
        renderAction
      )}

      {Array.isArray(
        relationships
      ) &&
        relationships.map(
          (relationship, index) => {
            if (
              relationship?.type !==
              "connects"
            ) {
              return null;
            }

            const from =
              visualMap.get(
                String(
                  relationship.from ||
                  ""
                )
              );

            const to =
              visualMap.get(
                String(
                  relationship.to ||
                  ""
                )
              );

            if (!from || !to) {
              return null;
            }

            const fromPos =
              getVisualPosition(
                from
              );

            const toPos =
              getVisualPosition(
                to
              );

            return (
              <Connector
                key={`relationship-${index}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                color={
                  relationship.color ||
                  COLORS.purple
                }
                width={
                  Number(
                    relationship.width ??
                    4
                  )
                }
                start={
                  Number(
                    relationship.start ??
                    0
                  )
                }
                duration={
                  Number(
                    relationship.duration ??
                    0.8
                  )
                }
                dashed={
                  Boolean(
                    relationship.dashed
                  )
                }
              />
            );
          }
        )}
    </AbsoluteFill>
  );
}

/* =========================================================
   V2 VISUAL RESOLVER
========================================================= */

function renderVisual(
  visual,
  index
) {
  const key =
    visual.id ||
    `${visual.type}-${index}`;

  switch (
    visual.type
  ) {
    case "asset":
      return (
        <VisualAsset
          key={key}
          visual={visual}
        />
      );

    case "subject":
      return (
        <VisualSubject
          key={key}
          visual={visual}
        />
      );

    case "text":
      return (
        <VisualText
          key={key}
          visual={visual}
        />
      );

    case "counter":
    case "number":
      return (
        <VisualCounter
          key={key}
          visual={visual}
        />
      );

    case "diagram":
      return (
        <VisualDiagram
          key={key}
          visual={visual}
        />
      );

    case "compare":
      return (
        <VisualCompare
          key={key}
          visual={visual}
        />
      );

    case "spotlight":
      return (
        <VisualSpotlight
          key={key}
          visual={visual}
        />
      );

    case "transform":
      return (
        <VisualTransform
          key={key}
          visual={visual}
        />
      );

    default:
      return null;
  }
}

/* =========================================================
   MAIN
========================================================= */

export default function MotionRenderer({
  plan = {},
}) {
  const visuals =
    Array.isArray(
      plan.visuals
    )
      ? plan.visuals
      : [];

  const legacyElements =
    Array.isArray(
      plan.elements
    )
      ? plan.elements
      : [];

  const hasV2 =
    visuals.length > 0;

  return (
    <AbsoluteFill
      style={{
        background:
          plan.background ||
          "#070B14",
        overflow:
          "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(30,64,175,0.16), transparent 45%)",
        }}
      />

      <SceneCamera
        camera={
          plan.camera
        }
      >
        {hasV2
          ? visuals.map(
              renderVisual
            )
          : legacyElements.map(
              renderLegacyElement
            )}

        <VisualActionTimeline
          timeline={
            Array.isArray(
              plan.timeline
            )
              ? plan.timeline
              : []
          }
          relationships={
            Array.isArray(
              plan.relationships
            )
              ? plan.relationships
              : []
          }
          visuals={visuals}
        />
      </SceneCamera>
    </AbsoluteFill>
  );
}
