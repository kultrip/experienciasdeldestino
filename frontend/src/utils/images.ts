const normalizeFilename = (name: string): string => {
  let base = name.trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  base = base.split('/').pop() || base;
  const dotIndex = base.lastIndexOf('.');
  const ext = dotIndex >= 0 ? base.slice(dotIndex).toLowerCase() : '';
  let stem = dotIndex >= 0 ? base.slice(0, dotIndex) : base;
  stem = stem
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  if (!stem) {
    stem = 'image';
  }
  return `${stem}${ext}`;
};

export const resolveImageUrl = (value?: string | null): string | null => {
  if (!value) return null;
  let trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  const normalized = normalizeFilename(trimmed);
  return `/images/${normalized}`;
};
