import * as React from 'react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Icon name from assets/icons. */
  icon: string;
  /** Persian accessible name — required; the icon alone never conveys meaning. */
  label: string;
  /** ghost = transparent (headers, rows); surface = hairline chip on canvas. */
  variant?: 'ghost' | 'surface';
  /** Hit area in px — never below 48. */
  size?: number;
  /** Mirror the glyph for RTL direction. */
  flip?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
