/* Input normalisation shared by the LTR-isolated fields. */
const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

export function toLatinDigits(input = '') {
  return String(input).replace(/[۰-۹٠-٩]/g, (d) => {
    const i = FA.indexOf(d);
    return String(i > -1 ? i : AR.indexOf(d));
  });
}

/** Accepts pasted +98…, 0098…, 98… or 09… and returns up to 11 Latin digits starting with 0. */
export function normalizePhone(raw = '') {
  let d = toLatinDigits(raw).replace(/\D/g, '');
  if (d.startsWith('0098')) d = d.slice(4);
  else if (d.startsWith('98') && d.length > 10) d = d.slice(2);
  if (d.startsWith('9')) d = '0' + d;
  return d.slice(0, 11);
}

/** 0912 345 6789 */
export function formatPhone(digits = '') {
  const d = digits.slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean).join(' ');
}

/** CHD-4K9P — 7 upper-case alphanumerics with a dash after the third. */
export function normalizeInvite(raw = '') {
  const c = toLatinDigits(raw).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return c.length > 3 ? c.slice(0, 3) + '-' + c.slice(3) : c;
}

export function onlyDigits(raw = '', max = 6) {
  return toLatinDigits(raw).replace(/\D/g, '').slice(0, max);
}
