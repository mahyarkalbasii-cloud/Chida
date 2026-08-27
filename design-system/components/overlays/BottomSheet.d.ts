import * as React from 'react';

export interface BottomSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  /** Short Persian title; also the dialog's accessible name. */
  title?: string;
  /** One calm sentence under the title. */
  description?: string;
  children?: React.ReactNode;
  /** Actions stacked full-width at the bottom. */
  footer?: React.ReactNode;
  /** false for a blocking sheet (no backdrop tap, no close button). */
  dismissible?: boolean;
}

export declare function BottomSheet(props: BottomSheetProps): JSX.Element | null;
