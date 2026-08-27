import React from 'react';

/* Lucide glyphs shipped in assets/icons. The SVG is fetched once and inlined so
   stroke="currentColor" inherits the text colour in both themes.
   Pages set window.CHIDA_ICON_BASE to the relative path of that folder. */
const cache = {};
const inflight = {};

function loadIcon(url) {
  if (cache[url]) return Promise.resolve(cache[url]);
  if (!inflight[url]) {
    inflight[url] = fetch(url)
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => {
        const svg = t.replace(/width="24"/, 'width="100%"').replace(/height="24"/, 'height="100%"');
        cache[url] = svg;
        return svg;
      })
      .catch(() => '');
  }
  return inflight[url];
}

export function Icon({ name, size = 20, color = 'currentColor', flip = false, style, ...rest }) {
  const base = (typeof window !== 'undefined' && window.CHIDA_ICON_BASE) || 'assets/icons';
  const q = (typeof window !== 'undefined' && window.CHIDA_ASSET_QUERY) || '';
  const url = base + '/' + name + '.svg' + q;
  const px = Number(size) || 20;
  const [markup, setMarkup] = React.useState(cache[url] || '');

  React.useEffect(() => {
    let alive = true;
    if (cache[url]) { setMarkup(cache[url]); return undefined; }
    loadIcon(url).then((svg) => { if (alive) setMarkup(svg); });
    return () => { alive = false; };
  }, [url]);

  return (
    <span
      aria-hidden="true"
      {...rest}
      dangerouslySetInnerHTML={{ __html: markup }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: px, height: px, flex: '0 0 auto', color,
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    />
  );
}
