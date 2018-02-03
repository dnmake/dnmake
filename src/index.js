var fs    = require('fs'),
    path  = require('path'),
    uuid  = require('uuid/v4'),
    rmdir = require('rmdir'),
    cli   = require('./cli');

function buildEnv() {
    var appDir = path.join(process.env.HOME, '.dnmake');
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }

    var projectsDir = path.join(appDir, 'projects');
    if (!fs.existsSync(projectsDir)) {
        fs.mkdirSync(projectsDir);
    }

    var tempDir = path.join(appDir, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    return {
        appDir: appDir,
        projectsDir: projectsDir,
        tempDir: tempDir
    };
}

function buildScope(env) {
    var id = uuid();
    var tempDir = path.join(env.tempDir, id);

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    return {
        tempDir: tempDir,
        destroy: () => {
            rmdir(tempDir);
        }
    };
}

function getCommandFactory(cmdName) {
    try {
        return require('./cmd/' + cmdName);
    }
    catch(ex) {
        return null;
    }
}

async function run(cmdName, args, opts) {
    var env = buildEnv();
    var scope = buildScope(env);
    var cmdFactory = getCommandFactory(cmdName);

    if (!cmdFactory && scope.project) {
        cmdFactory = getCommandFactory('run');
        args.unshift(cmdName);
    }

    try {
        var cmd = new cmdFactory(env, scope);
        if (!cmd.isValid(args, opts)) {
            return console.error('Error: Invalid arguments for command ' + cmdName);
        }

        var res = await cmd.run(args, opts);

        if (res.success) {
            console.log(res.message ? res.message : 'Ok');
        }
        else {
            console.error('Error: ' + res.message);
        }
    }
    catch (err) {
        console.error('Error: ' + err.message);
    }
    finally {
        scope.destroy();
    }
}

var parsedCli = cli.parse(process.argv);
run(parsedCli.cmd, parsedCli.args, parsedCli.opts);