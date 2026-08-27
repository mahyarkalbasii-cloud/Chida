import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Spinner } from '../feedback/Spinner.jsx';
import { FieldMessage } from './FieldMessage.jsx';
import { normalizeInvite } from './digits.js';

export function InviteCodeField({
  label = 'کد دعوت', value = '', onChange, hint, error, disabled = false, loading = false,
  autoFocus = false, id, inputRef, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const auto = React.useId ? React.useId() : 'i';
  const fieldId = id || 'chida-invite-' + auto;
  const msgId = fieldId + '-msg';
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--accent)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-default)';

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
        <Icon name="ticket" size={20} color={focus ? 'var(--accent)' : 'var(--text-tertiary)'} />
        <input
          id={fieldId} ref={inputRef} className="chida-ltr-field" value={value}
          onChange={(e) => onChange && onChange(normalizeInvite(e.target.value))}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          disabled={disabled} placeholder="CHD-4K9P" dir="ltr" spellCheck={false}
          autoCapitalize="characters" autoCorrect="off" autoComplete="one-time-code" inputMode="text" autoFocus={autoFocus}
          aria-invalid={error ? true : undefined} aria-describedby={(error || hint) ? msgId : undefined}
          {...rest}
          style={{
            flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-fa)', fontSize: 'var(--size-body)', fontWeight: 'var(--weight-medium)',
            letterSpacing: '.12em', textTransform: 'uppercase',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
          }}
        />
        {loading ? <Spinner size={18} /> : null}
      </div>
      <FieldMessage id={msgId} tone={error ? 'error' : 'help'}>{error || hint}</FieldMessage>
    </div>
  );
}
