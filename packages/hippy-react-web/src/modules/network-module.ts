function getCookies() {
  return Promise.resolve(document.cookie);
}

function setCookie(url, keyValue, expires) {
  // TODO: Merge exist cookies.
  document.cookie = `${keyValue}; expire=${expires}`;
  return Promise.resolve(undefined);
}

export {
  getCookies,
  setCookie,
};
