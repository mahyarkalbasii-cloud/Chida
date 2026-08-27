The default overlay on mobile — pickers, secondary forms, "why do we need this?" explanations.

```jsx
<BottomSheet open={open} onClose={close} title="راهنمای کد دعوت"
  footer={<Button variant="primary" fullWidth onClick={close}>متوجه شدم</Button>}>
  کد دعوت را تیم چیدا برای شما می‌فرستد.
</BottomSheet>
```

Positions itself against the nearest positioned ancestor (`position: relative` on the screen frame). Use `Modal` instead only for a short blocking confirmation.
