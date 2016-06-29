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

  // check for errors in the options, and clean up if needed
  options = validateOptions(options)

  // if no processor is set, assume `keyvalue`
  const defaultProcessor = options.processor || 'keyvalue'

  // if no overrides were set, assume there are none
  const overrides = options.overrides || {}

  // if the XLSX file came over as a Buffer, read it differently
  const workbook = rawXLSX instanceof Buffer ? XLSX.read(rawXLSX, {type: 'buffer'}) : XLSX.readFile(rawXLSX)

  // get the names of all the sheets in an Array
  let sheets = workbook.SheetNames

  if (options.includeSheets) {
    sheets = sheets.filter((s) => options.includeSheets.indexOf(s) !== -1)
  }

  if (options.excludeSheets) {
    sheets = sheets.filter((s) => options.excludeSheets.indexOf(s) === -1)
  }

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

/**
 * Validates and normalizes the options passed to `process`.
 *
 * @private
 * @param  {Object} options
 * @return {Object}
 */
function validateOptions (options) {
  // doesn't make sense to pass both, so prevent it
  if (options.includeSheets && options.excludeSheets) {
    throw new Error("Do not pass both `includeSheets` and `excludeSheets`. It's confusing.")
  }

  // if `includeSheets` exists and isn't an Array, make it so
  if (options.includeSheets) {
    if (!Array.isArray(options.includeSheets)) options.includeSheets = [options.includeSheets]
  }

  // if `excludeSheets` exists and isn't an Array, make it so
  if (options.excludeSheets) {
    if (!Array.isArray(options.excludeSheets)) options.excludeSheets = [options.excludeSheets]
  }

  // if `excludeSheets` is set and one of them show up in `overrides`, it won't
  // break anything, but the user should be aware it won't work
  if (options.excludeSheets && options.overrides) {
    const overrides = Object.keys(options.overrides)

    overrides.forEach((override) => {
      if (options.excludeSheets.indexOf(override) !== -1) {
        console.warn(`\`${override}\` has an override, but it is also being excluded in \`excludedSheets\`.`)
      }
    })
  }

  return options
}

module.exports = {
  process
}
