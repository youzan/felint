<p>
<a href="https://github.com/youzan" target="_blank"><img width="36px" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan"></a>
</p>
<p align="center">
    <a href="http://youzan.github.io/felint/" target="_blank">
        <img width="226px" src="https://img.yzcdn.cn/public_files/2017/02/09/232aae6e44455f5d068b9f74b9394f64.png">
    </a>
</p>
<p align="center">A smart way to eslint and scss-lint for front end</p>

## 一、什么是Felint
felint是一个集成了eslint、Git Hooks、scsslint的前端代码检查工具。
由于使用了pre-commit钩子，felint将强制让你仅提交符合规范的代码。

## 二、名词解析

#### felint config
`felint config`为felint的统一配置信息。在felint中它以一个远程地址的形势存在，你可以在[自定义规则](#customerConfig)中修改其默认地址。在`felint init`或`felint update`命令执行过程中，将从该地址下载具体配置信息。


## 三、安装 felint

#### 1. 安装准备
1. MacOS（有赞清一色Mac，欢迎大家拿简历砸过来<joinus@youzan.com>）
2. 由于felint本身为npm包，所以安装前请确保你的电脑已安装node和npm 
3. felint使用gem安装scss检测工具scss_lint，所以请确保你已安装gem

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
|_.felint         // felint config文件夹
|_.eslintrc       // eslint 规则文件，用于检测js代码
|_.eslintignore   // eslint ignore文件
|_.scss-lint.yml  // scss 规则文件，用于检测scss代码
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
felint init [options]

-options:
-5: 默认option，用于生成符合es5的JavaScript规范
-6: 扩展了airbnb的规范，用于生成符合es6并兼容react的JavaScript规范
```

执行`felint init`命令后，felint将从你指定的[自定义规则](#customerConfig)中读取`felint config`地址或从默认地址<https://github.com/youzan/felint-config>下载所需的默认的配置文件并保存在项目的`.felint`文件夹下。

当配置文件下载完成后，felint将自动执行配置文件内部的初始化脚本文件，载入git钩子，并生成最终规则文件。

#### 2. felint update

```
felint update
```

执行`felint update`命令后，felint将从你指定的[自定义规则](#customerConfig)中读取`felint config`地址或从默认地址<https://github.com/youzan/felint-config>重新下载所需的默认的配置文件并执行初始化脚本，载入git钩子。

`felint update`对比于`felint init`命令，取消了生成最终规则文件的操作。

#### 3. felint use

```
felint use [options]

-options:
-5: 用于生成符合es5的JavaScript规范
-6: 扩展了airbnb的规范，用于生成符合es6并兼容react的JavaScript规范
```

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
felint init
cd C page fold
felint use -6
```

`felint use`命令将在`c page fold`下产生成对应版本的规则文件。此时`C page fold`下的代码将使用自己的规则文件进行校验。

**_注意，在使用`felint use`命令前必须确保当前目录或其父级目录上已运行过`felint init`或者`felint update`。_**

#### 4. felint checkrc

```
felint checkrc
```

由于eslint规则可以继承，所以可能存在多个eslint规则文件，并对某个js文件的语法检测造成影响。

该命令用于打印出当前目录及其父级目录上存在的所有eslint规则文件路径，方便检测由于存在多个规则文件所造成的问题。

#### 5. felint checkDependence

```
felint checkDependence
```

由于felint是一个npm包，它默认依赖很多其他的第三方全局npm包，所以当这些被felint所依赖的全局包缺失或者版本不匹配时可能导致felint功能不可用。

该命令用于检测felint依赖的全局npm包是否存在以及版本是否符合要求。

**_注意，该命令只有当你使用默认`felint config`时才有意义，如你使用[gitHookUrl](#gitHookUrl)来使用自己的config，该命令无意义_**

#### 6. felint youzan

```
felint youzan
```

该命令用于生成基于Youzan的[.felintrc](#felintrc)文件。


## 六、felint高阶

#### 1. <a name="changeDefaultRule"></a>修改默认规则

如果你需要修改默认的scss规则或者eslint规则，请不要直接修改对应目录下的`.eslintrc`和`.scss-lint.yml`文件，避免别人重新执行`felint init`时重新覆盖为默认规则（虽然在覆盖之前会有确认覆盖的交互提示）。

推荐方案为修改[.felintrc](#felintrc)文件，具体修改方案请移步[.felintrc](#felintrc)文件说明。

#### 2. <a name="customerConfig"></a> 自定义规则

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以fork出来修改为自己的felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后在[.felintrc](#felintrc)文件的[gitHookUrl](#gitHookUrl)字段中手动配置你自己的 felint-config 仓库地址。

然后重新执行一次 `felint init` 即可。

## 七、<a name="felintrc"></a>.felintrc文件

```
{
    "gitHookUrl": "your own felint config url",
    "eslintrc_es5": {
    },
    "eslintrc_es6": {
    },
    "scss-lint": {}
}
```

#### 1. <a name="gitHookUrl"></a>gitHookUrl

该地址用于指定`felint config`的仓库地址，如果你有自己的config仓库，请指定它。指定之后，felint的`init`, `update`命令都将从该地址拉取配置。

#### 2. eslintrc_es5 eslintrc_es6

该字段用于覆盖对应版本的默认javascript规则。

felint在执行`init`、`use`命令是会读取该字段，用于生成最终规则文件。

#### 3. scss-lint

该字段用于覆盖默认scss规则。

felint在执行`init`、`use`命令是会读取该字段，用于生成最终规则文件。


## 八、felint依赖

默认`felint config`依赖的全局包如下：

```
'eslint' '@2.11.1'
'scss_lint' '--version=0.48.0'
'eslint-plugin-react' '@5.1.1'
'babel-eslint' '@6.0.4'
'eslint-plugin-import' '@1.8.1'
'eslint-plugin-jsx-a11y' '@1.2.3'
'eslint-config-airbnb' '@9.0.1'
```

## 九、开源协议
本项目基于 [MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)协议，请自由地享受和参与开源。
