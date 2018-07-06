let sh = require('shelljs');

let felintConfig = require('./felintConfig.js');

let checkPackage = require('./utils/checkPackage.js');

let fileUtil = require('./utils/fileUtil.js');

function installPackage(packageName, version) {
    let result = checkPackage(packageName, version);
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

function addDevDependence(dependence) {
    let packageInfo;
    try {
        packageInfo = require(`${process.cwd()}/package.json`);
    } catch (e) {
        return;
    }
    if (packageInfo) {
        packageInfo.devDependencies = packageInfo.devDependencies || {};
        Object.keys(dependence).forEach((k) => {
            if (!packageInfo.devDependencies[k]) {
                packageInfo.devDependencies[k] = dependence[k];
            }
        });
        fileUtil.createFileSync(`${process.cwd()}/package.json`, packageInfo);
    }
}

// 安装单个依赖
function install(type, typeInfo) {
    return new Promise((res) => {
        typeInfo = typeInfo || {};
        if (type === 'npm') {
            let npmDepList = Object.keys(typeInfo);
            let msgInfo = [];
            npmDepList.forEach((packageName) => {
                let result = installPackage(packageName, typeInfo[packageName]);
                if (result && result.current) {
                    msgInfo.push(`你已安装${`${packageName}@${result.current}`.red}，默认版本为${typeInfo[packageName].green}，${'请确认!'.red}`);
                }
            });
            // installPackage 会自动在package.json里面加入devDependence的依赖
            // addDevDependence(typeInfo);
            res(msgInfo);
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
async function installDependence() {
    let configInfo = felintConfig.read();
    let dependenceConfig = configInfo.dependence;
    let dependenceList = dependenceConfig && Object.keys(dependenceConfig) || [];
    if (dependenceList.length) {
        let i;
        for (i = dependenceList.length - 1; i >= 0; i--) {
            let msgInfo = await install(dependenceList[i], dependenceConfig[dependenceList[i]]);
            return msgInfo;
        }
    }
}

module.exports = {
    install: installDependence
};