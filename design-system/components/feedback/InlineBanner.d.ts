import * as React from 'react';

export interface InlineBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** error = rust tint + role="alert"; warning/offline = neutral; info = copper tint. */
  tone?: 'error' | 'warning' | 'info' | 'offline';
  /** Short bold line — what happened. */
  title?: string;
  /** Explanation or next step. */
  children?: React.ReactNode;
  /** One small Button, usually "تلاش دوباره". */
  action?: React.ReactNode;
  /** Override the tone's default icon. */
  icon?: string;
}

export declare function InlineBanner(props: InlineBannerProps): JSX.Element;
