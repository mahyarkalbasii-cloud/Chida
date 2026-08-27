import * as React from 'react';

export interface OtpInputProps {
  /** Digit count — CHIDA uses 6. */
  length?: number;
  /** Current digits, e.g. "0491". */
  value?: string;
  onChange?: (digits: string) => void;
  /** Fires once the last box is filled — auto-submit from here. */
  onComplete?: (digits: string) => void;
  label?: string;
  hint?: React.ReactNode;
  /** Error text; also shakes the group once and marks every box invalid. */
  error?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export declare function OtpInput(props: OtpInputProps): JSX.Element;
