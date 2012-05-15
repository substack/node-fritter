var fritter = require('../');
var vm = require('vm');
var test = require('tap').test;

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/caught.js', 'utf8');

test('caught', function (t) {
    var fry = fritter(src);
    
    fry.on('error', function (err, c) {
        t.fail(err);
    });
    
    setTimeout(function () {
        t.end();
    }, 100);
    
    vm.runInNewContext(fry.source, fry.context);
});
