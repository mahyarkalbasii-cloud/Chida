import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Spinner } from '../feedback/Spinner.jsx';
import { FieldMessage } from './FieldMessage.jsx';
import { normalizePhone, formatPhone } from './digits.js';

export function PhoneField({
  label = 'شماره موبایل', value = '', onChange, hint, error, disabled = false, loading = false,
  autoFocus = false, id, inputRef, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const auto = React.useId ? React.useId() : 'p';
  const fieldId = id || 'chida-phone-' + auto;
  const msgId = fieldId + '-msg';
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--accent)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-default)';

  const handle = (e) => { if (onChange) onChange(normalizePhone(e.target.value)); };

  return (
    <div style={{ width: '100%', ...style }}>
      <label htmlFor={fieldId} style={{ display: 'block', marginBottom: 'var(--space-3)', fontSize: 'var(--size-label)', lineHeight: 'var(--lh-label)', fontWeight: 'var(--weight-medium)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)' }}>{label}</label>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)', height: 'var(--field-height)', padding: '0 var(--space-4)',
          background: disabled ? 'var(--bg-inset)' : 'var(--bg-surface)',
          border: '1px solid ' + borderColor, borderRadius: 'var(--radius-control)',
          boxShadow: focus ? '0 0 0 3px ' + (error ? 'var(--danger-subtle)' : 'var(--accent-subtle)') : 'none',
          transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        }}>
        <Icon name="phone" size={20} color={focus ? 'var(--accent)' : 'var(--text-tertiary)'} />
        <input
          id={fieldId} ref={inputRef} className="chida-ltr-field" value={formatPhone(value)} onChange={handle}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          type="tel" inputMode="numeric" autoComplete="tel" name="phone" autoFocus={autoFocus}
          disabled={disabled} placeholder="0912 345 6789" dir="ltr"
          aria-invalid={error ? true : undefined} aria-describedby={(error || hint) ? msgId : undefined}
          {...rest}
          style={{
            flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-fa)', fontSize: 'var(--size-body)', fontWeight: 'var(--weight-medium)',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
          }}
        />
        <span aria-hidden="true" className="chida-ltr-field" style={{ fontSize: 'var(--size-callout)', color: 'var(--text-tertiary)', fontWeight: 'var(--weight-medium)', paddingInlineStart: 'var(--space-3)', borderInlineStart: '1px solid var(--border-subtle)' }}>+98</span>
        {loading ? <Spinner size={18} /> : null}
      </div>
      <FieldMessage id={msgId} tone={error ? 'error' : 'help'}>{error || hint}</FieldMessage>
    </div>
  );
}
