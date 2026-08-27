import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FieldMessage({ tone = 'help', children, id, style, ...rest }) {
  if (!children) return null;
  const isError = tone === 'error';
  return (
    <div id={id} role={isError ? 'alert' : undefined} {...rest}
      style={{
        display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start',
        marginTop: 'var(--space-3)',
        fontSize: 'var(--size-caption)', lineHeight: 'var(--lh-caption)',
        color: isError ? 'var(--danger)' : 'var(--text-secondary)',
        ...style,
      }}>
      {isError ? <Icon name="circle-alert" size={16} style={{ marginTop: 2 }} /> : null}
      <span>{children}</span>
    </div>
  );
}
