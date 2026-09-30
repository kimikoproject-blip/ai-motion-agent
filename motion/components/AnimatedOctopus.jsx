import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TENTACLES = [
  {
    rotate: -68,
    length: 250,
    delay: 0,
    bend: -22,
  },
  {
    rotate: -48,
    length: 280,
    delay: 4,
    bend: 18,
  },
  {
    rotate: -28,
    length: 300,
    delay: 8,
    bend: -15,
  },
  {
    rotate: -8,
    length: 270,
    delay: 12,
    bend: 20,
  },
  {
    rotate: 8,
    length: 270,
    delay: 2,
    bend: -20,
  },
  {
    rotate: 28,
    length: 300,
    delay: 6,
    bend: 16,
  },
  {
    rotate: 48,
    length: 280,
    delay: 10,
    bend: -18,
  },
  {
    rotate: 68,
    length: 250,
    delay: 14,
    bend: 22,
  },
];

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function Tentacle({
  rotate,
  length,
  delay,
  bend,
  frame,
  entrance,
}) {
  const wave =
    Math.sin(
      (frame + delay) / 12
    ) * 7;

  const wave2 =
    Math.sin(
      (frame + delay) / 20
    ) * 5;

  const scaleY =
    0.75 + entrance * 0.25;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "58%",
        width: length,
        height: 76,
        transformOrigin:
          "0% 50%",
        transform: `
          translate(-6%, -50%)
          rotate(${rotate + wave}deg)
          skewY(${bend + wave2}deg)
          scaleY(${scaleY})
          scaleX(${entrance})
        `,
        opacity: entrance,
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius:
            "999px 55% 55% 999px",
          background:
            "linear-gradient(90deg, #B92F87 0%, #D946A6 45%, #F06BC1 100%)",
          boxShadow:
            "0 14px 35px rgba(217,70,166,0.22)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "10%",
          top: "25%",
          width: "78%",
          height: "22%",
          borderRadius: 999,
          background:
            "rgba(255,255,255,0.18)",
          filter:
            "blur(4px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 18,
          top: 24,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background:
            "rgba(255,210,240,0.55)",
          boxShadow:
            "0 0 12px rgba(255,210,240,0.35)",
        }}
      />
    </div>
  );
}

export default function AnimatedOctopus({
  x = 50,
  y = 48,
  scale = 1,
}) {
  const frame =
    useCurrentFrame();

  const { fps } =
    useVideoConfig();

  const entrance =
    spring({
      frame,
      fps,
      config: {
        damping: 14,
        stiffness: 90,
        mass: 0.8,
      },
    });

  const breathing =
    1 +
    Math.sin(
      frame / 16
    ) *
      0.025;

  const float =
    Math.sin(
      frame / 20
    ) *
      10;

  const tilt =
    Math.sin(
      frame / 34
    ) *
      1.8;

  const glow =
    0.65 +
    Math.sin(
      frame / 13
    ) *
      0.15;

  const bodyScale =
    interpolate(
      clamp(entrance),
      [0, 1],
      [0.72, 1]
    );

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 620,
        height: 650,
        transform: `
          translate(-50%, -50%)
          translateY(${float}px)
          rotate(${tilt}deg)
          scale(${bodyScale * scale * breathing})
        `,
        transformOrigin:
          "center center",
        opacity: entrance,
        zIndex: 20,
        filter: `
          drop-shadow(
            0 25px 45px
            rgba(217,70,166,0.28)
          )
        `,
      }}
    >
      {/* Aura */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: 500,
          height: 500,
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            `radial-gradient(
              circle,
              rgba(217,70,166,${glow * 0.22}),
              rgba(56,189,248,0.04) 45%,
              transparent 72%
            )`,
          filter:
            "blur(25px)",
        }}
      />

      {/* Tentacles */}
      {TENTACLES.map(
        (tentacle, index) => (
          <Tentacle
            key={index}
            {...tentacle}
            frame={frame}
            entrance={entrance}
          />
        )
      )}

      {/* Body */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "35%",
          width: 330,
          height: 310,
          transform:
            "translate(-50%, -50%)",
          borderRadius:
            "48% 48% 43% 43%",
          background:
            "radial-gradient(circle at 35% 25%, #F06BC1 0%, #D946A6 32%, #A92878 70%, #701B54 100%)",
          boxShadow:
            `
              inset -28px -35px 60px
              rgba(65,8,48,0.35),
              inset 22px 20px 35px
              rgba(255,170,225,0.16),
              0 0 45px
              rgba(217,70,166,${glow * 0.55})
            `,
          zIndex: 5,
        }}
      >
        {/* Head highlight */}
        <div
          style={{
            position: "absolute",
            left: 65,
            top: 45,
            width: 115,
            height: 55,
            borderRadius:
              "50%",
            background:
              "rgba(255,220,245,0.20)",
            transform:
              "rotate(-18deg)",
            filter:
              "blur(5px)",
          }}
        />

        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "47%",
            display: "flex",
            gap: 55,
            transform:
              "translate(-50%, -50%)",
          }}
        >
          {[0, 1].map(
            (eye) => (
              <div
                key={eye}
                style={{
                  width: 54,
                  height: 70,
                  borderRadius:
                    "50%",
                  background:
                    "#FFF7FC",
                  border:
                    "5px solid #701B54",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  boxShadow:
                    "0 8px 20px rgba(50,0,30,0.28)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 38,
                    borderRadius:
                      "50%",
                    background:
                      "#160914",
                    transform:
                      `translateY(${
                        Math.sin(
                          frame / 22
                        ) * 2
                      }px)`,
                  }}
                />
              </div>
            )
          )}
        </div>

        {/* Face */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "69%",
            width: 58,
            height: 26,
            transform:
              "translateX(-50%)",
            borderBottom:
              "6px solid rgba(70,10,50,0.65)",
            borderRadius:
              "0 0 50px 50px",
          }}
        />
      </div>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4, 5].map(
        (particle) => {
          const angle =
            particle *
              60 +
            frame * 0.45;

          const radius =
            255 +
            Math.sin(
              frame / 14 +
                particle
            ) *
              18;

          const px =
            50 +
            Math.cos(
              angle *
                (Math.PI / 180)
            ) *
              (radius / 6.2);

          const py =
            45 +
            Math.sin(
              angle *
                (Math.PI / 180)
            ) *
              (radius / 7.2);

          return (
            <div
              key={`particle-${particle}`}
              style={{
                position:
                  "absolute",
                left: `${px}%`,
                top: `${py}%`,
                width:
                  particle % 2
                    ? 9
                    : 13,
                height:
                  particle % 2
                    ? 9
                    : 13,
                borderRadius:
                  "50%",
                background:
                  particle % 2
                    ? "#38BDF8"
                    : "#F06BC1",
                opacity:
                  0.35 +
                  Math.sin(
                    frame / 8 +
                      particle
                  ) *
                    0.15,
                boxShadow:
                  "0 0 16px currentColor",
              }}
            />
          );
        }
      )}
    </div>
  );
}
