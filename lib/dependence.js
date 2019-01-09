'use strict';

/**
 * 安装配置指定的依赖
 */
let install = (() => {
    var _ref = _asyncToGenerator(function* (plan) {
        const dependenceList = ['npm'];
        if (typeof plan === 'string') {
            dependenceList.push(plan);
        } else if (typeof plan === 'object') {
            Object.keys(plan).forEach(function (item) {
                const planName = plan[item];
                if (dependenceList.indexOf(planName) === -1) {
                    dependenceList.push(planName);
                }
            });
        }

        const configInfo = felintConfig.readFelintConfig();
        const dependenceConfig = configInfo.dependence;
        let dependencePackages = {};
        dependenceList.forEach(function (item) {
            dependencePackages = Object.assign({}, dependencePackages, dependenceConfig[item] || {});
        });

        let msgInfo = yield installSinglePackage(dependencePackages);
        return msgInfo || '';
    });

    return function install(_x) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const sh = require('shelljs');
const felintConfig = require('./felintConfig.js');
const checkPackage = require('./utils/checkPackage.js');

/**
 * 安装npm包
 * @param {String} packageName 包名
 * @param {String} version 版本号
 */
function installPackage(packageName, version) {
    const result = checkPackage(packageName, version);

    if (!result) {
        try {
            console.log(`开始安装${packageName}@${version}`.green);
            sh.exec(`npm i -D ${packageName}@${version}`);
        } catch (e) {
            console.log(`${packageName}@${version}安装失败，请检查`.red);
        }
    } else {
        return result;
    }
}

// 安装单个依赖
function installSinglePackage(typeInfo = {}) {
    return new Promise(res => {
        const npmDepList = Object.keys(typeInfo);
        const msgInfo = [];

        npmDepList.forEach(packageName => {
            let result = installPackage(packageName, typeInfo[packageName]);
            if (result && result.current) {
                msgInfo.push(`你已安装${`${packageName}@${result.current}`.red}，默认版本为${typeInfo[packageName].green}，${'请确认!'.red}`);
            }
        });

        res(msgInfo);
    });
}

module.exports = {
    install
};