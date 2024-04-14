## Provider 链上查询操作

### 可读操作
 `ehters.js` 内置的公共 `RPC`、或者自己申请的 `RPC` 新建 `provider`
```js
	/* 个人 RPC */
	const ALCHEMY_MAINNET_URL = '...'
	const provider = new ethers.JsonRpcProvider (ALCHEMY_MAINNET_URL)
	
	/* ethers 内置公共 RPC */
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

### Signer 可写操作

在非对称加密中，私钥不会公开，而是用来生成数字签名（`Signer`）。这个签名随信息一起发送，用来以证明信息的来源及其完整性。公钥则被公开，使任何人都可以验证这个签名，以确认信息确实是由私钥持有者发送的，并且内容未被篡改。

```js
const browserProvider = new BrowserProvider(ethereum: [Eip1193Provider], network?: [Networkish])
// new ethers.BrowserProvider(window.ethereum)

const signer = browserProvider.getSigner(address?: number | string)⇒ Promise< JsonRpcSigner>	  
```

在 `ethers.js` 中，`Wallet` 类继承了 `Signer` 类，一般用 `Wallet` 对交易和消息进行签名。

## Wallet 钱包

在 `ethers.js` 中，`Wallet` 类继承了 `Signer` 类，一般用 `Wallet` 对交易和消息进行签名。
[![](../assets/20240414-07-12-53.png)]( https://docs.ethers.org/v6/api/wallet/#BaseWallet )
```js
/* 提供私钥、provider */
const wallet = new Wallet(privateKey: SigningKey, provider?: null | Provider)

/* 仅提供私钥，后续通过 connect 连接 Provider */
const wallet2 = new Wallet(privateKey: SigningKey)
wallet2.connect(provider) // connect 继承子 Signer
```





###  对交易进行签名

```js
	// 利用私钥和provider创建wallet对象
	const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
	const wallet = new ethers.Wallet(privateKey, provider)
	
	const address = '0xeBf9372997A1d7a14f4aDD0a80452B661b67a3f4'
	const tx = {
		to: address,
		value: ethers.parseEther("0.001")
	}
	// 发送交易，获得交易响应
	const tx = await wallet.sendTransaction(tx)
	const receipt = await tx.wait() // 等待链上确认交易，获得收据
```


### 对消息进行签名，确认用户拥有某地址

```js
	/* 客户端 */
	// Our signer; Signing(签署) messages does not require a Provider 
	wallet = new Wallet(privateKey) 
	// Wallet { 
		// address: '0xC08B5542D177ac6686946920409741463a15dDdB', 
		// provider: null 
	// }
	message = "sign into ethers.org?" // Signing(签署) the message 
	sig = await wallet.signMessage(message); 
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

查询合约相关信息
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