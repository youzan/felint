#!/usr/bin/env node
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

program
    .version(versionUtil.VERSION)
    .command('init')
    .option('-p, --plan [value]', '使用指定代码规范方案')
    .description('使用felint初始化项目。更多信息请参考：https://github.com/youzan/felint/blob/master/README.md')
    .action(async (options) => {
        const isUpdating = await versionUtil.checkUpdate();
        if (!isUpdating) {
            const felintrcFile = felintrc.read();
            await fetchConfig(felintrcFile || {});

            const plan = options.plan || felintrc.getPlan() || 'default';
            console.log('开始安装本地依赖...'.green);
            let msgInfo = await dependence.install(plan);
            console.log(msgInfo.join('\n'));

            sh.exec('rm ./.eslintrc ./.sass-lint.yml');
            await ruleFile.createIgnore();
            await felintrc.set({
                plan
            });
            ruleFile.createPlan(plan);
        }
    });

// 更新依赖
program
    .command('dep')
    .description('安装 eslint/stylelint 及其依赖，并写入package.json')
    .action(async () => {
        const isUpdating = await versionUtil.checkUpdate();
        if (!isUpdating) {
            const felintrcFile = felintrc.read();
            // 拉取配置
            await fetchConfig(felintrcFile || {});

            // 更新依赖
            const plan = felintrc.getPlan() || 'default';
            console.log('开始更新依赖...'.green);
            let msgInfo = await dependence.install(plan);
            console.log(msgInfo.join('\n'));
        }
    });

// 更新规则文件
program
    .command('rules')
    .description('更新规则文件')
    .action(async () => {
        const felintrcFile = felintrc.read();
        // 拉取最新配置
        await fetchConfig(felintrcFile || {});

        // 根据plan更新校验规则
        const plan = felintrc.getPlan() || 'default';
        ruleFile.createPlan(plan);
    });

// 返回felint base path
program
    .command('where')
    .description('返回felint安装路径')
    .action(() => {
        console.log(path.dirname(__dirname));
    });

// 输出felint-config仓库地址
program
    .command('config-url')
    .description('输出felint-config仓库地址')
    .action(() => {
        const felintrcFile = felintrc.read();
        console.log(felintrcFile.configRep || felintrcFile.gitHookUrl || DEFAUTL_CONFIG_URL);
    });

program.parse(process.argv);

process.once('uncaughtException', function() {
    process.exitCode = 1;
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
