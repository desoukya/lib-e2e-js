# lib-e2e-js

<img src="https://askripka.files.wordpress.com/2020/04/cucumberjs2.png" align="right" alt="Cucumber JS" width="120" height="140">

An end-to-end framework for executing integration tests against JavaScript/TypeScript backend servers. This framework utilizes the following libraries, frameworks, and technologies:

- **Cucumber**
- **Gherkin**
- **Docker**

## How It Works

1. Create .feature file(s) with e2e scenario(s) using Gherkin syntax
2. Run the e2e framework which will do the following:
   - spins up docker container(s) of the database(s)
   - starts the server in e2e mode
3. Executes live requests against server and database
4. Asserts response conforms to expected output
5. Generates a report of the results

## Setup

To integrate the e2e framework in a nodejs application, follow these steps:

<details><summary><b>Show Setup instructions</b></summary>

1. Install the package:

   ```sh
   npm install --save @desoukya/lib-e2e-js
   npm install --save-dev @cucumber/cucumber cucumber-html-reporter
   ```

   or

   ```sh
   yarn add @desoukya/lib-e2e-js
   yarn add --dev --save-dev @cucumber/cucumber cucumber-html-reporter
   ```

2. Add e2e related scripts in `package.json`:

   ```diff
     "scripts": {
   +   "prebuild": "rimraf dist",
       "build": "nest build",
   -   "start": "nest start",
   +   "start": "NODE_ENV=local nest start",
   +   "start:e2e": "NODE_ENV=e2e nest start",
   +   "e2e": "node node_modules/.bin/e2e-start"
     }
   ```

3. Add a directory `./e2e` to the root of your project with a config file called `config.js`:

   ```js
   module.exports = {
     appPreBuildTimeout: 2000,
     appBuildTimeout: 6000,
     couchbaseStartupTimeout: 3000,
     serverStartupTimeout: 4000,
     e2eStartupTimeout: 5000,
     images: [
       {
         name: "couchbase",
         image: "dockerhub.hilton.com/couchbase:enterprise-7.6.2
         port: 8091,
       },
     ],
   };
   ```

   - The e2e process consists of steps that run sequentially. The steps do not support a callback interface so there is no mechanism to be informed when a step has completed. For this reason, we rely on manually configured timeouts. Given that each machine specs are different, if your machine requires more time to start up a nest js server for example, you can bump the timeout from 4000 to 8000.
   - Images represents project dependencies your app requires to successfully setup an end-to-end environment. For example, if your app connects to both couchbase **and** kafka, add both image objects.
