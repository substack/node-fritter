fritter
=======

Transform the AST in order to generate stack traces with no stack trace API
necessary.

examples
========

``` js
var src = '(' + function () {
    (function fee () {
        [ 'foe', 'fum' ].forEach(fie);
    })();
    
    function fie (s) { smell(s) }
    function smell () { english('blood') }
}+ ')()'

var fritter = require('fritter');
var fry = fritter(src);
fry.on('error', function (err, c) {
    console.log(String(err));
    console.log('--------------------');
    c.stack.forEach(function (s) {
        console.log(
            s.callee.id && s.callee.id.name
            || src.slice(s.range[0], s.range[1] + 1)
        );
    });
    console.log('--------------------');
});

var vm = require('vm');
try {
    vm.runInNewContext(fry.source, fry.context);
} catch (err) { /* ignore this */ }
```

methods
=======

``` js
var fritter = require('fritter')
```

var fry = fritter(src, context={})
--------------------------------

Return a `fry` object given some javascript source `src` and some `context` to
execute in and populate.

`fry` emits `'error'` events with the error object and the present callstack as
arguments when exceptions in `src` are thrown.

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
