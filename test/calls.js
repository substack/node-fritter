var fritter = require('../');
var test = require('tap').test;
var vm = require('vm');

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/calls.js', 'utf8');
test('calls', function (t) {
    t.plan(11);
    var fry = fritter().include(src, { filename : 'zoom.js' });
    
    fry.on('error', function (err, c) {
        t.equal(err, 'moo');
        t.equal(c.current.filename, 'zoom.js');
        t.equal(c.current.start.line, 2);
        t.equal(c.current.end.line, 2);
        
        t.equal(c.stack.length, 3);
        
        t.deepEqual(
            c.stack.map(function (s) {
                return s.callee.name
            }),
            [ 'h', 'g', 'f' ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.line }),
            [ 1, 0, 4 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.start.col }),
            [ 16, 16, 0 ]
        );
        
        t.deepEqual(
            c.stack.map(function (s) { return s.end.col }),
            [ 18, 18, 2 ]
        );
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) {
        t.equal(err, 'moo');
    }
});
