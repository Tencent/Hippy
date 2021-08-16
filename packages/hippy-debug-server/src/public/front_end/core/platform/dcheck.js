export function DCHECK(condition, message = 'DCHECK') {
  if (!condition()) {
    throw new Error(message + ':' + new Error().stack);
  }
}