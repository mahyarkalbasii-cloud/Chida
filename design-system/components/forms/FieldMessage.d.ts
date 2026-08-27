import * as React from 'react';

export interface FieldMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** help = neutral guidance under a field; error = rust text + icon + role="alert". */
  tone?: 'help' | 'error';
  children?: React.ReactNode;
  /** Wire to the field's aria-describedby. */
  id?: string;
}

export declare function FieldMessage(props: FieldMessageProps): JSX.Element | null;
