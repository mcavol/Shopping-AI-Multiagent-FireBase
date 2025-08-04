import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10c0 1.234-.23 2.42-.65 3.5" />
      <path d="M15.5 8.5c-1 .66-2.5 2-2.5 3.5s1.5 2.84 2.5 3.5" />
      <path d="M12 16c-1 .66-2.5 2-2.5 3.5s1.5 2.84 2.5 3.5" />
      <path d="M12 8c1-.66 2.5-2 2.5-3.5S13.5.84 12.5 0" />
      <path d="M5 22s4.5-2.5 6-5" />
      <path d="m14 13-1-5 1-1" />
      <path d="m18 13-1-5 1-1" />
      <path d="m2 11 1 5 1-1" />
      <path d="m6 11 1 5 1-1" />
      <path d="M14 13h4l2 5h-4Z" />
      <path d="M2 11h4l2 5H2Z" />
    </svg>
  ),
};
