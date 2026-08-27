import * as React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** File name (without .svg) of a glyph in assets/icons — e.g. "phone", "chevron-left". */
  name: string;
  /** Square size in px. 16 inline, 20 default, 24 headers, 32 feature. */
  size?: number;
  /** Any CSS color; defaults to currentColor so the icon inherits text color. */
  color?: string;
  /** Mirror horizontally — use for directional glyphs that must point the RTL way. */
  flip?: boolean;
}

export declare function Icon(props: IconProps): JSX.Element;
