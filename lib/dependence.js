'use strict';

// 安装配置指定的依赖
let installDependence = (() => {
    var _ref = _asyncToGenerator(function* (global) {
        let configInfo = felintConfig.read();
        let dependenceConfig = configInfo.dependence;
        let dependenceList = dependenceConfig && Object.keys(dependenceConfig) || [];
        if (dependenceList.length) {
            let i;
            for (i = dependenceList.length - 1; i >= 0; i--) {
                yield install(dependenceList[i], dependenceConfig[dependenceList[i]], global);
            }
        }
    });

    return function installDependence(_x) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let sh = require('shelljs');

let process = require('process');
let path = require('path');

let felintConfig = require('./felintConfig.js');

// 安装单个依赖
function install(type, typeInfo, global) {
    return new Promise(res => {
        typeInfo = typeInfo || {};
        if (type === 'npm') {
            let npmDepList = Object.keys(typeInfo);
            let npmShellStr = `npm install -d --prefix ${global ? path.dirname(__dirname) : process.cwd()} `;
            npmDepList.reduce((preval, key) => {
                npmShellStr += `${key}@${typeInfo[key]} `;
            }, npmShellStr);
            npmShellStr += '--save-dev';
            let child = sh.exec(npmShellStr, { async: true, stdio: 'inherit' });
            child.on('exit', code => {
                if (code !== 0) {
                    console.log('有依赖安装失败，请检查!'.red);
                }
                res();
            });
        } else if (typeInfo.install) {
            let child = sh.exec(typeInfo.install, { async: true, stdio: 'inherit' });
            child.on('exit', code => {
                if (code !== 0) {
                    console.log('有依赖安装失败，请检查!'.red);
                }
                res();
            });
        } else {
            res();
        }
    });
}

module.exports = {
    install: installDependence
};