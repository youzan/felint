#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var fs = require('fs');
var path = require('path');

var HOME = process.env.HOME;

// update config files
function updateConfig() {
    console.log('update git hooks:\n'.green)
    var s = has( HOME + '/.git_hooks');
    var resolveFn, rejectFn;
    var processPromise = new Promise(function(resolve, reject) {
        resolveFn = resolve;
        rejectFn = reject;
    });
    if(!s || !s.isDirectory()) {
        console.log('You should run "felint init" first'.red);
        rejectFn();
    } else {
        childProcess.exec(
            'cd ~/.git_hooks && git pull origin master',
            function(err) {
                if (err) {
                    console.log(err, '\n');
                    rejectFn();
                } else {
                    resolveFn();
                }
            }
        );
    }
    return processPromise;
}

// 递归寻找目录
function treeHas(prePath, pathStr, targetFold) {
    if (prePath !== pathStr && pathStr && targetFold) {
        var fp = pathStr;
        var s = has(fp + '/' + targetFold);
        if(!s) {
            return treeHas(pathStr, path.dirname(pathStr), targetFold);
        } else {
            return {
                'stat': s,
                'path': fp
            }
        }
    } else {
        return false;
    }
}

function has(pathStr) {
    if (pathStr) {
        try {
            var s = fs.statSync(pathStr);
        } catch(e) {
            return false;
        }
        return s;
    } else {
        return false;
    }
}

// init config files
function initConfig() {
    console.log('start init config files...\n'.green);
    var currWorkDirectory = process.cwd();
    var felintrcFileObj = {};
    var felintrcPwd = currWorkDirectory + '/.felintrc';

    var resolveFn;
    var rejectFn;
    var processPromise = new Promise(function(resolve, reject) {
        resolveFn = resolve;
        rejectFn = reject;
    });

    fs.access(felintrcPwd, fs.F_OK | fs.R_OK, function(err) {
        if (err) {
            console.log('.felintrc file does not exist or can not be read, please check it\n'.red)
        } else {
            try {
                felintrcFileObj = JSON.parse(fs.readFileSync(felintrcPwd).toString());
            } catch (e) {
                console.log('parse .felintrc file error\n');
            }
        }
        var gitHookUrl;
        if (typeof felintrcFileObj === 'object' && felintrcFileObj.gitHookUrl) {
            gitHookUrl = felintrcFileObj.gitHookUrl;
            console.log('use .felintrc file\n'.green)
        } else {
            gitHookUrl = 'https://github.com/youzan/felint-config.git';
            console.log('use default config...\n'.green)
        }
        console.log(colors.green('use ' + gitHookUrl) + '\n( you can use your own, via https://github.com/youzan/felint/blob/master/README.md )\n');
        console.log('getting the config files from remote server...\n'.green);
        childProcess.exec(
            'cd ~ && rm -rf ./.git_hooks && git clone -b master ' + gitHookUrl + ' .git_hooks',
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
function runSh(esV) {
    console.log('start run logic shell...\n'.green)
    var child = childProcess.exec(
        'sh ~/.git_hooks/update_git_hooks.sh ' + esV,
        function(err) {
            if (err) {
                console.log(err);
                console.log('\n');
                console.log(colors.red('Error: please try again'));
            } else {
                console.log(colors.green('update git hooks success! ') + '\n( eslint will be run while git commit )\n');
                console.log(colors.green('update .eslintrc .scss-lint.yml success!\n'));
                console.log(colors.green('Enjoy!'));
            }
        }
    );
    child.stdout.on('data', function(data) {
        console.log(data);
    })
}

program
    .version('0.1.6')
    .command('init')
    .description('by default, felint will copy the eslint config file, css lint config and git hooks \
      from https://github.com/youzan/felint-config. \
      You can use your own by forking our felint-config and specifying the git url in .felintrc file. \
      More detail please read: https://github.com/youzan/felint/blob/master/README.md')
    .option('-5, --ecamScript5', 'default ecamScript5 for your project')
    .option('-6, --ecamScript6', 'default ecamScript6 for your project')
    .action(function(options) {
        var esV = options.ecamScript6 ? '6' : '5';
        initConfig().then(function(res) {
            runSh(esV);
        }).catch(function() {
            console.log(colors.red('Error: please try again'));
        });

    });

program
    .command('update')
    .description('update felint config files')
    .option('-c, --config', 'only update felint config itself')
    .option('-5, --ecamScript5', 'update felint config files & use ecamScript5 for your project')
    .option('-6, --ecamScript6', 'update felint config files & use ecamScript6 for your project')
    .action(function(options) {
        var isConfig = options.config;
        var esV = options.ecamScript6 ? '6' : (options.ecamScript5 || !isConfig) ? '5' : '';
        var p = updateConfig();
        if(isConfig) {
            p.then(function() {
                console.log('update config success'.green);
            }).catch(function(e) {
                console.log(e, '\n');
                console.log(colors.red('Error: please try again'));
            });
        } else {
            p.then(function() {
                runSh(esV);
            }).catch(function(e) {
                console.log(e, '\n');
                console.log(colors.red('Error: please try again'));
            });
        }
    });

program
    .command('use')
    .description('use different ecamScript version for your project or directory')
    .option('-5, --ecamScript5', 'use ecamScript5 for your project')
    .option('-6, --ecamScript6', 'use ecamScript6 for your project')
    .action(function(options) {
        var esV = options.ecamScript6 ? '6' : '5';
        childProcess.exec(
            'cp ~/.git_hooks/.eslintrc_es' + esV + ' ./.eslintrc',
            function(err) {
                if (err) {
                    console.log(err, '\n');
                    console.log('maybe you should run "felint init" first'.red);
                } else {
                    console.log(('already use ecamScript' + esV + ' for current directory').green);
                }
            }
        );
    })

program
    .command('checkrc')
    .description('check there are how many .eslintrc files in your path')
    .action(function() {
        var info = treeHas('', process.cwd(), '.eslintrc');
        var pathStr;
        while(info) {
            pathStr = info.path;
            if(info.stat.isFile()) {
                console.log((pathStr + '/.eslintrc').green);
            }
            info = treeHas(pathStr, path.dirname(pathStr), '.eslintrc');
        }
    })

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
