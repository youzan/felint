#!/bin/bash

projectPath=`pwd`
RED='\033[0;31m'
NC='\033[0m'
LGREEN='\033[1;32m'
my_dir="$(dirname "$0")"

# Check MultiHook

ALL_HOOKS_FOLDER=$projectPath/.multi_hooks/all_hooks

APPLICATION=felint

printf '\n========== 开始安装multi_hooks ==========\n'
curl http://gitlab.qima-inc.com/delai/youzan_git_kit/raw/master/init_multi_hooks.sh | sh
printf '\n========== 安装multi_hooks完成 ==========\n'

if [ -d $ALL_HOOKS_FOLDER ];then
  rm -rf $ALL_HOOKS_FOLDER/$APPLICATION
  mkdir -p $ALL_HOOKS_FOLDER/$APPLICATION
  cd $ALL_HOOKS_FOLDER/$APPLICATION
  # 2、下面这里填脚本地址
  printf '\n========== init hook ==========\n'
  ln -s ../../../.felint/hooks/pre-commit "./pre-commit"
  ln -s ../../../.felint/hooks/commit-msg "./commit-msg"
  echo '当前目录里的 commit-msg 和 pre-commit 实际上被软链到了 '$projectPath'/.felint 下真正的脚本文件，相应的钩子触发的时候会被执行。\n
  只是勾子通过multihook来出发而已，后续的 felint 钩子、配置的更新都没有差别' > ./README

  printf '\n========== chmod hook ==========\n'
  chmod -R a+x $projectPath/.multi_hooks
  printf '\n========== chmod hook done ==========\n'
  printf '\n========== init hook done ==========\n'
fi

printf '\n========== ALL DONE, THANKS\n'
