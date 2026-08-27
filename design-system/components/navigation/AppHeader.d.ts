import * as React from 'react';

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Screen title — short, no punctuation. Omit on the first screen of a flow. */
  title?: string;
  /** Small line under the title, e.g. "مرحله ۲ از ۳". */
  subtitle?: string;
  /** Shows the back control (a right-pointing chevron in RTL). */
  onBack?: () => void;
  backLabel?: string;
  /** Trailing slot — one IconButton or a ghost Button. */
  action?: React.ReactNode;
  sticky?: boolean;
}

export declare function AppHeader(props: AppHeaderProps): JSX.Element;
