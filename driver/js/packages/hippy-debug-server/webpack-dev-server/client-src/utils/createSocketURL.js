import url from 'url';

function createSocketURL(parsedURL) {
  const { hostname, port, pathname } = parsedURL;

  return url.format({
    protocol: 'ws:',
    hostname: hostname || 'localhost',
    port: port || 38988,
    pathname: pathname || '/ws',
    slashes: true,
  });
}

export default createSocketURL;
