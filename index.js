var program = require('commander');
var colors = require('colors');
var childProcess = require('child_process');

program
  .version('0.0.1')
  .command('init')
  .action(function() {
    console.log('init git hooks:\n'.green);
    var processPromise = new Promise(function(resolve, reject) {
      childProcess.exec(
        'git clone https://github.com/cookfront/git-hooks.git git_hooks',
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
        'sh ./git_hooks/update_git_hooks.sh',
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
  .action(function() {
    console.log('update git hooks:\n'.green)
    var processPromise = new Promise(function(resolve, reject) {
      childProcess.exec(
        'cd ./git_hooks && git pull origin master',
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
        'sh ./git_hooks/update_git_hooks.sh',
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

program.parse(process.argv);
