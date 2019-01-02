const path = require('path');
const sh = require('shelljs');
const fileUtil = require('./utils/fileUtil.js');
const felintConfig = require('./felintConfig.js');

/**
 * 合并两个对象
 * @param {Object} target 
 * @param {Object} another 
 */
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
 * 生成对应的规则
 * @param {String} planName plan名
 */
async function createPlan(planName = 'default', force) {
    const ruleConfig = felintConfig.readFelintConfig();
    const planConfig = {};

    if (typeof planName === 'object') {
        Object.keys(planName).forEach(planPath => {
            if (!planPath) return;

            planConfig[planPath] = ruleConfig.plan[planName[planPath]];
        });
    } else {
        planConfig[process.cwd()] = ruleConfig.plan[planName];
    }

    const planKeys = Object.keys(planConfig);
    if (planKeys.length !== 0) {
        for (let i = 0; i < planKeys.length; i++) {
            const planPath = planKeys[i];
            const ruleList = planConfig[planPath];

            for (let j = ruleList.length - 1; j >= 0; j--) {
                const filename = ruleList[j];
                await createFile(filename, planPath, force);
            }
        }
    }
}

/**
 * 文件名命名规则
 * 最终产生规则文件
 * @param {String} felintDirPath .felint路径
 * @param {String} fileName 文件名
 * @param {Boolean} force 是否强制更新文件
 */
async function createFile(fileName, targetFolder, force) {
    const felintDirPath = felintConfig.felintDirPath();

    if (felintDirPath && fileName) {
        const ext = fileUtil.getFileExtension(fileName).toLowerCase();
        const fileNE = fileName.slice(0, ext.length ? (-ext.length - 1) : fileName.length);

        // 需要生成的目录
        const targetFilePath = targetFolder ? path.resolve(process.cwd(), targetFolder) : process.cwd();

        // 判断目标目录路径是否存在
        if (!fileUtil.has(targetFilePath)) return;

        // 生成的文件路径
        let targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}${ext ? `.${ext}` : ''}`;

        if (fileNE.indexOf('stylelint') > -1) {
            targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}.json`;
        }

        const override = force || await fileUtil.checkOverride(targetFileName);
        const sourceFilePath = `${felintDirPath.path}/rules/${fileName}`;

        // 覆盖文件
        if (override) {
            if (ext === 'json') {
                await createJsonFile(targetFileName, sourceFilePath, ext);
            } else {
                sh.cp(sourceFilePath, targetFilePath);
            }
            console.log(`你在目录${targetFilePath}已创建${fileName}规则`.green);
        }
    }
}

async function createJsonFile(targetFileName, sourceFilePath, ext) {
    const targetFileContent = fileUtil.readFile(targetFileName, ext);
    let fileContent = '';

    if (ext === 'json') {
        fileContent = await fileUtil.readFile(sourceFilePath, ext);
        console.log(fileContent, targetFileContent)
        fileContent = mergeObject(fileContent, targetFileContent);
        
        fileUtil.createFileSync(targetFileName, JSON.stringify(fileContent || {}, null, 2), ext);
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
    createPlan,
    createIgnore
};
