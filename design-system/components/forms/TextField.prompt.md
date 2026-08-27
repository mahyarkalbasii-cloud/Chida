The base field for free text — labels are always visible, and the message line below is reserved so the layout does not jump when an error appears.

```jsx
<TextField label="نام پروژه" value={v} onChange={e => set(e.target.value)}
  placeholder="مثلاً برج مسکونی نیلوفر" hint="این نام را فقط شما می‌بینید." />
<TextField label="متراژ" ltr icon="layers" suffix={<span>متر مربع</span>} />
<TextField label="نام فروشگاه" error="این نام قبلاً ثبت شده است." />
```

States: default, hover (darker hairline), focus (copper border + 3px copper tint ring), filled, error, disabled, loading. For phone numbers, invite codes and OTP use `PhoneField`, `InviteCodeField`, `OtpInput` — they add the LTR isolation and paste behaviour.
