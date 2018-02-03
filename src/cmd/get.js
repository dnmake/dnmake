var fs   = require('fs'),
    path = require('path'),
    git  = require('simple-git/promise');

module.exports = class GetCommand {

    constructor(env, scope) {
        this.env = env;
        this.scope = scope;
    }

    isValid(args, options) {
        return args.length == 1;
    }

    async run(args, options) {
        var remote = args[0];
        var name = options['name'] ? options['name'] : this._extractName(remote);
        console.log(options);
        var projectDir = path.join(this.env.projectsDir, name);

        var upgraded = true;
        if (fs.existsSync(projectDir)) {
            await this._upgrade(name, projectDir);
        }
        else {
            await this._clone(name, projectDir, remote);
            upgraded = false;
        }

        return {
            success: true,
            message: (upgraded ? 'Upgraded' : 'Created') + ' ' + name
        };
    }

    async _upgrade(name, projectDir) {
        console.log((await git(projectDir)
            .pull('origin', 'master')).summary);
    }

    async _clone(name, projectDir, remote) {
        await git(this.scope.tempDir).silent(true)
            .clone(remote, this.scope.tempDir);

        fs.mkdirSync(projectDir);
        await git(projectDir)
            .clone(this.scope.tempDir, projectDir);

        await git(projectDir)
            .removeRemote('origin');

        await git(projectDir)
            .addRemote('origin', remote);
    }

    _extractName(remote) {
        if (remote.endsWith('.git')) {
            remote = remote.substr(0, remote.length - 4);
        }

        var parts = remote.split('/');
        return parts.length == 1 ? parts[0] : parts[parts.length - 1] + '@' + parts[parts.length - 2];
    }
};