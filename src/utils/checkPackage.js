const walk = require('walkdir');
let nodeModules;

function getAllNodeModules(pathStr) {
    const modules = [];
    try {
        modules = walk.sync(pathStr, {
            no_recurse: true
        });
    } catch (e) {
        modules = [];
    }

    modules.forEach((moduleName) => {
        // 私包
        if (moduleName[0] === '@') {
            modules = modules.concat(getAllNodeModules(`${pathStr}/${moduleName}`));
        }
    });

    return modules;
}

function check(name, version) {
    const fixName = `\/${name}$`;
    const nameReg = new RegExp(fixName);
    let result = false;

    if (!nodeModules) {
        nodeModules = getAllNodeModules(`${process.cwd()}/node_modules`);
    }

    nodeModules.some(n => {
        if (nameReg.test(n)) {
            const packageJson = require(`${n}/package.json`);

            if (packageJson.version === version) {
                result = true;
            } else {
                result = {
                    current: packageJson.version,
                    require: version
                };
            }

            return true;
        } else {
            return false;
        }
    });

    return result;
}

module.exports = check;
