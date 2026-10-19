import React from 'react';
import { getTierClass } from '../utils/formatters';

export default function ScoreMeter({ score, tier, size = 'md' }) {
  const isLarge = size === 'lg';
  const radius = isLarge ? 36 : 24;
  const stroke = isLarge ? 6 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // Emerald
    if (s >= 65) return '#3b82f6'; // Blue
    return '#f59e0b'; // Amber
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isLarge ? '1rem' : '0.65rem' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor(score)}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Number in center */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          lineHeight: 1,
        }}>
          <span style={{
            fontSize: isLarge ? '1.35rem' : '0.95rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: '#fff',
          }}>
            {score}
          </span>
          {isLarge && <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>%</span>}
        </div>
      </div>

      {tier && (
        <span className={`badge ${getTierClass(tier)}`} style={{ fontSize: isLarge ? '0.85rem' : '0.725rem' }}>
          {tier}
        </span>
      )}
    </div>
  );
}
