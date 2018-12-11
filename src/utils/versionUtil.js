/* global Promise */

let sh = require('shelljs');
var readline = require('readline');

let VERSION = require('../../package.json').version;

let isBetaNow = VERSION.indexOf('alpha') > -1;

function versionParser(version) {
    let info = {version: []};
    if (version) {
        let part = version.split('-');
        info.isBeta = part[1] && part[1].indexOf('alpha') > -1;
        if (info.isBeta) {
            info.betaVersion = +part[1].split('.')[1];
        }
        let versionInfo = part[0].split('.');
        info.version = [+versionInfo[0], +versionInfo[1], +versionInfo[2]];
    }
    return info;
}

function compareVersion(versionA, versionB) {
    let versionAInfo = versionParser(versionA);
    let versionBInfo = versionParser(versionB);
    let compareValue = 0;
    let index = 0;
    do {
        compareValue = versionAInfo.version[index] - versionBInfo.version[index];
        index ++;
    } while (compareValue === 0 && index <= 2);
    if (compareValue === 0) {
        if (versionAInfo.isBeta) {
            compareValue = -1;
            if (versionBInfo.isBeta) {
                compareValue = versionAInfo.betaVersion - versionBInfo.betaVersion;
            }
        } else if (versionBInfo.isBeta) {
            compareValue = 1;
        } else {
            compareValue = 0;
        }
    }
    return compareValue;
}

/**
 * 判断是否需要更新felint
 * @param  {[type]} version [description]
 * @return {[type]}         [description]
 */
function checkUpdate() {
    let olVersion;
    let isUpdating = false;
    return new Promise(res => {
        try {
            olVersion = sh.exec('npm view felint@latest version', {silent: true});
        } catch (e) {
            console.log('检查更新失败');
            res(isUpdating);
        }
        let compareValue = compareVersion(VERSION, olVersion);
        if (compareValue > 0 && isBetaNow) {
            try {
                olVersion = sh.exec('npm view felint@beta version', {silent: true});
            } catch (e) {
                console.log('检查更新失败');
                res(isUpdating);
            }
            compareValue = compareVersion(VERSION, olVersion);
        }
        if (compareValue < 0) {
            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(`发现felint新版本${olVersion.trim().red}，立即更新(Y/n)?`, (ans) => {
                rl.close();
                if (ans !== 'n') {
                    isUpdating = true;
                    console.log('更新felint版本中...');
                    sh.exec(`npm install -d -g felint@${versionParser(olVersion).isBeta ? 'beta' : 'latest'}`);
                }
                res(isUpdating);
            });
        } else {
            res(isUpdating);
        }
    });
}

module.exports = {
    VERSION,
    isBetaNow,
    checkUpdate
};
