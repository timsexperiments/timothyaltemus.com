export function formatDate(date: Date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeFormatter.format(date)}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeFormatter.format(date)}`;
  } else {
    return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
  }
}
