A 24px box in a 48px tappable row — used for the terms agreement and for optional settings.

```jsx
<Checkbox checked={agreed} onChange={setAgreed}
  error={submitted && !agreed ? 'برای ادامه، شرایط را بپذیرید.' : undefined}>
  <a href="#">شرایط استفاده</a> و حریم خصوصی چیدا را می‌پذیرم.
</Checkbox>
```

The whole row is the hit target. Never pre-check a consent box.
