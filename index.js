#!/usr/bin/env node

/* global Promise */

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var path = require('path');
var fileUtil = require('./fileUtil.js');
var checkUpdate = require('./checkUpdate.js');
var checkOverRide = require('./checkOverRide.js');

var DEFAUTL_GIT_HOOKS = 'https://github.com/youzan/felint-config.git';
var YOUZAN_GIT_HOOKS = 'http://gitlab.qima-inc.com/fe/felint-config.git';

var VERSION = require('./package.json').version;

var DefaultPackageMap = {
    'eslint-plugin-react': '5.1.1',
    'babel-eslint': '6.0.4',
    'eslint-plugin-import': '1.8.1',
    'eslint-plugin-jsx-a11y': '1.2.3',
    'eslint-config-airbnb': '9.0.1',
    'eslint-plugin-lean-imports': '0.3.3',
    'eslint': '2.11.1'
};

// init config files
function initConfig() {
    console.log('start init config files...\n'.green);

    var resolveFn;
    var rejectFn;
    var processPromise = new Promise(function(resolve, reject) {
        resolveFn = resolve;
        rejectFn = reject;
    });

    fileUtil.treeReadFile('.felintrc').then(function(content) {
        return Promise.resolve(content);
    }, function() {
        console.log('.felintrc file does not exist or can not be read as JSON format, please check it\n');
        return Promise.resolve({});
    }).then(function(r) {
        var gitHookUrl = DEFAUTL_GIT_HOOKS;
        if (r.gitHookUrl) {
            console.log('use .felintrc file\n'.green);
            gitHookUrl = r.gitHookUrl;
        }
        console.log(colors.green('use ' + gitHookUrl) + '\n( you can use your own, via https://github.com/youzan/felint/blob/master/README.md )\n');
        console.log('getting the config files from remote server...\n'.green);
        childProcess.exec(
            'rm -rf ./.git_hooks && rm -rf ./.felint && git clone -b master ' + gitHookUrl + ' .felint && cd .felint && rm -rf ./.git',
            function(err) {
                if (err) {
                    console.log(err, '\n');
                    rejectFn();
                }
                resolveFn();
            }
        );
    });

    return processPromise;
}


// run logic shell
function runSh(cb) {
    console.log('start run logic shell...\n'.green);
    var child = childProcess.exec(
        'sh ./.felint/update_git_hooks.sh',
        function(err) {
            if (err) {
                console.log(err);
                console.log('\n');
                console.log(colors.red('Error: please try again'));
            } else {
                cb && cb();
            }
        }
    );
    child.stdout.on('data', function(data) {
        console.log(data);
    });
}

function _check(dependencied, i, keys) {
    var key = keys[i];
    var version = DefaultPackageMap[key];
    var reg = new RegExp('\/' + key + '$');
    var flag = false;
    var pathStr = '';
    i++;
    dependencied.some(function(value) {
        if (reg.test(value)) {
            pathStr = value + '/package.json';
            return flag = true;
        }
        return false;
    });
    if (flag) {
        fileUtil.readJSON(pathStr).then(function(fileContent) {
            if (fileContent.version === version) {
                console.log(colors.green('你已安装' + key + '@' + version));
            } else {
                console.log(colors.red('你已安装' + key + '@' + fileContent.version + '，如果出现问题，请安装'), colors.green(version + '版本尝试解决'));
            }
            if (i < keys.length) {
                _check(dependencied, i, keys);
            }
        }, function(e) {
            console.log(colors.red('你尚未安装' + key + '@' + version));
            if (i < keys.length) {
                _check(dependencied, i, keys);
            }
        });
    } else {
        console.log(colors.red('你尚未安装' + key + '@' + version));
        if (i < keys.length) {
            _check(dependencied, i, keys);
        }
    }
}

function checkPackageVersion() {
    childProcess.exec(
        'npm list -g --depth=0 --silent --parseable=true',
        function(err, stdout) {
            var dependencied = (stdout.split('\n')) || [];
            var keys = Object.keys(DefaultPackageMap);
            _check(dependencied, 0, keys);
        }
    );
}

function updateEslintrcFile(eslintrcPath, esV) {
    var resFn;
    var p = new Promise(function(res) {
        resFn = res;
    });
    checkOverRide(eslintrcPath).then(function() {
        fileUtil.mergeEslintrcFile(esV).then(function(content) {
            fileUtil.createJSONFile(eslintrcPath, content).then(function() {
                console.log('update eslintrc file success'.green);
                resFn();
            }).catch(function(r) {
                console.log(colors.red(r));
                resFn();
            });
        }, function(r) {
            console.log(colors.red(r));
            resFn();
        });
    }, function() {
        resFn();
    });
    return p;
}

function updateScsslintYmlFile(scsslintYmlPath) {
    var resFn;
    var p = new Promise(function(res) {
        resFn = res;
    });
    checkOverRide(scsslintYmlPath).then(function() {
        fileUtil.mergeScssLint().then(function(content) {
            fileUtil.createYAMLFile(scsslintYmlPath, content).then(function() {
                console.log('update scss-lint file success'.green);
                resFn();
            }).catch(function(r) {
                console.log(colors.red(r));
                resFn();
            });
        }, function(r) {
            console.log(colors.red(r));
            resFn();
        });
    }, function() {
        resFn();
    });
    return p;
}

program
    .version(VERSION)
    .command('init')
    .description('by default, felint will copy the eslint config file, css lint config and git hooks \
      from https://github.com/youzan/felint-config. \
      You can use your own by forking our felint-config and specifying the git url in .felintrc file. \
      More detail please read: https://github.com/youzan/felint/blob/master/README.md')
    .option('-5, --ecamScript5', 'default ecamScript5 for your project')
    .option('-6, --ecamScript6', 'default ecamScript6 for your project')
    .action(function(options) {
        checkUpdate(VERSION).then(function(isUpdating) {
            if (isUpdating) {
                return;
            }
            var esV = options.ecamScript6 ? '6' : '5';
            initConfig().then(function(res) {
                runSh(function() {
                    var eslintrcPath = process.cwd() + '/.eslintrc';
                    var scsslintYmlPath = process.cwd() + '/.scss-lint.yml';
                    updateEslintrcFile(eslintrcPath, esV).then(function() {
                        updateScsslintYmlFile(scsslintYmlPath);
                    }, function() {
                        updateScsslintYmlFile(scsslintYmlPath);
                    });
                });
            }).catch(function() {
                console.log(colors.red('Error: please try again'));
            });
        });
    });

// 更新配置文件和钩子
program
    .command('update')
    .description('update felint config files(if you need to use the new eslintrc file or scss-lint file, use "use" command after update)')
    .action(function(options) {
        checkUpdate(VERSION).then(function(isUpdating) {
            if (isUpdating) {
                return;
            }
            initConfig().then(function(res) {
                runSh(false, function() {
                    console.log('update success!'.green);
                });
            }).catch(function() {
                console.log(colors.red('Error: please try again'));
            });
        });
    });

program
    .command('use')
    .description('use different ecamScript version for your project or directory')
    .option('-5, --ecamScript5', 'use ecamScript5 for your project')
    .option('-6, --ecamScript6', 'use ecamScript6 for your project')
    .action(function(options) {
        var esV = options.ecamScript6 ? '6' : '5';
        var eslintrcPath = process.cwd() + '/.eslintrc';
        var scsslintYmlPath = process.cwd() + '/.scss-lint.yml';
        updateEslintrcFile(eslintrcPath, esV).then(function() {
            updateScsslintYmlFile(scsslintYmlPath);
        }, function() {
            updateScsslintYmlFile(scsslintYmlPath);
        });
    });

program
    .command('checkrc')
    .description('check there are how many .eslintrc files in your path')
    .action(function() {
        var info = fileUtil.findUp(process.cwd(), '.eslintrc', 'isFile');
        var pathStr;
        while (info) {
            pathStr = info.path;
            console.log((pathStr).green);
            info = fileUtil.findUp(path.dirname(info.dirname), '.eslintrc', 'isFile');
        }
    });

program
    .command('checkDependence')
    .description('check felint dependencies')
    .action(function() {
        console.log(colors.green('检查中...'));
        checkPackageVersion();
    });

// 改命令用于产生youzan自己的felintrc文件
program
    .command('youzan')
    .description('create Youzan org felintrc file')
    .action(function() {
        var felintrcPath = process.cwd() + '/.felintrc';
        fileUtil.createJSONFileSync(felintrcPath, {
            'gitHookUrl': YOUZAN_GIT_HOOKS
        });
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}