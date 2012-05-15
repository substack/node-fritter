var fritter = require('../');
var test = require('tap').test;
var vm = require('vm');

var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/wait.js', 'utf8');

test('wait', function (t) {
    t.plan(4);
    
    var iv = null;
    var context = {
        wait : function (cb) {
            t.ok(!iv);
            iv = setInterval(function () {
                cb();
            }, 50);
        },
        exports : {},
        t : { ok : t.ok.bind(t) }
    };
    
    var fry = fritter(src, context);
    
    var x0 = null;
    setTimeout(function () {
        x0 = context.exports.times;
        t.ok(x0 >= 3 || x0 <= 6);
        fry.stop();
    }, 325);
    
    setTimeout(function () {
        t.equal(context.exports.times, x0);
    }, 500);
    
    try {
        vm.runInNewContext(fry.source, fry.context);
    }
    catch (err) { console.log(err.stack) }
    
    t.on('end', function () {
        clearInterval(iv);
    });
});
