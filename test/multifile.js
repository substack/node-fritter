var fritter = require('../');
var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var files = [ 'b.js', 'a.js' ].map(function (name) {
    return fs.readFileSync(__dirname + '/sources/multifile/' + name, 'utf8');
});

test('multifile', function (t) {
    t.plan(4);
    
    var modules = {};
    var fry = fritter({
        require : function (name) {
            return modules[name];
        },
        define : function (name, fn) {
            modules[name] = {};
            process.nextTick(function () {
                fn(modules[name]);
            });
        },
        setTimeout : setTimeout
    }, { longStacks : true });
    fry.include(files[0], { filename : './b.js' });
    fry.include(files[1], { filename : './a.js' });
    
    var src = ['./b.js','./a.js'].map(function (name,ix) {
        return 'define(' + JSON.stringify(name) + ',function (exports){'
            + fry.sources[ix]
            + '})'
        ;
    }).join(';');
    
    fry.on('error', function (err, c) {
        t.equal(err, 'beep boop');
        t.equal(c.current.filename, './b.js');
        
        t.deepEqual(
            c.stack.map(function (s) {
                return s.filename + ':' + (fry.nameOf(s) || '');
            }),
            [ './b.js:', './b.js:setTimeout', './b.js:zzz',
                './a.js:setTimeout', './a.js:' ]
        );
    });
    
    process.on('uncaughtException', function (err) {
        t.equal(err, 'beep boop');
    });
    vm.runInNewContext(src, fry.context);
});
