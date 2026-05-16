export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    utility: '#00E5FF', game: '#FF3D71', productivity: '#00FFA3',
    social: '#4D8CFF', media: '#FFB547', finance: '#8A5BFF',
    education: '#FF6B2B', other: '#8B9BB4',
  };
  return map[category] ?? '#8B9BB4';
}
