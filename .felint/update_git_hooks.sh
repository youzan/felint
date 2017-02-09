#!/bin/bash

projectPath=`pwd`
RED='\033[0;31m'
NC='\033[0m'
LGREEN='\033[1;32m'
my_dir="$(dirname "$0")"

# install package
installPackage()
{
  pn=$1
  printf "\n========== Install ${pn} start ==========\n"
  npm install -g "$pn"
  printf "\n========== Install ${pn} done ==========\n"
}

# check if package is already installed
# if not install it
checkAndInstallPackage()
{
  pn=$1
  v=$2
  if [[ $packageList == '' ]]; then
    packageList=`npm list -g --depth=0 --silent --parseable=true 2> /dev/null`
  fi
  sh "$my_dir/checkPackage.sh" "$pn" "$v" "$packageList"
  result=$?
  if [[ $result == '1' ]]; then
    printf "${RED}${pn}包版本错误，可能会导致felint问题，推荐使用${LGREEN}${v}版本${NC}"
  fi

  if [[ $result == '2' ]]; then
    installPackage "${pn}""@${v}"
  fi
}

# Check for eslint
checkAndInstallPackage 'eslint' '2.11.1'

# Check for scss_lint
which scss-lint &> /dev/null
if [[ "$?" == 1 ]]; then
  printf '\n========== Install scss_lint@0.48.0 start ==========\n'
  gem install scss_lint --version=0.48.0
  printf '\n========== Install scss_lint@0.48.0 done ==========\n'
fi

# Check eslint-plugin-react
checkAndInstallPackage 'eslint-plugin-react' '5.1.1'
checkAndInstallPackage 'babel-eslint' '6.0.4'
checkAndInstallPackage 'eslint-plugin-import' '1.8.1'
checkAndInstallPackage 'eslint-plugin-jsx-a11y' '1.2.3'
checkAndInstallPackage 'eslint-config-airbnb' '9.0.1'
checkAndInstallPackage 'eslint-plugin-lean-imports' '0.3.3'

# cd to hooks folder
cd ./.felint

printf '\n========== init .eslintignore start ==========\n'
cp ./.eslintignore "$projectPath"
printf '\n========== init .eslintignore done ==========\n'

printf '\n========== init hook ==========\n'
mkdir "${projectPath}/.git/hooks/"
hooks="${projectPath}/.git/hooks/"
rm -f "${hooks}/pre-commit" "${hooks}/pre-push" "${hooks}/post-merge" "${hooks}/commit-msg"
ln -s ../../.felint/pre-commit "$hooks"
ln -s ../../.felint/pre-push "$hooks"
ln -s ../../.felint/commit-msg "$hooks"
printf '\n========== chmod hook ==========\n'
chmod a+x "./pre-commit"
chmod a+x "./pre-push"
chmod a+x "./commit-msg"
printf '\n========== chmod hook done ==========\n'

printf '\n========== init hook done ==========\n'



printf '\n\n如eslint和eslint-plugin-react未安装成功：\033[32m npm install -g eslint && npm install -g eslint-plugin-react\033[0m'
printf '\n\n如 scss_lint 未安装成功：\033[32m gem install scss_lint \033[0m\n'

printf '\n========== ALL DONE, THANKS\n'
