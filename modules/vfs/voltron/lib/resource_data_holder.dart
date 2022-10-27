import 'dart:typed_data';

enum FetchResultCode {
  ok,
  openLocalFileError,
  notSupportSyncRemoteError,
  unknownSchemeError,
  remoteRequestFailedError
}

enum RequestFrom {
  native,
  local
}

enum TransferType {
  normal,
  nativeBuffer
}

mixin FetchResourceCallback {
  void onFetchCompleted(ResourceDataHolder holder);
}

class ResourceDataHolder {
  final String url;
  Uint8List? buffer;
  Map<String, String>? requestHeaders;
  Map<String, String>? responseHeaders;
  FetchResourceCallback? callback;
  TransferType transferType = TransferType.normal;

}
