export function formatPrice(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return '$' + (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (abs >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(1) + 'M';
  }
  if (abs >= 1_000) {
    return '$' + (value / 1_000).toFixed(1) + 'k';
  }
  if (abs >= 1) {
    return '$' + value.toFixed(0);
  }
  return '$' + value.toFixed(4);
}

export function formatDate(timestamp: number, includeTime: boolean = false): string {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-US', options);
}

export function formatIndicatorValue(value: number): string {
  return value.toFixed(3);
}

export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
