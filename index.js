#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');
var process = require('process');
var fs = require('fs');

program
  .version('0.1.3')
  .command('init')
  .description('init git hook, you can configure you git hook url by .felintrc file')
  .action(function() {
    console.log('init git hooks:\n'.green);
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
    var processPromise = new Promise(function(resolve, reject) {
      childProcess.exec(
        'git clone ' + gitHookUrl + ' .git_hooks',
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
            
          console.log(colors.green('init git hooks success!'));
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
