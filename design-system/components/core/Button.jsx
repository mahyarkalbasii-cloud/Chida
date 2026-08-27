import React from 'react';
import { Icon } from './Icon.jsx';
import { Spinner } from '../feedback/Spinner.jsx';

const TONE = {
  primary: { bg: 'var(--accent)', hover: 'var(--accent-hover)', press: 'var(--accent-pressed)', fg: 'var(--on-accent)', border: 'transparent', weight: 'var(--weight-demibold)' },
  secondary: { bg: 'var(--bg-surface)', hover: 'var(--bg-subtle)', press: 'var(--bg-inset)', fg: 'var(--text-primary)', border: 'var(--border-default)', weight: 'var(--weight-medium)' },
  ghost: { bg: 'transparent', hover: 'var(--bg-hover)', press: 'var(--bg-pressed)', fg: 'var(--text-accent)', border: 'transparent', weight: 'var(--weight-medium)' },
  danger: { bg: 'var(--danger)', hover: 'var(--danger-hover)', press: 'var(--danger-hover)', fg: 'var(--on-danger)', border: 'transparent', weight: 'var(--weight-demibold)' },
};

export function Button({
  children, variant = 'primary', size = 'lg', fullWidth = false, loading = false,
  disabled = false, iconStart, iconEnd, type = 'button', onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const t = TONE[variant] || TONE.primary;
  const off = disabled || loading;
  const sm = size === 'sm';
  const bg = off ? (variant === 'ghost' ? 'transparent' : 'var(--bg-inset)')
    : press ? t.press : hover ? t.hover : t.bg;

  return (
    <button
      type={type} disabled={off} aria-busy={loading || undefined} onClick={off ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerCancel={() => setPress(false)}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
        width: fullWidth ? '100%' : undefined,
        minHeight: sm ? 'var(--button-height-sm)' : 'var(--button-height)',
        minWidth: sm ? undefined : 'var(--touch-min)',
        padding: sm ? '0 var(--space-4)' : '0 var(--space-6)',
        background: bg, color: off ? 'var(--text-disabled)' : t.fg,
        border: '1px solid ' + (off ? 'var(--border-subtle)' : t.border),
        borderRadius: 'var(--radius-control)',
        fontFamily: 'var(--font-fa)', fontSize: sm ? 'var(--size-label)' : 'var(--size-body)',
        lineHeight: 1, fontWeight: t.weight, letterSpacing: 'var(--tracking-tight)',
        cursor: off ? 'not-allowed' : 'pointer', userSelect: 'none',
        transform: press && !off ? 'scale(.99)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
    >
      {loading ? <Spinner size={sm ? 16 : 18} color="currentColor" /> : (iconStart ? <Icon name={iconStart} size={sm ? 16 : 20} /> : null)}
      <span>{children}</span>
      {iconEnd && !loading ? <Icon name={iconEnd} size={sm ? 16 : 20} /> : null}
    </button>
  );
}
