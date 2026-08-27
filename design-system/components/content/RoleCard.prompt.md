The role choice, and the most consequential control in the product: an account is a builder **or** a supplier, permanently.

```jsx
<RoleCard icon="building-2" title="سازنده" value="builder" name="role"
  description="پروژه تعریف می‌کنید و برای خرید مصالح استعلام می‌گیرید."
  selected={role === 'builder'} onSelect={setRole} />
<RoleCard icon="store" title="تأمین‌کننده" value="supplier" name="role"
  description="کالا و قیمت ارائه می‌دهید و به استعلام‌ها پاسخ می‌دهید."
  selected={role === 'supplier'} onSelect={setRole} />
```

Selected = copper border + copper tint + filled check; it never relies on color alone. Always pair the two cards with a sentence stating the choice cannot be changed later — never offer a "both" option or a role switcher.
