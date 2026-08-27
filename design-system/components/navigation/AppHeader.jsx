import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function AppHeader({ title, onBack, backLabel = 'بازگشت', action, subtitle, sticky = true, style, ...rest }) {
  return (
    <header {...rest}
      style={{
        position: sticky ? 'sticky' : 'static', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        minHeight: 'var(--header-height)', padding: '0 var(--space-2)',
        background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)',
        ...style,
      }}>
      {onBack ? <IconButton icon="chevron-right" label={backLabel} onClick={onBack} /> : <span style={{ width: 'var(--space-4)' }} />}
      <div style={{ flex: 1, minWidth: 0, textAlign: 'center', padding: '0 var(--space-2)' }}>
        {title ? <div style={{ fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', fontWeight: 'var(--weight-demibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div> : null}
        {subtitle ? <div style={{ fontSize: 'var(--size-micro)', lineHeight: 'var(--lh-micro)', color: 'var(--text-tertiary)' }}>{subtitle}</div> : null}
      </div>
      <div style={{ minWidth: 48, display: 'flex', justifyContent: 'flex-end' }}>{action}</div>
    </header>
  );
}
