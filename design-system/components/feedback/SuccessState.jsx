import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function SuccessState({ title, description, children, icon = 'check', style, ...rest }) {
  return (
    <div role="status" {...rest}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)', padding: 'var(--space-8) var(--space-5)', ...style }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64,
        borderRadius: '50%', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
        animation: 'chida-pop var(--dur-slow) var(--ease-enter) both',
      }}>
        <Icon name={icon} size={30} color="var(--accent)" />
      </span>
      <h2 style={{ margin: 0, fontSize: 'var(--size-title)', lineHeight: 'var(--lh-title)', fontWeight: 'var(--weight-demibold)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h2>
      {description ? (
        <p style={{ margin: 0, maxWidth: 300, fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', color: 'var(--text-secondary)' }}>{description}</p>
      ) : null}
      {children ? <div style={{ marginTop: 'var(--space-3)', width: '100%' }}>{children}</div> : null}
    </div>
  );
}
