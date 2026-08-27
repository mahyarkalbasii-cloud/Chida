import * as React from 'react';

export interface SuccessStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short Persian confirmation, e.g. "حساب شما ساخته شد". */
  title: string;
  /** One calm sentence about what happens next. */
  description?: string;
  /** Icon name; defaults to "check". Use "circle-check" for a heavier confirmation. */
  icon?: string;
  /** Actions — usually a single primary Button. */
  children?: React.ReactNode;
}

export declare function SuccessState(props: SuccessStateProps): JSX.Element;
