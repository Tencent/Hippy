export declare class FilePathScoreFunction {
    _query: string;
    _queryUpperCase: string;
    _score: Int32Array;
    _sequence: Int32Array;
    _dataUpperCase: string;
    _fileNameIndex: number;
    constructor(query: string);
    score(data: string, matchIndexes: number[] | null): number;
    _testWordStart(data: string, j: number): boolean;
    _restoreMatchIndexes(sequence: Int32Array, n: number, m: number, out: number[]): void;
    _singleCharScore(query: string, data: string, i: number, j: number): number;
    _sequenceCharScore(query: string, data: string, i: number, j: number, sequenceLength: number): number;
    _match(query: string, data: string, i: number, j: number, consecutiveMatch: number): number;
}
