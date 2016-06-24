'use strict'

module.exports = function processSheet (sheet, processor) {
  // check which processor should be used, or abort if none match
  if (processor === 'keyvalue') {
    return require('./processors/keyvalue')(sheet)
  } else if (processor === 'objectlist') {
    return require('./processors/objectlist')(sheet)
  } else {
    return console.error('`' + processor + '` is not a valid sheet processor.')
  }
}
