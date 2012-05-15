function f () {
    try {
        throw 'a'
    }
    catch (err) {}
}

try { f() }
catch (err) {}
