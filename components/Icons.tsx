import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function TicketIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={28} height={28} {...base} {...props}>
      <path d="M3 9.5V7h22v2.5a2.5 2.5 0 0 0 0 5V21H3v-6.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="M10 10v8M17.5 10v8" strokeDasharray="2 3" />
    </svg>
  );
}

export function TicketStarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={28} height={28} {...base} {...props}>
      <path d="M4 9.5V7h20v2.5a2.5 2.5 0 0 0 0 5V21H4v-6.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="m14 11 1.5 3.1 3.4.5-2.45 2.4.58 3.4L14 18.8l-3.03 1.6.58-3.4L9.1 14.6l3.4-.5Z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={28} height={28} {...base} {...props}>
      <circle cx="14" cy="14" r="10" />
      <path d="M14 8.5V14l3.8 2.4" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={28} height={28} {...base} {...props}>
      <path d="M14 25s7.5-7.2 7.5-12.4A7.5 7.5 0 0 0 6.5 12.6C6.5 17.8 14 25 14 25Z" />
      <circle cx="14" cy="12.4" r="2.9" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={20} height={20} {...base} {...props}>
      <path d="M9.6 4.8 12 9l-2.1 2.3a13.4 13.4 0 0 0 6.8 6.8L19 16l4.2 2.4-.6 3a2.2 2.2 0 0 1-2.4 1.8C12.4 22.4 5.6 15.6 4.8 7.8A2.2 2.2 0 0 1 6.6 5.4Z" />
    </svg>
  );
}

export function RouteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={20} height={20} {...base} {...props}>
      <path d="M7 23c0-6.6 14-3.4 14-10a4 4 0 0 0-8 0c0 5 7 9 7 9" />
      <circle cx="7" cy="23" r="1.9" />
      <circle cx="17" cy="6.6" r="2.4" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={20} height={20} {...base} {...props}>
      <circle cx="14" cy="14" r="9.5" />
      <path d="M4.5 14h19M14 4.5c2.6 2.7 4 6 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-6-4-9.5s1.4-6.8 4-9.5Z" />
    </svg>
  );
}

export function VkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={20} height={20} aria-hidden focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M15.1 20.4c-6 0-9.7-4.2-9.8-11.1h3c.1 5.1 2.4 7.3 4.1 7.7V9.3h2.9v4.3c1.7-.2 3.5-2.2 4.1-4.3h2.8a8.3 8.3 0 0 1-3.7 5.4 8.6 8.6 0 0 1 4.3 5.7h-3.1c-.6-2-2.2-3.5-4.4-3.7v3.7Z"
      />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={20} height={20} {...base} {...props}>
      <rect x="4.5" y="6.5" width="19" height="17" rx="1" />
      <path d="M4.5 11.5h19M9.5 4v5M18.5 4v5" />
    </svg>
  );
}

/* --- иконки услуг (в стиле референса: тонкий контур, бронза) --- */

export function SteamIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={24} height={24} {...base} {...props}>
      <path d="M8 18c0-2.2 2.6-2.6 2.6-4.8S8 9.6 8 7.4" />
      <path d="M14 18c0-2.2 2.6-2.6 2.6-4.8S14 9.6 14 7.4" />
      <path d="M20 18c0-2.2 2.6-2.6 2.6-4.8" />
      <path d="M5 22h18" opacity=".55" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={24} height={24} {...base} {...props}>
      <path d="M6 22C4.5 15.5 8.5 6.5 22 5c1.2 11.5-5.5 16.5-12 15.4" />
      <path d="M6.5 21.5C10 17 14.5 13.5 19 11.5" />
    </svg>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={24} height={24} {...base} {...props}>
      <path d="M14 4.5c3.6 4.3 6.4 8 6.4 11.2a6.4 6.4 0 1 1-12.8 0c0-3.2 2.8-6.9 6.4-11.2Z" />
    </svg>
  );
}

export function HandsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={24} height={24} {...base} {...props}>
      <path d="M11.4 23c-2.6-1.6-4.3-3.9-4.9-7-.4-2.2.1-3.4 1.3-3.6 1-.2 1.8.6 2.3 2.3l.6-9.2c.1-1.3.7-2 1.7-1.9 1 0 1.5.8 1.5 2.1" />
      <path d="M16.6 23c2.6-1.6 4.3-3.9 4.9-7 .4-2.2-.1-3.4-1.3-3.6-1-.2-1.8.6-2.3 2.3l-.6-9.2c-.1-1.3-.7-2-1.7-1.9-1 0-1.5.8-1.5 2.1v8" />
    </svg>
  );
}

export function MugIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" width={24} height={24} {...base} {...props}>
      <path d="M6.5 9h11v13a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2Z" />
      <path d="M17.5 11.5H21a2.5 2.5 0 0 1 0 5h-3.5" />
      <path d="M6.5 9c0-2 1.6-2.6 2.6-2.2.4-1.6 2.6-2 3.4-.7.9-1.3 3-1 3.4.6 1.2-.3 2.6.4 2.6 2.3" />
    </svg>
  );
}

const serviceIcons = {
  steam: SteamIcon,
  leaf: LeafIcon,
  drop: DropIcon,
  hands: HandsIcon,
  mug: MugIcon,
} as const;

export type ServiceIconName = keyof typeof serviceIcons;

export function ServiceIcon({ name, ...props }: IconProps & { name: ServiceIconName }) {
  const Component = serviceIcons[name];
  return <Component {...props} />;
}

/* --- знак бани: печь-каменка с дымком --- */

export function BanyaMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width={40} height={40} aria-hidden focusable="false" {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 11c0-2 2-2.6 2-4.6M24 10c0-2 2-2.6 2-4.6M31 11c0-2 2-2.6 2-4.6" opacity=".8" />
        <path d="M12 20h24v20H12z" />
        <path d="M10 20l14-6 14 6" strokeLinejoin="round" />
        <path d="M17 27h14v9H17z" />
        <path d="M20 36c0-3 1.2-4 2-5.4.8 1.4 2 2.4 2 5.4" opacity=".9" />
        <path d="M25.5 36c0-2.4.9-3.2 1.6-4.3.6 1.1 1.4 1.9 1.4 4.3" opacity=".7" />
        <path d="M12 40h24" />
      </g>
    </svg>
  );
}
