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

felint 是一个同步前端代码校验规则的工具。

felint 为你的项目做以下两件事：

1. 初始化 eslint/stylelint 配置文件，无论是 react 项目、vue 项目、es5 还是 es6 都提供了针对性的配置方案
1. 安装 eslint/stylelint 及其依赖到当前项目的 node_modules 里

如果你需要利用`git`的钩子来校验代码，推荐使用：[husky](https://github.com/typicode/husky) 和 [lint-staged](https://github.com/okonet/lint-staged)。

## 二、安装 felint

```
npm install -g felint
```

## 三、快速开始

### 第一步

在项目的根目录，执行

```
felint init
```

`felint` 初始化完成后你的项目中将会产生如下文件：

```
|_.felintrc        // 第一次被执行 felint init 后会在项目根目录生成这个文件，具体见下面 .felintrc 章节
|_.eslintrc.json   // eslint 规则文件，用于检测js代码（使用的是官方推荐的配置）
|_.eslintignore    // eslint ignore配置文件
|_.stylelintrc.js  // stylelint 规则文件，用于检测css代码（使用的是官方推荐的配置）
|_.stylelintignore // stylelint ignore配置文件
```

### 第二步

将这些 `felint` 生成的文件提交到 git 仓库。

### 第三步（高阶用法）

默认情况下，`felint` 是同步 `ES6` 方案的校验规则，当你需要在项目中使用`Vue` 或 `React`规则时，我们可以在初始化时指定一个规则方案：

```
felint init -p vue
```

此时，`felint` 将会在你的项目中初始化适用于 `Vue` 的校验规则。

如果你需要在一个项目的不同目录使用不同的代码规范时，可以修改 `.felintrc` 文件自定义校验规则：

```
{
    "plan": {
        "./app": "node",
        "./client": "vue"
    }
}
```

此时在 `./app` 目录生成 node 的校验规则，在 `./client` 目录会生成 vue 的校验规则。

如果你不想使用默认的[felint-config](https://github.com/youzan/felint-config)规则来校验，你可以fork出来修改为自己的 felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后将 `.felintrc` 文件的 `gitHookUrl` 字段配置为你自己的仓库地址即可。

```
{
    "gitHookUrl": "https://github.com/youzan/felint-config.git"
}
```

当你更新了 felint-config 中的规则依赖，你需要在项目的根目录执行以下命令同步最新的依赖：

```
felint dep
```

当你更新了 felint-config 中的校验规则，你需要在项目的根目录执行以下命令同步最新的规则文件：

```
felint rules
```

## 四、名词解释

- `felint-config`：里面包含了代码校验规则的配置信息，默认为：[felint-config](https://github.com/youzan/felint-config)
- `.felintrc`：类似于 `.babelrc`文件，放在项目根目录用于配置 `felint-config` 的git仓库地址，和项目的代码规范方案。
- `eslint`：`JavaScript` 代码校验工具，详细文档点[这里](https://eslint.org/)
- `stylelint`：`CSS` 代码校验工具，详细文档点[这里](https://github.com/stylelint/stylelint)

## 五、felint命令详解

### 1. felint init

```
felint init -p planname -f

-p planname:
用于指定初始化规则方案，如果不指定则会使用默认的规则
-f:
是否强制覆盖已有的规则
```

执行 `felint init` 命令后，felint会读取 `.felintrc` 中 `felint-config` 配置的校验规则仓库地址（如未指定则会使用默认地址<https://github.com/youzan/felint-config>），当配置文件下载完成后，`felint` 将自动执行配置文件内部的初始化脚本文件，并生成最终规则文件。

关于规则方案声明请参见[felint-config介绍](https://github.com/youzan/felint-config)

### 2. felint dep

该命令会下载 `eslint` 和 `stylelint` 所需要的依赖，并写入到 `package.json` 中。

```
felint dep
```

### 3. felint rules

该命令会根据 `.felintrc` 配置文件同步最新的校验规则文件。

```
felint rules -f

-f:
是否强制覆盖已有的规则
```

### 4. felint config-url

```
felint config-url
```

输出 `felint config` 配置的仓库地址。

## 六、<a name="felintrc"></a>.felintrc文件

**.felintrc**用于配置`felint-config`的git仓库地址、对默认规则进行一定程度的自定义覆盖以及记录该项目所使用的代码规则方案。

**e.g.**

```
{
    gitHookUrl     // 用于指定使用的`felint-config`仓库地址
    plan          // 用于指定当前项目所使用的规则方案，比如`es5/es6/vue/react`等
    disturl       // 用于指定安装依赖时的`disturl`
    registryUrl   // 用于指定安装依赖时的`registry`
    useYarn       // 是否使用yarn来安装依赖，默认为`true`
}
```

## 七、开源协议
本项目基于 [MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)协议，请自由地享受和参与开源。
