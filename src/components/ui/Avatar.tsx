"use client";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

const colors = [
  "bg-primary-500",
  "bg-success-500",
  "bg-warning-500",
  "bg-danger-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500",
];

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

export default function Avatar({ name, src, className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = colors[getColorIndex(name)];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`w-10 h-10 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
}