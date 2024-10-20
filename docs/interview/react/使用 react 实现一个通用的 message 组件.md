
```js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // 类型检查
import classNames from 'classnames';
import './Message.css'; // 假设的CSS文件

// Message组件
const Message = ({ type = 'info', text, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  // 组件挂载后开始自动关闭的计时器
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if(onClose) onClose(); // 调用关闭回调
      }, duration);
      return () => clearTimeout(timer); // 清理计时器
    }
  }, [duration, onClose]);

  // 如果visible为false，则不渲染组件
  if (!visible) return null;

  // 根据type生成类名
  const messageClass = classNames('message', {
    'message-info': type === 'info',
    'message-success': type === 'success',
    'message-warn': type === 'warn',
    'message-error': type === 'error',
  });

  return (
    <div className={messageClass}>
      <span className="message-text">{text}</span>
    </div>
  );
};

// 定义props的类型检查
Message.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warn', 'error']),
  text: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

export default Message;

```

Used
```js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Message from './Message';

const App = () => {
  const [showMessage, setShowMessage] = useState(false);

  const closeMessage = () => setShowMessage(false);

  return (
    <div>
      <button onClick={() => setShowMessage(true)}>显示Message</button>
      {showMessage && <Message type="info" text="这是一个提示信息" duration={3000} onClose={closeMessage} />}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

```

