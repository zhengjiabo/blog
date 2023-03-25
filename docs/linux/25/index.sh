hello () {
  echo $0 $1 $2 $3 $4
}

# 调用函数
# bash index.sh => hello.sh a b c d
# zsh index.sh  => hello a b c d
# source index.sh => bash a c c d  (bash 环境下)
# source index.sh => hello a c c d (zsh 环境下)
hello a b c d