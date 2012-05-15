var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/deep.js', 'utf8');

test('deeply nested delay', function (t) {
    t.plan(2);
    var fry = fritter(src, {
        process : process,
        setTimeout : setTimeout
    });
    
    fry.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.deepEqual(
            c.stack.map(function (s) { return s.callee.name }),
            [
                'qualia', null, 'nextTick', 'zzz',
                'setTimeout', null, 'setTimeout',
                'yyy', 'xxx', 'setTimeout', 'h', 'g', 'f'
            ]
        );
        t.end();
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) {
        console.dir(err);
    }
});

