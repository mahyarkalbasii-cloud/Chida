The Iranian mobile field: LTR-isolated inside the RTL page, `autoComplete="tel"`, numeric keypad, and paste-tolerant (+98, 0098, ۰۹۱۲…, spaces and dashes all normalise).

```jsx
<PhoneField value={phone} onChange={setPhone} autoFocus
  hint="کد تأیید به همین شماره پیامک می‌شود."
  error={invalid ? 'شماره باید ۱۱ رقم و با ۰۹ شروع شود.' : undefined} />
```

`onChange` gives you clean digits (`09123456789`); display formatting (`0912 345 6789`) is handled internally. The `+98` marker is decorative — never make the user type it.
