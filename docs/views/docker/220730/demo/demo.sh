!# bash
# 当有该行时，直接报错退出
# 当无该行时，最终会输出 done
set -e

cat notexistfile

echo done