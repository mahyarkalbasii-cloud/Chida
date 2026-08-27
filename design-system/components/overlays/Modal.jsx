import React from 'react';

export function Modal({ open, onClose, title, description, children, footer, dismissible = true, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div onClick={dismissible ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', animation: 'chida-fade-in var(--dur-base) var(--ease-standard) both' }} />
      <div role="dialog" aria-modal="true" aria-label={title} {...rest}
        style={{
          position: 'relative', width: '100%', maxWidth: 320, background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--elev-overlay)', padding: 'var(--space-6)',
          animation: 'chida-pop var(--dur-base) var(--ease-enter) both',
          ...style,
        }}>
        {title ? <h2 style={{ margin: 0, fontSize: 'var(--size-headline)', lineHeight: 'var(--lh-headline)', fontWeight: 'var(--weight-demibold)' }}>{title}</h2> : null}
        {description ? <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', color: 'var(--text-secondary)' }}>{description}</p> : null}
        {children ? <div style={{ marginTop: 'var(--space-5)' }}>{children}</div> : null}
        {footer ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}
