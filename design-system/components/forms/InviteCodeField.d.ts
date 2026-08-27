import * as React from 'react';

export interface InviteCodeFieldProps {
  label?: string;
  /** Formatted value, e.g. "CHD-4K9P". */
  value?: string;
  /** Receives the normalised value: upper-cased, non-alphanumerics dropped, dash re-inserted. */
  onChange?: (code: string) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  /** Spinner while the code is being verified server-side. */
  loading?: boolean;
  autoFocus?: boolean;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  style?: React.CSSProperties;
}

export declare function InviteCodeField(props: InviteCodeFieldProps): JSX.Element;
