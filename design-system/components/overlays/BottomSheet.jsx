import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function BottomSheet({ open, onClose, title, description, children, footer, dismissible = true, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={dismissible ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', animation: 'chida-fade-in var(--dur-base) var(--ease-standard) both' }} />
      <div role="dialog" aria-modal="true" aria-label={title} {...rest}
        style={{
          position: 'relative', background: 'var(--bg-surface)',
          borderTopLeftRadius: 'var(--radius-sheet)', borderTopRightRadius: 'var(--radius-sheet)',
          borderTop: '1px solid var(--border-subtle)', boxShadow: 'var(--elev-sheet)',
          padding: 'var(--space-4) var(--gutter) calc(var(--space-6) + var(--safe-bottom))',
          animation: 'chida-sheet-up var(--dur-base) var(--ease-enter) both', maxHeight: '86%', overflowY: 'auto',
          ...style,
        }}>
        <div style={{ width: 36, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--border-default)', margin: '0 auto var(--space-5)' }} />
        {(title || dismissible) ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: description ? 'var(--space-2)' : 'var(--space-5)' }}>
            <h2 style={{ flex: 1, margin: 0, fontSize: 'var(--size-headline)', lineHeight: 'var(--lh-headline)', fontWeight: 'var(--weight-demibold)' }}>{title}</h2>
            {dismissible ? <IconButton icon="x" label="بستن" size={40} onClick={onClose} style={{ margin: '-8px -8px 0 0' }} /> : null}
          </div>
        ) : null}
        {description ? <p style={{ margin: '0 0 var(--space-5)', fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', color: 'var(--text-secondary)' }}>{description}</p> : null}
        <div>{children}</div>
        {footer ? <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}
