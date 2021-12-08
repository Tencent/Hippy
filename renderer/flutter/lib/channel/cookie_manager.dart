import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';

CookieJar cookieJar = CookieJar();

class CookieManager {
  static final CookieManager _singleton = CookieManager();
  CookieJar cookieJar = CookieJar();

  static CookieManager getInstance() {
    return _singleton;
  }

  void setCookie(String url, List<Cookie> cookies) {
    cookieJar.saveFromResponse(Uri.parse(url), cookies);
  }

  Future<List<Cookie>> getCookie(String url) {
    return cookieJar.loadForRequest(Uri.parse(url));
  }
}
