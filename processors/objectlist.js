const XLSX = require('xlsx')

/**
 * Converts an Excel worksheet into an Array of Objects corresponding to the
 * rows of the sheet.
 *
 * @param  {Object} worksheet
 * @return {Array}
 */
module.exports = function objectListProcessor (worksheet) {
  // use xlsx's sheet_to_json converter
  // setting raw: true so it doesn't force everything to be a string
  return XLSX.utils.sheet_to_json(worksheet, {raw: true})
}
