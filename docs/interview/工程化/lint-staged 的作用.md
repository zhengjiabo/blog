
## 作用

把 `git` 的暂存区的文件作为参数列表，去执行 shell 命令。

避免代码提交时校验所有文件导致效率太慢。

> This project contains a script that will run arbitrary shell tasks with a list of staged files as an argument, filtered by a specified glob pattern.
[lint-staged - npm (npmjs.com)](https://www.npmjs.com/package/lint-staged#why)

## 替代方案

`lint-stage` 源码不少，做了很多兼容处理。
以下仅仅是是思路。

`git status -s -uno | grep -v '^ ' | awk '{print $2}' | xargs eslint`
- `git status -s -uno` 列出暂存的文件。 `-s` 使用简短格式显示状态+空格+文件名，`-uno` 不显示未跟踪的文件。
- `grep -v '^ '` 过滤掉未暂存的文件。`-v`  用于反转匹配，`'^ '` 表示匹配行首的一个空格。以空格开头的行表示未暂存的修改，被过滤掉了。
- `awk '{print $2}'`提取文件名。
- `xargs eslint`将文件名作为参数传递给ESLint命令。