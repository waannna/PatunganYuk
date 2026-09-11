// src/components/ui/TrendChart.jsx
import { useState } from 'react';

export function TrendChart({ data = [], height = 200, color = '#6366f1' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Tidak ada data
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height;
  const pointSpacing = (chartWidth - padding * 2) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding + i * pointSpacing,
    y: chartHeight - padding - (d.value / maxValue) * (chartHeight - padding * 2),
    value: d.value,
    label: d.label
  }));

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  const formatRupiah = (val) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
    return `Rp ${val}`;
  };

  const gradientId = `trend-gradient-${color.replace('#', '')}`;

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + (1 - ratio) * (chartHeight - padding * 2);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                style={{ fontSize: '10px' }}
              >
                {formatRupiah(maxValue * ratio)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill="white"
              stroke={color}
              strokeWidth="2"
              style={{ 
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 50}
                  y={p.y - 45}
                  width="100"
                  height="28"
                  rx="6"
                  fill="#0f172a"
                />
                <text
                  x={p.x}
                  y={p.y - 26}
                  textAnchor="middle"
                  fill="white"
                  style={{ fontSize: '11px', fontWeight: '600' }}
                >
                  {formatRupiah(p.value)}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartHeight - 10}
            textAnchor="middle"
            fill="#94a3b8"
            style={{ fontSize: '11px', fontWeight: '500' }}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}