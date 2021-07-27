export declare class CharacterIdMap<T> {
    _elementToCharacter: Map<T, string>;
    _characterToElement: Map<string, T>;
    _charCode: number;
    constructor();
    toChar(object: T): string;
    fromChar(character: string): T | null;
}
