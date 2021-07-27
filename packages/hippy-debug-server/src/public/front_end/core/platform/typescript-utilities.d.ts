/**
 * This is useful to keep TypeScript happy in a test - if you have a value
 * that's potentially `null` you can use this function to assert that it isn't,
 * and satisfy TypeScript that the value is present.
 */
export declare function assertNotNull<T>(val: T): asserts val is NonNullable<T>;
/**
 * This is useful to check on the type-level that the unhandled cases of
 * a switch are exactly `T` (where T is usually a union type of enum values).
 * @param caseVariable
 */
export declare function assertUnhandled<T>(_caseVariable: T): T;
