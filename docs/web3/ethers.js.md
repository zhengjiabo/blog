## Provider 链上查询操作

 `ehters.js` 内置的公共 `RPC`、或者自己申请的 `RPC` 新建 `provider`
```js
const ALCHEMY_MAINNET_URL = '...'
const provider = new ethers.JsonRpcProvider (ALCHEMY_MAINNET_URL)
const providerDefault = ethers.GetDefaultProvider ();
```

链上查询操作
```js
    /* 1. 查询链 */
    const network = await provider.getNetwork();
    console.log(`Current network: `, network.toJSON());
	
    /* 2. 查询区块高度 */
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
    // 3. 查询区块信息
    const block = await provider.getBlock(blockNumber)
     console.log(`Block information: `, block);

    // 4. 给定合约地址查询合约bytecode，例子用的WETH地址
    const code = await provider.getCode(`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`);
    console.log(`WETH contract bytecode: `, code);
    
	/* 5. 查询 vitalik 钱包余额 */
    const balance = await provider.getBalance(`vitalik.eth`);
    console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`);
	
	// 6. 查询 vitalik 钱包历史交易次数
    const transactionCount = await provider.getTransactionCount(`vitalik.eth`);
    console.log(`Transaction count of vitalik: ${transactionCount}`);

    // 7. 查询当前建议的gas设置 feeData
    const feeData = await provider.getFeeData();
    console.log(`Current suggested fee data: `, feeData);
```


## Wallet 钱包

Web 3 中，私钥一般存放在本地 `Wallet` 中

## Signer

在非对称加密中，私钥不会公开，而是用来生成数字签名（`Signer`）。这个签名随信息一起发送，用来以证明信息的来源及其完整性。公钥则被公开，使任何人都可以验证这个签名，以确认信息确实是由私钥持有者发送的，并且内容未被篡改。

在 `ethers.js` 中，可以用 `Wallet` 产出 `signer`

###  场景一 进行链上可写交互



### 场景二 确认用户拥有某地址

```js
/* 客户端 */
// Our signer; Signing(签署) messages does not require a Provider 
signer = new Wallet(privateKey) 
// Wallet { 
	// address: '0xC08B5542D177ac6686946920409741463a15dDdB', 
	// provider: null 
// }
message = "sign into ethers.org?" // Signing(签署) the message 
sig = await signer.signMessage(message); 
// '0xefc6e1d2f21bb22b1013d05ecf1f06fd73cdcb34388111e4deec58605f3667061783be1297d8e3bee955d5b583bac7b26789b4a4c12042d59799ca75d98d23a51c' 

/* 服务端 */
// Validating a message; notice the address matches the signer 
// 校验信息成功，将会返回签名者的地址 
verifyMessage(message, sig) 
// '0xC08B5542D177ac6686946920409741463a15dDdB'
```


## Contract 合约

利用 `provider`（可读）、 `signer`（可读可写） 新建合约
```js
    const abiERC20 = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint)",
    ];
    const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI Contract
    const contractDAI = new ethers.Contract(addressDAI, abiERC20, provider)
```

可以查询合约相关信息
```js
    const nameDAI = await contractDAI.name() // 合约名称
    const symbolDAI = await contractDAI.symbol() // 合约唯一代号
	const totalSupplDAI = await contractDAI.totalSupply() //总供给
    console.log("\n2. 读取DAI合约信息")
    console.log(`合约地址: ${addressDAI}`)
    console.log(`名称: ${nameDAI}`)
    console.log(`代号: ${symbolDAI}`)
    console.log(`总供给: ${ethers.formatEther(totalSupplDAI)}`)
    const balanceDAI = await contractDAI.balanceOf('vitalik.eth') // 某人在合约内持仓
    console.log(`Vitalik持仓: ${ethers.formatEther(balanceDAI)}\n`)
```