Renders one Lucide glyph from `assets/icons` — the SVG is fetched once and inlined, so it inherits the current text colour in both themes. Never paste raw SVG into a screen.

```jsx
<Icon name="phone" size={20} />
<Icon name="chevron-left" size={24} flip />   {/* points right in RTL */}
```

Set `window.CHIDA_ICON_BASE = '../../assets/icons'` (path relative to the HTML page) before mounting. Sizes: 16 inline with text, 20 default, 24 in headers/list rows, 32 for role cards and empty states. Stroke weight is Lucide's 2px at 24px — do not mix in another icon family.
