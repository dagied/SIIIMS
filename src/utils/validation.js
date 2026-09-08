const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export const required = (value, label) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required.`;
  }
  return '';
};

export const email = (value, label = 'Email address') => {
  const requiredError = required(value, label);
  if (requiredError) return requiredError;
  return emailPattern.test(String(value).trim()) ? '' : `${label} must be a valid email address.`;
};

export const minLength = (value, length, label) => {
  if (String(value || '').trim().length < length) {
    return `${label} must be at least ${length} characters.`;
  }
  return '';
};

export const positiveNumber = (value, label, allowZero = false) => {
  const number = Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    return `${label} must be a valid ${allowZero ? 'non-negative' : 'positive'} number.`;
  }
  return '';
};

export const ipv4 = (value, label = 'IP address') => {
  const requiredError = required(value, label);
  if (requiredError) return requiredError;
  return ipv4Pattern.test(String(value).trim()) ? '' : `${label} must be a valid IPv4 address.`;
};

export const dateRange = (start, end, startLabel = 'Start date', endLabel = 'End date') => {
  const startError = required(start, startLabel);
  if (startError) return startError;
  const endError = required(end, endLabel);
  if (endError) return endError;
  return new Date(end) >= new Date(start) ? '' : `${endLabel} must be on or after ${startLabel.toLowerCase()}.`;
};

export const firstError = (...errors) => errors.find(Boolean) || '';
