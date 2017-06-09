let fileUtil = require('./utils/fileUtil.js');

function read() {
    let felintDirPath = fPath();
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

function fPath() {
    return fileUtil.findUp(process.cwd(), '.felint', 'isDirectory');
}

module.exports = {
    read,
    fPath
};
