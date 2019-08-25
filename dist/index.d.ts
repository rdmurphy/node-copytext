/// <reference types="node" />
export { keyvalue, table } from './processors';
export interface ProcessOptions {
    include?: string[];
    exclude?: string[];
    processor?: string;
    overrides?: {
        [sheetName: string]: 'keyvalue' | 'table';
    };
}
export declare type ProcessResults = {
    [sheetName: string]: unknown;
};
export declare function process(file: string | Buffer, { include, exclude, processor, overrides, }?: ProcessOptions): ProcessResults;
