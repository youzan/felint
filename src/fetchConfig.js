let sh = require('shelljs');

let versionUtil = require('./utils/versionUtil.js');

let DEFAUTL_CONFIG_URL = 'https://github.com/youzan/felint-config.git';

// 拉取配置
function fetchConfig(felintrc) {
    let configRepositoryUrl = felintrc.configRep || DEFAUTL_CONFIG_URL;
    console.log(`felint将拉取位于${configRepositoryUrl}的配置\n`.green);
    let shellStr = `rm -rf ./.felint && git clone -b ${versionUtil.isBetaNow ? 'dev' : 'master'} ${configRepositoryUrl} .felint && cd .felint && rm -rf ./.git`;
    sh.exec(shellStr, {silent: true});
}


module.exports = fetchConfig;
