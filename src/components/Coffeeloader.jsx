import React from "react";

/**
 * CoffeeLoader — spinner temático para toda la app
 *
 * Props:
 *   variant  → "cup" | "pour" | "grinder"   (default: "cup")
 *   message  → string (default según variante)
 *   size     → "sm" | "md" | "lg"            (default: "md")
 */

const messages = {
  cup:     "Procesando tu pedido...",
  pour:    "Cargando...",
  grinder: "Cargando...",
};

/* ─── Variante 1: Taza llenándose ─── */
function CupLoader() {
  return (
    <svg width="110" height="130" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 36 Q28 26 32 16 Q36 6 32 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M32 36 Q28 26 32 16 Q36 6 32 0;M32 36 Q36 26 32 16 Q28 6 32 0;M32 36 Q28 26 32 16 Q36 6 32 0"
          dur="2s" begin="0s" repeatCount="indefinite" />
      </path>
      <path d="M50 36 Q46 24 50 14 Q54 4 50 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M50 36 Q46 24 50 14 Q54 4 50 0;M50 36 Q54 24 50 14 Q46 4 50 0;M50 36 Q46 24 50 14 Q54 4 50 0"
          dur="2s" begin="0.4s" repeatCount="indefinite" />
      </path>
      <path d="M68 36 Q64 26 68 16 Q72 6 68 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M68 36 Q64 26 68 16 Q72 6 68 0;M68 36 Q72 26 68 16 Q64 6 68 0;M68 36 Q64 26 68 16 Q72 6 68 0"
          dur="2s" begin="0.8s" repeatCount="indefinite" />
      </path>
      <path d="M15 42 L20 100 Q20 106 26 106 L74 106 Q80 106 80 100 L85 42 Z"
        fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <clipPath id="cupClip">
        <path d="M16 42 L21 100 Q21 105 26 105 L74 105 Q79 105 79 100 L84 42 Z" />
      </clipPath>
      <rect x="15" y="42" width="70" height="64" fill="#7c4a1e" clipPath="url(#cupClip)">
        <animate attributeName="y" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      <ellipse cx="50" cy="52" rx="30" ry="5" fill="#c8956c" opacity="0.85">
        <animate attributeName="cy" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
        <animate attributeName="opacity" values="0;0.85;0.85;0.85" dur="2.5s" begin="0s" repeatCount="indefinite" />
      </ellipse>
      <path d="M80 58 Q98 58 98 78 Q98 98 80 98" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="50" cy="112" rx="48" ry="7" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Variante 2: Jarrita sirviendo ─── */
function PourLoader() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-30, 85, 45)">
        <rect x="62" y="20" width="38" height="48" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        <rect x="63" y="44" width="36" height="23" rx="4" fill="#7c4a1e">
          <animate attributeName="height" values="23;18;23" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="y" values="44;49;44" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <path d="M62 24 Q52 22 50 18 Q48 14 54 14 Q60 14 62 20" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        <path d="M100 28 Q114 28 114 44 Q114 60 100 60" fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
      </g>
      <path d="M54 52 Q52 70 48 85" stroke="#7c4a1e" strokeWidth="4" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M54 52 Q52 70 48 85;M54 52 Q56 70 50 85;M54 52 Q52 70 48 85"
          dur="1.5s" repeatCount="indefinite" />
      </path>
      <path d="M18 88 L23 118 Q23 122 28 122 L62 122 Q67 122 67 118 L72 88 Z"
        fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <clipPath id="pourCupClip">
        <path d="M19 88 L24 118 Q24 121 28 121 L62 121 Q66 121 66 118 L71 88 Z" />
      </clipPath>
      <rect x="18" y="88" width="54" height="34" fill="#7c4a1e" clipPath="url(#pourCupClip)">
        <animate attributeName="y" values="122;100;96;100" dur="1.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      <ellipse cx="45" cy="100" rx="22" ry="4" fill="#c8956c" opacity="0.8">
        <animate attributeName="cy" values="122;100;96;100" dur="1.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
        <animate attributeName="opacity" values="0;0.8;0.8;0.8" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
      <path d="M67 100 Q78 100 78 110 Q78 120 67 120" fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="45" cy="126" rx="36" ry="5" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
      <path d="M34 88 Q31 80 34 72" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M55 88 Q52 80 55 72" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ─── Variante 3: Grano se parte → taza → "Cheo's" emerge del vapor ─── */
function GrinderLoader() {
  return (
    <svg width="160" height="160" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gl-cupG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#8B6914"/>
          <stop offset="40%"  stopColor="#C9A84C"/>
          <stop offset="70%"  stopColor="#e0c870"/>
          <stop offset="100%" stopColor="#9a7820"/>
        </linearGradient>
        <linearGradient id="gl-sauG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7a5a1a"/>
          <stop offset="50%"  stopColor="#C9A84C"/>
          <stop offset="100%" stopColor="#7a5a1a"/>
        </linearGradient>
        <linearGradient id="gl-cofG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5a3010"/>
          <stop offset="100%" stopColor="#1a0a04"/>
        </linearGradient>
        <clipPath id="gl-cc">
          <path d="M296 248 L308 320 Q308 328 316 328 L364 328 Q372 328 372 320 L384 248 Z"/>
        </clipPath>
      </defs>

      <style>{`
        @keyframes gl-bL {
          0%,20%  { transform:rotate(0deg) translateX(0px);   opacity:1 }
          46%     { transform:rotate(-48deg) translateX(-6px); opacity:1 }
          58%     { transform:rotate(-48deg) translateX(-6px); opacity:0 }
          59%,100%{ transform:rotate(0deg);                   opacity:0 }
        }
        @keyframes gl-bR {
          0%,20%  { transform:rotate(0deg) translateX(0px);  opacity:1 }
          46%     { transform:rotate(48deg) translateX(6px);  opacity:1 }
          58%     { transform:rotate(48deg) translateX(6px);  opacity:0 }
          59%,100%{ transform:rotate(0deg);                  opacity:0 }
        }
        @keyframes gl-bPulse { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.016) } }
        @keyframes gl-split {
          0%,18%  { opacity:0; transform:scaleY(0) }
          26%     { opacity:1; transform:scaleY(1) }
          46%     { opacity:1; transform:scaleY(1) }
          56%,100%{ opacity:0; transform:scaleY(0) }
        }
        @keyframes gl-px0 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 52%{opacity:1;transform:translate(-60px,-54px)scale(1)} 70%{opacity:0;transform:translate(-76px,-70px)scale(0.3)} 100%{opacity:0} }
        @keyframes gl-px1 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 52%{opacity:1;transform:translate(60px,-54px)scale(1)}  70%{opacity:0;transform:translate(76px,-70px)scale(0.3)}  100%{opacity:0} }
        @keyframes gl-px2 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 54%{opacity:1;transform:translate(-78px,0px)scale(1)}   70%{opacity:0;transform:translate(-98px,0px)scale(0.3)}   100%{opacity:0} }
        @keyframes gl-px3 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 54%{opacity:1;transform:translate(78px,0px)scale(1)}    70%{opacity:0;transform:translate(98px,0px)scale(0.3)}    100%{opacity:0} }
        @keyframes gl-px4 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 56%{opacity:1;transform:translate(-46px,62px)scale(1)}  70%{opacity:0;transform:translate(-58px,80px)scale(0.3)}  100%{opacity:0} }
        @keyframes gl-px5 { 0%,42%{opacity:0;transform:translate(0,0)scale(0)} 56%{opacity:1;transform:translate(46px,62px)scale(1)}   70%{opacity:0;transform:translate(58px,80px)scale(0.3)}   100%{opacity:0} }
        @keyframes gl-pxGl{ 0%,42%{opacity:0;r:0} 52%{opacity:0.20;r:78} 64%{opacity:0.06;r:86} 70%,100%{opacity:0;r:0} }
        @keyframes gl-cupA {
          0%,56%  { opacity:0; transform:scaleY(0.05) translateY(44px) }
          67%     { opacity:1; transform:scaleY(1.03) translateY(-2px)  }
          72%,88% { opacity:1; transform:scaleY(1)    translateY(0px)   }
          97%,100%{ opacity:0; transform:scaleY(0.9)  translateY(6px)   }
        }
        @keyframes gl-hdlA {
          0%,64%  { opacity:0; transform:scaleX(0) }
          74%,88% { opacity:1; transform:scaleX(1) }
          97%,100%{ opacity:0 }
        }
        @keyframes gl-sauA {
          0%,58%  { opacity:0; transform:scaleX(0.08) }
          68%,88% { opacity:1; transform:scaleX(1)    }
          97%,100%{ opacity:0 }
        }
        @keyframes gl-cofA {
          0%,64%  { transform:translateY(58px) }
          76%,88% { transform:translateY(0px)  }
          97%,100%{ transform:translateY(58px) }
        }
        @keyframes gl-sv1 { 0%,70%{opacity:0;transform:translateY(0)} 78%{opacity:0.85;transform:translateY(-6px)} 87%,100%{opacity:0;transform:translateY(-26px)} }
        @keyframes gl-sv2 { 0%,73%{opacity:0;transform:translateY(0)} 81%{opacity:0.70;transform:translateY(-6px)} 89%,100%{opacity:0;transform:translateY(-26px)} }
        @keyframes gl-sv3 { 0%,76%{opacity:0;transform:translateY(0)} 84%{opacity:0.70;transform:translateY(-6px)} 91%,100%{opacity:0;transform:translateY(-26px)} }
        @keyframes gl-txtA {
          0%,74%  { opacity:0; transform:translateY(24px) scale(0.65) }
          84%     { opacity:1; transform:translateY(0px)  scale(1.05) }
          88%,90% { opacity:1; transform:translateY(0px)  scale(1)    }
          97%,100%{ opacity:0; transform:translateY(-16px) scale(0.82) }
        }
        @keyframes gl-ulA {
          0%,76%  { opacity:0; transform:scaleX(0) }
          85%,90% { opacity:0.5; transform:scaleX(1) }
          97%,100%{ opacity:0 }
        }
        .gl-bL  { transform-origin:340px 210px; animation:gl-bL     4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-bR  { transform-origin:340px 210px; animation:gl-bR     4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-bId { transform-origin:340px 210px; animation:gl-bPulse 4.8s ease-in-out infinite; }
        .gl-spl { transform-origin:340px 210px; animation:gl-split  4.8s ease-in-out infinite; }
        .gl-pGl { animation:gl-pxGl 4.8s ease-out infinite; transform-origin:340px 210px; }
        .gl-p0  { transform-origin:340px 210px; animation:gl-px0 4.8s ease-out infinite; }
        .gl-p1  { transform-origin:340px 210px; animation:gl-px1 4.8s ease-out infinite; }
        .gl-p2  { transform-origin:340px 210px; animation:gl-px2 4.8s ease-out infinite; }
        .gl-p3  { transform-origin:340px 210px; animation:gl-px3 4.8s ease-out infinite; }
        .gl-p4  { transform-origin:340px 210px; animation:gl-px4 4.8s ease-out infinite; }
        .gl-p5  { transform-origin:340px 210px; animation:gl-px5 4.8s ease-out infinite; }
        .gl-cup { transform-origin:340px 288px; animation:gl-cupA 4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-hdl { transform-origin:372px 284px; animation:gl-hdlA 4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-sau { transform-origin:340px 330px; animation:gl-sauA 4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-cof { transform-origin:340px 290px; animation:gl-cofA 4.8s cubic-bezier(.4,0,.2,1) infinite; }
        .gl-sv1 { transform-origin:320px 244px; animation:gl-sv1 4.8s ease-out infinite; }
        .gl-sv2 { transform-origin:340px 242px; animation:gl-sv2 4.8s ease-out infinite; }
        .gl-sv3 { transform-origin:360px 244px; animation:gl-sv3 4.8s ease-out infinite; }
        .gl-txt { transform-origin:340px 192px; animation:gl-txtA 4.8s cubic-bezier(.34,1.56,.64,1) infinite; }
        .gl-ul  { transform-origin:340px 208px; animation:gl-ulA  4.8s ease-out infinite; }
      `}</style>

      {/* Glow explosión */}
      <circle className="gl-pGl" cx="340" cy="210" r="0" fill="#C9A84C"/>

      {/* Partículas */}
      <ellipse className="gl-p0" cx="340" cy="210" rx="7" ry="11" fill="#2d1506"/>
      <ellipse className="gl-p1" cx="340" cy="210" rx="7" ry="11" fill="#3d2008"/>
      <ellipse className="gl-p2" cx="340" cy="210" rx="5" ry="8"  fill="#C9A84C"/>
      <ellipse className="gl-p3" cx="340" cy="210" rx="5" ry="8"  fill="#C9A84C"/>
      <ellipse className="gl-p4" cx="340" cy="210" rx="6" ry="9"  fill="#2d1506"/>
      <ellipse className="gl-p5" cx="340" cy="210" rx="6" ry="9"  fill="#3d2008"/>

      {/* Grano */}
      <g className="gl-bId">
        <g className="gl-bL">
          <path d="M340 130 Q290 168 290 210 Q290 252 340 290 Z" fill="#2d1506"/>
          <path d="M340 130 Q308 168 308 210 Q308 252 340 290 Z" fill="#3d2008" opacity="0.5"/>
          <path d="M340 138 Q326 176 324 210 Q326 244 340 282"
                fill="none" stroke="#1a0d04" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g className="gl-bR">
          <path d="M340 130 Q390 168 390 210 Q390 252 340 290 Z" fill="#2d1506"/>
          <path d="M340 130 Q372 168 372 210 Q372 252 340 290 Z" fill="#3d2008" opacity="0.5"/>
          <path d="M340 138 Q354 176 356 210 Q354 244 340 282"
                fill="none" stroke="#1a0d04" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <path d="M340 130 Q283 168 283 210 Q283 252 340 290 Q397 252 397 210 Q397 168 340 130 Z"
              fill="none" stroke="#5a3a10" strokeWidth="1.8"/>
      </g>

      {/* Línea de partición sólida */}
      <line className="gl-spl" x1="340" y1="134" x2="340" y2="286"
            stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>

      {/* Platillo */}
      <g className="gl-sau">
        <ellipse cx="340" cy="330" rx="62" ry="10" fill="url(#gl-sauG)" stroke="#8B6914" strokeWidth="1.2"/>
        <ellipse cx="340" cy="328" rx="48" ry="6"  fill="#C9A84C" opacity="0.3"/>
      </g>

      {/* Taza */}
      <g className="gl-cup">
        <g clipPath="url(#gl-cc)">
          <g className="gl-cof">
            <rect x="294" y="268" width="92" height="64" fill="url(#gl-cofG)"/>
            <ellipse cx="340" cy="268" rx="42" ry="7" fill="#5a3010"/>
          </g>
        </g>
        <path d="M296 248 L308 320 Q308 328 316 328 L364 328 Q372 328 372 320 L384 248 Z"
              fill="none" stroke="url(#gl-cupG)" strokeWidth="3.5" strokeLinejoin="round"/>
        <path d="M296 248 L384 248"
              stroke="url(#gl-cupG)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <ellipse cx="340" cy="248" rx="44" ry="7"
                 fill="#1a0a04" stroke="#C9A84C" strokeWidth="1" opacity="0.95"/>
      </g>

      {/* Asa */}
      <g className="gl-hdl">
        <path d="M372 268 Q400 268 400 288 Q400 308 372 308"
              fill="none" stroke="url(#gl-cupG)" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Vapor */}
      <path className="gl-sv1" fill="none" stroke="#C9A84C" strokeWidth="2.6"
            strokeLinecap="round" opacity="0"
            d="M320 242 Q314 228 320 214 Q326 200 320 186"/>
      <path className="gl-sv2" fill="none" stroke="#C9A84C" strokeWidth="3.0"
            strokeLinecap="round" opacity="0"
            d="M340 240 Q334 224 340 208 Q346 192 340 176"/>
      <path className="gl-sv3" fill="none" stroke="#C9A84C" strokeWidth="2.6"
            strokeLinecap="round" opacity="0"
            d="M360 242 Q354 228 360 214 Q366 200 360 186"/>

      {/* Cheo's */}
      <g className="gl-txt">
        <text
          x="340" y="200"
          fontFamily="Georgia,'Times New Roman',serif"
          fontSize="54"
          fontWeight="700"
          fontStyle="italic"
          textAnchor="middle"
          letterSpacing="-1"
          fill="#C9A84C"
        >Cheo&apos;s</text>
      </g>
      <line className="gl-ul" x1="288" y1="209" x2="392" y2="209"
            stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Componente principal exportado ─── */
export default function CoffeeLoader({ variant = "cup", message, size = "md" }) {
  const sizeClass = {
    sm: "py-4 gap-3",
    md: "py-10 gap-5",
    lg: "py-16 gap-6",
  }[size] || "py-10 gap-5";

  const subMessage = message || messages[variant] || "Cargando...";

  const Loader = { cup: CupLoader, pour: PourLoader, grinder: GrinderLoader }[variant] || CupLoader;

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClass}`}>
      <Loader />
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-gray-700">{subMessage}</p>
        <p className="text-xs text-gray-400">Un momento por favor ☕</p>
      </div>
    </div>
  );
}