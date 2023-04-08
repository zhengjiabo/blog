
1. 安装 Cypress     `npm install cypress --save-dev`
2. 打开 Cypress 的控制台  `npx cypress open`
3. 创建脚本 
![](../assets/20230408173804.png)

```js
describe('Login', () => { // 定义一个测试套件，名称为“Login”
  it('should login successfully', () => { // 定义一个测试用例，名称为“should login successfully”
    cy.visit('https://web.xxxx.cn/login') // 访问指定的URL
    cy.get('#phone').type('13000000000') // 获取手机号输入框元素，并输入指定的手机号码
    cy.get('#password').type('Blacklake123') // 获取密码输入框元素，并输入指定的密码
    cy.get('.ant-btn').click() // 获取登录按钮元素，并模拟鼠标点击操作
    cy.url().should('include', '/cooperate') // 检查当前页面的URL是否包含指定的字符串
  })
})
```

4. 执行脚本，在 Cypress 控制台点击脚本便会执行
![](../assets/20230408174139.png)

