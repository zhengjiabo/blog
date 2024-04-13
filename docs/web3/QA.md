
1. 为什么以太坊不能像比特币一样用一个 merkle tree？
以太坊有智能合约，单纯的交易树无法满足。

2. ETH 的数据结构是怎么设计出来的？    
MPT：因为状态树需要 MPT，三棵树统一。
- 哈希表，需要验证，借助了 MT，由哈希表生成 MT。代价太大了。淘汰
- MT 存储：


Merkle Tree 和 Merkle Patricia Tree 的联系是什么？  
为什么 ETH 使用 Merkle Patricia Tree 而非不排序的 Merkle Tree？
地址空间是 2 的 160 次方为什么要搞得这么稀疏？
Sorted Merkle tree，Binary tree 和 merkle tree 以及 Merkle Patricia Tree 有什么关联性？
Merkle tree 和 binary tree （二叉树）有什么区别？
Merkle Proof 这个树能证明什么？
MPT 为什么要保留历史状态呢？为什么不在原地直接改了？
MPT 怎么实现回滚呢？
Parent Hash 和 Uncle Hash 都是在块头里面吗？它们的区别是什么？
MPT 是键值对，存储过程是怎样的，它怎样的工作原理？
Beneficiary 与 Coinbase 都是接收钱的地址，有什么区别？
Bloom 的工作原理跟 MPT 的联系是？
Mixdigest 跟 nonce 有什么联系？
MPT 和 PT 有什么区别？
状态树保存的是 key value pair，跟 RLP 有什么关联性？
Nested array of bytes 和  protocal buffer 的相关性是什么？
以太坊中三个树的工作原理是什么？它们是怎么共同工作的？
128 倍的向量跟 bloom filter 有什么关系？
为什么说以太坊的运行过程可以把它看作是一个交易驱动的状态机？
视频中讲状态树和交易树、收据树的一个区别是状态树要包含系统中所有账户的状态，无论这些账户是否参与了当前区块中的交易，那么能不能把这个状态树的设计改一下？改成每个区块的状态树也只包含这个区块中的交易相关的那些账户的状态，问题太长，不知道表达什么？
以太坊的智能合约与比特币的脚本系统相比，有哪些显著的优势和潜在的风险？
以太坊最初使用的工作量证明（PoW）机制为何要切换到权益证明（PoS）机制？
以太坊切换到权益证明机制的主要驱动力是什么？
以太坊历史上的重大分叉事件是如何影响其网络安全和代币价值的？
以太坊的扩展性问题目前的主要解决方案有哪些？分层解决方案（如侧链、状态通道等）对网络的影响如何？
高昂的交易费用对以太坊用户有何影响？这如何影响小额交易或新用户的参与？