import * as React from 'react';

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Steps in the flow — builder sign-up is 3, supplier sign-up is 2. */
  total?: number;
  /** 1-based current step. */
  current?: number;
  /** Optional name of the current step, shown on the right of the counter. */
  label?: string;
}

export declare function StepIndicator(props: StepIndicatorProps): JSX.Element;
