import * as React from 'react';

export interface TabBarItem {
  id: string;
  /** Persian label — one or two words. */
  label: string;
  /** Icon name from assets/icons. */
  icon: string;
}

export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  /** 3–4 destinations; more than 4 does not fit at 390px. */
  items: TabBarItem[];
  value?: string;
  onChange?: (id: string) => void;
}

export declare function TabBar(props: TabBarProps): JSX.Element;
