
```js
import { useState, useEffect, useRef, useCallback } from 'react';

// 定义useFetch Hook
const useFetch = (url, options = {}) => {
  // 用于存储请求的数据响应
  const [response, setResponse] = useState(null);
  // 用于存储请求的错误信息
  const [error, setError] = useState(null);
  // 用于标识请求的加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 用于中断控制器，以便在组件卸载时取消请求
  const controller = useRef(new AbortController());

  // 用于触发重新获取数据的函数
  const refetch = useCallback(() => {
    fetchData(url, options);
  }, [url, options]);

  // 一旦组件依赖的url或options发生变化，会重新触发数据获取
  useEffect(() => {
    fetchData(url, options);
    // 返回一个清除函数，用于取消请求
    return () => controller.current.abort();
  }, [url, options]);

  // 获取数据的函数
  const fetchData = async (url, options) => {
    setIsLoading(true); // 开始请求时，设置加载状态为true

    try {
      // 设置信号，以便我们可以从fetch中取消请求
      options.signal = controller.current.signal;
      const res = await fetch(url, options); // 执行网络请求
      if (!res.ok) { throw new Error('Network response was not ok'); }
      const data = await res.json(); // 假设接口返回的是JSON数据
      setResponse(data); // 请求成功，设置响应数据
    } catch (error) {
      // 捕获并保存请求过程中出现的错误
      setError(error);
    } finally {
      setIsLoading(false); // 请求结束，设置加载状态为false
    }
  };

  // 如果组件卸载，取消正在进行的请求
  useEffect(() => {
    return () => controller.current.abort();
  }, []);

  // 返回响应数据，错误信息，加载状态和触发重新获取数据的函数
  return { response, error, isLoading, refetch };
};

export default useFetch;

```