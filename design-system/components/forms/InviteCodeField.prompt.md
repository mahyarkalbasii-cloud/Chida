The builder-side invite code — LTR, upper-case, auto-dashed, and tolerant of a pasted code with spaces or lower-case letters.

```jsx
<InviteCodeField value={code} onChange={setCode} loading={checking}
  hint="کد دعوت را از تیم چیدا دریافت می‌کنید."
  error={bad ? 'این کد معتبر نیست. دوباره بررسی کنید.' : undefined} />
```

Format is 7 alphanumerics with a dash after the third (`CHD-4K9P`); the mask is applied while typing. Only the builder path uses it — suppliers go straight to the phone step.
