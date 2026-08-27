import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function ListRow({ title, subtitle, icon, meta, trailing, onClick, divider = true, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const clickable = Boolean(onClick);
  return (
    <div
      onClick={onClick} role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        minHeight: 'var(--touch-min)', padding: 'var(--space-4) 0',
        borderBottom: divider ? '1px solid var(--border-subtle)' : 'none',
        background: clickable && hover ? 'var(--bg-hover)' : 'transparent',
        cursor: clickable ? 'pointer' : undefined,
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}>
      {icon ? (
        <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flex: '0 0 auto', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
          <Icon name={icon} size={20} color="var(--text-secondary)" />
        </span>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 'var(--size-caption)', lineHeight: 'var(--lh-caption)', color: 'var(--text-secondary)' }}>{subtitle}</div> : null}
      </div>
      {meta ? <div className="chida-num" style={{ fontSize: 'var(--size-caption)', color: 'var(--text-tertiary)', flex: '0 0 auto' }}>{meta}</div> : null}
      {trailing !== undefined ? trailing : (clickable ? <Icon name="chevron-left" size={18} color="var(--text-tertiary)" /> : null)}
    </div>
  );
}
