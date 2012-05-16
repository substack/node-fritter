var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(require.resolve('traverse'), 'utf8')
    + ';' + fs.readFileSync(__dirname + '/sources/traverse.js', 'utf8')
;

test('fff', function (t) {
    t.plan(3);
    
    var fry = fritter({
        t : { same : t.same.bind(t) },
        module : { exports : {} },
        console : console
    });
    fry.include(src);
    
    fry.on('error', function (err, c) {
        t.equal(err, 'beep');
    });
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) {
        t.equal(err, 'beep');
    }
});
