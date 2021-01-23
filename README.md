# LModelEditor
Web-based model editor intended to be used for Minecraft entities.

Check out the [Live Version](https://lclpyt.github.io/LModelEditor/ "The live version on GitHub Pages")!

## Building
After cloning the repository, you'll first need to install all the npm dependencies:
```
npm install
```
After that, you can create a production build with:
```
npm run build
```
The generated website will be located in the `./dist` directory.

## Developing
To create a dev build, simply perform this command:
```
npm run dev
```
For more convenience during development (and ES6 modules support) you can start the webpack-dev-server:
```
npm start
```
