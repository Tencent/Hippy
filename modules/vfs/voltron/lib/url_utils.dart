bool isHttpUrl(String url) {
  return url.isNotEmpty && url.substring(0, 7).toLowerCase() == "http://";
}

bool isHttpsUrl(String url) {
  return url.isNotEmpty && url.substring(0, 8).toLowerCase() == "https://";
}

bool isFileUrl(String url) {
  return url.isNotEmpty && url.substring(0, 7).toLowerCase() == "file://";
}

bool isWebUrl(String url) {
  return isHttpUrl(url) || isHttpsUrl(url);
}
