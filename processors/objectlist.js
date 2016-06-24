'use strict'

var marked = require('marked')
var XLSX = require('xlsx')

// prep marked
marked.setOptions({
  smartypants: true
})

module.exports = function objectListProcessor (worksheet) {
  // use xlsx's sheet_to_json converter, setting raw: true so it doesn't force everything to be a string
  var data = XLSX.utils.sheet_to_json(worksheet, {raw: true})

  var mdColumns = []

  // loop through each cell in the worksheet to find headers
  for (var cell in worksheet) {
    // not a real cell, skip it
    if (cell[0] === '!') continue

    // pull out the cell's number
    var cellNumber = +cell.match(/\d+/)[0]

    // if the cell's number is `1`, we're looking at the first row
    if (cellNumber === 1) {
      var aCell = worksheet[cell].v

      // look for the columns identifying as markdown parsable
      if (aCell.toLowerCase().slice(-3) === '_md') {
        mdColumns.push(aCell)
      }
    }
  }

  // if there are any markdown columns, convert them
  if (mdColumns) {
    data.forEach(function (d) {
      mdColumns.forEach(function (c) {
        if (d.hasOwnProperty(c)) {
          d[c] = marked(d[c])
        }
      })
    })
  }

  // return the data
  return data
}
