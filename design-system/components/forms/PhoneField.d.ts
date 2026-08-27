import * as React from 'react';

export interface PhoneFieldProps {
  label?: string;
  /** Raw digits only, e.g. "09123456789" — the component formats and re-normalises. */
  value?: string;
  /** Receives normalised Latin digits (paste of +98…, 0098…, ۰۹۱۲… all land correctly). */
  onChange?: (digits: string) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  style?: React.CSSProperties;
}

export declare function PhoneField(props: PhoneFieldProps): JSX.Element;
