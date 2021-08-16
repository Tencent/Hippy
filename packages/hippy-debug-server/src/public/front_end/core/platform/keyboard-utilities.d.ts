export declare const enum ArrowKey {
    UP = "ArrowUp",
    DOWN = "ArrowDown",
    LEFT = "ArrowLeft",
    RIGHT = "ArrowRight"
}
export declare const ARROW_KEYS: Set<ArrowKey>;
export declare function keyIsArrowKey(key: string): key is ArrowKey;
