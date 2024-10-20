## 解决 HOC（高阶组件）嵌套地狱
当多个 HOC 同时使用时，组件最终可能被多层HOC包裹，形成所谓的“HOC嵌套地狱”。
```js
// 假设这是两个简单的HOC
const withSubscription = Component => props => <Component {...props} />;
const withAuth = Component => props => <Component {...props} />;

// 使用HOC
const EnhancedComponent = withSubscription(withAuth(MyComponent));

```

自定义Hooks可以封装和提取逻辑，避免了通过HOC进行逻辑包裹和传递的需要。
```js
import { useContext, useEffect } from 'react';
import { AuthContext, SubscriptionContext } from './contexts';

const MyComponent = () => {
  const auth = useContext(AuthContext);
  const subscription = useContext(SubscriptionContext);
  useEffect(() => {
    // 订阅逻辑
  }, []);

  return <div>我的组件</div>;
};

```
## 减少`this`关键字的繁琐使用
在类组件中，`this`关键字经常用于访问组件的状态和属性。但容易产生混淆和错误，this指向不明确或者在不同的函数中不一致。
```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    // 必须绑定this
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>增加</button>
      </div>
    );
  }
}
```

在函数组件中使用`useState`和`useEffect`等Hooks，完全避开了`this`关键字的使用，使得状态和副作用的管理更加直观和简洁。
```js
import { useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  );
};

```

## 逻辑复用
在类组件中，复用状态逻辑通常意味着要将逻辑抽离成高阶组件或渲染属性。这样不仅会导致组件层级变深，还会使得组件接口变得复杂。
```js
// 必须通过HOC或者Render Props等方式进行逻辑复用
const withSubscription = Component => class extends React.Component {
  componentDidMount() {
    // 订阅逻辑
  }

  render() {
    return <Component {...this.props} />;
  }
};

```

通过自定义Hooks，开发者可以把组件之间的共享逻辑抽象出来，且保持组件层的扁平化。
```js
import { useEffect } from 'react';

// 自定义Hook
const useSubscription = () => {
  useEffect(() => {
    // 订阅逻辑
    return () => {
      // 清理逻辑
    };
  }, []);
};

// 在组件中使用
const MyComponent = () => {
  useSubscription();

  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};

```

