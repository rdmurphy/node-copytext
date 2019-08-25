import { WorkSheet } from 'xlsx';
declare type KeyValueResults = {
    [key: string]: unknown;
};
/**
 * Converts an Excel spreadsheet into an object, with each key representing
 * the value in the first column, and each value representing the value in the
 * second column.
 * @param worksheet The worksheet to convert
 */
export declare function keyvalue(worksheet: WorkSheet): KeyValueResults;
/**
 * Converts an Excel worksheet into an Array of Objects corresponding to the
 * rows of the sheet.
 * @param worksheet The worksheet to convert
 */
export declare function table(worksheet: WorkSheet): unknown[];
export {};
