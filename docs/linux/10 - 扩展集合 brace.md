---
title: 扩展集合 brace
date: 2022-10-31
tags:
 - linux
categories: 
 - linux
---


## 总结
- `{a,b,c}`，`*.{json,md}`：集合项，与通配符结合
- `{A..z}`：自动扩展字母
- `{01..10}`：自动扩展数字
- `{0..-10..2}`：自动扩展，自减 2 




## 提问
- [x] 1. 如何列出当前目录下所有的 `json` 与 `md` 文件
  > `exa -lah *.{json,md}` 或者 `exa -lah {*.json,*.md}`
- [x] 2. 如何创建 test000 到 test099.json 100 个 json 文件
  > `touch test{000..99}.json`


<!-- ## 疑问
- [ ] 1. -->




## 1. 前提提要、场景
假设要新建大量文件，文件名从 1 数到 100，怎么使用命令实现？这时候就需要有个描述，用来表示 1 - 100。这便是 `brace`，用以扩展集合、数组等。




## 2. brace 扩展集合
[Brace Expansion](https://www.gnu.org/software/bash/manual/bash.html#Brace-Expansion)

以下语句都不要在中间穿插空格
- `set`：`{a,b,c}`
- `range`：`{1..10}`，`{01..10}`
- `step`：`{1..10..2}`

```sh
# 不同项用 , 隔开，如果是自动扩展则是..
$ echo {a,b,c}
a b c

# range: 输出 01 到 10
$ echo {01..10}
01 02 03 04 05 06 07 08 09 10

# step: 输出 1 到 10，但是每一步需要自增 2
$ echo {1..10..2}
1 3 5 7 9

# step: 输出 1 到 10，但是每一步需要自增 3
$ echo {1..10..3}
1 4 7 10

# step: 输出 0 到 -10，但是每一步需要自减 2
$ echo {0..-10..2}
0 -2 -4 -6 -8 -10

$ echo {a..z}
a b c d e f g h i j k l m n o p q r s t u v w x y z

$ echo {A..z}   
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z
```

批量操作
```sh
# 列出当前目录下所有的 json 与 md 文件
$ ls -lah {*.json,*.md}

# 创建 a.js 到 z.js 26个文件
$ touch {a..z}.js

$ ls *.js
a.js  c.js  e.js  g.js  i.js  k.js  m.js  o.js  q.js  s.js  u.js  w.js  y.js
b.js  d.js  f.js  h.js  j.js  l.js  n.js  p.js  r.js  t.js  v.js  x.js  z.js

# 创建从1 数到 100 的 js 的文件
$ touch {1..100}.js

```