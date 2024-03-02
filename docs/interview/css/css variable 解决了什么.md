
## 减少样式重复定义

```css
:root { 
	--bgcolor: blue; 
	--color: red;
}
p { 
	color: var(--color);
}
div { 
	backgroung-color: var(--bgcolor); 
	color: var(--color)
}
```


## CSS 变量可以通过 JavaScript 动态更改
```js
document.documentElement.style.setProperty('--main-color', '#ff488c');
```

```css
:root {
	--main-color: #488cff;
}

.element {
	background-color: var(--main-color);
}

```