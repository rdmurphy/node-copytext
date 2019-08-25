// native
import assert from 'assert';
import fs from 'fs';

// local
import { process } from '../src/index';

function copyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const basicKeyValue = {
  CORGI: {
    name: 'Winston',
    instagram_account: 'https://instagram.com/winstonthewhitecorgi/',
  },
};

const basicKeyValueEmptyCell = copyObj(basicKeyValue);
basicKeyValueEmptyCell.CORGI.instagram_account = '';

const multiKeyValue = copyObj(basicKeyValue);
multiKeyValue.SHIBA = {
  name: 'Maru',
  instagram_account: 'https://instagram.com/marutaro/',
};

describe('processor options', function() {
  it('should throw an error when unavailable processor is passed', function() {
    const input = function() {
      process('./test/files/basic_keyvalue.xlsx', {
        processor: 'i-do-not-exist',
      });
    };

    assert.throws(
      input,
      e => e instanceof Error && /is not a valid sheet processor/.test(e)
    );
  });
});

describe('file loading methods', function() {
  it('should load as a Buffer', function() {
    const file = fs.readFileSync('./test/files/basic_keyvalue.xlsx');
    assert.deepEqual(process(file), basicKeyValue);
  });

  it('should open the file via path', function() {
    assert.deepEqual(
      process('./test/files/basic_keyvalue.xlsx'),
      basicKeyValue
    );
  });
});

describe('reading XLSX key value sheets', function() {
  it('should load a single key value sheet', function() {
    assert.deepEqual(
      process('./test/files/basic_keyvalue.xlsx'),
      basicKeyValue
    );
  });

  it('should load a key value sheet with `keyvalue` processor set', function() {
    assert.deepEqual(
      process('./test/files/basic_keyvalue.xlsx', {
        processor: 'keyvalue',
      }),
      basicKeyValue
    );
  });

  it('should load a key value sheet with empty overrides set', function() {
    assert.deepEqual(
      process('./test/files/basic_keyvalue.xlsx', { overrides: {} }),
      basicKeyValue
    );
  });

  it('should gracefully handle an empty value cell', function() {
    assert.deepEqual(
      process('./test/files/basic_keyvalue_emptycell.xlsx'),
      basicKeyValueEmptyCell
    );
  });

  it('should read multiple key value sheets', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx'),
      multiKeyValue
    );
  });
});

const basicTable = {
  CORGI: [
    {
      name: 'Winston',
      instagram_account: 'https://instagram.com/winstonthewhitecorgi/',
    },
    {
      name: 'Tibby',
      instagram_account: 'https://instagram.com/tibbythecorgi/',
    },
    {
      name: 'Poky',
      instagram_account: 'https://instagram.com/poky_corgi/',
    },
  ],
};

const basicTableBio = copyObj(basicTable);
basicTableBio.CORGI[0].bio_md =
  'Two-year-old Pembroke Welsh Corgi living in Los Angeles, CA.';
basicTableBio.CORGI[1].bio_md = 'Half lion, half corgi. A pinch of bunny.';
basicTableBio.CORGI[2].bio_md =
  'Pembroke Welsh Corgi living in northern Ontario, Canada.';

const basicTableEmptyCell = copyObj(basicTableBio);
delete basicTableEmptyCell.CORGI[0].bio_md;

const multiTable = copyObj(basicTableBio);
multiTable.SHIBA = [
  {
    name: 'Maru',
    instagram_account: 'https://instagram.com/marutaro/',
    bio_md: 'My name is Maru. Breed of shiba.',
  },
];

describe('reading XLSX table sheets', function() {
  it('should load a single table sheet with `table` processor set', function() {
    assert.deepEqual(
      process('./test/files/basic_table.xlsx', { processor: 'table' }),
      basicTable
    );
  });

  it('should load a single object value sheet with a `table` set', function() {
    assert.deepEqual(
      process('./test/files/basic_table.xlsx', {
        processor: 'keyvalue',
        overrides: {
          CORGI: 'table',
        },
      }),
      basicTable
    );
  });

  it('should gracefully handle an empty cell', function() {
    assert.deepEqual(
      process('./test/files/basic_table_emptycell.xlsx', {
        processor: 'table',
      }),
      basicTableEmptyCell
    );
  });

  it('should read multiple table sheets', function() {
    assert.deepEqual(
      process('./test/files/multi_table.xlsx', { processor: 'table' }),
      multiTable
    );
  });
});

const mixedKeyValueTable = copyObj(basicTableBio);
mixedKeyValueTable.SHIBA = {
  name: 'Maru',
  instagram_account: 'https://instagram.com/marutaro/',
  bio: 'My name is Maru. Breed of shiba.',
};

describe('reading mixed key value/table sheets', function() {
  it('should read a mixed key value/table file with processor set to `keyvalue`, with an override for `table`', function() {
    assert.deepEqual(
      process('./test/files/mixed_keyvalue_table.xlsx', {
        processor: 'keyvalue',
        overrides: {
          CORGI: 'table',
        },
      }),
      mixedKeyValueTable
    );
  });

  it('should read a mixed key value/table file with processor set to `table`, with an override for `keyvalue`', function() {
    assert.deepEqual(
      process('./test/files/mixed_keyvalue_table.xlsx', {
        processor: 'table',
        overrides: {
          SHIBA: 'keyvalue',
        },
      }),
      mixedKeyValueTable
    );
  });
});

describe('including/excluding sheets in a file', function() {
  it('should only include sheets listed in `include` when passed', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx', {
        include: ['CORGI'],
      }),
      basicKeyValue
    );
  });

  it('should only include sheet listed in `include` when passed as single value', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx', {
        include: 'CORGI',
      }),
      basicKeyValue
    );
  });

  it('should only exclude sheets listed in `exclude` when passed', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx', {
        exclude: ['SHIBA'],
      }),
      basicKeyValue
    );
  });

  it('should only exclude sheet listed in `exclude` when passed as single value', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx', {
        exclude: 'SHIBA',
      }),
      basicKeyValue
    );
  });

  it('should still exclude sheets listed in `exclude` when passed, even if an override is also passed', function() {
    assert.deepEqual(
      process('./test/files/multi_keyvalue.xlsx', {
        exclude: ['SHIBA'],
        overrides: {
          SHIBA: 'table',
        },
      }),
      basicKeyValue
    );
  });
});
