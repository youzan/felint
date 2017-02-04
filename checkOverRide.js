var readline = require('readline');
var fileUtil = require('./fileUtil.js');

/**
 * 判断是否需要覆盖css/js规则文件
 * @param  {[type]} version [description]
 * @return {[type]}         [description]
 */
function checkOverRide(filePath) {
    var fileStat = fileUtil.has(filePath);
    var resFn, rejFn;
    var p = new Promise(function(res, rej) {
        resFn = res;
        rejFn = rej;
    });
    if (fileStat && fileStat.isFile()) {
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
        resFn();
    }
    return p;
}

module.exports = checkOverRide;