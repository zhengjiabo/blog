---
title: jq `json` 处理工具
date: 2022-11-28
tags:
 - linux
categories: 
 - linux
---


## 总结
1. `cat [File] | jq '.[]'`: `JSON` 转化 `JSONL`
2. `cat [File] | jq -s '.'`: `JSONL` 转化 `JSON`
3. `cat [File] | jq '.key'`: `JSONL` 路径取值，只输出特定的字段
4. `cat [File] | jq '{key}'`: `JSONL` 抽取属性构建新对象，筛选特定字段进行输出
5. `cat [File] | jq 'select(.age > 24)'`: `JSONL` 过滤
6. `cat [File] | jq '{age} | map_values(.+10)'`: `JSONL` 映射
7. `cat [File] | jq 'sort_by(-.age)'`: `JSON` 排序
8. `cat [File] | jq --stream`: `stream` 流式读取 `JSON`
5. 与 `less/tail` 结合使用
    > `less [File] | jq '.'`
    > `tail -f [File] | jq '.'`





## 提问
- [x] 1. 如何把 JSON 转化为 JSONL
    > `cat [File] | jq '.[]'`
- [x] 2. 如何把 JSONL 转化为 JSON
    > `cat [File] | jq -s '.'`
- [x] 3. 如何使 JSONL 只输出特定的字段
    > `cat [File] | jq '.key'`
- [x] 4. 如何筛选 JSONL 特定字段进行输出
    > `cat [File] | jq '{key}'`
- [x] 5. 如何与 less/tail 结合使用
    > `less [File] | jq '.'`
    > `tail -f [File] | jq '.'`





## 1. 前提提要、场景
前端经常要和 `JSON` 打交道，各种配置文件也都是 `JSON` 格式。这便需要有个工具，可以操作 `JSON` —— `jq`

学习前请打开 [jq 官方文档](https://stedolan.github.io/jq/manual/)，内有完整示例。会频繁用到。



## 2. 安装
1. 下载 
`curl -O https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64`

2. 更改权限
`chmod a+x jq-linux64`

3. 移动到 `bin` 目录
`mv jq-linux64 /usr/bin/jq`



## 3. 示例准备
`demo.jsonl`: 模拟日志文件中，每行日志记录都是 `json`
> `JSONL` 即 `JSON Lines`
```sh
$ cat <<EOF > demo.jsonl
{"name": "shanyue", "age": 24, "friend": {"name": "shuifeng"}}
{"name": "shuifeng", "age": 25, "friend": {"name": "shanyue"}}
EOF
```

`demo.json`: 模拟后台接口返回的数据
```sh
$ cat <<EOF > demo.json
[
  {"name": "shanyue", "age": 24, "friend": {"name": "shuifeng"}},
  {"name": "shuifeng", "age": 25, "friend": {"name": "shanyue"}}
]
EOF
```


## 4. jq 命令详解
命令：`jq [options...] filter [files]`
- `options`: 选项
- `filter`: 转换操作，类似 `lodash` 函数


### 4.1 option 选项
常用选项: 
- `-s`: `JSONL` 转 `JSON`。将输入转换成个大数组 (如后续的 filter: `group`, `sort` 只能以数组作为输入)
- `-c`: 不对做 `JSON` 格式化，一行输出。 
- `--stream`: 对 `JSON` 逐字段输出


### 4.2 filter 转换操作
常用选项:
- 实现了 [loadsh](https://www.lodashjs.com/) 的 `get`，`map`，`filter`，`map`，`pick`，`uniq`，`group` 等
- `.`: 代表自身
- `.[]`: 返回数组或对象里的所有值，且是以单独的结果返回，即 `JSONL`
- `.a.b`: 取属性，相当于 `_.get(input, 'a.b')`
- `select(bool)`: 过滤，相当于 `_.filter(boolFn)`
- `map_values`: 映射，相当于 `_.map`，不过 `jq` 无法单独操作 `key`
- `sort`: 排序 
- `group_by`: 按字段分组 
 


## 5. 场景示例
### 5.1 JSON to JSONL
```sh
# .[]: 返回数组或对象里的所有值，且是以单独的结果返回，即 JSONL
$ cat demo.json | jq '.[]'
{
  "name": "shanyue",
  "age": 24,
  "friend": {
    "name": "shuifeng"
  }
}
{
  "name": "shuifeng",
  "age": 25,
  "friend": {
    "name": "shanyue"
  }
}
```

### 5.2 JSONL to JSON
```sh
# -s: 代表把 jsonl 组成数组处理
$ cat demo.jsonl | jq -s '.'
[
  {
    "name": "shanyue",
    "age": 24,
    "friend": {
      "name": "shuifeng"
    }
  },
  {
    "name": "shuifeng",
    "age": 25,
    "friend": {
      "name": "shanyue"
    }
  }
]
```

### 5.3 `.` 路径取值
`.`: [Object Identifier-Index: .foo, .foo.bar](https://stedolan.github.io/jq/manual/#Basicfilters)
类似 `loadsh` 的 [_.get](https://www.lodashjs.com/docs/lodash.get)

```sh
$ cat demo.jsonl | jq '.name'
"shanyue"
"shuifeng"
```



### 5.4 `{}` 抽取属性构建新对象
`{}`: [Object Construction: {}](https://stedolan.github.io/jq/manual/#TypesandValues)
类似 `loadsh` 的 [_.pick](https://www.lodashjs.com/docs/lodash.pick)

接收 `JSONL`

```sh
$ cat demo.jsonl | jq '{name, friendname: .friend.name}'
{
  "name": "shanyue",
  "friendname": "shuifeng"
}
{
  "name": "shuifeng",
  "friendname": "shanyue"
}
```



### 5.5 `select` 过滤
`select`: [select(boolean_expression)](https://stedolan.github.io/jq/manual/#Builtinoperatorsandfunctions)
类似 `loadsh` 的 [_.filter](https://www.lodashjs.com/docs/lodash.filter)

```sh
# 先过滤，后抽取属性构建新对象
$ cat demo.jsonl | jq 'select(.age > 24) | {name}'
{
  "name": "shuifeng"
}
```


### 5.6 `map_values` 映射
`map_values`: [map(x), map_values(x)](https://stedolan.github.io/jq/manual/#Builtinoperatorsandfunctions)
类似 `loadsh` 的 [_.map](https://www.lodashjs.com/docs/lodash.map)

```sh
# 先抽取属性构建新对象，后映射 + 10
$ cat demo.jsonl | jq '{age} | map_values(.+10)'
{
  "age": 34
}
{
  "age": 35
}
```


### 5.7 `sort_by` 排序
`sort_by`: [sort, sort_by(path_expression)](https://stedolan.github.io/jq/manual/#Builtinoperatorsandfunctions)
类似 `loadsh` 的 [_.sortBy](https://www.lodashjs.com/docs/lodash.sortBy)

`sort_by` 只接受数组，所以要把 `JSONL` 转 `JSON`
```sh
# 按照 age 降序排列
# -s: jsonl to json
# -.age: 降序
# .[]: json to jsonl
# {}: pick
$ cat demo.jsonl | jq -s '. | sort_by(-.age) | .[] | {name, age}'
{
  "name": "shuifeng",
  "age": 25
}
{
  "name": "shanyue",
  "age": 24
}

# 按照 age 升序排列
$ cat demo.jsonl | jq -s '. | sort_by(.age) | .[] | {name, age}'
{
  "name": "shanyue",
  "age": 24
}
{
  "name": "shuifeng",
  "age": 25
}
```






### 5.8 `stream` 流
`stream`: [Streaming](https://stedolan.github.io/jq/manual/#Streaming)

当字段嵌套过多时，逐字段查看 `JSON` 数据
```sh
$ cat demo.json
[
  {"name": "shanyue", "age": 24, "friend": {"name": "shuifeng"}},
  {"name": "shuifeng", "age": 25, "friend": {"name": "shanyue"}}
]

$ cat demo.json | jq --stream -c
[[0,"name"],"shanyue"]
[[0,"age"],24]
[[0,"friend","name"],"shuifeng"]
[[0,"friend","name"]]
[[0,"friend"]]
[[1,"name"],"shuifeng"]
[[1,"age"],25]
[[1,"friend","name"],"shanyue"]
[[1,"friend","name"]]
[[1,"friend"]]
[[1]]
```



### 5.9 jq with less （less 上的 jq 应用）

如果 `JSON` 数据过大时，可选择使用 `less` 查看数据，如果在 `less` 中需要语法高亮时，可使用 `jq -C`。

```sh
# -C: --color-output
$ cat demo.json | jq -C '.' | less
```



### 5.10 jq with log （tail 上的 jq 应用）

生产环境的日志往往通过 `JSONL` 格式进行文件存储，通常通过 `tail -f` 实时查看日志

如果只关注某几个重要指标，也可以进行筛选。

```sh
# 实时查看日志
$ tail -f demo.jsonl | jq '.'

# 如果只关注某个参数的话，也可以进行筛选
$ tail -f demo.jsonl | jq '{name}'
```

如果需要测试上面命令，可新开一个 `shell`，输入以下命令进行测试
```sh
# -c: 紧凑输出。 JSONL 只压缩第一行， JSON 所有都压缩成一行
$ cat demo.jsonl | jq -c '.' >> demo.jsonl
```








