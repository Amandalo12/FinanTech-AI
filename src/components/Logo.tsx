import { useId } from "react";

export function Logo({ size = 32 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <g fill="#F8FAFC">
        <rect x="6.5" y="13" width="3" height="7" rx="1" />
        <rect x="14.5" y="9" width="3" height="10" rx="1" />
        <rect x="22.5" y="11" width="3" height="8" rx="1" />
      </g>
      <path
        d="M8 9v3M8 21v2M16 6v2M16 20v4M24 8v2M24 20v3"
        stroke="#F8FAFC"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
