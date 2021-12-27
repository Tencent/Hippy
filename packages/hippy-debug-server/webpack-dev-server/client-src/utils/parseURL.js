function parseURL(resourceQuery) {
  const options = {};

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    const searchParams = resourceQuery.substr(1).split('&');

    for (let i = 0; i < searchParams.length; i++) {
      const pair = searchParams[i].split('=');

      options[pair[0]] = decodeURIComponent(pair[1]);
    }
  }

  return options;
}

export default parseURL;
