import * as React from 'react';

/**
 * The CHIDA action button: one primary action per screen, full-width on mobile.
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children: React.ReactNode;
  /** primary = the single main action; secondary = alternative; ghost = low-weight text action; danger = destructive. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** lg = 52px (default, forms and screen actions); sm = 40px (inside cards and rows). */
  size?: 'lg' | 'sm';
  fullWidth?: boolean;
  /** Swaps the leading icon for a spinner and blocks clicks; keep the label visible. */
  loading?: boolean;
  disabled?: boolean;
  /** Icon name from assets/icons rendered before the label. */
  iconStart?: string;
  /** Icon name rendered after the label. */
  iconEnd?: string;
  style?: React.CSSProperties;
}

export declare function Button(props: ButtonProps): JSX.Element;
