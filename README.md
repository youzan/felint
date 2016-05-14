Felint-前端JS和SCSS检查工具
========

## 安装

```c
npm install -g felint
```

## 如果需要手动配置git钩子仓库（否则忽略）

在项目根目录添加`.felintrc`文件，其内容为：

```js
{
	"gitHookUrl": "your url"
}
```

## 初始化钩子

```c
felint init
```

## 升级钩子

```c
felint update
```
