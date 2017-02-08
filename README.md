# Felint - 无痛的前端 JS 和 SCSS 代码检查工具 

## 什么是Felint
felint是一个集成了eslint、Git Hooks、scsslint的前端代码检查工具。
由于使用了pre-commit钩子，felint将强制让你仅提交符合规范的代码。

## 安装 felint

### 安装准备
1. MacOS（有赞清一色Mac，欢迎大家拿简历砸过来<joinus@youzan.com>）
2. 由于felint本身为npm包，所以安装前请确保你的电脑已安装node和npm 
3. felint使用gem安装scss检测工具scss_lint，所以请确保你已安装gem

### 安装
```
npm install -g felint
```

## 快速开始

### 使用felint初始化项目

进入到你项目的根目录，运行

```
felint init
```
felint 会从 <https://github.com/youzan/felint-config> 下载所需的默认的配置文件并完成初始化。

初始化完成后你的项目中将会产生如下目录或文件：

```
|_.felint         // felint config文件夹
|_.eslintrc       // eslint 规则文件，用于检测js代码
|_.eslintignore   // eslint ignore文件
|_.scss-lint.yml  // scss 规则文件，用于检测scss代码
```

同时，felint将自动载入git的pre-commit钩子，当你在运行`git commit`时自动检测待提交的文件是否符合相应规范。如无法通过校验，felint将拒绝此次提交。

## felint命令详解

### felint init

```
felint init [options]

-options:
-5: 用于生成符合es5的JavaScript规范
-6: 扩展了airbnb的规范，用于生成符合es6并兼容react的JavaScript规范
```

`felint init`命令主要用于初始化项目，生成必要的配置文件，载入git钩子，生成规则文件。

### felint update

```
felint update
```

felint update命令仅用于更新`felint init`命令产生的`.felint`文件夹并重新载入git钩子。

### felint use

```
felint use [options]

-options:
-5: 用于生成符合es5的JavaScript规范
-6: 扩展了airbnb的规范，用于生成符合es6并兼容react的JavaScript规范
```

该命令用于生成对应版本的规则文件。

`felint init`命令可以看成`felint update && felint use`。

所以在使用`felint use`命令前必须确保当前目录或其父级目录上已运行过`felint init`或者`felint update`。

### felint checkrc

```
felint checkrc
```

由于eslint规则可以继承，所以可能存在多个eslint规则文件，并对某个js文件的语法检测造成影响。

该命令用于打印出当前目录及其父级目录上存在的所有eslint规则文件路径，方便检测由于存在多个规则文件所造成的问题。

### felint checkDependence

```
felint checkDependence
```

由于felint是一个npm包，它默认依赖很多其他的第三方全局npm包，所有当这些被felint所依赖的全局包缺失或者版本匹配时可能导致felint功能不可用。

该命令用于检测felint依赖的全局npm包是否存在以及版本是否符合要求。

**_注意，该命令只有当你使用默认`felint config`时才有意义，如你使用[gitHookUrl](#gitHookUrl)来使用自己的config，该命令无意义_**

### felint youzan

```
felint youzan
```

该命令用于生成基于Youzan的[.felintrc](#felintrc)文件。


## felint高阶

### 修改默认规则

如果你需要修改默认的scss规则或者eslint规则，请不要直接修改对应目录下的`.eslintrc`和`.scss-lint.yml`文件，避免别人重新执行`felint init`时重新覆盖为默认规则（虽然在覆盖之前会有确认覆盖的交互提示）。

推荐方案为修改[.felintrc](#felintrc)文件，具体修改方案请移步[.felintrc](#felintrc)文件说明。

### 自定义规则

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以fork出来修改为自己的felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后在[.felintrc](#felintrc)文件的[gitHookUrl](#gitHookUrl)字段中手动配置你自己的 felint-config 仓库地址。

然后重新执行一次 `felint init` 即可。

## <a name="felintrc">.felintrc</a>

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

### <a name="gitHookUrl">gitHookUrl</a>

该地址用于指定`felint config`的仓库地址，如果你有自己的config仓库，请指定它。指定之后，felint的`init`, `update`命令都将从该地址拉取配置。

### eslintrc_es5 eslintrc_es6

该字段用于覆盖对应版本的默认javascript规则。

felint在执行`init`、`use`命令是会读取该字段，用于生成最终规则文件。

### scss-lint

该字段用于覆盖默认scss规则。

felint在执行`init`、`use`命令是会读取该字段，用于生成最终规则文件。


## felint依赖

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
