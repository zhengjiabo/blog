
如果在子组件的构造函数中抛出错误时，React 将停止渲染流程，并立即尝试渲染最近的 ErrorBoundary。可以用来避免白屏，提供缺省 UI 和错误处理逻辑。

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志发送至服务器
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 可以自定义错误的UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}
```
