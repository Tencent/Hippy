class FlexOutput {
  static int makeDouble(double width, double height) {
    return makeInt(width.toInt(), height.toInt());
  }

  static int makeInt(int width, int height) {
    return width << 32 | height;
  }

  static int getWidth(int measureOutput) {
    return (0xFFFFFFFF & (measureOutput >> 32));
  }

  static int getHeight(int measureOutput) {
    return (0xFFFFFFFF & measureOutput);
  }
}
