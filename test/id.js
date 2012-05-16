var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/id.js', 'utf8');

test('id', function (t) {
    t.plan(1);
    var fry = fritter(src);
    fry.on('error', function (err, c) { t.fail(err) });
    
    vm.runInNewContext(fry.source, fry.context);
    t.same(fry.context.xs, [11,12,13]);
});
