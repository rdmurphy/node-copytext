'use strict'

const keyvalue = require('./processors/keyvalue')
const table = require('./processors/table')
const XLSX = require('xlsx')

/**
 * Object for storing a reference valid processors.
 *
 * @private
 * @type {Object}
 */
const processors = {
  keyvalue,
  table
}

/**
 * Retrieves a processor by name. Throws an error if it does not exist.
 *
 * @private
 * @param  {String} name
 * @return {Function}
 */
function getProcessor (name) {
  if (processors.hasOwnProperty(name)) return processors[name]

  throw new Error(`\`${name}\` is not a valid sheet processor.`)
}

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

  // if no processor is set, assume `keyvalue`
  const defaultProcessor = options.processor || 'keyvalue'

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
    const processor = overrides.hasOwnProperty(sheet) ? overrides[sheet] : defaultProcessor

    // pass pass the sheet on to the process script with the correct processor
    payload[sheet] = getProcessor(processor)(workbook.Sheets[sheet])
  })

  // return the processed data
  return payload
}

module.exports = {
  process
}
