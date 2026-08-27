import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { FieldMessage } from './FieldMessage.jsx';

export function Checkbox({ checked = false, onChange, children, error, disabled = false, id, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const auto = React.useId ? React.useId() : 'c';
  const fieldId = id || 'chida-check-' + auto;
  const msgId = fieldId + '-msg';
  const borderColor = error ? 'var(--danger)' : checked ? 'var(--accent)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-default)';

  return (
    <div style={{ width: '100%', ...style }}>
      <label htmlFor={fieldId}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', minHeight: 'var(--touch-min)', padding: 'var(--space-3) 0', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <span style={{ position: 'relative', display: 'inline-flex', flex: '0 0 auto', width: 24, height: 24, marginTop: 2 }}>
          <input id={fieldId} type="checkbox" checked={checked} disabled={disabled}
            onChange={(e) => onChange && onChange(e.target.checked)}
            aria-describedby={error ? msgId : undefined} {...rest}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} />
          <span aria-hidden="true" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24,
            borderRadius: 'var(--radius-xs)',
            background: disabled ? 'var(--bg-inset)' : checked ? 'var(--accent)' : 'var(--bg-surface)',
            border: '1px solid ' + (disabled ? 'var(--border-subtle)' : borderColor),
            transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
          }}>
            {checked ? <Icon name="check" size={16} color={disabled ? 'var(--text-disabled)' : 'var(--on-accent)'} /> : null}
          </span>
        </span>
        <span style={{ fontSize: 'var(--size-callout)', lineHeight: 'var(--lh-callout)', color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)' }}>{children}</span>
      </label>
      <FieldMessage id={msgId} tone="error">{error}</FieldMessage>
    </div>
  );
}
