Progress through a short flow: equal copper segments filling right-to-left, plus a spelled-out counter so progress is not carried by color alone.

```jsx
<StepIndicator total={3} current={2} label="شماره موبایل" />
```

Use it only for flows of 2–4 steps. Segments never animate backwards abruptly — going back simply un-fills the last segment.
