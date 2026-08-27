import * as React from 'react';

export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Leading icon in a 40px tinted square. */
  icon?: string;
  /** Right-side value — price, count, date. Rendered with tabular numerals. */
  meta?: React.ReactNode;
  /** Replaces the default chevron. */
  trailing?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

export declare function ListRow(props: ListRowProps): JSX.Element;
