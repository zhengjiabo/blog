

1. `cloneElement`，基于一个已存在的 React 元素创建一个新的React 元素、并进行修改。
2. `createElement`，根据 Type 创建一个全新的 React 元素。 （Type： 字符串、一个函数、一个类或React节点） 

原因：在React中，元素是 immutable，意味着一旦创建就不能被修改。如果你想要修改一个元素，你需要创建一个该元素的一个拷贝，并在拷贝上进行所需的修改。


