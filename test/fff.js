var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/fff.js', 'utf8');
test('fff', function (t) {
    t.plan(2);
    var fry = fritter().include(src, { filename : 'fff.js' });
    fry.on('error', function (err, c) {
        t.equal(err, 'doom');
        
        t.deepEqual(
            c.stack.map(function (s) {
                return fry.nameOf(s) + ':' + s.filename
            }),
            [
                'f:fff.js', 'f:fff.js', 'f:fff.js',
                'f:fff.js', 'f:fff.js', 'f:fff.js'
            ]
        );
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) {
        if (err !== 'doom') t.fail(err);
    }
});
