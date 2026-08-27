import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function RoleCard({ icon, title, description, selected = false, disabled = false, onSelect, name = 'role', value, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <label
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
        padding: 'var(--space-5)', background: selected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
        border: '1px solid ' + (selected ? 'var(--accent)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-subtle)'),
        borderRadius: 'var(--radius-card)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .55 : 1, minHeight: 'var(--touch-comfortable)',
        transition: 'border-color var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}>
      <input type="radio" name={name} value={value} checked={selected} disabled={disabled}
        onChange={() => onSelect && onSelect(value)} {...rest}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }} />
      {icon ? (
        <span aria-hidden="true" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flex: '0 0 auto',
          borderRadius: 'var(--radius-md)', background: selected ? 'var(--bg-surface)' : 'var(--bg-subtle)',
          border: '1px solid ' + (selected ? 'var(--accent-border)' : 'var(--border-subtle)'),
        }}>
          <Icon name={icon} size={22} color={selected ? 'var(--accent)' : 'var(--text-secondary)'} />
        </span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 'var(--size-headline)', lineHeight: 'var(--lh-headline)', fontWeight: 'var(--weight-demibold)', color: 'var(--text-primary)' }}>{title}</span>
        {description ? <span style={{ display: 'block', marginTop: 2, fontSize: 'var(--size-caption)', lineHeight: 'var(--lh-caption)', color: 'var(--text-secondary)' }}>{description}</span> : null}
      </span>
      <span aria-hidden="true" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flex: '0 0 auto', marginTop: 2,
        borderRadius: '50%', background: selected ? 'var(--accent)' : 'transparent',
        border: '1px solid ' + (selected ? 'var(--accent)' : 'var(--border-default)'),
      }}>
        {selected ? <Icon name="check" size={14} color="var(--on-accent)" /> : null}
      </span>
    </label>
  );
}
