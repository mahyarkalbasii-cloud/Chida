The one action control in CHIDA — every screen has at most one `primary` button, and on mobile it is full-width and pinned above the keyboard.

```jsx
<Button variant="primary" fullWidth onClick={next}>ادامه</Button>
<Button variant="secondary" size="sm" iconStart="pencil">ویرایش</Button>
<Button variant="ghost" size="sm">ارسال دوباره کد</Button>
<Button variant="primary" fullWidth loading>در حال بررسی</Button>
```

Variants: `primary` (copper fill), `secondary` (surface + hairline), `ghost` (text only), `danger` (rust fill, destructive confirmations only). `loading` keeps the label and adds a spinner — never replace the label with a bare spinner. Disabled buttons stay visible but must never be the only explanation of why an action is blocked; pair them with a `FieldMessage`.
