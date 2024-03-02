
## Git Hooks
`.git/hooks` 文件下，保存了一些 shell 脚本，在对应时期中执行对应的钩子。

`.git` 是被忽略的文件夹，在团队中无法维护使用。

## 解决方案
### Husky
安装 Husky 的时候把配置文件和 Git Hook 关联起来，这样我们就能在团队中使用 Git Hooks 了.


### 设置 core.hooksPath 路径

将 `git config core.hooksPath ./git-hooks` 命令添加到 `package.json` 的 `postinstall` 脚本中，每次通过 `npm install` 安装依赖时都会自动设置钩子路径。

将 `git hooks` 路径维护到 `.git` 外。
