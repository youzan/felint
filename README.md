<p>
<a href="https://github.com/youzan" target="_blank"><img width="36px" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan"></a>
</p>
<p align="center">
    <a href="http://youzan.github.io/felint/" target="_blank">
        <img width="226px" src="https://img.yzcdn.cn/public_files/2017/02/09/232aae6e44455f5d068b9f74b9394f64.png">
    </a>
</p>
<p align="center">A smart way to eslint and stylelint for front end</p>


[![npm version](https://img.shields.io/npm/v/felint.svg?style=flat)](https://www.npmjs.com/package/felint) [![downloads](https://img.shields.io/npm/dt/felint.svg)](https://www.npmjs.com/package/felint) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[![NPM](https://nodei.co/npm/felint.png?downloads=true&downloadRank=true)](https://nodei.co/npm/felint/)

## 一、什么是Felint
felint是一个集成了eslint、Git Hooks、stylelint的前端代码检查工具。
由于使用了pre-commit钩子，felint将强制让你仅提交符合规范的代码。

## 二、名词解析

#### .felintrc

**.felintrc**用于配置`felint-config`的git仓库地址、对默认规则进行一定程度的自定义覆盖、记录该项目所使用的代码规则方案等。详细信息[请看这里](#felintrc)。

#### felint-config
`felint-config`为felint的统一配置信息。在felint中它以一个远程地址的形势存在，你可以在[.felintrc](#felintrc)中修改其默认地址。详细信息[请看这里](#felintconfig)。


## 三、安装 felint

#### 1. 安装准备
1. MacOS（有赞清一色Mac，欢迎大家拿简历砸过来<joinus@youzan.com>）
2. 由于felint本身为npm包，所以安装前请确保你的电脑已安装node和npm 

#### 2. 安装
```
npm install -g felint
```

## 四、快速开始

#### 使用felint初始化项目

进入到你项目的根目录，运行

```
felint init
```

felint初始化完成后你的项目中将会产生如下目录和文件：

```
|_.felint          // felint config文件夹
|_.eslintrc.json   // eslint 规则文件，用于检测js代码
|_.eslintignore    // eslint ignore配置文件
|_.stylelintrc.js  // stylelint 规则文件，用于检测css代码
|_.stylelintignore // stylelint ignore配置文件
```

#### _对于独立开发人员_

推荐将这些新增文件加入对应项目的git仓库以备份。

#### _团队开发_

推荐将这些新增文件加入对应项目的git仓库，方便团队内部其他成员同步。

当团队内部统一使用felint来对前端项目进行代码检测时，请确保每个成员都在该项目目录下执行过一遍`felint init`命令。

当对一个已执行过`felint init`命令的项目进行[修改默认规则](#changeDefaultRule)操作并提交后，团队内部其他成员在拉取最新代码后不需要任何操作就可使用最新规则。

felint将自动载入git的pre-commit钩子，当你在运行`git commit`时自动检测待提交的文件是否符合相应规范。如无法通过校验，felint将拒绝此次提交。

## 五、felint命令详解

#### 1. felint init

```
felint init -p planname

planname:
用于指定初始化规则方案
```

执行`felint init`命令后，felint将从[.felintrc](#customerConfig)中读取`felint config`地址或（如没有.felintrc文件）使用默认地址<https://github.com/youzan/felint-config>下载所需的默认的配置文件并保存在项目的`.felint`文件夹下。

当配置文件下载完成后，felint将自动执行配置文件内部的初始化脚本文件，载入git钩子，并生成最终规则文件。

#### 2. felint update

```
felint update
```

`felint update`对比于`felint init`命令，取消了生成最终规则文件的操作。

#### 3. felint use

```
felint use [options]

options:
-p [value]: 为当前目录使用指定的规则方案
-f value: 为当前目录使用指定的规则文件
```

规则方案和规则文件请参见[felint-config介绍](#felintconfig)

使用场景：

```
|_ A project
    |_ B page(es5 page source fold)
    |_ C page(es6 page source fold)
```
此时需要对B、C页面代码进行不同的规则检测。
推荐做法:

```
cd A project
felint init -p es5
cd C page fold
felint use -p es6
```

`felint use`命令将在`c page fold`下产生成对应版本的规则文件。此时`C page fold`下的代码将使用自己的规则文件进行校验。

**_注意，在使用`felint use`命令前必须确保当前目录或其父级目录上已运行过`felint init`。_**

#### <a name="felintExport"></a>4. felint export

```
felint export
```

该命令用于在当前项目下安装默认eslint/stylelint及其依赖，并在当前项目的package.json注入相应的devDependencies。可参考[felint export使用例子](#felintExportCase)。

#### 4. felint youzan

```
felint youzan
```

该命令用于生成基于Youzan的[.felintrc](#felintrc)文件。


## 六、felint高阶

#### 1. <a name="changeDefaultRule"></a>修改默认规则

如果你需要修改默认的stylelint规则或者eslint规则，请不要直接修改对应目录下的`.eslintrc.json`和`.stylelintrc.js`文件，避免别人重新执行`felint init`时重新覆盖为默认规则（虽然在覆盖之前会有确认覆盖的交互提示）。

推荐方案为修改[.felintrc](#felintrc)文件，具体修改方案请移步[.felintrc](#felintrc)文件说明。

#### 2. <a name="customerConfig"></a> 自定义felint-config

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以fork出来修改为自己的felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后在[.felintrc](#felintrc)文件的[configRep](#configRep)字段中手动配置你自己的 felint-config 仓库地址。

然后重新执行一次 `felint init` 即可。

#### 3. <a name="felintExportCase"></a>使用Felint快速生成基础配置

对于特殊项目，可能其依赖的eslint/stylelint插件跟其他项目不兼容，则felint支持`export`方法，将`felint-config`指定的默认依赖通过`devDependencies`的方式安装在当前项目中同时在项目下生成基础规则文件(eslintrc/stylelintrc)，之后可在基础规则上随意修改。

## 七、<a name="felintrc"></a>.felintrc文件

**.felintrc**用于配置`felint-config`的git仓库地址、对默认规则进行一定程度的自定义覆盖、记录该项目所使用的代码规则方案以及记录该项目是否被`felint export`过。

**e.g.**

```
{
    configReg   // 用于指定使用的felint-config仓库地址
    plan        // 用于指定当前项目所使用的规则方案，比如es5/es6/vue/react等
    local       // 用于指定该项目下是否执行过felint export
    ruleExtends // 该字段并不叫这个名字，只是表明其用处
}
```
#### 1. <a name="configRep"></a>configRep

该地址用于指定`felint config`的仓库地址，如果你有自己的config仓库，请指定它。指定之后，felint的`init`, `update`命令都将从该地址拉取配置。

#### 2. plan

该字段用于记录执行`felint init -p value`时所使用的规范方案（如果不指定则为default）。

#### 3. local

该字段记录在当前目录下是否执行过`felint export`命令。

#### 4. ruleExtends

该字段内的值会跟`felint-config`中同名规则文件的内容做merge，生成最终的规则文件。

**e.g.**

```
{
    "plan": "es6",
    ".eslintrc_es6": {
        "rules": {
            "no-console": 0
        }
    }
}
```

felint在执行`init`、`use`命令后最终生成的`.eslintrc.json`文件内容将会整合felint-config目录下rules/.eslintrc_es6的内容和.felintrc内的.eslintrc_es6的值。

__注意，在这里请不要对plugin等需要依赖第三方包的字段进行修改，否则将可能导致错误，如需修改plugin，请使用[felint export](#felintExport)命令__


## 八、 <a name="felintconfig"></a>felint-config

你可以默认使用我们提供的官方的`felint-config`也可以根据自己团队的需要在工程目录里的[**.felintrc**](#felintrc)里去指定。

关于`felint-config`的目录结构，可以看[这里](https://github.com/youzan/felint-config/tree/felint-1.x-config-example)。

`felint-config`必须提供一个`config.js`文件作为`Felint`的功能配置。

以下为一个`config.js`的例子:

```javascript
module.exports = {
    dependence: {
        npm: {
            "eslint": "3.19.0",
            "babel-eslint": "7.2.1",
            "eslint-config-airbnb": "14.1.0",
            "stylelint": "7.10.1",
            "stylelint-config-standard": "16.0.0"
        }
    },
    plan: {
        es6: ['.eslintrc_es6', '.stylelintrc'],
        es5: ['.eslintrc_es5', '.stylelintrc'],
        default: ['.eslintrc_es6', '.stylelintrc']
    },
    initHooks: 'update_git_hooks.sh'
}
```

其中`dependence`指定了`felint`的依赖包。

<a name="plan"></a>`plan`字段指定了`Felint`可用的代码规范方案。

**e.g.**

> es6: ['.eslintrc_es6.json', '.stylelintrc.json']
> > 该方案名为es6，使用`felint-config 的 rules目录`下的 .eslintrc_es6.json 和 .stylelintrc.json规范文件。

`initHooks`指定了初始化钩子的脚本，将在执行felint init、felint update的时候被调用。

## 九、开源协议
本项目基于 [MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)协议，请自由地享受和参与开源。
