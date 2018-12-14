const path = require('path');
const sh = require('shelljs');
const fileUtil = require('./utils/fileUtil.js');
const felintConfig = require('./felintConfig.js');

/**
 * 生成对应的规则
 * @param {String} planName plan名
 * @param {String} targetFolder 生成的plan目录
 */
async function createPlan(planName = 'default', targetFolder) {
    if (typeof planName === 'object') {
        Object.keys(planName).forEach(planPath => {
            createPlan(planName[planPath], planPath);
        });
    }

    const ruleConfig = felintConfig.readFelintConfig();

    if (ruleConfig && ruleConfig.plan && ruleConfig.plan[planName]) {
        const ruleList = ruleConfig.plan[planName];

        for (let index = ruleList.length - 1; index >= 0; index--) {
            const filename = ruleList[index];
            await createFile(filename, targetFolder);
        }
    }
}

/**
 * 文件名命名规则
 * 最终产生规则文件
 * @param {String} felintDirPath .felint路径
 * @param {String} fileName 文件名
 */
async function createFile(fileName, targetFolder) {
    const felintDirPath = felintConfig.felintDirPath();

    if (felintDirPath && fileName) {
        const ext = fileUtil.getFileExtension(fileName).toLowerCase();
        const fileNE = fileName.slice(0, ext.length ? (-ext.length - 1) : fileName.length);

        // 需要生成的目录
        const targetFilePath = targetFolder ? path.resolve(process.cwd(), targetFolder) : process.cwd();
        // 生成的文件路径
        let targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}${ext ? `.${ext}` : ''}`;

        if (fileNE.indexOf('stylelint') > -1) {
            targetFileName = `${targetFilePath}/${fileNE.split('_')[0]}.js`;
        }

        const override = await fileUtil.checkOverride(targetFileName);
        const sourceFilePath = `${felintDirPath.path}/rules/${fileName}`;

        // 覆盖文件
        if (override) {
            sh.cp(sourceFilePath, targetFileName);
            console.log(`你在目录${targetFilePath}已创建${fileName}规则`.green);
        }
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
