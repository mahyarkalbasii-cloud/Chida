A screen-level message for conditions that are not tied to one field — a failed request, no connection, a service note.

```jsx
<InlineBanner tone="offline" title="اتصال اینترنت برقرار نیست"
  action={<Button size="sm" variant="secondary" iconStart="refresh-cw">تلاش دوباره</Button>}>
  وقتی شبکه برگردد، ادامه می‌دهیم.
</InlineBanner>
```

Field-level problems belong to `FieldMessage`, not here. Tone is carried by icon + text, never by color alone.
