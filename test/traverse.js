var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(require.resolve('traverse'), 'utf8')
    + ';' + fs.readFileSync(__dirname + '/sources/traverse.js', 'utf8')
;

test('fff', function (t) {
    t.plan(4);
    var fry = fritter({
        t : t,
        module : { exports : {} },
    });
    fry.include(src);
    
    fry.on('error', function (err, c) {
        t.equal(err, 'beep');
        t.deepEqual(
            c.stack.map(function (s) { return fry.nameOf(s) }),
            []
        );
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) {
console.log(err.stack);
        t.equal(err, 'beep');
    }
});
