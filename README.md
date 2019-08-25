# node-copytext

A node library for accessing a XLSX spreadsheet as a JavaScript object. Inspired by the NPR visuals team's [copytext](https://github.com/nprapps/copytext) Python library. Works great coupled with a group-edited Google Spreadsheet exported as a XLSX file.

[![build status](https://img.shields.io/travis/rdmurphy/node-copytext/master.svg?style=flat-square)](https://travis-ci.org/rdmurphy/node-copytext)
[![Coveralls branch](https://img.shields.io/coveralls/rdmurphy/node-copytext/master.svg?style=flat-square)](https://coveralls.io/github/rdmurphy/node-copytext)
[![npm version](https://img.shields.io/npm/v/copytext.svg?style=flat-square)](https://www.npmjs.com/package/copytext)
[![npm](https://img.shields.io/npm/dm/copytext.svg?style=flat-square)](https://www.npmjs.com/package/copytext)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [In Practice](#in-practice)
- [API Docs](#api-docs)
    - [Table of Contents](#table-of-contents)
  - [process](#process)
    - [Parameters](#parameters)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

-   Access an XLSX spreadsheet as a JavaScript object
-   Great for passing into templates, saving to a file, etc.
-   XLSX spreadsheets can be loaded via path or [`Buffer`](https://nodejs.org/api/buffer.html)
-   Can process both **key/value** sheets and **table** layouts

## Requirements

-   [node.js](https://nodejs.org/) >= 4

## Installation

```sh
npm install --save-dev copytext
```

If you're looking to do some work on `node-copytext` itself, clone the repo instead:

```sh
git clone https://github.com/rdmurphy/node-copytext.git
cd node-copytext
npm install
npm test # make sure everything already works!
```

And you're good to go!

## Usage

`copytext` can work with both **key/value** and **table** layouts. By default, it assumes you're passing **key/value** sheets.

_Note: With **key/value** sheets, the processor will only care about content in the first **two** columns. Anything else will be ignored. (Meaning the other columns are a great place to leave notes!)_

**corgis_keyvalue.xlsx**  
_Sheet name: CORGIS_

| -                     | -                                      |
| --------------------- | -------------------------------------- |
| **name**              | Poky                                   |
| **instagram_account** | <https://instagram.com/tibbythecorgi/> |

```js
var copytext = require('copytext');

var data = copytext.process('./corgis_keyvalue.xlsx');

console.log(data);

// {
//   'CORGIS': {
//     'name': 'Poky',
//     'instagram_account': 'https://instagram.com/poky_corgi/'
//   }
// }
```

To tell `copytext` to use the **table** parser instead, pass an object as the second argument to `copytext` with `processor` set to `table`.

**corgis_table.xlsx**  
_Sheet name: CORGIS_

| name  | instagram_account                      |
| ----- | -------------------------------------- |
| Poky  | <https://instagram.com/poky_corgi/>    |
| Tibby | <https://instagram.com/tibbythecorgi/> |

```js
var copytext = require('copytext');

var data = copytext.process('./corgis_table.xlsx', {
  'processor': 'table'
});

console.log(data);

// {
//   'CORGIS': [{
//     'name': 'Poky',
//     'instagram_account': 'https://instagram.com/poky_corgi/'
//   },{
//     'name': 'Tibby',
//     'instagram_account': 'https://instagram.com/tibbythecorgi/'
//   }]
// }
```

Have a spreadsheet that uses both layouts? No problem! Tell `copytext` which sheets are the exception. Overrides are passed in as a list to the options object on the `overrides` key. Each override should have the name of the sheet as the key, and the name of the processor as the value.

Assume we have the previous example's `CORGIS` sheet in a spreadsheet plus this sheet:

_Sheet name: SHIBA_

| -                     | -                                 |
| --------------------- | --------------------------------- |
| **name**              | Maru                              |
| **instagram_account** | <https://instagram.com/marutaro/> |

```js
var copytext = require('copytext');

var data = copytext.process('./husky_keyvalue_corgis_table.xlsx', {
  'processor': 'table',
  'overrides': {
    'SHIBA': 'keyvalue'
  }
});

console.log(data);

// {
//   'CORGIS': [{
//     'name': 'Poky',
//     'instagram_account': 'https://instagram.com/poky_corgi/'
//   },
//   {
//     'name': 'Tibby',
//     'instagram_account': 'https://instagram.com/tibbythecorgi/'
//   }],
//   'SHIBAS': {
//     'name': 'Maru',
//     'instagram_account': 'https://instagram.com/marutaro/'
//   }
// }
```

The override works in both directions — this would have produced the same result:

```js
var data = copytext.process('./husky_keyvalue_corgis_table.xlsx', {
  'processor': 'keyvalue',
  'overrides': {
    'CORGIS': 'table'
  }
});
```

It's also possible to include or exclude entire sheets. This is useful if you only want one sheet to be converted (for example, the other sheets may be supplying data to the master sheet), or want to exclude certain sheets.

```js
var copytext = require('copytext');

var data = copytext.process('./husky_keyvalue_corgis_table.xlsx', {
  'processor': 'table',
  'includeSheets': ['CORGI']
});
```

```js
var copytext = require('copytext');

var data = copytext.process('./husky_keyvalue_corgis_table.xlsx', {
  'processor': 'table',
  'excludeSheets': ['HUSKY']
});
```

## In Practice

This is most useful when working with templates. Here's an example with the excellent [Nunjucks](http://mozilla.github.io/nunjucks/) library.

```js
var fs = require('fs');
var copytext = require('copytext');
var nunjucks = require('nunjucks');

var data = copytext.process('./data/contacts.xlsx');  // a key/value sheet named CONTACTS
var res = nunjucks.render('index.html', {DATA: data});
```

**index.html**

```html
<ul>
  <li>{{ DATA.CONTACTS.name }}</li>
  <li>{{ DATA.CONTACTS.address }}</li>
  <li>{{ DATA.CONTACTS.phone }}</li>
</ul>
```

If you pass in a **table** sheet, you can loop through it! (Assume `CONTACTS` is a `table`.)

**index.html**

```html
<ul>
  {% for contact in DATA.CONTACTS %}
  <li>{{ contact.name }} | {{ contact.address }} | {{ contact.phone }}</li>
  {% endfor %}
</ul>
```

## API Docs

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [process](#process)
    -   [Parameters](#parameters)

### process

Accepts a raw XLSX file and options that determine how `copytext` should
process it.

#### Parameters

-   `rawXLSX` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Buffer](https://nodejs.org/api/buffer.html))** A Buffer of, or path to, an XLSX file
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.processor` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The processor used on all sheets without overrides (optional, default `'keyvalue'`)
    -   `options.includeSheets` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)> | [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Sheets to include (optional, default `undefined`)
    -   `options.excludeSheets` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)> | [String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Sheets to exclude (optional, default `undefined`)
    -   `options.overrides` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Key value pairs of the sheet name and processor that should be used (optional, default `undefined`)

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## License

By [Ryan Murphy](https://twitter.com/rdmurphy).

Available under the MIT license.
