export declare const enum ResultKind {
    ERROR = 0,
    PARAM_NAME = 1,
    PARAMETER = 2,
    PARAMETERS = 3,
    ITEM = 4,
    INTEGER = 5,
    DECIMAL = 6,
    STRING = 7,
    TOKEN = 8,
    BINARY = 9,
    BOOLEAN = 10,
    LIST = 11,
    INNER_LIST = 12,
    SERIALIZATION_RESULT = 13
}
export interface Error {
    kind: ResultKind.ERROR;
}
export interface Integer {
    kind: ResultKind.INTEGER;
    value: number;
}
export interface Decimal {
    kind: ResultKind.DECIMAL;
    value: number;
}
export interface String {
    kind: ResultKind.STRING;
    value: string;
}
export interface Token {
    kind: ResultKind.TOKEN;
    value: string;
}
export interface Binary {
    kind: ResultKind.BINARY;
    value: string;
}
export interface Boolean {
    kind: ResultKind.BOOLEAN;
    value: boolean;
}
export declare type BareItem = Integer | Decimal | String | Token | Binary | Boolean;
export interface ParamName {
    kind: ResultKind.PARAM_NAME;
    value: string;
}
export interface Parameter {
    kind: ResultKind.PARAMETER;
    name: ParamName;
    value: BareItem;
}
export interface Parameters {
    kind: ResultKind.PARAMETERS;
    items: Parameter[];
}
export interface Item {
    kind: ResultKind.ITEM;
    value: BareItem;
    parameters: Parameters;
}
export interface InnerList {
    kind: ResultKind.INNER_LIST;
    items: Item[];
    parameters: Parameters;
}
export declare type ListMember = Item | InnerList;
export interface List {
    kind: ResultKind.LIST;
    items: ListMember[];
}
export interface SerializationResult {
    kind: ResultKind.SERIALIZATION_RESULT;
    value: string;
}
export declare function parseItem(input: string): Item | Error;
export declare function parseList(input: string): List | Error;
export declare function serializeItem(input: Item): SerializationResult | Error;
export declare function serializeList(input: List): SerializationResult | Error;
