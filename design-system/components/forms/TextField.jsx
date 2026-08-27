import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Spinner } from '../feedback/Spinner.jsx';
import { FieldMessage } from './FieldMessage.jsx';

export function TextField({
  label, value, onChange, placeholder, hint, error, disabled = false, loading = false,
  optional = false, ltr = false, icon, suffix, id, inputRef, style, inputStyle, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const auto = React.useId ? React.useId() : 'f';
  const fieldId = id || 'chida-' + auto;
  const msgId = fieldId + '-msg';
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--accent)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-default)';

  return (
    <div style={{ width: '100%', ...style }}>
      {label ? (
        <label htmlFor={fieldId} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline', marginBottom: 'var(--space-3)', fontSize: 'var(--size-label)', lineHeight: 'var(--lh-label)', fontWeight: 'var(--weight-medium)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)' }}>
          {label}
          {optional ? <span style={{ fontSize: 'var(--size-caption)', fontWeight: 'var(--weight-regular)', color: 'var(--text-tertiary)' }}>اختیاری</span> : null}
        </label>
      ) : null}
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          height: 'var(--field-height)', padding: '0 var(--space-4)',
          background: disabled ? 'var(--bg-inset)' : 'var(--bg-surface)',
          border: '1px solid ' + borderColor, borderRadius: 'var(--radius-control)',
          boxShadow: focus ? '0 0 0 3px ' + (error ? 'var(--danger-subtle)' : 'var(--accent-subtle)') : 'none',
          transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        }}>
        {icon ? <Icon name={icon} size={20} color={focus ? 'var(--accent)' : 'var(--text-tertiary)'} /> : null}
        <input
          id={fieldId} ref={inputRef} value={value} disabled={disabled} placeholder={placeholder}
          onChange={onChange} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          aria-invalid={error ? true : undefined} aria-describedby={(error || hint) ? msgId : undefined}
          className={ltr ? 'chida-ltr-field' : undefined}
          {...rest}
          style={{
            flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-fa)', fontSize: 'var(--size-body)', fontWeight: 'var(--weight-regular)',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
            ...inputStyle,
          }}
        />
        {loading ? <Spinner size={18} /> : suffix}
      </div>
      <FieldMessage id={msgId} tone={error ? 'error' : 'help'}>{error || hint}</FieldMessage>
    </div>
  );
}
