// packages
import { default as XLSX, WorkSheet } from 'xlsx';

const isNumberRegEx = new RegExp(/\d+/);

type KeyValueResults = { [key: string]: unknown };

/**
 * Converts an Excel spreadsheet into an object, with each key representing
 * the value in the first column, and each value representing the value in the
 * second column.
 * @param worksheet The worksheet to convert
 */
export function keyvalue(worksheet: WorkSheet) {
  const data = {} as KeyValueResults;

  // loop through each cell in the worksheet
  for (const cell in worksheet) {
    // not a real cell, skip it
    if (cell[0] === '!') continue;

    // if it starts with 'A', we're looking at the beginning of a real row
    if (cell[0] === 'A') {
      // grab the value of the A cell
      let aCell = worksheet[cell].v;

      // look for a number in the cell
      const match = cell.match(isNumberRegEx);

      // pull out the cell's number to find the other columns
      const cellNumber = match ? match[0] : undefined;

      // pull out the value
      if (cellNumber) {
        let bCell = worksheet[`B${cellNumber}`];
        bCell = bCell ? bCell.v : '';

        // finally set value equal to key
        data[aCell] = bCell;
      } else {
        continue;
      }
    }
  }

  return data;
}

/**
 * Converts an Excel worksheet into an Array of Objects corresponding to the
 * rows of the sheet.
 * @param worksheet The worksheet to convert
 */
export function table(worksheet: WorkSheet) {
  // use xlsx's sheet_to_json converter
  // setting raw: true so it doesn't force everything to be a string
  return XLSX.utils.sheet_to_json(worksheet, { raw: true });
}
