const fileUtil = require('./utils/fileUtil.js');

/**
 * 读取felint配置文件内容
 */
function readFelintConfig() {
    const felintDirPath = felintDirPath();
    let felintConfig = {};

    if (felintDirPath && felintDirPath.path) {
        try {
            felintConfig = require(`${felintDirPath.path}/config.js`);
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
