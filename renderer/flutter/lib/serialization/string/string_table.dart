import 'package:flutter/services.dart';
import 'string_encoding.dart';
import 'string_location.dart';

/// A String pool, used to store and lookup frequently construct string objects.
abstract class StringTable {
  /// Use the specified {@code byteBuffer} and its {@code encoding} to find a string in the string table,
  /// if it exists, return its reference, if not, constructs a new one.
  ///
  /// If the string to be lookup is located in [StringLocation.eVoid], this means that the string will not be used,
  /// can simply return an empty string.
  ///
  /// The byte buffer used to lookup
  /// The [StringEncoding] of a supported encoding
  /// The location of the string
  /// If the string located in the value position of the k-v structure
  ///
  /// Return The string corresponding to [ByteData]
  String lookup(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey);

  void release();
}
