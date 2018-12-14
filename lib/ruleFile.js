'use strict';

/**
 * 生成对应的规则
 * @param {String} planName plan名
 * @param {String} targetFolder 生成的plan目录
 */
let createPlan = (() => {
    var _ref = _asyncToGenerator(function* (planName = 'default', targetFolder) {
        if (typeof planName === 'object') {
            Object.keys(planName).forEach(function (planPath) {
                createPlan(planName[planPath], planPath);
            });
        }

        const ruleConfig = felintConfig.readFelintConfig();

        if (ruleConfig && ruleConfig.plan && ruleConfig.plan[planName]) {
            const ruleList = ruleConfig.plan[planName];

            for (let index = ruleList.length - 1; index >= 0; index--) {
                const filename = ruleList[index];
                yield createFile(filename, targetFolder);
            }
        }
    });

    return function createPlan() {
        return _ref.apply(this, arguments);
    };
})();

/**
 * 文件名命名规则
 * 最终产生规则文件
 * @param {String} felintDirPath .felint路径
 * @param {String} fileName 文件名
 */


let createFile = (() => {
    var _ref2 = _asyncToGenerator(function* (fileName, targetFolder) {
        const felintDirPath = felintConfig.felintDirPath();

        if (felintDirPath && fileName) {
            const ext = fileUtil.getFileExtension(fileName).toLowerCase();
            const fileNE = fileName.slice(0, ext.length ? -ext.length - 1 : fileName.length);

            // 需要生成的目录
            const targetFilePath = path.resolve(process.cwd(), targetFolder) || process.cwd();
            // 生成的文件路径
            let targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}${ext ? `.${ext}` : ''}`;

            if (fileNE.indexOf('stylelint') > -1) {
                targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}.js`;
            }

            const override = yield fileUtil.checkOverride(targetFileName);
            const sourceFilePath = `${felintDirPath.path}/rules/${fileName}`;

            // 覆盖文件
            if (override) {
                sh.cp(sourceFilePath, targetFileName);
                console.log(`你已创建${fileName}规则`.green);
            }
        }
    });

    return function createFile(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
})();

/**
 * 创建ignore文件
 */


let createIgnore = (() => {
    var _ref3 = _asyncToGenerator(function* () {
        const felintDirPath = felintConfig.felintDirPath();

        if (felintDirPath && felintDirPath.path) {
            // 查看.felint下有无.eslintignore文件
            const hasEslintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.eslintignore`);

            if (hasEslintIgnoreFile) {
                const override = yield fileUtil.checkOverride(`${process.cwd()}/.eslintignore`);

                if (override) {
                    sh.cp(`${felintDirPath.path}/.eslintignore`, `${process.cwd()}/.eslintignore`);
                }
            }

            // 查看.felint下有无.stylelintignore文件
            const hasStylelintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.stylelintignore`);

            if (hasStylelintIgnoreFile) {
                const override = yield fileUtil.checkOverride(`${process.cwd()}/.stylelintignore`);

                if (override) {
                    sh.cp(`${felintDirPath.path}/.stylelintignore`, `${process.cwd()}/.stylelintignore`);
                }
            }
        }
    });

    return function createIgnore() {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const sh = require('shelljs');
const fileUtil = require('./utils/fileUtil.js');
const felintConfig = require('./felintConfig.js');

module.exports = {
    createPlan,
    createIgnore
};