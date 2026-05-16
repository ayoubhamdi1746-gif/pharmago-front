"use client";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div dir="ltr">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 60"
        fill="none"
        className={className}
      >
      <style>{`
        @keyframes pillPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes textReveal {
          0% { transform: translateX(-66px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes subFade {
          0% { opacity: 0; }
          100% { opacity: 0.6; }
        }
        @keyframes arrowPop {
          0% { transform: scale(0) translate(22px, 6px); opacity: 0; }
          60% { transform: scale(1.1) translate(22px, 6px); opacity: 1; }
          100% { transform: scale(1) translate(22px, 6px); opacity: 1; }
        }
        .p-a { animation: pillPop 0.3s ease-out forwards; transform-origin: 44px 30px; }
        .t-a { animation: textReveal 0.5s ease-out 0.2s forwards; opacity: 0; }
        .s-a { animation: subFade 0.3s ease-out 0.7s forwards; opacity: 0; }
        .w-a { animation: arrowPop 0.4s ease-out 0.1s forwards; opacity: 0; transform-origin: 22px 6px; }
      `}</style>
      <g className="t-a">
        <text x="110" y="34" fontFamily="Inter,system-ui,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1.2" fill="#FFFFFF">PHARMA<tspan fill="#00D4AA">&#183;</tspan>GO</text>
      </g>
      <g className="s-a">
        <text x="110" y="54" fontFamily="Inter,system-ui,sans-serif" fontSize="10" fontWeight="500" letterSpacing="1.2" fill="rgba(255,255,255,0.6)">PHARMACEUTICAL DELIVERY SECURED</text>
      </g>
      <g className="p-a">
        <path d="M 44 6 L 32 6 A 24 24 0 0 0 8 30 A 24 24 0 0 0 32 54 L 44 54 Z" fill="#00D4AA"/>
        <path d="M 44 6 L 56 6 A 24 24 0 0 1 80 30 A 24 24 0 0 1 56 54 L 44 54 Z" fill="#FFFFFF"/>
      </g>
      <g className="w-a">
        <path d="M 44 -4 Q 82 -4 88 16" stroke="#00D4AA" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M 88 16 L 78 11 M 88 16 L 78 21" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </g>
      </svg>
    </div>
  );
}
