import * as React from 'react';

/**
 * The base 52px text field — label above, hairline box, one message line below.
 */
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  /** Persian label, always visible — CHIDA does not use placeholder-only fields. */
  label?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  /** Neutral guidance shown under the field. */
  hint?: React.ReactNode;
  /** Error text — replaces the hint, turns the border rust, sets aria-invalid. */
  error?: React.ReactNode;
  disabled?: boolean;
  /** Shows a spinner inside the field (e.g. while a value is being checked). */
  loading?: boolean;
  /** Adds a quiet "اختیاری" tag next to the label. */
  optional?: boolean;
  /** Isolate the value as LTR with tabular numerals — for anything Latin/numeric. */
  ltr?: boolean;
  /** Leading icon name from assets/icons. */
  icon?: string;
  /** Trailing node — a unit, a "نمایش" toggle, a small Button. */
  suffix?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export declare function TextField(props: TextFieldProps): JSX.Element;
