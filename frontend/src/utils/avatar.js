import React from "react";
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

export default function Avatar({ username, size = 40 }) {
  // Generate the SVG string avatar based on username seed
  const svg = createAvatar(adventurerNeutral, { seed: username }).toString();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-block",
      }}
      // Inject raw SVG into the div
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
