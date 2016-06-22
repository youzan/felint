# Felint - 无痛的前端 JS 和 SCSS/CSS 代码检查工具


Felint = Eslint + Git Hook + Statistics 

## 安装 felint
安装前请确保你的电脑已经安装好了 npm 和 gem 

```c
npm install -g eslint && npm install -g eslint-plugin-react
gem install scss_lint

npm install -g felint
```

## 初始化

进入到你项目的根目录，运行
```c
felint init
```
felint 会从 https://github.com/youzan/felint-config 下载所需的默认的配置文件，包括Git Hook脚本、eslint 和 css lint 的配置文件等，然后放到当前项目合适的位置。

## 升级配置文件

```c
felint update
```

## 使用自己的 felint 配置

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以fork出来修改为自己的felint-config（修改方法参考 [felint-config 的 readme](https://github.com/youzan/felint-config/blob/master/README.md) ），然后在项目中手动配置你自己的 felint-config 仓库地址，在你的项目根目录添加一个`.felintrc`文件，其文件内容格式为：

```js
{
	"gitHookUrl": "your url"
}
```
然后执行一次 `felint init` 即可

## 对es6和es5的支持

如果你的项目是统一是用es6，那么在使用felint init和felint update的时候请带上-6的option。比如

```c
felint init -6
felint update -6
```

如果你的项目是es5的，那么可以不带option直接使用或者带-5。比如

```c
felint init -5
felint init
felint update -5
felint update
```

如果的你项目是本身是es5的，但是某个目录下的js是es6的，那么你可以在该目录下面运行felint use -6

```c
felint use -6
```

将在该目录下使用支持es6的eslintrc文件

## check该目录及父目录下有多少eslintrc文件会对eslint产生影响

```c
felint checkrc
```

## 可以配合使用的 Sublime 插件

### html-css-js prettify

推荐安装代码自动格式化插件：`html-css-js prettify`，按`shift+command+h`能自动规范大部分代码。

### SublimeLinter

推荐安装 `eslint` 相关的3个插件：`SublimeLinter`、`SublimeLinter-contrib-eslint`和`SublimeLinter-contrib-scss-lint`插件，在编码的时候就可以验证是否符合规范，红的提示为error必须修改为规范的代码，黄的为warning可以忽略，减少commit代码时不符合规范又要重新改的时间。
