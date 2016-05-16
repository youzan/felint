Felint-前端JS和SCSS检查工具
========

## 安装

```c
npm install -g felint
```

## 如果需要手动配置git钩子仓库（否则忽略）

如果你不想使用我们默认的[felint-config](https://github.com/youzan/felint-config)校验，你可以手动配置你的`git`钩子仓库地址，在你的项目根目录添加一个`.felintrc`文件，其文件内容格式为：

```js
{
	"gitHookUrl": "your url"
}
```

## 初始化钩子

进入到你项目的根目录，运行`felint init`即可初始化钩子：

```c
felint init
```

## 升级钩子g

```c
felint update
```
