'use strict';

const sh = require('shelljs');
const versionUtil = require('./utils/versionUtil.js');
const DEFAUTL_CONFIG_URL = 'https://github.com/youzan/felint-config.git';

// 拉取配置
function fetchConfig(felintrc) {
    const configRepositoryUrl = felintrc.configRep || felintrc.gitHookUrl || DEFAUTL_CONFIG_URL;
    console.log(`felint将拉取位于${configRepositoryUrl}的配置\n`.green);
    const shellStr = `rm -rf ./.felint && git clone -b ${versionUtil.isBetaNow ? 'dev' : 'master'} ${configRepositoryUrl} .felint && cd .felint && rm -rf ./.git`;
    sh.exec(shellStr, { silent: true });
}

module.exports = fetchConfig;