import React from 'react';

const TONES = {
  neutral: { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)', bd: 'var(--border-subtle)' },
  accent: { bg: 'var(--accent-subtle)', fg: 'var(--text-accent)', bd: 'var(--accent-border)' },
  danger: { bg: 'var(--danger-subtle)', fg: 'var(--danger)', bd: 'var(--danger-border)' },
};

export function Tag({ children, tone = 'neutral', style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: '2px var(--space-3)', background: t.bg, color: t.fg,
        border: '1px solid ' + t.bd, borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--size-micro)', lineHeight: 'var(--lh-micro)', fontWeight: 'var(--weight-medium)',
        whiteSpace: 'nowrap', ...style,
      }}>
      {children}
    </span>
  );
}
