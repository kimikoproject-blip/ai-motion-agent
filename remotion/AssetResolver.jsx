import React from "react";

import bloodDropBlue from "./assets/generated/blood-drop-blue.png";
import brainNode from "./assets/generated/brain-node.png";
import heartOrgan from "./assets/generated/heart-organ.png";
import metalRing from "./assets/generated/metal-ring.png";
import octopusCharacter from "./assets/generated/octopus-character.png";
import skinCell from "./assets/generated/skin-cell.png";

const generatedAssets = {
  "blood-drop-blue": bloodDropBlue,
  "brain-node": brainNode,
  "heart-organ": heartOrgan,
  "metal-ring": metalRing,
  "octopus-character": octopusCharacter,
  "skin-cell": skinCell,
};

function normalizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.(png|jpg|jpeg|webp)$/i, "")
    .replace(/[^a-z0-9-_]+/g, "-");
}

export function resolveAsset(assetId) {
  if (!assetId) return null;

  const normalized = normalizeId(assetId);

  return generatedAssets[normalized] || null;
}

export function AssetImage({ assetId, ...props }) {
  const src = resolveAsset(assetId);

  if (!src) {
    console.warn(`⚠️ Asset tidak ditemukan: ${assetId}`);
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      {...props}
    />
  );
}
