var src = '(' + function () {
    (function fee () {
        [ 'foe', 'fum' ].forEach(fie);
    })();
    
    function fie (s) { smell(s) }
    function smell () { english('blood') }
} + ')()';

var fritter = require('../');
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
