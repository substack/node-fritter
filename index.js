var falafel = require('falafel');
var identifier = require('identifier');
var EventEmitter = require('events').EventEmitter;

exports = module.exports = function (src, context, opts) {
    if (typeof src === 'object') {
        opts = context;
        context = src;
        src = undefined;
    }
    
    var fry = new Fritter(context || {}, opts || {});
    if (src !== undefined) fry.include(String(src));
    return fry;
};

function Fritter (context, opts) {
    this.names = {
        call : identifier(6),
        catcher : identifier(6),
        catchVar : identifier(6),
        expr : identifier(6),
        stopped : identifier(6),
        callPush : identifier(6),
        callPop : identifier(6),
        callProperty : identifier(6)
    };
    this.stack = [];
    this.current = undefined;
    this.context = context;
    this.nodes = [];
    this.source = '';
    this.sources = [];
    this.files = [];
    this.options = opts;
    
    this.defineContext();
}

Fritter.prototype = new EventEmitter;

Fritter.prototype.defineContext = function () {
    var self = this;
    var nodes = this.nodes;
    var context = this.context;
    var names = this.names;
    
    function isBuiltin (fn) {
        return fn === context.setTimeout
            || fn === context.clearTimeout
            || fn === context.setInterval
            || fn === context.clearInterval
        ;
    }
    
    function wrapFunction (f, stack_) {
        var f_ = function () {
            self.stack.splice(0);
            self.stack.push.apply(self.stack, stack_);
            
            if (typeof f.apply === 'function') {
                return f.apply(this, arguments);
            }
            else {
                return apply(f, this, arguments);
            }
        };
        return f_;
    }
    
    var longStacks = self.options.longStacks;
    context[names.callPush] = function (ix) {
        if (longStacks) self.stack.unshift(nodes[ix]);
    };
    
    context[names.callPop] = function (ix) {
        if (longStacks) self.stack.shift();
    };
    
    context[names.callProperty] = function (ix, obj, name) {
        var fn = obj[name];
        return context[names.call](ix, function () {
            if (fn === undefined) {
                throw new TypeError(
                    String(obj) + ' has no method \'' + name + '\''
                );
            }
            else if (typeof fn !== 'function') {
                throw new TypeError(
                    'Property \'' + name + '\' of '
                    + String(obj) + ' is not a function'
                );
            }
            return fn.apply(obj, arguments);
        });
    };
    
    context[names.call] = function (ix, fn) {
        if (typeof fn !== 'function') return fn;
        
        var fn_ = function () {
            if (self.stopped) throw names.stopped;
            self.stack.unshift(nodes[ix]);
            
            if (self.options.longStacks) {
                var stack = self.stack.slice();
                
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === 'function') {
                        arguments[i] = wrapFunction(arguments[i], stack);
                    }
                }
            }
            
            var res = fn.apply(this, arguments);
            self.stack.shift();
            return res;
        };
        return copyAttributes(fn, fn_);
    };
    
    (function () {
        var caught = [];
        var throwing = false;
        
        self.context[names.catcher] = function (err) {
            if (err === names.stopped) return;
            
            if (caught.indexOf(err) < 0) {
                caught.push(err);
                
                var stack_ = self.options.longStacks
                    ? filterStack(self.stack)
                    : self.stack
                ;
                self.emit('error', err, {
                    stack : stack_,
                    current : self.current
                });
            }
            
            if (!throwing) {
                throwing = true;
                process.nextTick(function () {
                    caught = [];
                    throwing = false;
                });
            }
            throw err;
        };
    })();
    
    context[names.expr] = function (ix, expr) {
        if (self.stopped) throw names.stopped;
        self.current = self.nodes[ix];
        return expr;
    };
};

Fritter.prototype.stop = function () {
    this.stopped = true;
};

Fritter.prototype.include = function (src, opts) {
    var self = this;
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
    }
    if (!opts) opts = {};
    var nodes = this.nodes;
    var names = this.names;
    
    var fileId = this.files.length;
    function pushNode (node) {
        if (opts.filename) node.filename = opts.filename;
        node.fileId = fileId;
        
        node.start = node.loc.start;
        node.end = node.loc.end;
        nodes.push(node);
    }
    
    var src_ = falafel({ source : src, loc : true }, function (node) {
        if (node.type === 'FunctionExpression'
        || node.type === 'FunctionDeclaration') {
            var inner =  node.body.source().slice(1,-1); // inside the brackets
            node.body.update('{'
                + names.callPush + '(' + nodes.length + ');'
                + 'try{' + inner + '}'
                + 'catch(' + names.catchVar + '){'
                + names.catcher + '(' + names.catchVar + ')'
                + '}'
                + 'finally {'
                + names.callPop + '(' + nodes.length + ')'
                + '}'
            + '}');
            pushNode(node);
        }
        else if (node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression') {
            node.callee.update(
                '(' + names.callProperty + '('
                    + nodes.length
                    + ','
                    + node.callee.object.source()
                    + ','
                    + JSON.stringify(node.callee.property.name)
                + '))'
            );
            pushNode(node);
        }
        else if (node.type === 'CallExpression') {
            node.callee.update(
                '(' + names.call + '('
                    + nodes.length + ',' + node.callee.source()
                + '))'
            );
            pushNode(node);
        }
        else if (node.type === 'ExpressionStatement') {
            node.update(
                '{'
                + names.expr + '(' + nodes.length + ');'
                + node.source()
                + '}'
            );
            pushNode(node);
        }
    });
    
    this.source += src_ + ';';
    this.sources.push(src_);
    this.files.push(src);
    
    return this;
};

Fritter.prototype.nameOf = function (node) {
    if (!node) return;
    if (node.id && 'name' in node.id) return node.id.name;
    var c = node.callee;
    if (!c) return;
    
    if ('name' in c) return c.name;
    if (c.id && 'id' in c) return c.id.name;
    if (c.type === 'MemberExpression' && !c.computed) {
        return this.files[node.fileId].slice(c.range[0], c.range[1] + 1);
    }
};

var Object_keys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

function copyAttributes (fn, fn_) {
    var keys = Object_keys(fn);
    for (var i = 0; i < keys.length; i++) fn_[key] = fn[key];
    return fn_;
}

function filterStack (stack) {
    return stack.filter(function (s, ix) {
        var before = stack[ix + 1];
        if (!s) return true;
        if (!before) return true;
        
        var bn = before.callee && (
            before.callee.name
            || (before.callee.id && before.callee.id.name)
        );
        var sn = s.id && s.id.name;
        
        if (before.type === 'CallExpression' 
        && ((bn && sn) || s.parent === before)
        && bn === sn) {
            return false;
        }
        return true;
    });
}
