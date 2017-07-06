<p>
<a href="https://github.com/youzan" target="_blank"><img width="36px" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan"></a>
</p>
<p align="center">
    <a href="http://youzan.github.io/felint/" target="_blank">
        <img width="226px" src="https://img.yzcdn.cn/public_files/2017/02/09/232aae6e44455f5d068b9f74b9394f64.png">
    </a>
</p>
<p align="center">A smart way to eslint stylelint and git hooks for front end</p>


[![npm version](https://img.shields.io/npm/v/felint.svg?style=flat)](https://www.npmjs.com/package/felint) [![downloads](https://img.shields.io/npm/dt/felint.svg)](https://www.npmjs.com/package/felint) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[![NPM](https://nodei.co/npm/felint.png?downloads=true&downloadRank=true)](https://nodei.co/npm/felint/)

## 一、什么是Felint
felint 是一个集成了 eslint、stylelint、git hook 的前端代码检查工具。

felint 为你的项目做以下三件事：

1. 初始化 eslint/stylelint 配置文件，无论是 react 项目、vue 项目、es5 还是 es6 都提供了针对性的配置方案
1. 安装 eslint/stylelint 及其依赖到当前项目的 node_modules 里
1. 挂载 git 钩子，在你提交代码时进行强制校验


## 二、安装 felint

```
npm install -g felint
```

## 三、快速开始

#### 第一步

在项目的根目录，执行

```
felint init
```

`felint` 初始化完成后你的项目中将会产生如下目录和文件：

```
|_.felintrc        // 第一次被执行 felint init 后会生成这个文件，里面包含了使用哪个配置方案等信息
|_.felint          // felint config文件夹
|_.eslintrc.json   // eslint 规则文件，用于检测js代码（使用的是官方推荐的配置）
|_.eslintignore    // eslint ignore配置文件
|_.stylelintrc.js  // stylelint 规则文件，用于检测css代码（使用的是官方推荐的配置）
|_.stylelintignore // stylelint ignore配置文件
```

同时，`felint` 会帮你挂载好相应的 git hook，当你在运行 `git commit` 时自动检测待提交的文件是否符合相应规范。如无法通过校验，将无法提交。

#### 第二步
将这些新增的代码提交到 git 仓库

#### 第三步
其他参与这个项目的成员，更新代码，然后也在项目的根目录，执行
```
felint init
```

如果不出意外，他们执行这个命令不会有新的文件产生，只是做了挂载 git hook 的操作而已。

当团队内部统一使用 felint 来对前端项目进行代码检测时，请确保每个成员都在该项目目录下执行过一遍 `felint init` 命令。

## 四、felint命令详解

#### 1. felint init

```
felint init -p planname

planname:
用于指定初始化规则方案
```

执行 `felint init` 命令后，felint将从[.felintrc](#customerConfig)中读取 `felint config` git仓库地址 或 使用默认地址<https://github.com/youzan/felint-config>（如没有.felintrc文件）下载所需的默认的配置文件并保存在项目的 `.felint` 文件夹下。

当配置文件下载完成后，`felint` 将自动执行配置文件内部的初始化脚本文件，挂载 git hook，并生成最终规则文件。

关于规则方案声明请参见[felint-config介绍](#felintconfig)

#### 2. felint use

```
felint use [options]

options:
-p [value]: 为当前目录使用指定的规则方案
-f value: 为当前目录使用指定的规则文件
```

关于规则方案和规则文件请参见[felint-config介绍](#felintconfig)

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

#### 3. felint hooks

该命令用于为当前项目挂载钩子。执行`felint init` 命令时会自动执行该命令。

**_注意，在使用 `felint use / felint hooks` 命令前必须确保当前目录或其父级目录上已运行过 `felint init` (一般来说，团队内有一人执行过即可)。所以，上面 `三、快速开始` 里 `第三步` 实际上团队里其他成员只要执行 `felint hooks` 也就可以了_**

## 五、<a name="felintrc"></a>.felintrc文件

**.felintrc**用于配置`felint-config`的git仓库地址、对默认规则进行一定程度的自定义覆盖以及记录该项目所使用的代码规则方案。

**e.g.**

```
{
    configReg   // 用于指定使用的felint-config仓库地址
    plan        // 用于指定当前项目所使用的规则方案，比如es5/es6/vue/react等
    ruleExtends // 该字段并不叫这个名字，只是表明其用处
}
```
#### 1. <a name="configRep"></a>configRep

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以fork出来修改为自己的felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后在[.felintrc](#felintrc)文件的[configRep](#configRep)字段中手动配置你自己的 felint-config 仓库地址。

然后重新执行一次 `felint init` 即可。

#### 2. plan

该字段用于记录执行`felint init -p value`时所使用的规范方案（如果不指定则为default）。

#### 3. ruleExtends

如果你需要覆盖默认的stylelint规则或者eslint规则，推荐修改这里。请不要直接修改对应目录下的`.eslintrc.json`和`.stylelintrc.js`文件，避免别人重新执行`felint init`时重新覆盖为默认规则（虽然在覆盖之前会有确认覆盖的交互提示）。
该字段内的值会跟`felint-config`的`rules`目录下的**同名规则文件**的内容做merge，生成最终的规则文件。

**e.g.**

```
{
    "plan": "es6",
    ".eslintrc_es6.json": {
        "rules": {
            "no-console": 0
        }
    }
}
```

felint在执行`init`、`use`命令后最终生成的`.eslintrc.json`文件内容将会整合felint-config目录下rules/.eslintrc_es6.json的内容和.felintrc内的.eslintrc_es6.json的值。

## 六、felint升级

felint将在你执行`felint init`命令的时候自动检查更新。当发现有新版本felint时，将在命令行提醒你是否需要更新。

## 七、开源协议
本项目基于 [MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)协议，请自由地享受和参与开源。
