# Quick start

It is highly recommended to use `Docisfy` as a document framework and imports
`visualify` to quickly present various diagrams.

Insert the `visualify` script in your `index.html` file.

```html
<head>
  ...
  <script src="https://cdn.jsdelivr.net/npm/visualifyjs"></script>
  
  <!-- or -->
          <!-- <script src="https://visualify.pharmacy.arizona.edu/dist/visualify.js"></script -->
  <!-- or -->
      <!-- script src="https://cdn.jsdelivr.net/gh/visualify/visualify.js@release/dist/visualify.js"></script> -->
</head>
```

Or install `visualify.cli` globally, which helps initializing and previewing the
website locally.

```bash
npm i visualify.cli -g
```

## Initialize

If you want to write the documentation in the `./docs` subdirectory, you can use
the `init` command.

```bash
visualify init ./docs
```

or simply run `visualify init`

```bash
visualify init
```

or anywhere you like.

```bash
visualify init <path>
```

## Writing content

After the `init` is complete, you can see the file list in the `./docs`
subdirectory.

-   `index.html` as the entry file
-   `home.jsom` as the home page
-   `.nojekyll` prevents GitHub Pages from ignoring files that begin with an
    underscore

You can easily update the documentation in `./docs/home.json`, of course you can
add [more pages](more-pages.md).

## Preview your site

Run the local server with `visualify serve <docs-path>`. You can preview your
site in your browser on `http://localhost:3000`.

```bash
visualify serve docs
```

?> For more use cases of `visualify.cli`, head over to the
[CLI documentation](CLI.md).

## Manual initialization

If you don't like `npm` or have trouble installing the tool, you can manually
create `index.html`:

```html
<!-- index.html -->

<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      $visualify = {
        //...
      };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/visualifyjs"></script>
    <!-- or -->
      <!-- <script src="https://visualify.pharmacy.arizona.edu/dist/visualify.js"></script> -->
    <!-- or -->
      <!-- script src="https://cdn.jsdelivr.net/gh/visualify/visualify.js@release/dist/visualify.js"></script> -->
  </body>
</html>

```

### Manually preview your site

If you have `Node.js` installed on your system, you can easily use it to run a
static server to preview your site.

```bash
# install corresponding dependencies
npm install -g serve
serve -s ./docs
```

If you have Python installed on your system, you can easily use it to run a
static server to preview your site.

```python2
cd docs && python -m SimpleHTTPServer 3000
```

```python3
cd docs && python -m http.server 3000
```
