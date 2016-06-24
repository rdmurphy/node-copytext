'use strict'

/**
 * Converts an Excel spreadsheet into an Object, with each key representing
 * the value in first column, and each value representing the value in the
 * second column.
 *
 * @param  {Object} worksheet
 * @return {Object}
 */
module.exports = function keyValueProcessor (worksheet) {
  const data = {}

  // loop through each cell in the worksheet
  for (let cell in worksheet) {
    // not a real cell, skip it
    if (cell[0] === '!') continue

    // if it starts with 'A', we're looking at the beginning of a real row
    if (cell[0] === 'A') {
      let aCell = worksheet[cell]

      // set blank if nothing
      aCell = aCell ? aCell.v : ''

      // pull out the cell's number to find the other columns
      const cellNumber = cell.match(/\d+/)[0]

      // pull out the value
      let bCell = worksheet['B' + cellNumber]
      bCell = bCell ? bCell.v : ''

      // finally set value equal to key
      data[aCell] = bCell
    }
  }

  // return data
  return data
}
