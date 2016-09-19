# The Garden API

## Repo usage
*Do not clone or push to master branch.*

Create branch or fork from *develop*, then push or create pull requests to that branch.

## Installation

- Install Mongo
- [Mongo doc link](https://docs.mongodb.com/manual/installation/)

- Install Node.js

  _It is recommended to install Node.js using NVM (Node Version Manager), which makes it easier to install and switch between versions:_
  
  See https://github.com/creationix/nvm/

- install dependecies:

  ```
  npm install
  ```

- Install ImageMagick

  ```
  Requires imagemagick CLI tools to be installed. brew install imagemagick
  ```

## Server

There are 2 modes for running mobile-api webserver:

- **development**
- **test**

The *mode* is set through **"NODE_ENV"** env variable:
```
export NODE_ENV=development;
```

### Running
Starts a node.js instance in localhost:3000
  
**Mode**: _development_

**Logs**: ./log

**Steps**:
- npm run start

To check if the server is running:

```
curl -v http://localhost:3000/api
```

Should response "{"message":" Main page "}"

### Testing
Runs all *_test.js from ./test

**Mode**: _test_

**Steps**:
```
npm test
```
