export function getFromLocalStorage<T>(key: string) {
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }

  return JSON.parse(item) as T;
}

export function setToLocalStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
