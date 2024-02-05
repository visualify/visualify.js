## Visualify

> The magical data portal generator
>
> Best mate for [Docsify](https://docsify.js.org/) to be deployed on GitHub
> Pages

## What it is

Visualify takes the complexity out of generating data portal websites, which is
inspired by [docsify](https://docsify.js.org/). Forget about manually writing
React components or generating static HTML files. Visualify smartly loads and
parses your configuration and data API, allowing you to provide the information
directly in a JavaScript file. The result? Your data is beautifully displayed
and visualized as a website, all with minimal effort on your part.

To get started, simply create an `index.html` file and deploy it on GitHub Pages
or your personal server.

Here is the [Quick Start](quickstart.md) guide, which providing detailed
instructions to help you begin.

## Pages Mode Vs. Reacharts Mode

Visualify supports two modes: `pages` and `reacharts`. The `pages` mode is
designed for creating a data portal website as the front router, while the
`reacharts` mode is designed for creating a single page with multiple plots. The
`reacharts` mode is the best mate for [Docsify](https://docsify.js.org/) to show
the plots of your data.

Pages mode will be the default mode if you don't specify the mode in the
configuration. You can specify the mode in the configuration file by setting the
`mode` field to `pages` or `reacharts`.

```json
{
    "mode": "pages"
}
```

## Features

-   **No Manual React Components**: Automatically handles the creation of React
    components without the need for manual coding.
-   **Smart Configuration and Data Parsing**: Loads and parses your
    configuration and data API, even if provided directly in a JavaScript file.
-   **Dynamic Website Visualization**: Transforms your data into a visually
    appealing website on the fly.
-   **Easy Deployment**: Just create an `index.html` file with `*.json`
    configuration and deploy it on GitHub Pages or your personal server.
-   **Best Mate for Docsify**: Visualify is the best mate for
    [Docsify](https://docsify.js.org/) to show the plots of your data.

## Showcases

-   [MmTrBC](https://visualify.pharmacy.arizona.edu/MmTrBC/): Zhou, Yizhuo, Ying
    Yang, Lihao Guo, Jun Qian, Jian Ge, Debora Sinner, Hongxu Ding, Andrea
    Califano, and Wellington V. Cardoso. "Airway basal cells show regionally
    distinct potential to undergo metaplastic differentiation." Elife 11 (2022):
    e80083.
-   [EsoDev](https://visualify.pharmacy.arizona.edu/EsoDev/): Yang, Ying, Carmel
    Grace McCullough, Lucas Seninge, Lihao Guo, Woo-Joo Kwon, Yongchun Z. Zhang,
    Nancy Yanzhe Li et al. "A Spatiotemporal and Machine-Learning Platform
    Accelerates the Manufacturing of hPSC-derived Esophageal Mucosa." bioRxiv
    (2023): 2023-10.
