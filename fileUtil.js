/* global Promise */

var fs = require('fs');
var path = require('path');
var YAML = require('js-yaml');

var DEFAULT_FELINTRC_CONFIG = {
    'eslintrc_es5': {
    },
    'eslintrc_es6': {
    },
    'scss-lint': {
    }
};

function has(pathStr) {
    if (pathStr) {
        try {
            var s = fs.statSync(pathStr);
        } catch (e) {
            return false;
        }
        return s;
    } else {
        return false;
    }
}

function treeHas(prePath, pathStr, targetFold) {
    if (prePath !== pathStr && pathStr && targetFold) {
        var fp = pathStr + '/' + targetFold;
        var s = has(fp);
        if (!s) {
            return treeHas(pathStr, path.dirname(pathStr), targetFold);
        } else {
            return {
                'stat': s,
                'path': fp,
                'dirname': pathStr
            };
        }
    } else {
        return false;
    }
}

function findUp(pathStr, target, type) {
    var result = treeHas('', pathStr, target);
    if (type && result) {
        if (!result.stat[type]()) {
            return findUp(path.dirname(result.path), target, type);
        }
    }
    return result;
}

function readFile(pathStr, resFn, rejFn) {
    if (!pathStr) {
        rejFn('path can not be empty');
    }
    var pathInfo = path.parse(pathStr);
    var fileContent;
    fs.access(pathStr, fs.F_OK | fs.R_OK, function(err) {
        if (err) {
            rejFn(pathInfo.base + ' file does not exist or can not be read, please check it');
        } else {
            try {
                fileContent = fs.readFileSync(pathStr, 'utf8');
            } catch (e) {
                rejFn('parse ' + pathInfo.base + ' error');
            }
            resFn(fileContent);
        }
    });
}

function readJSON(pathStr) {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    readFile(pathStr, function(fileContent) {
        resFn(JSON.parse(fileContent));
    }, rejFn);
    return p;
}

function createJSONFile(pathStr, contentStr) {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    if (!pathStr || !contentStr) {
        rejFn('neet pathStr and file content');
    } else {
        fs.writeFile(pathStr, contentStr, function(err) {
            if (err) {
                rejFn(err);
            } else {
                resFn();
            }
        });
    }
    return p;
}

function createJSONFileSync(pathStr, contentStr) {
    if (!pathStr || !contentStr) {
        console.log('neet pathStr and file content');
    } else {
        if (typeof contentStr === 'object') {
            contentStr = JSON.stringify(contentStr);
        }
        fs.writeFileSync(pathStr, contentStr);
    }
}

function mergeEslintrcFile(esV) {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    // 找到.felint目录
    var gitHookPath = findUp(process.cwd(), '.felint', 'isDirectory');
    if (gitHookPath) {
        // 读取对应eslintrc文件
        readJSON(gitHookPath.path + '/.eslintrc_es' + esV).then(function(r) {
            var eslintrcContent = r;
            // 尝试读取 felintrc文件
            treeReadFile('.felintrc').then(function(c) {
                return Promise.resolve(c);
            }, function(r) {
                return Promise.resolve(DEFAULT_FELINTRC_CONFIG);
            }).then(function(c) {
                Object.assign(eslintrcContent.rules, c['eslintrc_es' + esV] || {});
                resFn(JSON.stringify(eslintrcContent || {}, null, 4));
            });
        }).catch(function(r) {
            rejFn(r);
        });
    } else {
        rejFn('can find .felint directory!');
    }
    return p;
}

function readYaml(pathStr) {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    readFile(pathStr, function(fileContent) {
        resFn(YAML.safeLoad(fileContent));
    }, rejFn);
    return p;
}

function createYAMLFile(pathStr, contentStr) {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    if (!pathStr || !contentStr) {
        rejFn('neet pathStr and file content');
    } else {
        fs.writeFile(pathStr, contentStr, function(err) {
            if (err) {
                rejFn(err);
            } else {
                resFn();
            }
        });
    }
    return p;
}

function mergeScssLint() {
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    // 找到.felint目录
    var gitHookPath = findUp(process.cwd(), '.felint', 'isDirectory');
    if (gitHookPath) {
        // 读取对应scss-lint文件
        readYaml(gitHookPath.path + '/.scss-lint.yml').then(function(r) {
            var yamlObj = r;
            // 尝试读取 felintrc文件
            treeReadFile('.felintrc').then(function(c) {
                return Promise.resolve(c);
            }, function(r) {
                return Promise.resolve(DEFAULT_FELINTRC_CONFIG);
            }).then(function(c) {
                Object.assign(yamlObj.linters, c['scss-lint'] || {});
                // 直接返回字符串，方便比较、写文件
                resFn(YAML.safeDump(yamlObj || {}));
            })
        }).catch(function(r) {
            rejFn(r);
        });
    } else {
        rejFn('can find .felint directory!');
    }
    return p;
}

function treeReadFile(filename) {
    // read file content
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    var fileInfo = findUp(process.cwd(), filename, 'isFile');
    if (fileInfo) {
        readJSON(fileInfo.path).then(function(r) {
            resFn(r);
        }).catch(function(r) {
            rejFn(r);
        });
    } else {
        rejFn('can not find ' + filename + ' file');
    }
    return p;
}

module.exports = {
    mergeEslintrcFile: mergeEslintrcFile,
    readFile: readFile,
    readJSON: readJSON,
    treeReadFile: treeReadFile,
    createJSONFile: createJSONFile,
    findUp: findUp,
    mergeScssLint: mergeScssLint,
    createYAMLFile: createYAMLFile,
    has: has,
    createJSONFileSync: createJSONFileSync
}