var falafel = require('falafel');
var identifier = require('identifier');

module.exports = function (src, context) {
    if (!context) context = {};
    
    var names = {};
    
    names.call = identifier(6);
    context[names.call] = function (fn) {
        return fn;
    };
    
    names.catcher = identifier(6);
    names.catchVar = identifier(6);
    context[names.catcher] = function (err) {
        console.log('----------');
        console.dir(err);
        console.log('----------');
        throw err;
    };
    
    var source = falafel(src, function (node) {
        if (node.type === 'FunctionExpression') {
            var inner =  node.body.source().slice(1,-1); // inside the brackets
            node.body.update('{'
                + 'try{' + inner + '}'
                + 'catch(' + names.catchVar + '){'
                + names.catcher + '(' + names.catchVar + ')'
                + '}'
            + '}');
        }
        else if (node.type === 'CallExpression') {
            node.callee.update(
                '(' + names.call + '(' + node.callee.source() + '))'
            );
        }
    });
    return {
        source : source,
        context : context,
        names : names,
    };
};
