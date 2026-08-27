A short centered dialog for decisions that must be answered before continuing — leaving a half-finished flow, discarding data.

```jsx
<Modal open={open} title="از این مرحله خارج می‌شوید؟" description="اطلاعات واردشده ذخیره نمی‌شود."
  footer={<>
    <Button variant="danger" fullWidth onClick={leave}>خروج</Button>
    <Button variant="secondary" fullWidth onClick={close}>ادامه ثبت‌نام</Button>
  </>} />
```

Two actions at most. Anything longer or scrollable belongs in a `BottomSheet`.
