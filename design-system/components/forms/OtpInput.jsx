import React from 'react';
import { FieldMessage } from './FieldMessage.jsx';
import { onlyDigits } from './digits.js';

export function OtpInput({
  length = 6, value = '', onChange, onComplete, error, disabled = false, autoFocus = false,
  label, hint, id, style, ...rest
}) {
  const refs = React.useRef([]);
  const [focusIdx, setFocusIdx] = React.useState(-1);
  const auto = React.useId ? React.useId() : 'o';
  const groupId = id || 'chida-otp-' + auto;
  const msgId = groupId + '-msg';
  const digits = onlyDigits(value, length);

  const commit = (next) => {
    onChange && onChange(next);
    if (next.length === length && onComplete) onComplete(next);
  };

  const setAt = (i, raw) => {
    const typed = onlyDigits(raw, length);
    if (!typed) return;
    let next;
    if (typed.length > 1) next = (digits.slice(0, i) + typed).slice(0, length);
    else next = (digits.slice(0, i) + typed + digits.slice(i + 1)).slice(0, length);
    commit(next);
    const target = Math.min(next.length, length - 1);
    const el = refs.current[target];
    if (el) el.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) commit(digits.slice(0, i) + digits.slice(i + 1));
      else if (i > 0) { commit(digits.slice(0, i - 1) + digits.slice(i)); refs.current[i - 1] && refs.current[i - 1].focus(); }
    } else if (e.key === 'ArrowLeft' && i > 0) { refs.current[i - 1].focus(); }
    else if (e.key === 'ArrowRight' && i < length - 1) { refs.current[i + 1].focus(); }
  };

  return (
    <div style={{ width: '100%', ...style }} {...rest}>
      {label ? <div id={groupId + '-label'} style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--size-label)', lineHeight: 'var(--lh-label)', fontWeight: 'var(--weight-medium)' }}>{label}</div> : null}
      <div dir="ltr" role="group" aria-labelledby={label ? groupId + '-label' : undefined} aria-describedby={(error || hint) ? msgId : undefined}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(' + length + ', 1fr)', gap: 'var(--space-3)', direction: 'ltr',
          animation: error ? 'chida-shake var(--dur-slow) var(--ease-standard)' : undefined,
        }}>
        {Array.from({ length }).map((_, i) => {
          const filled = Boolean(digits[i]);
          const active = focusIdx === i;
          return (
            <input
              key={i} ref={(el) => { refs.current[i] = el; }}
              value={digits[i] || ''} disabled={disabled}
              onChange={(e) => setAt(i, e.target.value)} onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => { setFocusIdx(i); e.target.select(); }} onBlur={() => setFocusIdx(-1)}
              onPaste={(e) => { e.preventDefault(); setAt(0, e.clipboardData.getData('text')); }}
              inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} name={i === 0 ? 'otp' : undefined}
              maxLength={length} autoFocus={autoFocus && i === 0} aria-invalid={error ? true : undefined}
              aria-label={'رقم ' + (i + 1)}
              style={{
                width: '100%', height: 56, textAlign: 'center', boxSizing: 'border-box', padding: 0,
                background: disabled ? 'var(--bg-inset)' : filled ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
                border: '1px solid ' + (error ? 'var(--danger)' : active ? 'var(--accent)' : filled ? 'var(--border-strong)' : 'var(--border-default)'),
                borderRadius: 'var(--radius-control)', outline: 'none',
                boxShadow: active ? '0 0 0 3px ' + (error ? 'var(--danger-subtle)' : 'var(--accent-subtle)') : 'none',
                fontFamily: 'var(--font-fa)', fontSize: 'var(--size-otp)', lineHeight: 'var(--lh-otp)',
                fontWeight: 'var(--weight-demibold)', fontVariantNumeric: 'tabular-nums',
                transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)',
              }}
            />
          );
        })}
      </div>
      <FieldMessage id={msgId} tone={error ? 'error' : 'help'}>{error || hint}</FieldMessage>
    </div>
  );
}
