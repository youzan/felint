const sh = require('shelljs');
const felintConfig = require('./felintConfig.js');
const checkPackage = require('./utils/checkPackage.js');

/**
 * 安装npm包
 * @param {String} packageName 包名
 * @param {String} version 版本号
 */
function installPackage(packageName, version, configInfo) {
    const { registryUrl, disturl, useYarn } = configInfo;
    const result = checkPackage(packageName, version);
    let installCommand = useYarn ? `yarn add ${packageName}@${version} --dev` : `npm i -D ${packageName}@${version}`;

    if (registryUrl) {
        installCommand += ` --registry=${registryUrl}`;
    }

    if (disturl) {
        installCommand += ` --disturl=${disturl}`;
    }

    if (!result) {
        try {
            console.log(`开始安装${packageName}@${version}`.green);
            sh.exec(installCommand);
        } catch (e) {
            console.log(`${packageName}@${version}安装失败，请检查`.red);
        }
    } else {
        return result;
    }
}

// 安装单个依赖
function installSinglePackage(typeInfo = {}, configInfo) {
    return new Promise(res => {
        const npmDepList = Object.keys(typeInfo);
        const msgInfo = [];

        npmDepList.forEach(packageName => {
            let result = installPackage(packageName, typeInfo[packageName], configInfo);
            if (result && result.current) {
                msgInfo.push(`你已安装${`${packageName}@${result.current}`.red}，默认版本为${typeInfo[packageName].green}，${'请确认!'.red}`);
            }
        });

        res(msgInfo);
    });
}

/**
 * 安装配置指定的依赖
 */
async function install(plan) {
    const dependenceList = ['npm'];
    if (typeof plan === 'string') {
        dependenceList.push(plan);
    } else if (typeof plan === 'object') {
        Object.keys(plan).forEach(item => {
            const planName = plan[item];
            if (dependenceList.indexOf(planName) === -1) {
                dependenceList.push(planName);
            }
        });
    }

    const configInfo = felintConfig.readFelintConfig();
    const dependenceConfig = configInfo.dependence;
    let dependencePackages = {};
    dependenceList.forEach(item => {
        dependencePackages = Object.assign({}, dependencePackages, dependenceConfig[item] || {});
    });

    let msgInfo = await installSinglePackage(dependencePackages, configInfo);
    return msgInfo || '';
}

module.exports = {
    install
};
