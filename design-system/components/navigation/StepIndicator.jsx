import React from 'react';

const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export function StepIndicator({ total = 3, current = 1, label, style, ...rest }) {
  const counter = 'مرحله ' + fa(current) + ' از ' + fa(total);
  return (
    <div {...rest} role="group" aria-label={label || counter}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', ...style }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', direction: 'rtl' }}>
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          return (
            <span key={i} style={{
              flex: 1, height: 3, borderRadius: 'var(--radius-pill)',
              background: done ? 'var(--accent)' : 'var(--border-subtle)',
              transition: 'background var(--dur-base) var(--ease-standard)',
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--size-micro)', lineHeight: 'var(--lh-micro)', color: 'var(--text-tertiary)' }}>
        <span>{label}</span>
        <span className="chida-num" aria-hidden="true">{counter}</span>
      </div>
    </div>
  );
}
