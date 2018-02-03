function parseOpt(opt) {
    var eqPos = opt.indexOf('=', 0);

    var name = eqPos !== -1 ? opt.substr(2, eqPos - 2) : opt.substr(2);
    var value = eqPos !== -1 ? opt.substr(eqPos + 1) : true;

    return [name, value];
}

module.exports = {
    parse: argv => {
        var cmd = argv[2];
        var args = argv.slice(3).filter(a => !a.startsWith('--'));
        var opts = argv.slice(3).filter(a => a.startsWith('--')).map(parseOpt)
            .reduce((obj, item) => {
                obj[item[0]] = item[1];
                return obj;
            }, {});

        return {
            cmd: cmd,
            args: args,
            opts: opts
        };
    }
};