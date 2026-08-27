import * as React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** neutral = status/metadata; accent = active or new; danger = expired or rejected. */
  tone?: 'neutral' | 'accent' | 'danger';
}

export declare function Tag(props: TagProps): JSX.Element;
