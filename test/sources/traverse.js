var xs = [];
traverse.forEach({ a : 1, b : 2, c : [ 3, 4 ]}, function (node) {
    if (this.isLeaf) xs.push(node);
});
t.same(xs, [ 1, 2, 3, 4 ]);

traverse.forEach({ a : 1, b : 2, c : [ 3, 4 ]}, function (node) {
    if (this.isRoot) throw 'beep';
});

t.fail("shouldn't get this far");
