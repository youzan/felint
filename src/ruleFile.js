const sh = require('shelljs');
const fileUtil = require('./utils/fileUtil.js');
const stylelintCodeGenerator = require('./utils/stylelintCodeGenerator.js').default;
const felintrc = require('./felintrc.js');
const felintConfig = require('./felintConfig.js');

const toString = Object.prototype.toString;

async function createPlan(felintDirPath, ruleConfig, planName) {
    if (ruleConfig && ruleConfig.plan && ruleConfig.plan[planName]) {
        const ruleList = ruleConfig.plan[planName];

        for (let index = ruleList.length - 1; index >= 0; index--) {
            const filename = ruleList[index];
            await createFile(felintDirPath, filename);
        }
    }
}

function mergeObject(target, another) {
    if (target && another) {
        Object.keys(target).concat(Object.keys(another)).forEach((key) => {
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

/**
 * 创建 .eslintrc 文件
 * @param {String} targetFilePath 目标文件路径
 * @param {String} sourceFilePath 源文件路径
 * @param {String} fileName 文件名
 * @param {String} ext 扩展名
 */
async function createEslintrc(targetFilePath, sourceFilePath, fileName, ext) {
    const felintrcContent = felintrc.read();
    let fileContent = '';

    if ((ext === 'json' || ext === 'yaml' || ext === 'yml') && felintrcContent[fileName]) {
        fileContent = await fileUtil.readFile(sourceFilePath, ext);
        fileContent = mergeObject(fileContent, felintrcContent[fileName]);
        fileUtil.createFileSync(targetFilePath, JSON.stringify(fileContent || {}, null, 4), ext);
    } else {
        sh.cp(sourceFilePath, targetFilePath);
    }
}

/**
 * 创建stylelintrc文件
 * @param {String} targetFilePath 目标文件路径
 * @param {String} sourceFilePath 源文件路径
 * @param {String} fileName 文件名
 * @param {String} ext 扩展名
 */
async function createStylelintrc(targetFilePath, sourceFilePath, fileName, ext) {
    const felintrcContent = felintrc.read();
    let fileContent = '';
    fileContent = await fileUtil.readFile(sourceFilePath, ext);

    if (felintrcContent[fileName]) {
        fileContent = mergeObject(fileContent, felintrcContent[fileName]);
    }

    fileUtil.createFileSync(targetFilePath, stylelintCodeGenerator(JSON.stringify(fileContent || {}, null, 4), true), ext);
}

/**
 * 文件名命名规则
 * 最终产生规则文件
 * @param {String} felintDirPath .felint路径
 * @param {String} fileName 文件名
 */
async function createFile(felintDirPath, fileName) {
    if (felintDirPath && fileName) {
        const ext = fileUtil.getFileExtension(fileName).toLowerCase();
        const fileNE = fileName.slice(0, ext.length ? (-ext.length - 1) : fileName.length);
        const targetFilePath = `${process.cwd()}/${fileNE.split('_')[0]}${ext ? `.${ext}` : ''}`;

        if (fileNE.indexOf('stylelint') > -1) {
            targetFilePath = `${process.cwd()}/${fileNE.split('_')[0]}.js`;
        }

        const override = await fileUtil.checkOverride(targetFilePath);
        const sourceFilePath = `${felintDirPath}/rules/${fileName}`;

        // 覆盖文件
        if (override) {
            if (fileNE.indexOf('stylelint') > -1) {
                await createStylelintrc(targetFilePath, sourceFilePath, fileName, ext);
            } else if (fileNE.indexOf('eslintrc') > -1) {
                await createEslintrc(targetFilePath, sourceFilePath, fileName, ext);
            } else {
                sh.cp(sourceFilePath, targetFilePath);
            }
        }
    }
}

// 读取.felint里面的
function create(name = 'default') {
    const felintDirPath = felintConfig.felintDirPath();

    if (felintDirPath && felintDirPath.path) {
        const config = felintConfig.readFelintConfig();

        createPlan(felintDirPath.path, config, name);
    }
}

/**
 * 创建ignore文件
 */
async function createIgnore() {
    const felintDirPath = felintConfig.felintDirPath();

    if (felintDirPath && felintDirPath.path) {
        // 查看.felint下有无.eslintignore文件
        const hasEslintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.eslintignore`);

        if (hasEslintIgnoreFile) {
            const override = await fileUtil.checkOverride(`${process.cwd()}/.eslintignore`);

            if (override) {
                sh.cp(`${felintDirPath.path}/.eslintignore`, `${process.cwd()}/.eslintignore`);
            }
        }

        // 查看.felint下有无.stylelintignore文件
        const hasStylelintIgnoreFile = fileUtil.has(`${felintDirPath.path}/.stylelintignore`);

        if (hasStylelintIgnoreFile) {
            const override = await fileUtil.checkOverride(`${process.cwd()}/.stylelintignore`);

            if (override) {
                sh.cp(`${felintDirPath.path}/.stylelintignore`, `${process.cwd()}/.stylelintignore`);
            }
        }
    }
}

module.exports = {
    create,
    createIgnore
};
