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
            sh.exec(`npm install -d ${packageName}@${version} --save-dev`);
        } catch (e) {
            console.log(`${packageName}@${version}安装失败，请检查`.red);
        }
    } else {
        return result;
    }
}

// 安装单个依赖
function install(type, typeInfo = {}) {
    return new Promise(res => {
        if (type === 'npm') {
            const npmDepList = Object.keys(typeInfo);
            const msgInfo = [];

            npmDepList.forEach(packageName => {
                let result = installPackage(packageName, typeInfo[packageName]);
                if (result && result.current) {
                    msgInfo.push(`你已安装${`${packageName}@${result.current}`.red}，默认版本为${typeInfo[packageName].green}，${'请确认!'.red}`);
                }
            });

            res(msgInfo);
        } else if (typeInfo.install) {
            const child = sh.exec(typeInfo.install, {
                async: true,
                stdio: 'inherit'
            });
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
async function installDependence() {
    const configInfo = felintConfig.readFelintConfig();
    const dependenceConfig = configInfo.dependence;
    const dependenceList = dependenceConfig && Object.keys(dependenceConfig) || [];

    if (dependenceList.length) {
        for (let i = dependenceList.length - 1; i >= 0; i--) {
            let msgInfo = await install(dependenceList[i], dependenceConfig[dependenceList[i]]);
            return msgInfo;
        }
    }
}

module.exports = {
    install: installDependence
};
