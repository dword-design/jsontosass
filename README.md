[![Build Status](https://travis-ci.org/Regaddi/jsontosass.svg?branch=master)](https://travis-ci.org/Regaddi/jsontosass)
[![Coverage Status](https://coveralls.io/repos/github/Regaddi/jsontosass/badge.svg?branch=master)](https://coveralls.io/github/Regaddi/jsontosass?branch=master)

# jsontosass

Oh, no! Not another JSON to Sass converter! Why did you do that?

Simple answer: there was no JSON to Sass converter out there (up to this point)
that was flexible enough to suite my needs to e.g. satisfy my
[scss-lint](https://github.com/brigade/scss-lint) configuration.

This one here aims to be as flexible as possible regarding

- generation of your Sass variables
- indentation for maps
- minification
- Syntax output (Sass and SCSS) (coming soon)

Additionally I want this module to be well tested, that's why I'm focussing on
[TDD](https://en.wikipedia.org/wiki/Test-driven_development) here.

What you will get with this package is a well maintained, documented and tested
JSON to Sass converter that will definitely be the last one you'll ever need!

# Installation

You can easily install this package with [npm](https://www.npmjs.com):

    npm install jsontosass

After that you can access `jsontosass` easily by using `require`

```javascript
var jsontosass = require('jsontosass');
```

# Usage

There are 2 main functions available.

## convert()

```javascript
jsontosass.convert(/* String */jsonInput, /* Object */options);
```

`convert()` returns the generated Sass code as a string.

## convertFile()

```javascript
jsontosass.convertFile(/* String */jsonInputFilePath, /* String */sassOutputFilePath, /* Objects */options);
```

`convertFile()` does not return anything. It automatically creates the output file if it's nonexistent and writes the generated Sass code into it.

# Options

## `(Int/String)` indent

default: 4

If a number greater 0 is given, jsontosass will indent using the given number of spaces. Optionally you can set it to `'tabs'`. This will indent using `\t`. Indentation is only made, when `prettify` is set to `true`.

## `Boolean` prettify

default: true

If set to `true` jsontosass will pretty print the generated Sass code using the `indent` setting.

## `Int` spaceAfterColon

default: 1

Sets the amount of spaces after the colon `:`.

## `Int` spaceBeforeColon

default: 0

Sets the amount of spaces before the colon `:`.

## `Boolean` useMaps

default: true

If set to `true` jsontosass generates [Sass maps](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#maps) for inner objects.
If set to `false` jsontosass generates dashed variables.

# Examples

```json
{
    "key": {
        "innerKey": [1,2,3]
    }
}
```

```javascript
jsontosass.convert(json, {
    indent: 2
});
```

```scss
$key:(
  innerKey:(1,2,3)
);
```
