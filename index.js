#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var fs = require('fs');

program
    .version('0.1.4')
    .command('init')
    .description('by default, felint will copy the eslint config file, css lint config and git hooks \
      from https://github.com/youzan/felint-config. \
      You can use your own by forking our felint-config and specifying the git url in .felintrc file. \
      More detail please read: https://github.com/youzan/felint/blob/master/README.md')
    .action(function() {
        console.log('detecting felint-config git repository url...\n'.green);
        var currWorkDirectory = process.cwd();
        var felintrcFileObj;
        try {
            felintrcFileObj = JSON.parse(fs.readFileSync(currWorkDirectory + '/.felintrc').toString());
        } catch (e) {
            felintrcFileObj = {};
        }
        var gitHookUrl;
        if (typeof felintrcFileObj === 'object' && felintrcFileObj.gitHookUrl) {
            gitHookUrl = felintrcFileObj.gitHookUrl;
        } else {
            gitHookUrl = 'https://github.com/youzan/felint-config.git';
        }
        console.log(colors.green('use ' + gitHookUrl) + '\n( you can use your own, via https://github.com/youzan/felint/blob/master/README.md )\n');
        console.log('getting the config files from remote server...\n'.green);
        var processPromise = new Promise(function(resolve, reject) {
            childProcess.exec(
                'rm -rf ./.git_hooks && git clone ' + gitHookUrl + ' .git_hooks',
                function(err) {
                    if (err) {
                        reject();
                    }
                    resolve();
                }
            );
        });

        processPromise
            .then(function(res) {
                childProcess.exec(
                    'sh ./.git_hooks/update_git_hooks.sh',
                    function(err) {
                        if (err) {
                            console.log(colors.red('Error: please try again'));
                        }

                        console.log(colors.green('init git hooks success! ') + '\n( eslint will be run while git commit )\n');
                        console.log(colors.green('init .eslintrc .scss-lint.yml success!\n'));
                        console.log(colors.green('Enjoy!'));
                    }
                );
            })
            .catch(function() {
                console.log(colors.red('Error: please try again'));
            });
    });

program
    .command('update')
    .description('update git hooks')
    .action(function() {
        console.log('update git hooks:\n'.green)
        var processPromise = new Promise(function(resolve, reject) {
            childProcess.exec(
                'cd ./.git_hooks && git pull origin master',
                function(err) {
                    if (err) {
                        reject();
                    }
                    resolve();
                }
            );
        });

        processPromise
            .then(function() {
                childProcess.exec(
                    'sh ./.git_hooks/update_git_hooks.sh',
                    function(err) {
                        if (err) {
                            console.log(colors.red('Error: please try again'));
                        }

                        console.log(colors.green('update git hooks success!'));
                    }
                );
            })
            .catch(function() {
                console.log(colors.red('Error: please try again'));
            });
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
