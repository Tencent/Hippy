/* eslint-disable import/prefer-default-export */

/**
 * Warninng information output
 */
function warn(...context: any[]) {
  // In production build
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  /* eslint-disable-next-line no-console */
  console.warn(...context);
}

export {
  warn,
};
