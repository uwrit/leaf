# Building and deploying the Leaf client application
The Leaf client application is written in [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) using [Node Package Manager, or NPM](https://www.npmjs.com/) and [Create React App](https://github.com/facebook/create-react-app), a bootstrapping library maintained by Facebook. 

* [Installing dependencies](#installing-dependencies)
* [Building the client](#building-the-client)
* [Deploying build artifacts](#deploying-build-artifacts)

## Installing dependencies
After cloning the Leaf repo, `cd` to the client directory from the Leaf repo root:
```bash
cd src/ui-client/
```
Install dependencies:
```bash
npm install
```

## Building the client
Next we need to build, which transpiles TypeScript and [TSX/JSX](https://reactjs.org/docs/introducing-jsx.html) to JavaScript, minifies the code, and outputs a bundle which we can point Apache or IIS to. To build, execute:
```bash
npm run build
```
This outputs a build bundle to the `src/ui-client/build/` folder.

## Deloying build artifacts
The final step is to copy the `/build` folder contents to a directory on the web server that Apache/IIS can serve to users. Note that while there are a number of files in the bundle, requests should be pointed to the `index.html` file specifically.

For more information see the [Create React App deployment page](https://facebook.github.io/create-react-app/docs/deployment).
