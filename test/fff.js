var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/fff.js', 'utf8');
test('fff', function (t) {
    t.plan(2);
    var fry = fritter(src);
    fry.on('error', function (err, c) {
        t.equal(err, 'doom');
        
        t.deepEqual(
            c.stack.map(function (s) {
                return s.callee.name
            }),
            [ 'f', 'f', 'f', 'f', 'f', 'f' ]
        );
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    } catch (err) {}
});
