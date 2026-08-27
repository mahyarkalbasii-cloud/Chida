import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function TabBar({ items = [], value, onChange, style, ...rest }) {
  return (
    <nav {...rest}
      style={{
        display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '1fr',
        minHeight: 'var(--tabbar-height)', background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--safe-bottom)', ...style,
      }}>
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button key={it.id} type="button" onClick={() => onChange && onChange(it.id)}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              minHeight: 'var(--touch-min)', padding: 'var(--space-2)', border: 'none', background: 'transparent',
              color: active ? 'var(--text-accent)' : 'var(--text-tertiary)', cursor: 'pointer',
              fontFamily: 'var(--font-fa)', fontSize: 'var(--size-micro)', lineHeight: 'var(--lh-micro)',
              fontWeight: active ? 'var(--weight-medium)' : 'var(--weight-regular)',
            }}>
            <Icon name={it.icon} size={22} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
