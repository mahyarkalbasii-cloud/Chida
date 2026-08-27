import React from 'react';

export function Spinner({ size = 20, color = 'var(--accent)', label, style, ...rest }) {
  return (
    <span role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}
      {...rest}
      style={{
        display: 'inline-block', width: size, height: size, flex: '0 0 auto',
        border: Math.max(2, Math.round(size / 10)) + 'px solid currentColor',
        borderRadius: '50%', color, opacity: .28,
        borderTopColor: 'transparent',
        animation: 'chida-spin 700ms linear infinite',
        ...style,
      }}
    />
  );
}
