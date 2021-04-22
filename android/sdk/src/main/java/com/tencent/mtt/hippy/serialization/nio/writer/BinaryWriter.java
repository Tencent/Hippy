package com.tencent.mtt.hippy.serialization.nio.writer;

import java.nio.ByteBuffer;

/**
 * A serialization writer that write primitive value in their binary form.
 * in little-endian order, because Android is always little-endian order.
 */
public interface BinaryWriter {
  /**
   * Writes the given byte.
   *
   * @param b The byte to be written
   */
  void putByte(byte b);

  /**
   * This method transfers bytes into this writer from the given source array.
   *
   * @param bytes The array from which bytes are to be read
   * @param start The offset within the array of the first byte to be read
   * @param length The number of bytes to be read from the given array
   */
  void putBytes(byte[] bytes, int start, int length);

  /**
   * Writes eight bytes containing the given double value, in little-endian order.
   *
   * @param d The double value to be written
   */
  void putDouble(double d);

  /**
   * Writes an unsigned integer as a base-128 varint.
   * The number is written, 7 bits at a time, from the least significant to the
   * most significant 7 bits. Each byte, except the last, has the MSB set.
   * @see <a href="https://developers.google.com/protocol-buffers/docs/encoding">protocol buffers encoding</a>
   *
   * @param l The int or long value to be written
   * @return Number of bytes written
   */
  int putVarint(long l);

  /**
   * Writes eight bytes containing the given long value, in little-endian order.
   *
   * @param l The long value to be written
   */
  void putInt64(long l);

  /**
   * Writes two bytes containing the given char value, in little-endian order.
   *
   * @param c The char value to be written
   */
  void putChar(char c);

  /**
   * Returns this writer's length.
   *
   * @return The length of this writer
   */
  int length();

  /**
   * Sets this writer's length.
   * If new length is negative, it is treated as {@code current_length() + new_length}
   * If new length larger than writer capacity, the writer will be auto enlarge
   *
   * @param length The new length value
   * @return The current length of this writer
   */
  int length(int length);

  /**
   * Chunked the write operation and returns a wrapped {@link ByteBuffer} object.
   * After calling this method, writer will be reset and write from the beginning.
   *
   * @return wrapped byte buffer
   */
  ByteBuffer chunked();
}
