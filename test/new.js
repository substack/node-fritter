var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/new.js', 'utf8');

test('new', function (t) {
    var context = { module : { exports : {} } };
    var fry = fritter(src, context);
    
    process.nextTick(function () {
        var doom = context.module.exports;
        t.equal(doom(3).gloom(10), 13);
        t.end();
    });
    
    fry.on('error', function (err, c) {
        fry.stop();
        t.fail(err);
    });
    vm.runInNewContext(fry.source, fry.context);
});
