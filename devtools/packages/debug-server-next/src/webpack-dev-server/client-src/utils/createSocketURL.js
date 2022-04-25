import url from 'url';

function createSocketURL(parsedURL) {
  const { protocol, hostname, port, pathname, hash, role } = parsedURL;

  return url.format({
    protocol: protocol || 'ws:',
    hostname: hostname || 'localhost',
    port,
    pathname: pathname || '/ws',
    slashes: true,
    query: {
      hash,
      role,
    },
  });
}

export default createSocketURL;
