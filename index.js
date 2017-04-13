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
var eslintCli = require('eslint/lib/cli.js');
var concat = require('concat-stream');

var DEFAUTL_GIT_HOOKS = 'https://github.com/youzan/felint-config.git';
var YOUZAN_GIT_HOOKS = 'http://gitlab.qima-inc.com/fe/felint-config.git';

var VERSION = require('./package.json').version;

var supportType = ['react', 'vue', 'es6', 'es5', 'node'];

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
            'rm -rf ./.git_hooks && rm -rf ./.felint && git clone -b dev ' + gitHookUrl + ' .felint && cd .felint && rm -rf ./.git',
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

function updateEslintrcFile(eslintrcPath, type) {
    var resFn;
    var p = new Promise(function(res) {
        resFn = res;
    });
    fileUtil.mergeEslintrcFile(type).then(function(contentStr) {
        checkOverRide(eslintrcPath, contentStr).then(function() {
            fileUtil.createJSONFile(eslintrcPath, contentStr).then(function() {
                console.log('update eslintrc file success'.green);
                resFn();
            }).catch(function(r) {
                console.log(colors.red(r));
                resFn();
            });
        }, function() {
            resFn();
        });
    }, function(r) {
        console.log(colors.red(r));
        resFn();
    });
    return p;
}

function updateScsslintYmlFile(scsslintYmlPath) {
    if (!updateScsslintYmlFile) return;
    var resFn;
    var p = new Promise(function(res) {
        resFn = res;
    });

    fileUtil.mergeScssLint().then(function(contentStr) {
        checkOverRide(scsslintYmlPath, contentStr).then(function() {
            fileUtil.createYAMLFile(scsslintYmlPath, contentStr).then(function() {
                console.log('update scss-lint file success'.green);
                resFn();
            }).catch(function(r) {
                console.log(colors.red(r));
                resFn();
            });
        }, function() {
            resFn();
        });
    }, function(r) {
        console.log(colors.red(r));
        resFn();
    });

    return p;
}

program
    .version(VERSION)
    .command('init')
    .description('初始化felint，-h查看跟多options。更多信息请参考：https://github.com/youzan/felint/blob/master/README.md')
    .option('-t, --type [value]', '指定不同的代码规范，目前支持react(es6),vue(es6),node,es6,es5，默认es5')
    .action(function(options) {
        // checkUpdate(VERSION).then(function(isUpdating) {
        //     if (isUpdating) {
        //         return;
        //     }
        
        var type = options.type || 'es5';
        if (supportType.indexOf(type) === -1) {
            type = 'es5';
        }
        var eslintrcPath = process.cwd() + '/.eslintrc';
        var scsslintYmlPath = '';
        if (type !== 'node') {
            scsslintYmlPath = process.cwd() + '/.scss-lint.yml';
        }
        initConfig().then(function(res) {
            runSh(function() {
                var eslintrcPath = process.cwd() + '/.eslintrc';
                var scsslintYmlPath = process.cwd() + '/.scss-lint.yml';
                updateEslintrcFile(eslintrcPath, type).then(function() {
                    updateScsslintYmlFile(scsslintYmlPath);
                }, function() {
                    updateScsslintYmlFile(scsslintYmlPath);
                });
            });
        }).catch(function() {
            console.log(colors.red('Error: please try again'));
        });
        // });
    });

// 更新配置文件和钩子
program
    .command('update')
    .description('更新felint的配置文件')
    .action(function(options) {
        // checkUpdate(VERSION).then(function(isUpdating) {
        //     if (isUpdating) {
        //         return;
        //     }
        initConfig().then(function(res) {
            runSh(false, function() {
                console.log('update success!'.green);
            });
        }).catch(function() {
            console.log(colors.red('Error: please try again'));
        });
        // });
    });

program
    .command('use')
    .description('在当前目录下运用对应规则文件，-h查看跟多options')
    .option('-t, --type [value]', '指定不同的代码规范，目前支持react(es6),vue(es6),node,es6,es5，默认es5')
    .action(function(options) {
        var type = options.type || 'es5';
        if (!supportType.indexOf(type) > -1) {
            type = 'es5';
        }
        var eslintrcPath = process.cwd() + '/.eslintrc';
        var scsslintYmlPath = '';
        if (type !== 'node') {
            scsslintYmlPath = process.cwd() + '/.scss-lint.yml';
        }
        updateEslintrcFile(eslintrcPath, type).then(function() {
            updateScsslintYmlFile(scsslintYmlPath);
        }, function() {
            updateScsslintYmlFile(scsslintYmlPath);
        });
    });

program
    .command('checkrc')
    .description('检测当前目录及其父目录上的eslintrc文件')
    .action(function() {
        var info = fileUtil.findUp(process.cwd(), '.eslintrc', 'isFile');
        var pathStr;
        while (info) {
            pathStr = info.path;
            console.log((pathStr).green);
            info = fileUtil.findUp(path.dirname(info.dirname), '.eslintrc', 'isFile');
        }
    });

// 该命令用于产生youzan自己的felintrc文件
program
    .command('youzan')
    .description('创建有赞私有felintrc文件')
    .action(function() {
        var felintrcPath = process.cwd() + '/.felintrc';
        fileUtil.createJSONFileSync(felintrcPath, {
            'gitHookUrl': YOUZAN_GIT_HOOKS
        });
    });

// 调用eslint/stylelint校验js/css
program
    .command('lint')
    .option('-js, --javascript', '检测javascript代码')
    .option('-css, --css', '检测css代码')
    .description('使用felint检测js/css代码，-h查看更多options')
    .action(function(arg, options) {
        process.argv.splice(2, 1);
        if (process.argv.indexOf('--stdin') > -1) {
            process.stdin.pipe(concat({ encoding: 'string' }, function(text) {
                process.exitCode = eslintCli.execute(process.argv, text);
            }));
        } else {
            process.exitCode = eslintCli.execute(process.argv);
        }
    });

program.parse(process.argv);

process.once('uncaughtException', function(err) {
    process.exitCode = 1;
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}