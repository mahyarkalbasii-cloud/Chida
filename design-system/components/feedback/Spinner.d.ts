import * as React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px: 16 inside sm buttons, 18–20 default, 28 for full-screen waits. */
  size?: number;
  color?: string;
  /** Persian status text for screen readers, e.g. "در حال ارسال کد". Omit for decorative use inside a Button. */
  label?: string;
}

export declare function Spinner(props: SpinnerProps): JSX.Element;
