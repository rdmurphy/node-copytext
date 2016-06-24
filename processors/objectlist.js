'use strict'

var XLSX = require('xlsx')

module.exports = function objectListProcessor (worksheet) {
  // use xlsx's sheet_to_json converter, setting raw: true so it doesn't force everything to be a string
  var data = XLSX.utils.sheet_to_json(worksheet, {raw: true})

  // return the data
  return data
}
