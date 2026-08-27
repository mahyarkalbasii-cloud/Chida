The one line under a field: guidance in neutral grey, or the error in rust with an icon so the state never depends on color alone.

```jsx
<FieldMessage id="phone-help">کد تأیید به همین شماره پیامک می‌شود.</FieldMessage>
<FieldMessage tone="error" id="phone-err">شماره موبایل ۱۱ رقم و با ۰۹ شروع می‌شود.</FieldMessage>
```

Errors say what to do next, never blame the user. The field components render this for you when you pass `hint` / `error`.
