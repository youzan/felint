'use strict';

const fileUtil = require('./utils/fileUtil.js');

/**
 * 读取felint配置文件内容
 */
function readFelintConfig() {
    const felintDir = felintDirPath();
    let felintConfig = {};

    if (felintDir && felintDir.path) {
        try {
            felintConfig = require(`${felintDir.path}/config.js`);
        } catch (e) {
            console.log('无法找到.felint/config.js，你需要先初始化');
        }
    }

    return felintConfig;
}

/**
 * 获取`.felint`路径
 */
function felintDirPath() {
    return fileUtil.findUp(process.cwd(), '.felint', 'isDirectory');
}

module.exports = {
    readFelintConfig,
    felintDirPath
};