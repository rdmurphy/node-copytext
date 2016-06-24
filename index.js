'use strict'

var XLSX = require('xlsx')

var processData = require('./process')

module.exports = function copytext (rawXLSX, options) {
  // if no options are passed, set an empty Object as default
  options = options || {}

  // if no basetype is set, assume `keyvalue`
  var basetype = options.basetype || 'keyvalue'

  // if no overrides were set, assume there are none
  var overrides = options.overrides || {}

  var workbook

  // if the XLSX file came over as a Buffer, read it differently
  if (rawXLSX instanceof Buffer) {
    workbook = XLSX.read(rawXLSX, {type: 'buffer'})
  } else {
    workbook = XLSX.readFile(rawXLSX)
  }

  // get the names of all the sheets in an Array
  var sheets = workbook.SheetNames

  // the eventual payload returned to the callback
  var payload = {}

  // for each sheet in the workbook process its contents
  sheets.forEach(function (sheet) {
    // determine the appropriate processor, using the override if it exists
    var processor = overrides.hasOwnProperty(sheet) ? overrides[sheet] : basetype

    // pass pass the sheet on to the process script with the correct processor
    payload[sheet] = processData(workbook.Sheets[sheet], processor)
  })

  // return the processed data
  return payload
}
