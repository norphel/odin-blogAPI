export default function generateSVG(initials) {
  const backgroundColors = [
    "#2596BE",
    "#00FF62",
    "#FF6300",
    "#FF0000",
    "#8040F7",
    "#FB00FF",
    "#FF00A1",
  ];

  const randomBackgroundColor =
    backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

  const svg = `
      <svg width="100" height="100" style="background-color: ${randomBackgroundColor};">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-weight="bold" font-size="24" fill="white">
          ${initials}
        </text>
      </svg>
    `;

  return svg;
}
