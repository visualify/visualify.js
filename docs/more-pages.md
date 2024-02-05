# More pages

If you need more pages, you can simply create more `json` configuration files in
your visualify directory. If you create a file named `scatter`, then it is
accessible via `/scatter`.

For example, the directory structure is as follows:

```text
.
└── docs
    ├── index.html
    ├── scatter.json
    └── honme.json
```

Matching routes

```text
docs/home.json        => http://domain.com
                      => http://domain.com/home
docs/scatter.json     => http://domain.com/scatter
```
