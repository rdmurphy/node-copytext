'use strict'

const processData = require('./process')
const XLSX = require('xlsx')

/**
 * Accepts a raw XLSX file and options that determine how `copytext` should
 * process it.
 *
 * @param  {String|Buffer} rawXLSX A Buffer of, or path to, an XLSX file
 * @param  {Object} [options]
 * @return {Object}
 */
function process (rawXLSX, options) {
  // if no options are passed, set an empty Object as default
  options = options || {}

  // if no basetype is set, assume `keyvalue`
  const basetype = options.basetype || 'keyvalue'

  // if no overrides were set, assume there are none
  const overrides = options.overrides || {}

  // if the XLSX file came over as a Buffer, read it differently
  const workbook = rawXLSX instanceof Buffer ? XLSX.read(rawXLSX, {type: 'buffer'}) : XLSX.readFile(rawXLSX)

  // get the names of all the sheets in an Array
  const sheets = workbook.SheetNames

  // the eventual payload returned to the callback
  let payload = {}

  // for each sheet in the workbook process its contents
  sheets.forEach(function (sheet) {
    // determine the appropriate processor, using the override if it exists
    const processor = overrides.hasOwnProperty(sheet) ? overrides[sheet] : basetype

    // pass pass the sheet on to the process script with the correct processor
    payload[sheet] = processData(workbook.Sheets[sheet], processor)
  })

  // return the processed data
  return payload
}

module.exports = {
  process
}
