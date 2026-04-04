const fallbackSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#e5e7eb" />
    <rect x="120" y="120" width="960" height="435" rx="28" fill="#cbd5e1" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-size="42" font-weight="700">
      Image not added yet
    </text>
  </svg>
`);

export const fallbackImageUrl = `data:image/svg+xml;charset=UTF-8,${fallbackSvg}`;

export function resolveImageUrl(value) {
  return value || fallbackImageUrl;
}
