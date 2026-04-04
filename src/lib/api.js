const trimSlashes = (value) => value.replace(/\/+$/, '');

export function apiUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL ? trimSlashes(String(import.meta.env.VITE_API_BASE_URL)) : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
