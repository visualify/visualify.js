# Configuration

You can configure Visualify by defining `window.$visualify` or `$visualify` as
an object:

```js
<script>
window.$visualify = {
    mode: 'pages',
    // ...
}
</script>
```

Or you can initialize `$visualify` as a **Chart Module**:

```js
<script>
$visualify = {
    mode: 'charts',
}

new $visualify.Recharts({...}).mount('#chart')
new $visualify.LiveEditor({...}).mount('#ex11');
</script>
```

## el

-   Type: `String`
-   Default: `'#root'`

The DOM element to be mounted on initialization. It can be a CSS selector string
or an actual
[HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).

```js
window.$visualify = {
  el: '#root',
};
```

## mode

-   Type: `String`
-   Default: `'pages'`
-   Options: `'pages'`, `'charts'`

The mode of Visualify. If you want to use Visualify as a chart module, you can
set `mode` to `'charts'`.

```js
window.$visualify = {
  mode: 'charts',
};
```

## theme

-   Type: `String`
-   Default: `'modern'`
-   Options: `'modern'`, `'classic'`

The theme of Visualify. The default theme is `'modern'`. Themes usually make
changes to the layout and components of the page. Built-in different themes
provide different typesetting and functions, please choose different themes
according to different needs, you can also replace a single css to change the
style.

```js
window.$visualify = {
  theme: 'modern',
};
```

For more themes, please refer to [Themes](themes.md)

## homepage

-   Type: `String`
-   Default: `'home.json'`

The `home.json` in your docs folder will be treated as the homepage for your
website, but sometimes you may need to serve another file as your homepage.

```js
window.$visualify = {
    homepage: 'home',

    // Or use the json in your repo
    homepage: 'https://raw.githubusercontent.com/leolihao/visualify/master/docs/home.json',
}
```

## repo

-   Type: `String`

Configure the repository url, or a string of `username/repo`, to add the
[GitHub Corner](http://tholman.com/github-corners/) widget in the top right
corner of the site.

```js
window.$docsify = {
  repo: 'https://github.com/visualify',
};
```

## alias

-   Type: `Object`

Set the route alias. You can freely manage `routing` rules. Supports `RegExp`.

```js
window.$visualify = {
  alias: {
    '/docsify': 'https://docsify.js.org/#/configuration?id=alias',
  },
};
```
