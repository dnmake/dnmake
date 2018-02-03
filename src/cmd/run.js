module.exports = class RunCommand {

    constructor(env, scope) {
        if (!scope.project) {
            throw new Error('No project available');
        }
    }

    run(args, options) {

    }
};