#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var fs = require('fs');
var path = require('path');
var fileUtil = require('./fileUtil.js');
var checkUpdate = require('./checkUpdate.js');

var DEFAUTL_GIT_HOOKS = 'https://github.com/youzan/felint-config.git';
var YOUZAN_GIT_HOOKS = 'http://gitlab.qima-inc.com/fe/felint-config.git';

var VERSION = '0.2.4';

// init config files
function initConfig(isYouzan) {
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
        if (isYouzan) {
            gitHookUrl = YOUZAN_GIT_HOOKS;
        }
        if (r.gitHookUrl) {
            console.log('use .felintrc file\n'.green)
            gitHookUrl = r.gitHookUrl;
        } else {
            isYouzan ? console.log('use youzan config...\n'.green) : console.log('use default config...\n'.green)
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
    })

    return processPromise;
}


// run logic shell
function runSh(isYouzan, cb) {
    isYouzan = isYouzan && 'youzan';
    console.log('start run logic shell...\n'.green)
    var child = childProcess.exec(
        'sh ./.felint/update_git_hooks.sh ' + isYouzan,
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

program
    .version(VERSION)
    .command('init')
    .description('by default, felint will copy the eslint config file, css lint config and git hooks \
      from https://github.com/youzan/felint-config. \
      You can use your own by forking our felint-config and specifying the git url in .felintrc file. \
      More detail please read: https://github.com/youzan/felint/blob/master/README.md')
    .option('-5, --ecamScript5', 'default ecamScript5 for your project')
    .option('-6, --ecamScript6', 'default ecamScript6 for your project')
    .option('--youzan', 'for youzan org only')
    .action(function(options) {
        checkUpdate(VERSION).then(function(isUpdating) {
            if (isUpdating) {
                return;
            }
            var esV = options.ecamScript6 ? '6' : '5';
            var youzan = !!options.youzan;
            initConfig(youzan).then(function(res) {
                runSh(youzan, function() {
                    fileUtil.mergeEslintrcFile(esV).then(function(content) {
                        fileUtil.createJSONFile(process.cwd() + '/.eslintrc', content).then(function() {
                            console.log('update eslintrc file success'.green);
                        }).catch(function(r) {
                            console.log(colors.red(r));
                        });
                    }, function(r) {
                        console.log(colors.red(r));
                    });
                    fileUtil.mergeScssLint().then(function(content) {
                        fileUtil.createYAMLFile(process.cwd() + '/.scss-lint.yml', content).then(function() {
                            console.log('update scss-lint file success'.green);
                        }).catch(function(r) {
                            console.log(colors.red(r));
                        });
                    }, function(r) {
                        console.log(colors.red(r));
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
        })
    });

program
    .command('use')
    .description('use different ecamScript version for your project or directory')
    .option('-5, --ecamScript5', 'use ecamScript5 for your project')
    .option('-6, --ecamScript6', 'use ecamScript6 for your project')
    .action(function(options) {
        var esV = options.ecamScript6 ? '6' : '5';
        fileUtil.mergeEslintrcFile(esV).then(function(content) {
            fileUtil.createJSONFile(process.cwd() + '/.eslintrc', content).then(function() {
                console.log(colors.green('already use ecamScript' + esV + ' for your project or directory'));
            }).catch(function(r) {
                console.log(colors.red(r));
            });
        }, function(r) {
            console.log(colors.red(r));
        });
        fileUtil.mergeScssLint().then(function(content) {
            fileUtil.createYAMLFile(process.cwd() + '/.scss-lint.yml', content).then(function() {
                console.log('update scss-lint file success'.green);
            }).catch(function(r) {
                console.log(colors.red(r));
            });
        }, function(r) {
            console.log(colors.red(r));
        });
    })

program
    .command('checkrc')
    .description('check there are how many .eslintrc files in your path')
    .action(function() {
        var info = fileUtil.findUp( process.cwd(), '.eslintrc', 'isFile');
        var pathStr;
        while(info) {
            pathStr = info.path;
            console.log((pathStr).green);
            info = fileUtil.findUp( path.dirname(info.dirname), '.eslintrc', 'isFile' );
        }
    })

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}