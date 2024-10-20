使用 `Portals` 提供了一种脱离 `#app` 的组件，适合脱离文档流(out of flow) 的组件，特别是 `position: absolute` 与 `position: fixed` 的组件。比如模态框，通知，警告，goTop 等。

```html
<html>
  <body>
    <div id="app"></div>
    <div id="modal"></div>
    <div id="gotop"></div>
    <div id="alert"></div>
  </body>
</html>
```
```js
const modalRoot = document.getElementById("modal");
 
class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement("div");
  }
 
  componentDidMount() {
    modalRoot.appendChild(this.el);
  }
 
  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }
 
  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}
```