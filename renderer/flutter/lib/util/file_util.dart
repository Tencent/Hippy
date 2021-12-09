import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart';

import 'string_util.dart';

Future<ByteData> loadAssetFileBinary(String name) {
  return rootBundle.load(name);
}

Future<Directory?> createDir(Directory? parent, String dirName) async {
  if (parent == null || isEmpty(dirName)) return null;

  var childDir =
      Directory(parent.absolute.path + Platform.pathSeparator + dirName);
  if (!await childDir.exists()) await childDir.create();

  return childDir;
}

String fileNameByFile(FileSystemEntity? file) {
  if (file == null) {
    return "";
  }

  return basename(file.path);
}
