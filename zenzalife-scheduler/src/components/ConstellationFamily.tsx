import React from 'react'

// A stargazer-style family constellation rendered as twinkling nodes and
// gently animated lines that "walk" into the distance.
export function ConstellationFamily() {
  // Coordinates use a 1000x1000 viewBox for precision
  const mk = (x: number, y: number, r = 6) => ({ x, y, r })

  // Father (left)
  const dadStars = [
    mk(380, 640, 7), // head
    mk(380, 700), // neck
    mk(380, 780), // chest
    mk(380, 860), // hip
    mk(330, 780), // left shoulder
    mk(430, 780), // right shoulder
    mk(330, 860), // left elbow
    mk(430, 860), // right elbow
    mk(330, 930), // left hand
    mk(430, 930), // right hand
    mk(350, 960), // left knee
    mk(410, 960), // right knee
    mk(340, 1000), // left foot
    mk(420, 1000), // right foot
  ]
  const dadLines: [number, number][][] = [
    [[380, 640], [380, 700], [380, 780], [380, 860]], // spine
    [[330, 780], [380, 780], [430, 780]], // shoulders
    [[330, 780], [330, 860], [330, 930]], // left arm
    [[430, 780], [430, 860], [430, 930]], // right arm
    [[380, 860], [350, 960], [340, 1000]], // left leg
    [[380, 860], [410, 960], [420, 1000]], // right leg
  ]

  // Mother (right)
  const momStars = [
    mk(620, 660, 7), // head
    mk(620, 720),
    mk(620, 800),
    mk(620, 880),
    mk(570, 800),
    mk(670, 800),
    mk(570, 880),
    mk(670, 880),
    mk(570, 950),
    mk(670, 950),
    mk(590, 980),
    mk(650, 980),
    mk(580, 1040),
    mk(660, 1040),
  ]
  const momLines: [number, number][][] = [
    [[620, 660], [620, 720], [620, 800], [620, 880]],
    [[570, 800], [620, 800], [670, 800]],
    [[570, 800], [570, 880], [570, 950]],
    [[670, 800], [670, 880], [670, 950]],
    [[620, 880], [590, 980], [580, 1040]],
    [[620, 880], [650, 980], [660, 1040]],
  ]

  // Child (center)
  const kidStars = [
    mk(500, 740, 6), // head
    mk(500, 790),
    mk(500, 850),
    mk(500, 910),
    mk(470, 850),
    mk(530, 850),
    mk(470, 910),
    mk(530, 910),
    mk(485, 960),
    mk(515, 960),
    mk(480, 1020),
    mk(520, 1020),
  ]
  const kidLines: [number, number][][] = [
    [[500, 740], [500, 790], [500, 850], [500, 910]],
    [[470, 850], [500, 850], [530, 850]],
    [[470, 850], [470, 910]],
    [[530, 850], [530, 910]],
    [[500, 910], [485, 960], [480, 1020]],
    [[500, 910], [515, 960], [520, 1020]],
  ]

  const renderStars = (pts: { x: number; y: number; r: number }[], baseDelay = 0) =>
    pts.map((p, i) => (
      <circle
        key={`s-${p.x}-${p.y}-${i}`}
        cx={p.x}
        cy={p.y}
        r={p.r}
        fill="rgba(255,255,210,0.95)"
        className="twinkle"
        style={{ animationDelay: `${baseDelay + i * 120}ms` }}
      />
    ))

  const renderLines = (segments: [number, number][][], baseDelay = 0) =>
    segments.map((seg, i) => (
      <polyline
        key={`l-${i}`}
        className="constellation-line"
        points={seg.map(([x, y]) => `${x},${y}`).join(' ')}
        style={{ animationDelay: `${baseDelay + i * 180}ms` }}
      />
    ))

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Starry family walking out into the heavens */}
      <svg viewBox="0 0 1000 1100" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="silhouetteGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="50%" stopColor="rgba(180,200,255,0.20)" />
            <stop offset="100%" stopColor="rgba(120,140,220,0.05)" />
          </radialGradient>
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        {/* Soft silhouettes behind the constellations */}
        <g filter="url(#soft-blur)" opacity="0.35" className="silhouette-pulse">
          {/* Dad silhouette */}
          <ellipse cx="380" cy="760" rx="65" ry="120" fill="url(#silhouetteGlow)" />
          <ellipse cx="380" cy="640" rx="26" ry="26" fill="url(#silhouetteGlow)" />
          <ellipse cx="340" cy="900" rx="30" ry="70" fill="url(#silhouetteGlow)" />
          <ellipse cx="420" cy="900" rx="30" ry="70" fill="url(#silhouetteGlow)" />

          {/* Kid silhouette */}
          <ellipse cx="500" cy="860" rx="50" ry="95" fill="url(#silhouetteGlow)" />
          <ellipse cx="500" cy="740" rx="22" ry="22" fill="url(#silhouetteGlow)" />

          {/* Mom silhouette */}
          <ellipse cx="620" cy="820" rx="60" ry="110" fill="url(#silhouetteGlow)" />
          <ellipse cx="620" cy="660" rx="24" ry="24" fill="url(#silhouetteGlow)" />
          <ellipse cx="580" cy="940" rx="28" ry="68" fill="url(#silhouetteGlow)" />
          <ellipse cx="660" cy="940" rx="28" ry="68" fill="url(#silhouetteGlow)" />
        </g>

        <g
          className="animate-walk-away animate-bob-slow"
          style={{ transformOrigin: '50% 80%' }}
        >
          {/* hold hands */}
          <polyline
            className="constellation-line"
            points="430,930 460,900 500,910 540,900 570,950"
            style={{ animationDelay: '300ms' }}
          />

          {/* Dad */}
          {renderLines(dadLines, 0)}
          {renderStars(dadStars, 0)}

          {/* Kid */}
          {renderLines(kidLines, 200)}
          {renderStars(kidStars, 200)}

          {/* Mom */}
          {renderLines(momLines, 400)}
          {renderStars(momStars, 400)}
        </g>
      </svg>

      {/* Occasional shooting star for magic */}
      <div className="shooting-star absolute left-10 top-24 w-24 h-1 rotate-[20deg]" />
    </div>
  )
}
