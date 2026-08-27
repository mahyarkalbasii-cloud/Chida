import React from 'react';
import { Icon } from './Icon.jsx';

export function IconButton({ icon, label, variant = 'ghost', size = 48, flip = false, disabled = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const solid = variant === 'surface';
  const bg = disabled ? 'transparent' : press ? 'var(--bg-pressed)' : hover ? 'var(--bg-hover)' : (solid ? 'var(--bg-surface)' : 'transparent');
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled} onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerCancel={() => setPress(false)}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, padding: 0,
        background: bg, color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        border: solid ? '1px solid var(--border-subtle)' : '1px solid transparent',
        borderRadius: 'var(--radius-control)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
    >
      <Icon name={icon} size={22} flip={flip} />
    </button>
  );
}
