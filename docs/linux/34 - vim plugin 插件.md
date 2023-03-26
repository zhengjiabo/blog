---
title: vim plugin 插件 
date: 2022-11-20
tags:
 - linux
categories: 
 - linux
---


## 总结
- 插件用来提高开发的效率，提供很多便捷的功能
- 利用 `pathogen` 来管理插件，将后续插件都放到其文件夹内
- 在 `.vimrc` 中设置快捷键，协调好各个插件的快捷键，避免冲突。  





<!-- ## 提问
- [x]  -->





## 1. 前提提要、场景

通过之前的章节，已经可以使用 `vim` 进行编写文件了。但距离真正的开发还差了些便捷，可以装些插件来提高开发效率。



## 2. pathogen 管理插件 

[pathogen github](https://github.com/tpope/vim-pathogen)    

新建文件夹，并将后续插件都放于该文件夹中。
```sh
$ mkdir -p ~/.vim-config/plugins && \
curl -LSso ~/.vim-config/plugins https://tpo.pe/pathogen.vim
```

配置 `vim` 插件路径为 `~/.vim-config/plugins/`，后续将插件下载在该目录。由于是自定义目录，不是 `vim-pathogen` 默认的目录，所以根据 `github` 上的说明。

在 `.vimrc` 中配置
```sh
" 配置 runtimepath
source ~/.vim-config/plugins/vim-pathogen/pathogen.vim

execute pathogen#infect('plugins/{}', '~/.vim-config/plugins/{}')
execute pathogen#helptags()
```


## 3. nerdtree 文件目录管理器

[nerdtree github](https://github.com/preservim/nerdtree)    
文件目录管理器，跟 vscode 的目录一样。      

将插件下载到上一步设置的自定义目录 `~/.vim-config/plugins/nerdtree` 中
```sh
# depth：1 只保留最近一次 commit 记录，轻量级 clone
$ git clone --depth=1 https://github.com/preservim/nerdtree.git ~/.vim-config/plugins/nerdtree
```

在 `.vimrc` 中配置
```sh
syntax on
filetype plugin indent on
```

随后使用 `vim` 打开任意文件，键入 `:NERDTree<CR>`，`<CR>` 为回车，便能看到以下界面

![](../assets/1s28.png)

也可以设置快捷键，在 `.vimrc` 中配置
```sh
nnoremap <leader>n :NERDTreeFocus<CR>
nnoremap <C-n> :NERDTree<CR>
nnoremap <C-t> :NERDTreeToggle<CR>
nnoremap <C-f> :NERDTreeFind<CR> " 定位当前文件的位置
```
在文件管理窗口
- `ma`: 新建文件或文件夹
- `md`: 删除文件或文件夹
- `I`: 切换隐藏文件显示状态
- `i`: 打开文件，水平面板打开
- `s`: 打开文件，垂直面板打开



## 4. ctrlp 文件搜索

[ctrlp github](https://github.com/ctrlpvim/ctrlp.vim)    
文件搜索，类似于 vscode 的 `ctrl + p`


将插件下载到上一步设置的自定义目录 `~/.vim-config/plugins/ctrlp` 中
```sh
# depth：1 只保留最近一次 commit 记录，轻量级 clone
$ git clone --depth=1 https://github.com/ctrlpvim/ctrlp.vim.git  ~/.vim-config/plugins/ctrlp
```


在 `.vimrc` 中配置
```sh
" ctrlp
let g:ctrlp_map = '<c-p>'
let g:ctrlp_cmd = 'CtrlP'
let g:ctrlp_working_path_mode = 'ra'
let g:ctrlp_root_markers = ['pom.xml', '.p4ignore']
set wildignore+=*/tmp/*,*.so,*.swp,*.zip     " MacOSX/Linux
let g:ctrlp_custom_ignore = '\v[\/]\.(git|hg|svn)$'
let g:ctrlp_user_command = 'find %s -type f'        " MacOSX/Linux
let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files -co --exclude-standard']
```
`ctrlp`，类似于 vscode 的 `<Ctrl-p>`
- `<c-p>`: 在当前项目下查找文件
- `,b`: 在buffer中查找文件
- `,f`: 在最近打开文件中查找     

在 `ctrlp` 窗口中，`<c-j>` 和 `<c-k>` 控制上下移动。


## 5. 备注
由于目前只用 vscode 的 vim 插件，还未涉及开发迁移到 linux 的 vim，且短期内没这个打算，所以暂不继续配置插件了。       
后续插件未尝试，如果需要配置可以看 GitHub 上的说明。

基本思路：都是扔到 `pathogen` 的插件目录里，且配置相关快捷键，多个插件协调好快捷键避免冲突


## 5. ag.vim

[ag.vim github](https://github.com/rking/ag.vim)    
查找关键字，类似于 `sublime` 的 `Command + Shift + f`
- `Ag key *.js` 在特定文件下查找关键字
> Tip：首先需要安装 `Ag` 命令，即 [ the_silver_searcher ](https://github.com/ggreer/the_silver_searcher)



## 6. vim-commentary

[vim-commentary github](https://github.com/tpope/vim-commentary)    
注释命令
- `:gcc` 注释当前行，类似于 `sublime` 的 `<c-/>`

## 7. vim-fugitive

[vim-fugitive github](https://github.com/tpope/vim-fugitive)    
git扩展
- `:Gblame` 查看当前行的归属
- `:Gdiff` 查看与工作区文件的差异
- `:Gread` 相当于 `git checkout -- file`
- `:Gwrite` 相当于 `git add file`


## 8. emmet-vim

[emmet-vim github](https://github.com/tpope/vim-fugitive)    
- `<c-y>`, 类似于 `sublime` 的 `<c-e>`


## 9. delimitMate

[delimitMate github](https://github.com/Raimondi/delimitMate)    
括号，引号自动补全。



## 10. vim-colors-solarized

[vim-colors-solarized github](https://github.com/altercation/vim-colors-solarized)    
可更改配置文件中 `background` 为 `dark` 和 `light` 切换主题
