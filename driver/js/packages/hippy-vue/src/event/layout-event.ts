/**
 * layout event
 */
export class LayoutEvent extends Event {
  // distance from top
  public top?: number;

  // distance from left
  public left?: number;

  // distance from bottom
  public bottom?: number;

  // distance from right
  public right?: number;

  // width
  public width?: number;

  // height
  public height?: number;
}
