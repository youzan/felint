/* global Promise */
var readline = require('readline');
var fileUtil = require('./fileUtil.js');
var colors = require('colors');

/**
 * 判断是否需要覆盖css/js规则文件
 * @param  {[type]} version [description]
 * @return {[type]}         [description]
 */
function checkOverRide(filePath, newContentStr) {
    var fileStat = fileUtil.has(filePath);
    var resFn;
    var rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    if (fileStat && fileStat.isFile()) {
        fileUtil.readFile(filePath, function(oldContentStr) {
            // 不相同则提示替换
            if (newContentStr != oldContentStr) {
                var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                rl.question(filePath + '文件已存在，是否要覆盖(Y/n)?', function(ans) {
                    rl.close();
                    if (ans !== 'n') {
                        resFn();
                    } else {
                        rejFn();
                    }
                });
            } else {
                rejFn();
            }
        }, function(r) {
            resFn();
        });
    } else {
        resFn();
    }
    return p;
}

module.exports = checkOverRide;