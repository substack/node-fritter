var fs = require('fs');
var src = fs.readFileSync(__dirname + '/sources/giant.js', 'utf8');

var fritter = require('../');
var fry = fritter(src);
fry.on('error', function (err, c) {
    console.log(String(err));
    c.stack.forEach(function (s) {
        console.log(
            '    in .' + fry.nameOf(s) + '()'
            + ', line ' + s.start.line
        );
    });
});
fry.run();
