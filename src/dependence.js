let sh = require('shelljs');

let process = require('process');
let path = require('path');

let felintConfig = require('./felintConfig.js');

// 安装单个依赖
function install(type, typeInfo, global) {
    return new Promise((res) => {
        typeInfo = typeInfo || {};
        if (type === 'npm') {
            let npmDepList = Object.keys(typeInfo);
            let npmShellStr = `npm install -d --prefix ${global ? path.dirname(__dirname) : process.cwd()} `;
            npmDepList.reduce((preval, key) => {
                npmShellStr += `${key}@${typeInfo[key]} `;
            }, npmShellStr);
            npmShellStr += '--save-dev';
            let child = sh.exec(npmShellStr, {async: true, stdio: 'inherit'});
            child.on('exit', (code) => {
                if (code !== 0) {
                    console.log('有依赖安装失败，请检查!'.red);
                }
                res();
            });
        } else if (typeInfo.install) {
            let child = sh.exec(typeInfo.install, {async: true, stdio: 'inherit'});
            child.on('exit', (code) => {
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

// 安装配置指定的依赖
async function installDependence(global) {
    let configInfo = felintConfig.read();
    let dependenceConfig = configInfo.dependence;
    let dependenceList = dependenceConfig && Object.keys(dependenceConfig) || [];
    if (dependenceList.length) {
        let i;
        for (i = dependenceList.length - 1; i >= 0; i--) {
            await install(dependenceList[i], dependenceConfig[dependenceList[i]], global);
        }
    }
}

module.exports = {
    install: installDependence
};