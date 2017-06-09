## 1.0.0
修改:

1. felint-config重新设计
2. 删除felint checkDependence、felint checkrc命令
3. 增加felint export命令
4. 对felint init、felint use命令的option进行修改
5. 去掉对全局eslint/scss_lint的依赖
6. 使用stylelint替换scss_lint进行css校验

## 0.3.0
修改:

1. 在felint init命令执行过程中加入对felint依赖的全局npm包的版本检测(e.g. felint依赖eslint，当全局没有安装eslint时或安装的eslint版本不符合要求的时候，将会提示)
2. felint init 和felint use命令从原来的强制覆盖原有eslintrc、scss_lint.yml文件改为在覆盖前加入是否覆盖原有文件的交互提示
3. 新增独立felint checkDependence命令，用于诊断felint依赖的全局npm包有无问题，效果同1(强烈推荐大家更新后执行看下自己的依赖是否正确)
4. 新增felint youzan命令，用于代替原有--youzan参数，--youzan参数已废弃。该命令用于生成基于有赞的felintrc文件，该文件可为后续init/update等命令提供 `felint config` 的仓库地址(e.g. felint init -6 --youzan === felint youzan && felint init -6)