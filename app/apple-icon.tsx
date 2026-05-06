import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5EFE6",
        }}
      >
        <svg viewBox="0 0 48 48" width={140} height={140}>
          <path
            d="M24 8 C 29 14, 36 18, 36 27 C 36 34, 30 40, 24 40 C 18 40, 12 34, 12 27 C 12 21, 15 19, 17 16 C 18 18, 20 19, 21 16 C 22 13, 23 11, 24 8 Z"
            fill="#1A1614"
          />
          <path
            d="M24 19 C 27 22, 29 25, 29 29 C 29 32, 27 34, 24 34 C 21 34, 19 32, 19 29 C 19 27, 21 25, 22 23 C 22 24, 23 24, 24 23 Z"
            fill="#F5EFE6"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
