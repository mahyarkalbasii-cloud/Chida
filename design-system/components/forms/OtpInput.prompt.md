Six LTR boxes for the SMS code — SMS autofill (`one-time-code`), full-code paste into any box, backspace and arrow navigation, Persian digits normalised to Latin.

```jsx
<OtpInput value={code} onChange={setCode} onComplete={verify} autoFocus
  error={wrong ? 'کد واردشده درست نیست.' : undefined} />
```

Boxes read left-to-right even inside the RTL page — that is intentional and matches how the SMS arrives. Auto-submit on `onComplete`; keep the resend timer and "ویرایش شماره" link outside the component.
