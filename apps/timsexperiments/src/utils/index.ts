/** Formats dates for articles in the format "January 1, 2023". */
export function formatArticleDate(date: Date) {
  return new Intl.DateTimeFormat('en-us', {
    dateStyle: 'long',
  }).format(date);
}

/** Rotates an array around */
export function rotate<T>(items: T[], aroundIndex: number = 0) {
  return [...items.slice(aroundIndex), ...items.slice(0, aroundIndex)];
}
