export declare const inverse: <K, V>(map: Map<K, V>) => Multimap<V, K>;
export declare class Multimap<K, V> {
    private map;
    set(key: K, value: V): void;
    get(key: K): Set<V>;
    has(key: K): boolean;
    hasValue(key: K, value: V): boolean;
    get size(): number;
    delete(key: K, value: V): boolean;
    deleteAll(key: K): void;
    keysArray(): K[];
    valuesArray(): V[];
    clear(): void;
}
