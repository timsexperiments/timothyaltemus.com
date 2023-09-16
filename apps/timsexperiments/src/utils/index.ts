export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-us', {
    dateStyle: "long",
  }).format(date);
}
