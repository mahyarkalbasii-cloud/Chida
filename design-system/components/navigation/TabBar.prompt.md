The bottom navigation for the signed-in product — 3 or 4 destinations, active state in copper text plus weight change.

```jsx
<TabBar value={tab} onChange={setTab} items={[
  { id: 'home', label: 'خانه', icon: 'house' },
  { id: 'orders', label: 'سفارش‌ها', icon: 'clipboard-list' },
  { id: 'account', label: 'حساب', icon: 'user' },
]} />
```

The tab set differs per role and never contains a role switcher — an account is either a builder or a supplier for its whole life.
