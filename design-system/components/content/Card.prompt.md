The default container: surface fill, 1px hairline, 14px radius, **no shadow** — depth in CHIDA comes from borders, not shadows.

```jsx
<Card>…</Card>
<Card interactive onClick={open}>…</Card>
```

Only floating things (`Modal`, `BottomSheet`) get a shadow. Do not nest a Card inside a Card; use a divider instead.
