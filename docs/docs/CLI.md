# CLI tools for Visualify

## Description

The Visualify.CLI command line interface organizes spatial data using R-tree, 
for efficient data searching and loading. 
By this means, data portals created by Visualifyjs are able to handle large-scale databases.

## Installation

```bash
npm install -g @visualify/cli
```

## Usage

To use Visualify.CLI, you can run the following command:

-   init [path] - Create new documentation
-   serve [path] - Run local server to preview site
-   start [path] - Start a web server to serve the specified path
-   load-json <path> - Load points from JSON file
-   mapping [options] <path> - Create a mapping with optional keys
-   rtree2d [options] <path> - Create a 2D R-tree
-   help [command] - display help for command

```bash
visualify --help

visualify init --help
visualify serve --help
visualify start --help
visualify load-json --help
```
