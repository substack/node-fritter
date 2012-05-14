function f (i) {
    if (i === 6) throw 'doom'
    else return f(i + 1)
}

function id (x) {
    return x
}

(id(f))(f(f(f(f(f(1))))));
