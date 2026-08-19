export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lt-grad" x1="4" y1="8" x2="60" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#lt-grad)" />
      <path
        d="M14 40C22 40 24 26 34 24C40.6667 22.6667 44.3333 24.3333 45 27"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="47" cy="19" r="3" fill="white" />
      <circle cx="52" cy="27" r="1.8" fill="white" fillOpacity="0.8" />
    </svg>
  );
}
