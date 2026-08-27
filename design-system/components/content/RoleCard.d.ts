import * as React from 'react';

/**
 * The builder-or-supplier choice at the start of sign-up — a radio card, one per role.
 */
export interface RoleCardProps {
  /** Icon name — "building-2" for سازنده, "store" for تأمین‌کننده. */
  icon?: string;
  title: string;
  /** One line on what this role does in CHIDA. */
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (value?: string) => void;
  /** Radio group name — keep identical across the cards of one choice. */
  name?: string;
  value?: string;
  style?: React.CSSProperties;
}

export declare function RoleCard(props: RoleCardProps): JSX.Element;
