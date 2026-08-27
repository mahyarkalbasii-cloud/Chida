import * as React from 'react';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** Stacked actions; destructive action first, "انصراف" as secondary below it. */
  footer?: React.ReactNode;
  dismissible?: boolean;
}

export declare function Modal(props: ModalProps): JSX.Element | null;
