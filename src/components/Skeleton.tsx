export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-card shimmer ${className}`}
      style={{
        background: `linear-gradient(90deg, rgba(0,212,170,0.05) 25%, rgba(0,212,170,0.02) 50%, rgba(0,212,170,0.05) 75%)`,
        backgroundSize: "200% 100%",
      }}
    />
  );
}
