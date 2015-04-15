'use strict';

var marked = require('marked');

// setup marked
marked.setOptions({
  smartypants: true
});

module.exports = function keyValueProcessor(worksheet) {
  var data = {};

  // loop through each cell in the worksheet
  for (var cell in worksheet) {
    // not a real cell, skip it
    if (cell[0] === '!') { continue; }

    // if it starts with 'A', we're looking at the beginning of a real row
    if (cell[0] === 'A') {
      var aCell = worksheet[cell];

      // set blank if nothing
      aCell = aCell ? aCell.v : '';

      // pull out the cell's number to find the other columns
      var cellNumber = cell.match(/\d+/)[0];

      // pull out the value
      var bCell = worksheet['B' + cellNumber];
      bCell = bCell ? bCell.v : '';

      // will this be parsed by marked?
      var cCell = worksheet['C' + cellNumber];
      cCell = cCell ? cCell.v.toLowerCase() : '';

      // if there is a match, run the value through marked
      if (cCell === 'markdown' || cCell === 'md') {
        bCell = marked(bCell);
      }

      // finally set value equal to key
      data[aCell] = bCell;
    }
  }

  // return data
  return data;
};
