export const isMeaningful = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return false;
    const l = t.toLowerCase();
    if (l === 'n/a' || l === 'na' || l === 'not applicable' || l === 'not answered' || l === '—' || l === '-') return false;
    return true;
  }
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'boolean') return true;
  if (Array.isArray(v)) return v.some(isMeaningful);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return Object.values(o).some(isMeaningful);
  }
  return false;
};

export const displayValue = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.map(displayValue).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const parts = Object.entries(o)
      .filter(([, val]) => isMeaningful(val))
      .map(([k, val]) => `${k}: ${displayValue(val)}`);
    return parts.join('; ');
  }
  return String(v);
};