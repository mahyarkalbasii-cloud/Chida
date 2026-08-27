The 56px screen header: back control on the right (RTL), centred title, one optional trailing action.

```jsx
<AppHeader title="تأیید شماره" subtitle="مرحله ۳ از ۳" onBack={back} />
<AppHeader title="پروژه‌های من" action={<IconButton icon="bell" label="اعلان‌ها" />} />
```

Back is always available inside a flow except on its first screen. Never put the primary action here — it lives at the bottom of the screen.
