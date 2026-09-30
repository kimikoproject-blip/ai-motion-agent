import React from "react";

import {
  Audio,
  Sequence,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 30;

/* =========================================================
   DURATION
========================================================= */

export function getSceneDuration(scene) {
  const audioDuration =
    Number(
      scene.audio_duration_seconds
    );

  if (
    Number.isFinite(audioDuration) &&
    audioDuration > 0
  ) {
    return Math.ceil(
      (audioDuration + 0.25) * FPS
    );
  }

  const duration =
    Number(
      scene.duration_seconds
    );

  if (
    Number.isFinite(duration) &&
    duration > 0
  ) {
    return Math.ceil(
      duration * FPS
    );
  }

  return 5 * FPS;
}

/* =========================================================
   FOCUS
========================================================= */

function getFocusStyle(scene) {
  const box =
    scene.focus_bbox;

  if (!box) {
    return null;
  }

  return {
    left: `${box.x * 100}%`,
    top: `${box.y * 100}%`,
    width: `${box.width * 100}%`,
    height: `${box.height * 100}%`,
  };
}

/* =========================================================
   CAMERA
========================================================= */

function FocusCamera({
  scene,
  children,
}) {
  const frame =
    useCurrentFrame();

  const {
    width,
    height,
  } = useVideoConfig();

  const duration =
    getSceneDuration(scene);

  const progress =
    duration > 1
      ? frame / (duration - 1)
      : 0;

  const motion =
    scene.motion ||
    "none";

  const intensity =
    scene.motion_intensity ||
    "subtle";

  const strength =
    intensity === "strong"
      ? 1
      : intensity === "medium"
      ? 0.65
      : 0.35;

  /*
   * Gentle cinematic movement.
   * Jangan terlalu besar supaya gambar
   * tetap terasa sebagai satu composition.
   */

  let scale = 1.04;

  let x = 0;
  let y = 0;

  if (
    motion === "zoom_in"
  ) {
    scale =
      interpolate(
        progress,
        [0, 1],
        [
          1.02,
          1.10 +
            strength * 0.035,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  else if (
    motion === "zoom_out"
  ) {
    scale =
      interpolate(
        progress,
        [0, 1],
        [
          1.10 +
            strength * 0.035,
          1.02,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  else if (
    motion === "pan_left"
  ) {
    scale = 1.08;

    x =
      interpolate(
        progress,
        [0, 1],
        [
          20 * strength,
          -20 * strength,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  else if (
    motion === "pan_right"
  ) {
    scale = 1.08;

    x =
      interpolate(
        progress,
        [0, 1],
        [
          -20 * strength,
          20 * strength,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  else if (
    motion === "focus"
  ) {
    scale =
      interpolate(
        progress,
        [0, 1],
        [
          1.03,
          1.12 +
            strength * 0.025,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  else if (
    motion === "reveal"
  ) {
    scale =
      interpolate(
        progress,
        [0, 1],
        [
          1.12 +
            strength * 0.025,
          1.03,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );

    y =
      interpolate(
        progress,
        [0, 1],
        [
          18 * strength,
          -8 * strength,
        ],
        {
          extrapolateLeft:
            "clamp",
          extrapolateRight:
            "clamp",
        }
      );
  }

  /*
   * Subtle floating motion.
   *
   * Ini membuat scene tidak terasa
   * benar-benar freeze.
   */
  const floatX =
    Math.sin(
      frame * 0.018
    ) *
    3 *
    strength;

  const floatY =
    Math.sin(
      frame * 0.015
    ) *
    3 *
    strength;

  /*
   * Parallax kecil.
   *
   * Bukan efek 3D besar.
   * Tujuannya cuma memberi
   * depth pada illustration.
   */
  const parallaxX =
    Math.sin(
      frame * 0.011
    ) *
    5 *
    strength;

  const parallaxY =
    Math.cos(
      frame * 0.009
    ) *
    4 *
    strength;

  return (
    <div
      style={{
        position:
          "absolute",

        inset: 0,

        width,
        height,

        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          position:
            "absolute",

          inset:
            "-4%",

          width:
            "108%",

          height:
            "108%",

          transform:
            `translate3d(${x + floatX + parallaxX}px, ${y + floatY + parallaxY}px, 0) scale(${scale})`,

          transformOrigin:
            "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FocusPulse({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const focus =
    getFocusStyle(scene);

  if (!focus) {
    return null;
  }

  const start =
    spring({
      frame: Math.max(
        0,
        frame - 12
      ),
      fps: FPS,
      config: {
        damping: 16,
        stiffness: 110,
        mass: 0.55,
      },
    });

  const pulse =
    1 +
    Math.sin(
      frame * 0.18
    ) *
      0.025;

  const opacity =
    interpolate(
      start,
      [0, 0.3, 1],
      [0, 0.8, 0.35]
    );

  return (
    <div
      style={{
        position: "absolute",
        ...focus,
        transform:
          `scale(${pulse})`,
        transformOrigin:
          "center center",
        borderRadius: 32,
        border:
          "3px solid rgba(255,255,255,0.78)",
        boxShadow:
          "0 0 32px rgba(255,255,255,0.42)",
        opacity,
        pointerEvents:
          "none",
        boxSizing:
          "border-box",
      }}
    />
  );
}

/* =========================================================
   FOCUS HIGHLIGHT
========================================================= */

function FocusHighlight({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const focus =
    getFocusStyle(scene);

  if (!focus) {
    return null;
  }

  const progress =
    spring({
      frame: Math.max(
        0,
        frame - 18
      ),
      fps: FPS,
      config: {
        damping: 18,
        stiffness: 95,
        mass: 0.65,
      },
    });

  const opacity =
    interpolate(
      progress,
      [0, 1],
      [0, 0.24]
    );

  return (
    <div
      style={{
        position: "absolute",
        ...focus,
        background:
          "rgba(255,255,255,0.16)",
        borderRadius: 30,
        opacity,
        pointerEvents:
          "none",
        boxSizing:
          "border-box",
        boxShadow:
          "0 0 40px rgba(255,255,255,0.25)",
      }}
    />
  );
}

/* =========================================================
   FOCUS POP
========================================================= */

function FocusPop({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const focus =
    getFocusStyle(scene);

  if (!focus) {
    return null;
  }

  const progress =
    spring({
      frame: Math.max(
        0,
        frame - 5
      ),
      fps: FPS,
      config: {
        damping: 12,
        stiffness: 150,
        mass: 0.5,
      },
    });

  const scale =
    interpolate(
      progress,
      [0, 1],
      [0.82, 1]
    );

  const opacity =
    interpolate(
      progress,
      [0, 0.15, 1],
      [0, 1, 1]
    );

  return (
    <div
      style={{
        position: "absolute",
        ...focus,
        transform:
          `scale(${scale})`,
        transformOrigin:
          "center center",
        opacity,
        pointerEvents:
          "none",
        borderRadius: 30,
        boxSizing:
          "border-box",
      }}
    />
  );
}

/* =========================================================
   ATTENTION RING
========================================================= */

function AttentionRing({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const focus =
    getFocusStyle(scene);

  if (!focus) {
    return null;
  }

  const progress =
    spring({
      frame: Math.max(
        0,
        frame - 20
      ),
      fps: FPS,
      config: {
        damping: 16,
        stiffness: 90,
        mass: 0.6,
      },
    });

  const ringScale =
    interpolate(
      progress,
      [0, 1],
      [0.82, 1.1]
    );

  const opacity =
    interpolate(
      progress,
      [0, 0.25, 1],
      [0, 0.8, 0.28]
    );

  return (
    <div
      style={{
        position: "absolute",
        ...focus,
        transform:
          `scale(${ringScale})`,
        transformOrigin:
          "center center",
        borderRadius: 40,
        border:
          "2px solid rgba(255,255,255,0.35)",
        opacity,
        pointerEvents:
          "none",
        boxSizing:
          "border-box",
      }}
    />
  );
}

/* =========================================================
   SEMANTIC MOTION
========================================================= */

function resolveAnimation(scene) {
  if (scene.animation) {
    return scene.animation;
  }

  const type =
    scene.visual_type ||
    "";

  if (
    type === "PROCESS"
  ) {
    return "flow";
  }

  if (
    type === "SIMPLE_ANATOMY"
  ) {
    return "pulse";
  }

  if (
    type === "CHARACTER_FACT"
  ) {
    return "breathe";
  }

  if (
    type === "COMPARISON"
  ) {
    return "highlight";
  }

  if (
    type === "MAP_LOCATION"
  ) {
    return "highlight";
  }

  if (
    type === "OBJECT_EXPLANATION"
  ) {
    return "pop";
  }

  return "none";
}

function SemanticMotion({
  scene,
}) {
  const animation =
    resolveAnimation(
      scene
    );

  if (
    animation === "pulse"
  ) {
    return (
      <FocusPulse
        scene={scene}
      />
    );
  }

  if (
    animation === "highlight"
  ) {
    return (
      <>
        <FocusHighlight
          scene={scene}
        />

        <AttentionRing
          scene={scene}
        />
      </>
    );
  }

  if (
    animation === "pop"
  ) {
    return (
      <FocusPop
        scene={scene}
      />
    );
  }

  if (
    animation === "reveal"
  ) {
    return (
      <>
        <FocusHighlight
          scene={scene}
        />

        <AttentionRing
          scene={scene}
        />
      </>
    );
  }

  if (
    animation === "breathe"
  ) {
    return (
      <AttentionRing
        scene={scene}
      />
    );
  }

  return null;
}

/* =========================================================
   HEADLINE
========================================================= */

function SceneHeadline({
  scene,
  duration,
}) {
  const frame =
    useCurrentFrame();

  const text =
    scene.overlay_text;

  if (!text) {
    return null;
  }

  const enter =
    spring({
      frame,
      fps: FPS,
      config: {
        damping: 18,
        stiffness: 120,
        mass: 0.6,
      },
    });

  const opacity =
    interpolate(
      enter,
      [0, 1],
      [0, 1]
    );

  const translateY =
    interpolate(
      enter,
      [0, 1],
      [30, 0]
    );

  const exit =
    interpolate(
      frame,
      [
        Math.max(
          0,
          duration - 15
        ),
        duration,
      ],
      [1, 0],
      {
        extrapolateLeft:
          "clamp",
        extrapolateRight:
          "clamp",
      }
    );

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 105,
        textAlign:
          "center",
        opacity:
          opacity * exit,
        transform:
          `translateY(${translateY}px)`,
        fontFamily:
          "Arial, sans-serif",
        fontWeight: 900,
        fontSize: 82,
        lineHeight: 0.95,
        letterSpacing: -2,
        color: "white",
        textShadow:
          "0 5px 18px rgba(0,0,0,0.4)",
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
}

/* =========================================================
   CAPTION
========================================================= */

function SceneCaption({
  scene,
  duration,
}) {
  const frame =
    useCurrentFrame();

  if (
    !scene.caption
  ) {
    return null;
  }

  const opacity =
    interpolate(
      frame,
      [0, 10, 20],
      [0, 0.7, 1],
      {
        extrapolateLeft:
          "clamp",
        extrapolateRight:
          "clamp",
      }
    );

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 95,
        padding:
          "18px 24px",
        borderRadius: 24,
        background:
          "rgba(0,0,0,0.42)",
        backdropFilter:
          "blur(10px)",
        color: "white",
        fontFamily:
          "Arial, sans-serif",
        fontSize: 34,
        fontWeight: 700,
        lineHeight: 1.2,
        textAlign:
          "center",
        opacity,
        zIndex: 20,
      }}
    >
      {scene.caption}
    </div>
  );
}

/* =========================================================
   CALLOUT
========================================================= */

function SceneCallout({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const focus =
    getFocusStyle(scene);

  if (
    !focus ||
    !scene.emphasis
  ) {
    return null;
  }

  const progress =
    spring({
      frame: Math.max(
        0,
        frame - 14
      ),
      fps: FPS,
      config: {
        damping: 16,
        stiffness: 110,
        mass: 0.55,
      },
    });

  const opacity =
    interpolate(
      progress,
      [0, 0.35, 1],
      [0, 1, 1]
    );

  const scale =
    interpolate(
      progress,
      [0, 1],
      [0.82, 1]
    );

  /*
   * Tentukan sisi callout
   * berdasarkan posisi focus.
   */
  const focusX =
    Number(
      scene.focus_bbox?.x ||
      0.5
    );

  const focusY =
    Number(
      scene.focus_bbox?.y ||
      0.5
    );

  const placeLeft =
    focusX > 0.55;

  const labelWidth = 360;

  const labelLeft =
    placeLeft
      ? "5%"
      : "66%";

  const labelTop =
    focusY > 0.62
      ? "18%"
      : "68%";

  const lineStartX =
    placeLeft
      ? "41%"
      : "64%";

  const lineEndX =
    placeLeft
      ? `${focusX * 100}%`
      : `${focusX * 100}%`;

  const lineY =
    `${Math.min(
      92,
      Math.max(
        12,
        (focusY +
          focusY +
          0.05) *
          50
      )
    )}%`;

  return (
    <>
      {/* connector */}
      <div
        style={{
          position:
            "absolute",
          left:
            lineStartX,
          top:
            lineY,
          width:
            "18%",
          height:
            3,
          background:
            "rgba(255,255,255,0.82)",
          transformOrigin:
            placeLeft
              ? "right center"
              : "left center",
          transform:
            placeLeft
              ? "rotate(-12deg)"
              : "rotate(12deg)",
          opacity,
          zIndex: 30,
        }}
      />

      {/* arrow head */}
      <div
        style={{
          position:
            "absolute",
          left:
            lineEndX,
          top:
            lineY,
          width:
            12,
          height:
            12,
          borderTop:
            "3px solid white",
          borderRight:
            "3px solid white",
          transform:
            placeLeft
              ? "rotate(-135deg)"
              : "rotate(45deg)",
          opacity,
          zIndex: 31,
        }}
      />

      {/* label */}
      <div
        style={{
          position:
            "absolute",
          left:
            labelLeft,
          top:
            labelTop,
          width:
            labelWidth,
          padding:
            "16px 20px",
          borderRadius:
            18,
          background:
            "rgba(10,10,10,0.72)",
          border:
            "2px solid rgba(255,255,255,0.7)",
          color:
            "white",
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            28,
          fontWeight:
            800,
          lineHeight:
            1.1,
          textAlign:
            "center",
          opacity,
          transform:
            `scale(${scale})`,
          transformOrigin:
            "center center",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.3)",
          zIndex: 30,
        }}
      >
        {scene.emphasis}
      </div>
    </>
  );
}

/* =========================================================
   KINETIC TEXT
========================================================= */

function KineticText({
  scene,
}) {
  const frame =
    useCurrentFrame();

  const beats =
    Array.isArray(
      scene.text_beats
    )
      ? scene.text_beats
      : [];

  if (!beats.length) {
    return null;
  }

  const time =
    frame / FPS;

  return (
    <>
      {beats.map(
        (beat, index) => {
          const start =
            Number(
              beat?.start
            ) || 0;

          const duration =
            Number(
              beat?.duration
            ) || 1;

          if (
            time < start ||
            time > start + duration
          ) {
            return null;
          }

          const localFrame =
            Math.max(
              0,
              Math.round(
                (time - start) *
                  FPS
              )
            );

          const style =
            beat?.style ||
            "normal";

          const enter =
            spring({
              frame:
                localFrame,
              fps: FPS,
              config: {
                damping: 14,
                stiffness: 150,
                mass: 0.5,
              },
            });

          let fontSize = 52;
          let bottom = 150;
          let translateY = 28;
          let scale = 1;
          let rotate = 0;

          let background =
            "rgba(0,0,0,0.48)";

          let padding =
            "12px 22px";

          let radius = 18;

          let letterSpacing = -1;

          /*
           * QUESTION
           *
           * Hook:
           * besar, naik dari bawah,
           * sedikit rotate.
           */
          if (
            style === "question"
          ) {
            fontSize = 68;
            bottom = 240;

            translateY =
              interpolate(
                enter,
                [0, 0.65, 1],
                [80, -4, 0]
              );

            scale =
              interpolate(
                enter,
                [0, 0.55, 1],
                [0.72, 1.08, 1]
              );

            rotate =
              interpolate(
                enter,
                [0, 0.5, 1],
                [-3, 1, 0]
              );

            background =
              "rgba(20,20,20,0.68)";

            padding =
              "18px 30px";

            radius = 26;

            letterSpacing = -1.5;
          }

          /*
           * NUMBER
           *
           * Punch:
           * paling besar dan paling kuat.
           */
          else if (
            style === "number"
          ) {
            fontSize = 112;
            bottom = 285;

            translateY =
              interpolate(
                enter,
                [0, 0.35, 0.7, 1],
                [70, -8, 3, 0]
              );

            scale =
              interpolate(
                enter,
                [0, 0.35, 0.65, 1],
                [0.45, 1.2, 0.94, 1]
              );

            rotate =
              interpolate(
                enter,
                [0, 0.45, 1],
                [-4, 1.5, 0]
              );

            background =
              "rgba(0,0,0,0.76)";

            padding =
              "12px 34px";

            radius = 30;

            letterSpacing = -4;
          }

          /*
           * EMPHASIS
           *
           * Fakta penting:
           * lebih clean, tidak sebesar number.
           */
          else if (
            style === "emphasis"
          ) {
            fontSize = 72;
            bottom = 205;

            translateY =
              interpolate(
                enter,
                [0, 0.7, 1],
                [42, -2, 0]
              );

            scale =
              interpolate(
                enter,
                [0, 0.6, 1],
                [0.76, 1.05, 1]
              );

            background =
              "rgba(255,255,255,0.16)";

            padding =
              "15px 28px";

            radius = 24;

            letterSpacing = -1.8;
          }

          /*
           * NORMAL
           *
           * Informasi pendukung.
           */
          else {
            fontSize = 50;
            bottom = 165;

            translateY =
              interpolate(
                enter,
                [0, 1],
                [30, 0]
              );

            scale =
              interpolate(
                enter,
                [0, 1],
                [0.92, 1]
              );

            background =
              "rgba(0,0,0,0.46)";

            padding =
              "10px 20px";

            radius = 18;
          }

          /*
           * Sedikit idle motion
           * setelah entrance selesai.
           */
          const idle =
            style === "number"
              ? Math.sin(
                  localFrame *
                    0.18
                ) * 0.012
              : style === "emphasis"
              ? Math.sin(
                  localFrame *
                    0.14
                ) * 0.007
              : 0;

          scale *=
            1 + idle;

          const opacity =
            interpolate(
              enter,
              [0, 0.25, 1],
              [0, 1, 1]
            );

          return (
            <div
              key={
                `${index}-${beat.text}`
              }
              style={{
                position:
                  "absolute",

                left: 50,
                right: 50,

                bottom,

                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                zIndex: 50,

                pointerEvents:
                  "none",
              }}
            >
              <div
                style={{
                  padding,

                  borderRadius:
                    radius,

                  background,

                  color:
                    "white",

                  fontFamily:
                    "Arial, sans-serif",

                  fontWeight:
                    900,

                  fontSize,

                  lineHeight:
                    0.95,

                  letterSpacing,

                  textAlign:
                    "center",

                  maxWidth:
                    "92%",

                  opacity,

                  transform:
                    `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,

                  transformOrigin:
                    "center center",

                  textShadow:
                    "0 6px 18px rgba(0,0,0,0.45)",

                  boxShadow:
                    style ===
                    "number"
                      ? "0 12px 35px rgba(0,0,0,0.28)"
                      : "none",
                }}
              >
                {beat.text}
              </div>
            </div>
          );
        }
      )}
    </>
  );
}

/* =========================================================
   SCENE
========================================================= */



function SingleScene({
  scene,
  duration,
  imageResolver,
}) {
  const imageSrc =
    imageResolver(scene);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "#111",
        overflow: "hidden",
      }}
    >
      <FocusCamera
        scene={scene}
      >
        <Img
          src={imageSrc}
          style={{
            position:
              "absolute",
            width: "100%",
            height: "100%",
            objectFit:
              "cover",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.18), transparent 30%, transparent 65%, rgba(0,0,0,0.28))",
            pointerEvents:
              "none",
          }}
        />

        <SemanticMotion
          scene={scene}
        />
      </FocusCamera>

      <SceneHeadline
        scene={scene}
        duration={duration}
      />

      <SceneCaption
        scene={scene}
        duration={duration}
      />

      <SceneCallout
        scene={scene}
      />

      <KineticText
        scene={scene}
      />

      {scene.audio_path && (
        <Audio
          src={staticFile(
            scene.audio_path
          )}
        />
      )}
    </div>
  );
}

/* =========================================================
   SEQUENCE
========================================================= */

export function SceneSequence({
  scenes,
  imageResolver,
}) {
  let startFrame = 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "black",
      }}
    >
      {scenes.map(
        (scene) => {
          const duration =
            getSceneDuration(
              scene
            );

          const currentStart =
            startFrame;

          startFrame +=
            duration;

          return (
            <Sequence
              key={
                scene.scene_id
              }
              from={
                currentStart
              }
              durationInFrames={
                duration
              }
            >
              <SingleScene
                scene={scene}
                duration={
                  duration
                }
                imageResolver={
                  imageResolver
                }
              />
            </Sequence>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   TOTAL DURATION
========================================================= */

export function totalDuration(
  scenes
) {
  return scenes.reduce(
    (
      total,
      scene
    ) =>
      total +
      getSceneDuration(
        scene
      ),
    0
  );
}
