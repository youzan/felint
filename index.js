#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var fs = require('fs');
var path = require('path');

// update config files
function updateConfig() {
    console.log('update git hooks:\n'.green)
    var processPromise = new Promise(function(resolve, reject) {
        childProcess.exec(
            'cd ./.git_hooks && git pull origin dev',
            function(err) {
                if (err) {
                    console.log(err, '\n');
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });
    return processPromise;
}

// 递归寻找目录
function hasGitHooks(prePath, pathStr, targetFold) {
    if (prePath !== pathStr && pathStr && targetFold) {
        var gitHookPath = pathStr + '/' + targetFold;
        try {
            var directoryStat = fs.statSync(gitHookPath);
        } catch(e) {
            return hasGitHooks(pathStr, path.dirname(pathStr), targetFold);
        }
        if(directoryStat && directoryStat.isDirectory()){
            return gitHookPath;
        }
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
            'rm -rf ./.git_hooks && git clone -b dev ' + gitHookUrl + ' .git_hooks',
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
function runSh() {
    var esV = program.ecamScript6 ? '6' : '5';
    console.log('start run logic shell...\n'.green)
    var child = childProcess.exec(
        'sh ./.git_hooks/update_git_hooks.sh ' + esV,
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
    .option('-5, --ecamScript5', 'default ecamScript5 for your project')
    .option('-6, --ecamScript6', 'default ecamScript6 for your project');

program
    .version('0.1.6')
    .command('init')
    .description('by default, felint will copy the eslint config file, css lint config and git hooks \
      from https://github.com/youzan/felint-config. \
      You can use your own by forking our felint-config and specifying the git url in .felintrc file. \
      More detail please read: https://github.com/youzan/felint/blob/master/README.md')
    .action(function() {
        initConfig().then(function(res) {
            runSh();
        }).catch(function() {
            console.log(colors.red('Error: please try again'));
        });

    });

program
    .command('update')
    .description('update git hooks')
    .action(function() {
        updateConfig().then(function() {
            runSh();
        }).catch(function() {
            console.log(colors.red('Error: please try again'));
        });

    });

program
    .command('use')
    .description('use different ecamScript version for your project or directory')
    .action(function() {
        var hookPath = hasGitHooks('', process.cwd(), '.git_hooks');
        if(hookPath) {
            var esV = program.ecamScript6 ? '6' : '5';
            childProcess.exec(
                'rm ./.eslintrc && cp ' + hookPath + '/.eslintrc_es' + esV + ' ./.eslintrc',
                function(err) {
                    if (err) {
                        console.log(err, '\n');
                    } else {
                        console.log(('already use ecamScript' + esV + ' for current directory').green);
                    }
                }
            );
        } else {
            console.log('you should run "felint init" in your project root directory first!'.red);
        }
    })

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
