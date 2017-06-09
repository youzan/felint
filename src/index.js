#!/usr/bin/env node
require('colors');
let program = require('commander');
let process = require('process');
let path = require('path');
let sh = require('shelljs');
let versionUtil = require('./utils/versionUtil.js');
let fetchConfig = require('./fetchConfig.js');
let dependence = require('./dependence.js');
let updateHooks = require('./updateHooks.js');
let ruleFile = require('./ruleFile.js');
let felintrc = require('./felintrc.js');

let YOUZAN_CONFIG_URL = 'http://gitlab.qima-inc.com/fe/felint-config.git';
program
    .version(versionUtil.VERSION)
    .command('init')
    .option('-p, --plan [value]', '使用指定代码规范方案')
    .description('使用felint初始化项目。更多信息请参考：https://github.com/youzan/felint/blob/master/README.md')
    .action(async (options) => {
        let isUpdating = await versionUtil.checkUpdate();
        if (isUpdating) {
            return;
        }
        let isLocal = felintrc.isLocal();
        if (!isLocal) {
            let felintrcFile = felintrc.read();
            await fetchConfig(felintrcFile || {});
            console.log('开始安装依赖...'.green);
            // init依赖必须安装在全局
            await dependence.install(true);
            updateHooks.update();
            await ruleFile.createIgnore();
            let plan = options.plan || felintrc.getPlan() || 'default';
            await felintrc.set({
                plan
            });
            ruleFile.create('plan', plan, isLocal);
        } else {
            console.log('该项目为felint local项目，无法使用felint进行初始化'.red);
        }
    });

// 更新配置文件和钩子
program
    .command('update')
    .description('更新felint的配置文件')
    .action(async () => {
        let isUpdating = await versionUtil.checkUpdate();
        if (isUpdating) {
            return;
        }
        let felintrcFile = felintrc.read();
        let isLocal = felintrc.isLocal();
        if (!isLocal) {
            await fetchConfig(felintrcFile || {});
            console.log('开始更新依赖...'.green);
            await dependence.install(!isLocal);
            updateHooks.update();
        } else {
            console.log('该项目为felint local项目，无法使用felint进行更新'.red);
        }
    });

program
    .command('use')
    .description('在当前目录下使用指定代码规范方案或文件')
    .option('-p, --plan [planname]', '使用指定代码规范方案')
    .option('-f, --file [filename]', '使用指定规则文件')
    .action((options) => {
        let isLocal = felintrc.isLocal();
        if (options.plan) {
            ruleFile.create('plan', options.plan, isLocal);
        }
        if (options.file) {
            ruleFile.create('file', options.file, isLocal);
        }
    });

// 该命令用于产生youzan自己的felintrc文件
program
    .command('youzan')
    .description('创建有赞私有felintrc文件')
    .action(() => {
        felintrc.create({
            'configRep': YOUZAN_CONFIG_URL
        });
    });

// 该命令用于export出相应规则文件和依赖

program
    .command('export')
    .option('-p, --plan [value]', '使用指定代码规范方案')
    .description('创建本地对应依赖')
    .action(async (options) => {
        let felintrcFile = felintrc.read();
        await fetchConfig(felintrcFile || {});
        console.log('开始安装本地依赖...'.green);
        await dependence.install();
        updateHooks.update();
        let plan = options.plan || felintrc.getPlan() || 'default';
        await felintrc.set({
            plan
        });
        ruleFile.create('plan', plan, 'local');
        // 标记为local
        felintrc.local();
    });

// 调用eslint校验js
program
    .command('lintjs [eslintParams...]')
    .description('使用felint检测js代码')
    .option('--exitcode', '使用exitcode')
    .allowUnknownOption()
    .action(function(eslintParams, options) {
        let eslintPath = 'eslint/lib/cli.js';
        if (felintrc.isLocal()) {
            console.log('该项目为felint export项目，将使用项目本地的eslint进行检测\n'.green);
            console.log(`${process.cwd()}/node_modules/eslint`);
            eslintPath = `${process.cwd()}/node_modules/eslint/lib/cli.js`;
        }
        let eslintCli;
        try {
            eslintCli = require(eslintPath);
        } catch (e) {
            console.log('你尚未安装eslint');
            process.exitCode = 0;
            return;
        }
        let params = process.argv.slice(0);
        params.splice(2, 1);
        if (options.exitcode) {
            // 处理params
            params.splice(params.indexOf('--exitcode'), 1);
        }
        var exitCode = eslintCli.execute(params);
        if (options.exitcode) {
            process.exitCode = exitCode;
        }
    });

// 调用eslint校验js
program
    .command('lintcss [stylelintParams...]')
    .description('使用stylelint检测css代码')
    .option('--exitcode', '使用exitcode')
    .allowUnknownOption()
    .action((stylelintParams, options) => {
        let stylelintPath = `${path.dirname(__dirname)}/node_modules/stylelint/bin/stylelint.js`;
        if (felintrc.isLocal()) {
            console.log('该项目为felint export项目，将使用项目本地的stylelint进行检测\n'.green);
            console.log(`${process.cwd()}/node_modules/stylelint`);
            stylelintPath = `${process.cwd()}/node_modules/stylelint/bin/stylelint.js`;
        }
        let params = process.argv.slice(0);
        params.splice(0, 3);
        if (options.exitcode) {
            // 处理params
            params.splice(params.indexOf('--exitcode'), 1);
        }
        let child = sh.exec(`${stylelintPath} ${params.join(' ')}`, {async: true});
        child.on('exit', (code) => {
            if (options.exitcode) {
                process.exitCode = code;
            }
        });
    });

// 判断该项目是否是local项目
program
    .command('islocal')
    .description('查看该项目是否是local项目')
    .action(() => {
        console.log(felintrc.isLocal());
    });

// 返回felint base path
program
    .command('where')
    .description('返回felint安装路径')
    .action(() => {
        console.log(path.dirname(__dirname));
    });

program.parse(process.argv);

process.once('uncaughtException', function() {
    process.exitCode = 1;
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}