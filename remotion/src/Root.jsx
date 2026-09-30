import React from "react";

import {
  Composition,
  staticFile,
} from "remotion";

import scenesData from "../data/scenes.json";

import {
  SceneSequence,
  totalDuration,
} from "../../motion/SceneSequence";

const scenes =
  scenesData.scenes;

function imageResolver(
  scene
) {
  if (
    !scene.image_hash
  ) {
    throw new Error(
      `Scene ${scene.scene_id} belum memiliki image_hash`
    );
  }

  const number =
    String(
      scene.scene_id
    ).padStart(
      2,
      "0"
    );

  return staticFile(
    `scenes/scene-${number}-${scene.image_hash}.png`
  );
}

function MotionVideo() {
  return (
    <SceneSequence
      scenes={scenes}
      imageResolver={
        imageResolver
      }
    />
  );
}

export const RemotionRoot =
  () => {
    return (
      <Composition
        id="AutoMotionShort"
        component={
          MotionVideo
        }
        durationInFrames={
          totalDuration(
            scenes
          )
        }
        fps={30}
        width={1080}
        height={1920}
      />
    );
  };
