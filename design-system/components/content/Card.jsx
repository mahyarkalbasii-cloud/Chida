import React from 'react';

export function Card({ children, padding = 'var(--space-5)', interactive = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid ' + (interactive && hover ? 'var(--border-strong)' : 'var(--border-subtle)'),
        borderRadius: 'var(--radius-card)', padding, boxShadow: 'none',
        cursor: interactive ? 'pointer' : undefined,
        transition: 'border-color var(--dur-fast) var(--ease-standard)',
        ...style,
      }}>
      {children}
    </div>
  );
}
