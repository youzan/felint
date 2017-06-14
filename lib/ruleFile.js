'use strict';

let createPlan = (() => {
    var _ref = _asyncToGenerator(function* (felintDirPath, ruleConfig, planName, isLocal) {
        if (ruleConfig && ruleConfig.plan && ruleConfig.plan[planName]) {
            let ruleList = ruleConfig.plan[planName];
            let index;
            let filename;
            for (index = ruleList.length - 1; index >= 0; index--) {
                filename = ruleList[index];
                yield createFile(felintDirPath, filename, isLocal);
            }
        }
    });

    return function createPlan(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();

/**
 * stylelint的plugin, extends, processors的路径在stylelint非本地安装时需要绝对路径
 * @return stylelintrc file
 */


let createEslintrc = (() => {
    var _ref2 = _asyncToGenerator(function* (targetFilePath, sourceFilePath, fileName, ext) {
        let felintrcContent = felintrc.read();
        let fileContent = '';
        if ((ext === 'json' || ext === 'yaml' || ext === 'yml') && felintrcContent[fileName]) {
            fileContent = yield fileUtil.readFile(sourceFilePath, ext);
            fileContent = mergeObject(fileContent, felintrcContent[fileName]);
            fileUtil.createFileSync(targetFilePath, JSON.stringify(fileContent || {}, null, 4), ext);
        } else {
            sh.cp(sourceFilePath, targetFilePath);
        }
    });

    return function createEslintrc(_x5, _x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
    };
})();

let createStylelintrc = (() => {
    var _ref3 = _asyncToGenerator(function* (targetFilePath, sourceFilePath, fileName, ext) {
        let felintrcContent = felintrc.read();
        let isLocal = !!felintrc.read().local;
        let fileContent = '';
        fileContent = yield fileUtil.readFile(sourceFilePath, ext);
        if (felintrcContent[fileName]) {
            fileContent = mergeObject(fileContent, felintrcContent[fileName]);
        }

        if (!isLocal) {
            fileContent = fixStylelintPath(fileContent);
        }
        fileUtil.createFileSync(targetFilePath, stylelintCodeGenerator(JSON.stringify(fileContent || {}, null, 4), isLocal), ext);
    });

    return function createStylelintrc(_x9, _x10, _x11, _x12) {
        return _ref3.apply(this, arguments);
    };
})();

/**
 * 文件名命名规则
 * 最终产生规则文件
 */


let createFile = (() => {
    var _ref4 = _asyncToGenerator(function* (felintDirPath, fileName) {
        if (fileName) {
            let ext = fileUtil.getFileExtension(fileName).toLowerCase();
            let fileNE = fileName.slice(0, ext.length ? -ext.length - 1 : fileName.length);
            let targetFilePath = `${process.cwd()}/${fileNE.split('_')[0]}${ext ? `.${ext}` : ''}`;
            if (fileNE.indexOf('stylelint') > -1) {
                targetFilePath = `${process.cwd()}/${fileNE.split('_')[0]}.js`;
            }
            let override = yield fileUtil.checkOverride(targetFilePath);
            let sourceFilePath = `${felintDirPath}/rules/${fileName}`;
            if (override) {
                // override
                if (fileNE.indexOf('stylelint') > -1) {
                    yield createStylelintrc(targetFilePath, sourceFilePath, fileName, ext);
                } else if (fileNE.indexOf('eslintrc') > -1) {
                    yield createEslintrc(targetFilePath, sourceFilePath, fileName, ext);
                } else {
                    sh.cp(sourceFilePath, targetFilePath);
                }
            }
        }
    });

    return function createFile(_x13, _x14) {
        return _ref4.apply(this, arguments);
    };
})();

// 读取.felint里面的


let createIgnore = (() => {
    var _ref5 = _asyncToGenerator(function* () {
        let felintDirPath = felintConfig.fPath();
        if (felintDirPath && felintDirPath.path) {
            // 查看.felint下有无.eslintignore文件
            let hasEslintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.eslintignore`);
            if (hasEslintIgnoreFile) {
                let override = yield fileUtil.checkOverride(`${process.cwd()}/.eslintignore`);
                if (override) {
                    sh.cp(`${felintDirPath.path}/.eslintignore`, `${process.cwd()}/.eslintignore`);
                }
            }
            // 查看.felint下有无.stylelintignore文件
            let hasStylelintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.stylelintignore`);
            if (hasStylelintIgnoreFile) {
                let override = yield fileUtil.checkOverride(`${process.cwd()}/.stylelintignore`);
                if (override) {
                    sh.cp(`${felintDirPath.path}/.stylelintignore`, `${process.cwd()}/.stylelintignore`);
                }
            }
        }
    });

    return function createIgnore() {
        return _ref5.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let sh = require('shelljs');

let fileUtil = require('./utils/fileUtil.js');

let stylelintCodeGenerator = require('./utils/stylelintCodeGenerator.js').default;

let felintrc = require('./felintrc.js');

let felintConfig = require('./felintConfig.js');

const toString = Object.prototype.toString;

function fixStylelintPath(stylelintrc) {
    [stylelintrc.extends, stylelintrc.plugins, stylelintrc.processors] = [stylelintrc.extends, stylelintrc.plugins, stylelintrc.processors].map(value => {
        value = value || [];
        value = typeof value === 'string' ? [value] : value;
        return value.map(name => {
            let nameStr = typeof name === 'string' ? name : name[0];
            nameStr = nameStr.indexOf('/') === -1 ? `<%path%>${nameStr}` : nameStr;
            if (typeof name !== 'string') {
                name[0] = nameStr;
                return name;
            }
            return nameStr;
        });
    });
    return stylelintrc;
}

function mergeObject(target, another) {
    if (target && another) {
        Object.keys(target).concat(Object.keys(another)).forEach(key => {
            if (target[key] === undefined) {
                target[key] = another[key];
            } else {
                if (toString.call(target[key]) === '[object Object]') {
                    Object.assign(target[key], another[key] || {});
                } else {
                    target[key] = another[key] === undefined ? target[key] : another[key];
                }
            }
        });
    }
    return target;
}

function create(type, name, isLocal) {
    let felintDirPath = felintConfig.fPath();
    if (felintDirPath && felintDirPath.path) {
        let config = felintConfig.read();
        if (type === 'plan') {
            createPlan(felintDirPath.path, config, name, isLocal);
        } else {
            createFile(felintDirPath.path, name, isLocal);
        }
    }
}

module.exports = {
    create,
    createIgnore
};