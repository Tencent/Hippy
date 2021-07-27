export declare const _Eps: number;
export declare class Vector {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    length(): number;
    normalize(): void;
}
export declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
    distanceTo(p: Point): number;
    projectOn(line: Point): Point;
    scale(scalar: number): Point;
    toString(): string;
}
export declare class CubicBezier {
    controlPoints: Point[];
    constructor(point1: Point, point2: Point);
    static parse(text: string): CubicBezier | null;
    evaluateAt(t: number): Point;
    asCSSText(): string;
    static readonly Regex: RegExp;
    static readonly KeywordValues: Map<string, string>;
}
export declare class EulerAngles {
    alpha: number;
    beta: number;
    gamma: number;
    constructor(alpha: number, beta: number, gamma: number);
    /**
     * Derives orientation angles from a rotation matrix.
     *
     * The angles alpha, beta and gamma are in the [0, 360), [-180, 180) and
     * [-90, 90) intervals respectively, as specified in the Device Orientation
     * spec (https://w3c.github.io/deviceorientation/#deviceorientation).
     *
     * The Euler angles derived here follow a Z-X'-Y'' sequence.
     *
     * In particular we compute the decomposition of a given rotation matrix r
     * such that
     *    r = rz(alpha) * rx(beta) * ry(gamma)
     * where rz, rx and ry are rotation matrices around z, x and y axes in the
     * world coordinate reference frame respectively. The reference frame
     * consists of three orthogonal axes x, y, z where x points East, y points
     * north and z points upwards perpendicular to the ground plane. The computed
     * angles alpha, beta and gamma are in degrees and clockwise-positive when
     * viewed along the positive direction of the corresponding axis. Except for
     * the special case when the beta angle is +-90 these angles uniquely
     * define the orientation of a mobile device in 3D space. The
     * alpha-beta-gamma representation resembles the yaw-pitch-roll convention
     * used in vehicle dynamics, however it does not exactly match it. One of the
     * differences is that the 'pitch' angle beta is allowed to be within [-180,
     * 180). A mobile device with pitch angle greater than 90 could
     * correspond to a user lying down and looking upward at the screen.
     */
    static fromDeviceOrientationRotationMatrix(rotationMatrix: DOMMatrixReadOnly): EulerAngles;
}
export declare const scalarProduct: (u: Vector, v: Vector) => number;
export declare const crossProduct: (u: Vector, v: Vector) => Vector;
export declare const subtract: (u: Vector, v: Vector) => Vector;
export declare const multiplyVectorByMatrixAndNormalize: (v: Vector, m: DOMMatrix) => Vector;
export declare const calculateAngle: (u: Vector, v: Vector) => number;
export declare const degreesToRadians: (deg: number) => number;
export declare const degreesToGradians: (deg: number) => number;
export declare const degreesToTurns: (deg: number) => number;
export declare const radiansToDegrees: (rad: number) => number;
export declare const radiansToGradians: (rad: number) => number;
export declare const radiansToTurns: (rad: number) => number;
export declare const gradiansToRadians: (grad: number) => number;
export declare const turnsToRadians: (turns: number) => number;
export declare const boundsForTransformedPoints: (matrix: DOMMatrix, points: number[], aggregateBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
} | undefined) => {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
export declare class Size {
    width: number;
    height: number;
    constructor(width: number, height: number);
    clipTo(size?: Size | null): Size;
    scale(scale: number): Size;
    isEqual(size: Size | null): boolean;
    widthToMax(size: number | Size): Size;
    addWidth(size: number | Size): Size;
    heightToMax(size: number | Size): Size;
    addHeight(size: number | Size): Size;
}
export declare class Insets {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(left: number, top: number, right: number, bottom: number);
    isEqual(insets: Insets | null): boolean;
}
export declare class Rect {
    left: number;
    top: number;
    width: number;
    height: number;
    constructor(left: number, top: number, width: number, height: number);
    isEqual(rect: Rect | null): boolean;
    scale(scale: number): Rect;
    size(): Size;
    relativeTo(origin: Rect): Rect;
    rebaseTo(origin: Rect): Rect;
}
export declare class Constraints {
    minimum: Size;
    preferred: Size;
    constructor(minimum?: Size, preferred?: Size | null);
    isEqual(constraints: Constraints | null): boolean;
    widthToMax(value: number | Constraints): Constraints;
    addWidth(value: number | Constraints): Constraints;
    heightToMax(value: number | Constraints): Constraints;
    addHeight(value: number | Constraints): Constraints;
}
