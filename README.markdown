fritter
=======

Transform the AST in order to generate stack traces with no stack trace API
necessary.

This module is like [stackedy](https://github.com/substack/node-stackedy),
except that it uses [esprima](http://esprima.org/) by way of
[falafel](https://github.com/substack/node-falafel).

[![build status](https://secure.travis-ci.org/substack/node-fritter.png)](http://travis-ci.org/substack/node-fritter)

examples
========

giant.js:

``` js
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/giant.js', 'utf8');

var fritter = require('fritter');
var fry = fritter(src);
fry.on('error', function (err, c) {
    console.log(String(err));
    c.stack.forEach(function (s) {
        console.log(
            '  in .' + fry.nameOf(s) + '()'
            + ', line ' + s.start.line
        );
    });
});
fry.run();
```

sources/giant.js:

``` js
(function fee () {
    [ 'foe', 'fum' ].forEach(fie);
})();

function fie (s) { smell(s) }
function smell () { english('blood') }
```

output:

```
ReferenceError: english is not defined
  in .smell(), line 5
  in .forEach(), line 2
  in .fee(), line 1
```

methods
=======

``` js
var fritter = require('fritter')
```

var fry = fritter(src, context={}, opts={})
-------------------------------------------

Return a `fry` object given some optional javascript source `src` and some
`context` to execute in and populate.

`fry` emits `'error'` events with the error object and the present callstack as
arguments when exceptions in `src` are thrown.

If `opts.longStacks` is true, turn on longer stack traces for a performance
penalty.

fry.include(src, opts={})
-------------------------

Include and wrap some javascript source `src`. Use `opts.filename` to associate
nodes in the stack with filenames so custom error handlers know what file an
exception originated form.

fry.stop()
----------

Stop execution insofar as that is possible.

If callbacks from external APIs fire, the body of those callbacks won't fire.

attributes
==========

fry.source
----------

transformed source to execute with something like `vm.runInNewContext()`

fry.context
-----------

context to execute `fry.source` with, including randomly-named wrapper
functions to catch exceptions and track the call stack

fry.names
---------

names of the randomly-generated wrapper functions

install
=======

With [npm](http://npmjs.org) do:

```
npm install fritter
```

license
=======

MIT
