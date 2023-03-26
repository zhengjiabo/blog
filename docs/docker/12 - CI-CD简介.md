---
title: docker - 12 | CI/CD简介
date: 2022-09-19
tags:
 - docker
categories: 
 - docker
---
 



## 总结





## 疑问







## 提问
- [x] 请讲述几条主分支保护策略
1. 主分支禁止 `PUSH`，代码必须经过 `PR` 合并到主分支
2. 分支必须等待 CI 成功才能合并到主分支
3. 代码必须多个人同意，必须经过 `Code Review` 才能合并到主分支 


- [x] 什么是 CI/CD
- CI：持续集成。目的是提高代码质量，只允许正常的代码被合并到主分支。速度快，注重反馈速度（错误反馈给开发人员）。会进行对于级别的自动化测试，语法校验，npm 库风险审计，构建部署当前分支。需要权衡好反馈速度和校验完整性。
- CD：持续交付、持续部署。目的是彻底检查代码以发现问题代码，减少代码问题以节省测试人员的时间。注重检查完整性，常以测试代的代码覆盖率或功能覆盖率来衡量。持续部署的检查很值得推荐，但检查后自动部署在大部分场景下并不是个好方案，大部分场景下还是需要手动部署，人为去把控发布节点。

- [ ] 自建 Github Actions Runner 并完成自动部署






  
## 1. 前提提要、场景
前面的部署流程，还停留在手动部署阶段，需要将部署进行自动化：     
**每当我们将前端代码更新并 PUSH 到仓库后，CI/CD 将会拉取仓库代码并自动部署到服务器**     

![](../assets/1s7.png)



## 2. CI/CD
- CI：Continuous Integration，持续集成。目的：提高代码的质量，只允许正常的代码被合并到主分支。CI速度快，注重发现错误并反馈给开发人员的速度。是【错误反馈速度】与【执行的检查完整性】之间的权衡。且只有通过自动化测试、Code Review 后才能合并到主分支。
- CD：Continuous Deployment，持续交付、持续部署。(或者 Continuous Delivery，持续交付)。速度相对慢，注重检查完整性。目的：进行彻底检查以发现代码问题。通常以测试的代码覆盖率或功能覆盖率来衡量。持续交付给质量团队或者用户，以供评审。并尽早发现错误可以防止将坏代码部署到任何环境，节省测试团队验证的宝贵时间。

CI/CD不过是一套机制，并没有固定的落地规范，没必要过于纠结。每个团队面临的开发情况都不一样，选择最合适自己的方案才是最重要的。只需记得 CI/CD 是一个流程，用于实现应用开发中的高度持续自动化和持续监控。              

本地 `eslint` 是基于 `git hooks`，在本地运行。而 `CI/CD` 相当于服务端的 `git hooks`，与 `git` 集成在一起，在服务端运行。      

- 构建服务器：进行 CI 构建的服务器，一般用以构建、测试和部署，构建镜像以及自动部署服务。也可以是 Docker 容器。
- 部署服务器：对外提供服务的服务器，容器在该服务器中构建并启动。


为了更好的 CI/CD，构建服务器会赋予控制部署服务集群的权限，在构建服务器中通过一条命令，即可将某个服务在部署服务器集群中进行部署。


在 CI/CD 中，构建服务器往往会做以下工作
1. 功能分支提交后，通过 CI/CD 进行自动化测试、语法检查、npm 库风险审计等前端质量保障工程，如未通过 CI/CD，则无法 Code Review，更无法合并到主分支进行上线
2. 功能分支提交后，通过 CI/CD 对当前分支代码构建独立镜像，并生成独立的分支环境地址进行测试。如对每一个功能分支生成一个可供测试的地址，一般是 `<branch>.dev.demo.com`。
3. 功能分支测试通过后，合并到主分支，自动构建镜像并部署到生成环境中 (一般生成环境需要手动触发、自动部署)


### 2.1 CI/CD 的设计
- 长时间 或 价值不大的测试移至 CD 步骤：确保 CI 运行时间短，最多 3 ~ 7 分钟，开发者也会有意识的等待时间点取得结果，避免开启下一个功能后需要切换上下文，打断开发节奏降低生产力。
- 需要不同级别的自动化测试：为了确保 CI 运行时间短，便不能为每个合并运行所有测试，因为需要花费大量时间。并且大多数测试在该合并请求上毫无意义。例如 非公共层代码变动，无需测试公共层。





## 3. CI/CD 工具与产品
- [Gitlab CI](https://docs.gitlab.com/ee/ci/quick_start/)
- [Github Actions](https://docs.github.com/cn/actions/using-workflows/workflow-syntax-for-github-actions)
- [Jenkins](https://www.jenkins.io/zh/doc/pipeline/tour/getting-started/)

国内公司一般以 `Gitlab CI` 作为 CI/CD 工具，此时需要自建 `Gitlab Runner` 作为构建服务器。

CI/CD 的基本术语
- Runner：用来执行 CI/CD 的构建服务器
- workflow/pipeline：CI/CD 的工作流。(在大部分 CI，如 Gitlab、Jenkins 中为 Pipeline，而 Github 中为 Workflow，二者略有不同)
- job/stages：任务，比如构建，测试和部署。每个 workflow/pipeline 由多个 job/stages 组成
- steps/stage：任务每一步做什么




## 4. 基本功能
每当我们将前端代码更新并 `PUSH` 到仓库后，CI/CD 将会拉取仓库代码并自动部署到服务器。        
可以将该功能拆分成两部分，监听事件以及触发对应命令
1. 事件: push
1. 命令: 前端部署


### 4.1 事件: on push
第一个要做的就是监听事件 `on: push`

在 `Github Actions` 中
```yaml
# 仅仅当 master 代码发生变更时，用以自动化部署
on:
  push:
    branches:    # 指定监听事件分支
      - master

# 仅当 feature/** 分支发生变更时，进行 Preview 功能分支部署 (见 Preview 篇)
on:
  push:
    branches:    
      - 'feature/**' # 可正则

# 仅当提交 PR 及提交后 feature/** 分支发生变更时，进行 Preview 功能分支部署 (见 Preview 篇)
on:
  pull_request: # 合并请求
    types:  # 合并请求类型
      # 当新建了一个 PR 时
      - opened          
      # 当提交 PR 的分支，未合并前并拥有新的 Commit 时
      - synchronize       
    branches:    
      - main

# 在每天凌晨 0:30 处理一些事情，比如清理多余的 OSS 资源，清理多余的功能分支 Preview (见 Preview 篇)
on:
  schedule: # 定时器
    - cron:  '30 8 * * *' # cron 定时器格式
```

在 `Gitlab CI ` 中 
```yaml
# 仅仅当 master 代码发生变更时，用以自动化部署
rules:
  - if: $CI_COMMIT_REF_NAME = "master"

# 仅当 feature/** 分支发生变更时，进行 Preview 功能分支部署 (见 Preview 篇)
rules:
  - if: $CI_COMMIT_REF_NAME =~ /feature/ # 正则

rules:
  - if: $CI_PIPELINE_SOURCE == "merge_request_event" # 合并请求
```


### 4.2 命令: Job 与脚本
上面以及有触发钩子了，接下来就是响应的命名，即触发事件。如果使用 `docker`，则是拉取最新代码后调用 `docker-compose up -d`


在 `Github Actions` 中
```yaml
name: push

on: [push]

jobs:
  test:
    # 将代码跑在 ubuntu 上
    runs-on: ubuntu-latest
    steps:
      # 切出代码，使用该 Action 将可以拉取最新代码
      - uses: actions/checkout@v2

      # 运行部署的脚本命令
      - run: docker-compose up -d
```




## 5. CI/CD 的主分支保护规则
CI/CD 进行自动化集成交付部署，但主分支的保护规则还需要手动设置。
1. 主分支禁止 `PUSH`，代码必须经过 `PR` 合并到主分支
2. 分支必须等待 CI 成功才能合并到主分支
3. 代码必须多个人同意才能合并到主分支，代码必须经过 `Code Review` (关于该 PR 下的所有 Review 必须解决)

具体文档
- [Github: Managing a branch protection rule](https://docs.github.com/cn/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)：必须 PR、多人审批等
- [Gitlab: Merge request approvals ALL TIERS](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)：Gitlab 的合并请求相关配置
- [Gitlab: Merge when pipeline succeeds](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)：合并成功删除原分支
- [Merge request approval rules](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/rules.html)：必须PR、多人审批等设置。（收费功能）





## 6. 使用 CI/CD 进行自动部署
如果使用 `docker` 手动部署，只需要执行 `docker-compose up --build`。         
当使用 CI/CD 结合 `docker` 部署前端，在规模上有所区别，规模大些可以使用 `kubernetes`，


### 6.1 简单连接部署
如果只是拥有构建服务器、部署服务器，且没有借助其他服务器集群管理的技术产品。在【构建服务器】中需要通过 `ssh` 连接【部署服务器】                   
由于构建服务器无部署服务器管理集群应用的能力与权限 (kubernetes 拥有这种能力)。如果部署到服务器，只能简单粗暴地通过 ssh 进入服务器并拉取代码执行命令。以下
`Github Actions` 案例。    
在【构建服务器】中操作【部署服务器】部署的简单 demo，直接连接后更新代码，最后执行部署命令。
```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    - |
      ssh root@shanyue.tech "
        # 假设该仓库位于 ~/Documents 目录
        cd ~/Documents/cra-deploy

        # 拉取最新代码
        get fetch origin master
        git reset --hard origin/master

        # 部署
        docker-compose up --build -d
      "
```


### 6.2 构建服务器、部署服务器同一台
虽然企业内部一般都是构建服务器和部署服务器分开的，但构建服务器、部署服务器是同一台服务器的话，对个人开发而言会省事，因为不用 ssh 去连接了。          
自建 Runner：`Github Actions` 允许在自有服务器中自建 Runner    
- [Github Actions: Adding self hosted runners](https://docs.github.com/cn/actions/hosting-your-own-runners/adding-self-hosted-runners)
```yaml
production:
  # 该 JOB 在自建 Runner 中进行运行
  runs-on: self-hosted
  steps:
    # 切出代码，使用该 Action 将可以拉取最新代码
    - uses: actions/checkout@v2
    - run: docker-compose up --build -d
```

而在真实的工作环境中，部署更为复杂，往往通过一些封装的命令来完成，分为三步:
1. 构建镜像
2. 推送镜像到自建的镜像仓库
3. 将镜像仓库中的镜像拉取到部署服务器进行部署 (使用 `kubectl`，在构建服务器，有部署服务器管理集群应用的能力与权限)

伪代码如下
```yaml
production:
  # 该 JOB 在自建 Runner 中进行运行
  runs-on: self-hosted
  steps:
    # 构建镜像
    - docker build -t cra-deploy-app .
    # 推送镜像
    - docker push cra-deploy-app
    # 拉取镜像并部署，deploy 为一个伪代码命令，在实际项目中可使用 helm、kubectl
    - deploy cra-deploy-app .

    # 或者通过 kubectl 进行部署
    # - kubectl apply -f app.yaml

    # 或者通过 helm 进行部署
    # - helm install cra-app cra-app-chart
```





## 遗留





