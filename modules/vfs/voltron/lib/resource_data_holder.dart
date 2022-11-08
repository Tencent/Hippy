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

typedef FetchResourceCallback = Function(ResourceDataHolder holder);

class ResourceDataHolder {

  final String url;
  int index = -1;
  Uint8List? buffer;
  Map<String, String>? requestHeaders;
  Map<String, String>? responseHeaders;
  FetchResourceCallback? callback;
  TransferType transferType = TransferType.normal;
  RequestFrom requestFrom = RequestFrom.local;
  FetchResultCode resultCode = FetchResultCode.ok;
  String errorMsg = "";

  ResourceDataHolder({
    required this.url,
    this.requestFrom = RequestFrom.local,
    this.requestHeaders,
    this.callback,
  });

  Map<String, dynamic> encode() {
    return {
      'url': url,
      'index': index,
      'buffer': buffer,
      'req_headers': requestHeaders,
      'rsp_headers': responseHeaders,
      'trans_type': transferType.index,
      'from': requestFrom.index,
      'result_code': resultCode.index,
      'err_msg': errorMsg
    };
  }
}
