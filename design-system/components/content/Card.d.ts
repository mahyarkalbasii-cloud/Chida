import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** CSS padding; default 16px. */
  padding?: string;
  /** Adds hover/press affordance and button semantics. */
  interactive?: boolean;
}

export declare function Card(props: CardProps): JSX.Element;
