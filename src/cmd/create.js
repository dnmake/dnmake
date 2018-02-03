var fs   = require('fs-extra'),
    path = require('path'),
    git  = require('simple-git/promise');

module.exports = class CreateCommand {

    constructor(env, scope) {
        this.env = env;
        this.scope = scope;

        if (scope.project) {
            throw new Error('Cannot create project inside an existsing project');
        }
    }

    isValid(args, options) {
        return args.length == 1 && options['name'];
    }

    async run(args, options) {
        var name = args[0];
        var dir = path.join(this.env.projectsDir, name);

        if (!fs.existsSync(dir)) {
            return {
                success: false,
                message: name + ' was not found'
            };
        }

        var remote = await git(dir).listRemote(['--get-url']);

        var projectDir = options['path'] ? options['path'] : options['name'];
        if (fs.existsSync(projectDir)) {
            return {
                success: false,
                message: projectDir + ' already exists'
            };
        }

        fs.mkdirSync(projectDir);
        fs.copySync(path.join(dir, 'src'), projectDir);
        fs.mkdirSync(path.join(projectDir, '.dnmake'));
        fs.writeFileSync(path.join(projectDir, '.dnmake', 'config.json'), JSON.stringify({
            name: name,
            options: options,
            remote: remote
        }));
        
        return {
            success: true,
            message: 'Created ' + options['name']
        };
    }
}