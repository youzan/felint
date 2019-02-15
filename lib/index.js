#!/usr/bin/env node
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('colors');
const program = require('commander');
const process = require('process');
const path = require('path');
const sh = require('shelljs');
const versionUtil = require('./utils/versionUtil.js');
const fetchConfig = require('./fetchConfig.js');
const dependence = require('./dependence.js');
const ruleFile = require('./ruleFile.js');
const felintrc = require('./felintrc.js');
const DEFAUTL_CONFIG_URL = 'https://github.com/youzan/felint-config.git';

program.version(versionUtil.VERSION).command('init').option('-p, --plan [value]', '使用指定代码规范方案').option('-f, --force', '强制更新规则文件').description('使用felint初始化项目。更多信息请参考：https://github.com/youzan/felint/blob/master/README.md').action((() => {
    var _ref = _asyncToGenerator(function* (options) {
        const isUpdating = yield versionUtil.checkUpdate();
        if (!isUpdating) {
            const felintrcFile = felintrc.read();
            yield fetchConfig(felintrcFile || {});

            const plan = options.plan || felintrc.getPlan() || 'default';
            console.log('开始安装本地依赖...'.green);
            let msgInfo = yield dependence.install(plan);
            console.log(msgInfo.join('\n'));

            sh.exec('rm ./.eslintrc ./.sass-lint.yml');
            yield ruleFile.createIgnore();
            yield felintrc.set({
                plan
            });
            yield ruleFile.createPlan(plan, options.force);

            sh.exec('rm -rf ./.felint', { silent: true });
        }
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})());

// 更新依赖
program.command('dep').description('安装 eslint/stylelint 及其依赖，并写入package.json').action(_asyncToGenerator(function* () {
    const isUpdating = yield versionUtil.checkUpdate();
    if (!isUpdating) {
        const felintrcFile = felintrc.read();
        // 拉取配置
        yield fetchConfig(felintrcFile || {});

        // 更新依赖
        const plan = felintrc.getPlan() || 'default';
        console.log('开始更新依赖...'.green);
        let msgInfo = yield dependence.install(plan);
        console.log(msgInfo.join('\n'));

        sh.exec('rm -rf ./.felint', { silent: true });
    }
}));

// 更新规则文件
program.command('rules').option('-f, --force', '强制更新规则文件').description('更新规则文件').action((() => {
    var _ref3 = _asyncToGenerator(function* (options) {
        const felintrcFile = felintrc.read();
        // 拉取最新配置
        yield fetchConfig(felintrcFile || {});

        // 根据plan更新校验规则
        const plan = felintrc.getPlan() || 'default';
        yield ruleFile.createPlan(plan, options.force);

        sh.exec('rm -rf ./.felint', { silent: true });
    });

    return function (_x2) {
        return _ref3.apply(this, arguments);
    };
})());

// 返回felint base path
program.command('where').description('返回felint安装路径').action(() => {
    console.log(path.dirname(__dirname));
});

// 输出felint-config仓库地址
program.command('config-url').description('输出felint-config仓库地址').action(() => {
    const felintrcFile = felintrc.read();
    console.log(felintrcFile.configRep || felintrcFile.gitHookUrl || DEFAUTL_CONFIG_URL);
});

program.parse(process.argv);

process.once('uncaughtException', function () {
    process.exitCode = 1;
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}