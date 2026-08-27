import * as React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Label content — may contain a link (e.g. to the terms). */
  children?: React.ReactNode;
  /** Error text under the row, e.g. when the terms are not accepted. */
  error?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;
