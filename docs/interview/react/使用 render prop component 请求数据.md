## Class
```js
import React, { Component } from 'react';

// 定义一个通用的数据获取组件，它通过render prop来提供数据获取功能
class DataFetcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, // 存储获取到的数据
      isLoading: true, // 标识是否正在获取数据
      error: null, // 存储错误信息（如果有）
    };
  }

  // 组件挂载后进行数据获取
  componentDidMount() {
    this.fetchData()
      .then(data => this.setState({ data, isLoading: false }))
      .catch(error => this.setState({ error, isLoading: false }));
  }

  // 模拟一个数据获取的方法
  fetchData = () => {
    // 假设使用Promise模拟异步操作，实际中这里会是如fetch()这样的API调用
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = { message: "这是获取到的数据" };
        // 模拟可能出现的错误
        if (Math.random() > 0.8) {
          reject("数据获取失败");
        } else {
          resolve(data);
        }
      }, 1000);
    });
  };

  render() {
    // 从props中获取render prop函数
    const { render } = this.props;
    const { data, isLoading, error } = this.state;

    // 使用render prop，将数据、状态和必要的函数通过children传递
    return render({
      data,
      isLoading,
      error,
      refetch: this.fetchData, // 提供一个重新获取数据的方法
    });
  }
}

// 使用DataFetcher的例子
const App = () => (
  <div>
    <h1>使用Render Prop获取数据示例</h1>
    <DataFetcher
      // 传递render prop函数
      render={({ data, isLoading, error, refetch }) => (
        <div>
          {isLoading ? (
            <p>加载中...</p>
          ) : error ? (
            <p onClick={() => refetch()}>数据获取失败，点击重试</p>
          ) : (
            <div>
              <p>{data.message}</p>
            </div>
          )}
        </div>
      )}
    />
  </div>
);

export default App;

```

## 函数组件 + Hooks
```js
import React, { useState, useEffect } from 'react';

// 使用函数组件和Hooks改写的DataFetcher
const DataFetcher = ({ render }) => {
  const [data, setData] = useState(null); // 用于存储获取到的数据
  const [isLoading, setIsLoading] = useState(true); // 标识是否正在获取数据
  const [error, setError] = useState(null); // 存储错误信息（如果有）

  // 使用useEffect替代componentDidMount进行数据获取
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data'); // 模拟数据获取
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // 空依赖数组意味着这个effect仅在组件挂载时运行一次

  // 使用render prop传递数据和状态
  return render({ data, isLoading, error, refetch: fetchData });
};

// 使用DataFetcher的例子
const App = () => (
  <div>
    <h1>使用Render Prop获取数据示例</h1>
    <DataFetcher
      render={({ data, isLoading, error, refetch }) => (
        <div>
          {isLoading ? (
            <p>加载中...</p>
          ) : error ? (
            <p onClick={() => refetch()}>数据获取失败，点击重试</p>
          ) : (
            <div>
              <p>{data.message}</p>
            </div>
          )}
        </div>
      )}
    />
  </div>
);

export default App;

```