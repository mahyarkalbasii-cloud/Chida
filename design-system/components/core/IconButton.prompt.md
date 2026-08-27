A 48px square icon-only control for headers and list rows — always takes a Persian `label` for screen readers.

```jsx
<IconButton icon="chevron-right" label="بازگشت" onClick={back} />
<IconButton icon="bell" label="اعلان‌ها" variant="surface" />
```

Back arrows in RTL point right: use `chevron-right`, or `chevron-left` with `flip`. Never below 48px, never without a label.
