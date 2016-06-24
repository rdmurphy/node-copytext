# node-copytext

A node library for accessing a XLSX spreadsheet as a JavaScript object. Inspired by the NPR visuals team's [copytext](https://github.com/nprapps/copytext) library for Python. Works great coupled with group-edited Google Spreadsheet exported as a XLSX file.

[![build status](https://img.shields.io/travis/rdmurphy/node-copytext/master.svg?style=flat-square)](https://travis-ci.org/rdmurphy/node-copytext)
[![Coveralls branch](https://img.shields.io/coveralls/rdmurphy/node-copytext/master.svg?style=flat-square)](https://coveralls.io/github/rdmurphy/node-copytext)
[![npm version](https://img.shields.io/npm/v/node-copytext.svg?style=flat-square)](https://www.npmjs.com/package/node-copytext)
[![npm](https://img.shields.io/npm/dm/node-copytext.svg?style=flat-square)](https://www.npmjs.com/package/node-copytext)

* [Features](#features)
* [Requirements](#requirements)
* [Installation](#installation)
* [Build Tools](#build-tools)
* [Usage](#usage)
* [In Practice](#in-practice)
* [Tests](#tests)
* [License](#license)

## Features

- Access an XLSX spreadsheet as a JavaScript object
- Great for passing into templates, saving to a file, etc.
- XLSX spreadsheets can be loaded via path or as a [`Buffer`](https://nodejs.org/api/buffer.html)
- Can process both **key/value** sheets and **table** layouts
- Tested against both node.js and io.js


## Requirements

- [node.js](https://nodejs.org/) >= 4

## Installation
```sh
npm install copytext
```

If you're looking to do some work on `node-copytext` itself, clone the repo instead:

```sh
git clone https://github.com/rdmurphy/node-copytext.git
cd node-copytext
npm install
npm test # make sure everything already works!
```

And you're good to go!

## Build Tools

Tool | Method
-----|-------
[Grunt](http://gruntjs.com/) | https://github.com/rdmurphy/grunt-copytext
[Gulp](http://gulpjs.com/) | Use `copytext` directly

## Usage

### The Basics

`copytext` can work with both **key/value** and **table** layouts. By default, it assumes you're passing it **key/value** sheets.

_Note: With **key/value** sheets, the processor will only care about content in the first **three** columns. Anything else will be ignored. (Meaning the other columns are a great place to leave notes!)_

**corgis_keyvalue.xlsx**  
*Sheet name: CORGIS*

- | -
----- | -----
**name** | Poky
**instagram_account** | https://instagram.com/poky_corgi/

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

To tell `copytext` to use the **table** parser instead (known as `objectlist`), you can pass an object as the second argument to `copytext` with a key of `basetype` set to `objectlist`.

**corgis_objectlist.xlsx**  
*Sheet name: CORGIS*

name | instagram_account
----- | -----
Poky | https://instagram.com/poky_corgi/
Tibby | https://instagram.com/tibbythecorgi/

```js
var copytext = require('copytext');

var data = copytext.process('./corgis_objectlist.xlsx', {
  'basetype': 'objectlist'
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

Have a spreadsheet that uses both layouts? No problem! Just let `copytext` know which sheets are the exception to the `basetype`. Overrides are passed in as a list to the options object on the `overrides` key. Each override should be represented as a key/value object where the key is the name of the sheet, and the value is the name of the processor to be used.

Assume we have the previous example's `CORGIS` sheet in a spreadsheet plus this sheet:

*Sheet name: SHIBA*

- | -
----- | -----
**name** | Maru
**instagram_account** | https://instagram.com/marutaro/

```js
var copytext = require('copytext');

var data = copytext.process('./husky_keyvalue_corgis_objectlist.xlsx', {
  'basetype': 'objectlist',
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

The override works in both directions - this would have produced the same result:

```js
var data = copytext.process('./husky_keyvalue_corgis_objectlist.xlsx', {
  'basetype': 'keyvalue',
  'overrides': {
    'CORGIS': 'objectlist'
  }
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



If you pass in a **table/objectlist** sheet, you can loop through it! (Assume `CONTACTS` is an `objectlist`.)

**index.html**
```html
<ul>
  {% for contact in DATA.CONTACTS %}
  <li>{{ contact.name }} | {{ contact.address }} | {{ contact.phone }}</li>
  {% endfor %}
</ul>
```


## Tests

Tests can be run with this command:

```sh
npm test
```

## License

By [Ryan Murphy](https://twitter.com/rdmurphy).

Available under the MIT license.
