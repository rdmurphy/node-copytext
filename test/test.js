/* global describe, it */

'use strict';

var assert = require('assert');
var copytext = require('../.');
var fs = require('fs');

function copyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var basicKeyValue = {
  CORGI: {
    'name': 'Winston',
    'instagram_account': 'https://instagram.com/winstonthewhitecorgi/'
  }
};

var basicKeyValueMD = copyObj(basicKeyValue);
basicKeyValueMD.CORGI.bio = '<p>Two-year-old Pembroke Welsh Corgi living in Los Angeles, CA.</p>\n';

var basicKeyValueEmptyCell = copyObj(basicKeyValue);
basicKeyValueEmptyCell.CORGI.instagram_account = '';

var multiKeyValue = copyObj(basicKeyValue);
multiKeyValue.SHIBA = {
  'name': 'Maru',
  'instagram_account': 'https://instagram.com/marutaro/'
};

describe('file loading methods', function() {
  it('should load as a Buffer', function() {
    var file = fs.readFileSync('./test/files/basic_keyvalue.xlsx');
    assert.deepEqual(copytext(file), basicKeyValue);
  });

  it('should open the file via path', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue.xlsx'), basicKeyValue);
  });
});

describe('reading XLSX key value sheets', function() {
  it('should load a single key value sheet', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue.xlsx'), basicKeyValue);
  });

  it('should load a key value sheet with `keyvalue` basetype set', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue.xlsx', {basetype: 'keyvalue'}), basicKeyValue);
  });

  it('should load a key value sheet with empty overrides set', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue.xlsx', {overrides: {}}), basicKeyValue);
  });

  it('should load a key value sheet with a markdown cell', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue_md.xlsx'), basicKeyValueMD);
  });

  it('should gracefully handle an empty value cell', function() {
    assert.deepEqual(copytext('./test/files/basic_keyvalue_emptycell.xlsx'), basicKeyValueEmptyCell);
  });

  it('should read multiple key value sheets', function() {
    assert.deepEqual(copytext('./test/files/multi_keyvalue.xlsx'), multiKeyValue);
  });
});


var basicObjectList = {
  CORGI: [
  {
    'name': 'Winston',
    'instagram_account': 'https://instagram.com/winstonthewhitecorgi/'
  },{
    'name': 'Tibby',
    'instagram_account': 'https://instagram.com/tibbythecorgi/'
  },{
    'name': 'Poky',
    'instagram_account': 'https://instagram.com/poky_corgi/'
  }
]};

var basicObjectListMD = copyObj(basicObjectList);
basicObjectListMD.CORGI[0].bio_md = '<p>Two-year-old Pembroke Welsh Corgi living in Los Angeles, CA.</p>\n';
basicObjectListMD.CORGI[1].bio_md = '<p>Half lion, half corgi. A pinch of bunny.</p>\n';
basicObjectListMD.CORGI[2].bio_md = '<p>Pembroke Welsh Corgi living in northern Ontario, Canada.</p>\n';

var basicObjectListEmptyCell = copyObj(basicObjectListMD);
delete basicObjectListEmptyCell.CORGI[0].bio_md;

var multiObjectList = copyObj(basicObjectListMD);
multiObjectList.SHIBA = [{
  'name': 'Maru',
  'instagram_account': 'https://instagram.com/marutaro/',
  'bio_md': '<p>My name is Maru. Breed of shiba.</p>\n'
}];

describe('reading XLSX object list sheets', function() {
  it('should load a single object list sheet with `objectlist` basetype set', function() {
    assert.deepEqual(copytext('./test/files/basic_objectlist.xlsx', {basetype: 'objectlist'}), basicObjectList);
  });

  it('should load a single object value sheet with an `objectlist` set', function() {
    assert.deepEqual(copytext('./test/files/basic_objectlist.xlsx', {
      basetype: 'keyvalue',
      overrides: {
        CORGI: 'objectlist'
      }
    }), basicObjectList);
  });

  it('should load an object list sheet with a markdown column', function() {
    assert.deepEqual(copytext('./test/files/basic_objectlist_md.xlsx', {basetype: 'objectlist'}), basicObjectListMD);
  });

  it('should gracefully handle an empty cell', function() {
    assert.deepEqual(copytext('./test/files/basic_objectlist_emptycell.xlsx', {basetype: 'objectlist'}), basicObjectListEmptyCell);
  });

  it('should read multiple object list sheets', function() {
    assert.deepEqual(copytext('./test/files/multi_objectlist.xlsx', {basetype: 'objectlist'}), multiObjectList);
  });
});

var mixedKeyValueObjectList = copyObj(basicObjectListMD);
mixedKeyValueObjectList.SHIBA = {
  'name': 'Maru',
  'instagram_account': 'https://instagram.com/marutaro/',
  'bio': '<p>My name is Maru. Breed of shiba.</p>\n'
};

describe('reading mixed key value/object list sheets', function() {
  it('should read a mixed key value/object list file with basetype set to `keyvalue`, with an override for `objectlist`', function() {
    assert.deepEqual(copytext('./test/files/mixed_keyvalue_objectlist.xlsx', {
      basetype: 'keyvalue',
      overrides: {
        CORGI: 'objectlist'
      }
    }), mixedKeyValueObjectList);
  });

  it('should read a mixed key value/object list file with basetype set to `objectlist`, with an override for `keyvalue`', function() {
    assert.deepEqual(copytext('./test/files/mixed_keyvalue_objectlist.xlsx', {
      basetype: 'objectlist',
      overrides: {
        SHIBA: 'keyvalue'
      }
    }), mixedKeyValueObjectList);
  });
});
