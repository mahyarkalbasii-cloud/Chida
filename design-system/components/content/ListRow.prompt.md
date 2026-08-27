A single line of a list — projects, quotes, orders, settings. Hairline divider, 48px minimum height, chevron only when the row navigates.

```jsx
<ListRow icon="building-2" title="برج نیلوفر" subtitle="۳ استعلام باز" meta="۲ روز پیش" onClick={open} />
```

In RTL the navigation chevron points left. Numbers in `meta` are tabular so columns align.
