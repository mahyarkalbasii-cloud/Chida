import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  error: { fg: 'var(--danger)', bg: 'var(--danger-subtle)', border: 'var(--danger-border)', icon: 'circle-alert' },
  warning: { fg: 'var(--text-primary)', bg: 'var(--bg-subtle)', border: 'var(--border-default)', icon: 'triangle-alert' },
  info: { fg: 'var(--text-primary)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)', icon: 'info' },
  offline: { fg: 'var(--text-primary)', bg: 'var(--bg-subtle)', border: 'var(--border-default)', icon: 'wifi-off' },
};

export function InlineBanner({ tone = 'info', title, children, action, icon, style, ...rest }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} {...rest}
      style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', padding: 'var(--space-4) var(--space-5)', background: t.bg, border: '1px solid ' + t.border, borderRadius: 'var(--radius-card)', ...style }}>
      <Icon name={icon || t.icon} size={20} color={t.fg} style={{ marginTop: 3 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? <div style={{ fontSize: 'var(--size-label)', lineHeight: 'var(--lh-label)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>{title}</div> : null}
        {children ? <div style={{ fontSize: 'var(--size-caption)', lineHeight: 'var(--lh-caption)', color: 'var(--text-secondary)', marginTop: title ? 2 : 0 }}>{children}</div> : null}
      </div>
      {action ? <div style={{ flex: '0 0 auto' }}>{action}</div> : null}
    </div>
  );
}
