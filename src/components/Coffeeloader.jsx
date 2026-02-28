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
      {/* Vapor izquierda */}
      <path d="M32 36 Q28 26 32 16 Q36 6 32 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M32 36 Q28 26 32 16 Q36 6 32 0;M32 36 Q36 26 32 16 Q28 6 32 0;M32 36 Q28 26 32 16 Q36 6 32 0"
          dur="2s" begin="0s" repeatCount="indefinite" />
      </path>
      {/* Vapor centro */}
      <path d="M50 36 Q46 24 50 14 Q54 4 50 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M50 36 Q46 24 50 14 Q54 4 50 0;M50 36 Q54 24 50 14 Q46 4 50 0;M50 36 Q46 24 50 14 Q54 4 50 0"
          dur="2s" begin="0.4s" repeatCount="indefinite" />
      </path>
      {/* Vapor derecha */}
      <path d="M68 36 Q64 26 68 16 Q72 6 68 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M68 36 Q64 26 68 16 Q72 6 68 0;M68 36 Q72 26 68 16 Q64 6 68 0;M68 36 Q64 26 68 16 Q72 6 68 0"
          dur="2s" begin="0.8s" repeatCount="indefinite" />
      </path>
      {/* Taza */}
      <path d="M15 42 L20 100 Q20 106 26 106 L74 106 Q80 106 80 100 L85 42 Z"
        fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <clipPath id="cupClip">
        <path d="M16 42 L21 100 Q21 105 26 105 L74 105 Q79 105 79 100 L84 42 Z" />
      </clipPath>
      {/* Café */}
      <rect x="15" y="42" width="70" height="64" fill="#7c4a1e" clipPath="url(#cupClip)">
        <animate attributeName="y" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      {/* Espuma */}
      <ellipse cx="50" cy="52" rx="30" ry="5" fill="#c8956c" opacity="0.85">
        <animate attributeName="cy" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
        <animate attributeName="opacity" values="0;0.85;0.85;0.85" dur="2.5s" begin="0s" repeatCount="indefinite" />
      </ellipse>
      {/* Asa */}
      <path d="M80 58 Q98 58 98 78 Q98 98 80 98" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
      {/* Plato */}
      <ellipse cx="50" cy="112" rx="48" ry="7" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Variante 2: Jarrita sirviendo ─── */
function PourLoader() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">

      {/* ── Jarrita (inclinada ~30°) ── */}
      <g transform="rotate(-30, 85, 45)">
        {/* Cuerpo */}
        <rect x="62" y="20" width="38" height="48" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        {/* Café dentro de la jarra */}
        <rect x="63" y="44" width="36" height="23" rx="4" fill="#7c4a1e">
          <animate attributeName="height" values="23;18;23" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="y" values="44;49;44" dur="1.5s" repeatCount="indefinite" />
        </rect>
        {/* Boquilla */}
        <path d="M62 24 Q52 22 50 18 Q48 14 54 14 Q60 14 62 20" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        {/* Asa */}
        <path d="M100 28 Q114 28 114 44 Q114 60 100 60" fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* ── Chorro de café cayendo ── */}
      <path d="M54 52 Q52 70 48 85" stroke="#7c4a1e" strokeWidth="4" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="d"
          values="M54 52 Q52 70 48 85;M54 52 Q56 70 50 85;M54 52 Q52 70 48 85"
          dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* ── Taza receptora ── */}
      <path d="M18 88 L23 118 Q23 122 28 122 L62 122 Q67 122 67 118 L72 88 Z"
        fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <clipPath id="pourCupClip">
        <path d="M19 88 L24 118 Q24 121 28 121 L62 121 Q66 121 66 118 L71 88 Z" />
      </clipPath>
      {/* Café llenándose en la taza */}
      <rect x="18" y="88" width="54" height="34" fill="#7c4a1e" clipPath="url(#pourCupClip)">
        <animate attributeName="y" values="122;100;96;100" dur="1.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      {/* Espuma taza */}
      <ellipse cx="45" cy="100" rx="22" ry="4" fill="#c8956c" opacity="0.8">
        <animate attributeName="cy" values="122;100;96;100" dur="1.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
        <animate attributeName="opacity" values="0;0.8;0.8;0.8" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
      {/* Asa taza */}
      <path d="M67 100 Q78 100 78 110 Q78 120 67 120" fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
      {/* Plato */}
      <ellipse cx="45" cy="126" rx="36" ry="5" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />

      {/* Vapor de la taza */}
      <path d="M34 88 Q31 80 34 72" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M55 88 Q52 80 55 72" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ─── Variante 3: Moledora de café ─── */
function GrinderLoader() {
  return (
    <svg width="110" height="140" viewBox="0 0 110 140" xmlns="http://www.w3.org/2000/svg">

      {/* ── Cuerpo principal de la moledora ── */}
      {/* Base inferior */}
      <rect x="20" y="95" width="70" height="35" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="2" />
      {/* Café molido cayendo a la base */}
      <rect x="22" y="97" width="66" height="31" rx="5" fill="#7c4a1e" opacity="0">
        <animate attributeName="height" values="0;31;31" dur="2s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        <animate attributeName="opacity" values="0;0.9;0.9" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Cuerpo central */}
      <rect x="25" y="52" width="60" height="46" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="2" />

      {/* Granos de café en el cuerpo */}
      <ellipse cx="38" cy="68" rx="5" ry="7" fill="#4a2c17" opacity="0.7">
        <animate attributeName="cy" values="62;78;62" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="55" cy="72" rx="5" ry="7" fill="#4a2c17" opacity="0.7">
        <animate attributeName="cy" values="65;82;65" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="72" cy="66" rx="5" ry="7" fill="#4a2c17" opacity="0.7">
        <animate attributeName="cy" values="60;76;60" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      </ellipse>

      {/* ── Tolva (embudo arriba) ── */}
      <path d="M30 30 L25 52 L85 52 L80 30 Z" fill="white" stroke="#e5e7eb" strokeWidth="2" />
      {/* Granos en tolva */}
      <ellipse cx="45" cy="42" rx="6" ry="4" fill="#4a2c17" opacity="0.5">
        <animate attributeName="cy" values="38;46;38" dur="1.2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="62" cy="40" rx="6" ry="4" fill="#4a2c17" opacity="0.5">
        <animate attributeName="cy" values="36;44;36" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
      </ellipse>

      {/* ── Manivela (gira) ── */}
      <g transform="translate(55, 18)">
        {/* Brazo de la manivela */}
        <line x1="0" y1="0" x2="18" y2="0" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate"
            values="0 0 0;360 0 0" dur="1s" repeatCount="indefinite" />
        </line>
        {/* Perilla */}
        <circle cx="18" cy="0" r="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate"
            values="0 0 0;360 0 0" dur="1s" repeatCount="indefinite" />
        </circle>
        {/* Centro eje */}
        <circle cx="0" cy="0" r="5" fill="white" stroke="#e5e7eb" strokeWidth="2" />
      </g>

      {/* Partículas de café molido cayendo */}
      <circle cx="48" cy="90" r="2" fill="#7c4a1e">
        <animate attributeName="cy" values="88;96;88" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="55" cy="90" r="1.5" fill="#7c4a1e">
        <animate attributeName="cy" values="88;96;88" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="62" cy="90" r="2" fill="#7c4a1e">
        <animate attributeName="cy" values="88;96;88" dur="0.6s" begin="0.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="0.6s" begin="0.4s" repeatCount="indefinite" />
      </circle>

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