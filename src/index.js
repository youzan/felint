#!/usr/bin/env node
require('colors');
const program = require('commander');
const process = require('process');
const path = require('path');
const sh = require('shelljs');
const versionUtil = require('./utils/versionUtil.js');
const fetchConfig = require('./fetchConfig.js');
const dependence = require('./dependence.js');
const updateHooks = require('./updateHooks.js');
const ruleFile = require('./ruleFile.js');
const felintrc = require('./felintrc.js');

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

            console.log('开始安装本地依赖...'.green);
            let msgInfo = await dependence.install();
            console.log(msgInfo.join('\n'));

            updateHooks.update();

            sh.exec('rm ./.eslintrc ./.scss-lint.yml');
            await ruleFile.createIgnore();
            const plan = options.plan || felintrc.getPlan() || 'default';
            await felintrc.set({
                plan
            });
            ruleFile.create('plan', plan, true);
        }
    });

// 更新配置文件和钩子
program
    .command('update')
    .description('更新felint的配置文件')
    .action(async () => {
        const isUpdating = await versionUtil.checkUpdate();
        if (!isUpdating) {
            const felintrcFile = felintrc.read();
            // 拉取配置
            await fetchConfig(felintrcFile || {});

            // 更新依赖
            console.log('开始更新依赖...'.green);
            let msgInfo = await dependence.install();
            console.log(msgInfo.join('\n'));

            // 更新git hook
            updateHooks.update();
        }
    });

program
    .command('use')
    .description('在当前目录下使用指定代码规范方案或文件')
    .option('-p, --plan [planname]', '使用指定代码规范方案')
    .action(async (options) => {
        // 先拉取最新的配置文件
        const felintrcFile = felintrc.read();
        await fetchConfig(felintrcFile || {});

        ruleFile.create(options.plan);
    });

// 返回felint base path
program
    .command('where')
    .description('返回felint安装路径')
    .action(() => {
        console.log(path.dirname(__dirname));
    });

// felint挂钩子
program
    .command('hooks')
    .description('挂载钩子')
    .action(() => {
        updateHooks.update();
    });

program.parse(process.argv);

process.once('uncaughtException', function() {
    process.exitCode = 1;
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
