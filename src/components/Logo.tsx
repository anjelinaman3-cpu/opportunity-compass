/** SkillScout mark: a minimal line-art student reading a book. */
export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="SkillScout logo: a student reading a book"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* head */}
      <circle cx="24" cy="13" r="5.5" />
      {/* hair / bun */}
      <path d="M18.6 11.2c1.6-3.4 9.2-3.4 10.8 0" />
      <path d="M30.5 8.4a2.6 2.6 0 1 0-3.4-2.2" />
      {/* shoulders */}
      <path d="M15.5 26.5c1.4-3.6 4.7-5.8 8.5-5.8s7.1 2.2 8.5 5.8" />
      {/* open book */}
      <path d="M24 29.6c-2.6-1.9-5.9-2.7-9.5-2.4v11.2c3.6-.3 6.9.5 9.5 2.4 2.6-1.9 5.9-2.7 9.5-2.4V27.2c-3.6-.3-6.9.5-9.5 2.4Z" />
      <path d="M24 29.6v11.2" />
    </svg>
  );
}
