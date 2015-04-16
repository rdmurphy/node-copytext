# node-copytext [![Build Status](https://travis-ci.org/rdmurphy/node-copytext.svg?branch=master)](https://travis-ci.org/rdmurphy/node-copytext)

A node library for accessing a XLSX spreadsheet as a JavaScript object. (Markdown batteries included!) Inspired by the NPR visuals team's [copytext](https://github.com/nprapps/copytext) library for Python. Works great coupled with group-edited Google Spreadsheet exported as a XLSX file.

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
- Support for markdown conversion via the [`marked`](https://github.com/chjj/marked) library
- Can process both **key/value** sheets and **table** layouts
- Tested against both node.js and io.js


## Requirements

- [node.js](https://nodejs.org/) >= 0.10 *or* [io.js](https://iojs.org/en/index.html)
- [npm](https://www.npmjs.com/)

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

var data = copytext('./corgis_keyvalue.xlsx');

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

var data = copytext('./corgis_objectlist.xlsx', {
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

var data = copytext('./husky_keyvalue_corgis_objectlist.xlsx', {
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
var data = copytext('./husky_keyvalue_corgis_objectlist.xlsx', {
  'basetype': 'keyvalue',
  'overrides': {
    'CORGIS': 'objectlist'
  }
});
```

### Markdown

In **key/value** sheets, you tell `copytext` to process the value cell (in column B) as Markdown by putting `md` or `markdown` in the cell next to it in column C.

- | - | -
----- | ----- | -----
**name**  | Poky |
**instagram_account**  | https://instagram.com/poky_corgi/ |
**bio** | Pembroke Welsh Corgi living in northern \[Ontario, Canada](https://en.wikipedia.org/wiki/Ontario). | markdown

In **table**/**objectlist** sheets, the hint is passed in the header row of the table. By adding `_md` to the end of a column's header label, `copytext` will know to treat everything in that column as Markdown.

name | instagram_account | bio_md
----- | ----- | -----
Poky | https://instagram.com/poky_corgi/ | Pembroke Welsh Corgi living in northern \[Ontario, Canada](https://en.wikipedia.org/wiki/Ontario).
Tibby | https://instagram.com/tibbythecorgi/ | Half lion, half corgi. A pinch of bunny.

## In Practice

This is most useful when working with templates. Here's an example with the excellent [Nunjucks](http://mozilla.github.io/nunjucks/) library.

```js
var fs = require('fs');
var copytext = require('copytext');
var nunjucks = require('nunjucks');

var data = copytext('./data/contacts.xlsx');  // a key/value sheet named CONTACTS
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
