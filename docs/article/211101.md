---
title: git revert、git restore 和 git reset
date: 2021-11-01
tags:
 - Git     
categories: 
 - article
---

## 1. 学前疑问
1. git revert、git restore 和 git reset的区别
2. 各自的应用场景是什么





## 2. 初步了解
通过翻阅 **Git官方文档**[<sup id="$1">1</sup>](#1)    
>There are three commands with similar names: git reset, git restore and git revert.       
git-revert: is about making a new commit that reverts the changes made by other commits.    
git-restore: is about restoring files in the working tree from either the index or another commit. This command does not update your branch. The command can also be used to restore files in the index from another commit.    
git-reset: is about updating your branch, moving the tip in order to add or remove commits from the branch. This operation changes the commit history.    
git reset can also be used to restore the index, overlapping with git restore.
  
从定义上可以得知
- git revert：  创建一个新提交，**恢复**其他**提交**的更改
- git restore： **恢复**某个索引下的**文件**
- git reset：   **重置**到某个历史**索引**


## 3. 应用场景
### 3.1 git revert
在版本迭代时，有部分功能因特殊原因无法上线，可以将无法上线的功能的合并请求给去除，即恢复这些提交的更改。    
重点：针对整个合并


### 3.2 git restore
产品进行多个细碎的需求变更，开发完了提交合并release分支后，产品反水说部分文件的变更不改了。    
重点：同个commit的部分文件还原，即针对文件，不是整个合并都恢复或重置。


### 3.3 git reset
版本迭代时，本次上线的代码被污染，很多无效代码被合并进来，需要重置到上个迭代版本。



## 总结






## 课后疑问





## 参考资料
- <span id="1"></span>[1] [Git官方文档：https://git-scm.com/docs/git](https://git-scm.com/docs/git) ===> [back](#$1)



