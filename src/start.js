/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require("dotenv");
const pathJoin = require("node:path").join;
const { Docker } = require("docker-cli-js");
const _ = require("lodash");
const spinnies = require("spinnies");
const { spawn } = require("child_process");
const freePort = require("kill-port");

let pids = [];
const docker = new Docker({ echo: false });
const APP_ROOT_DIR = process.cwd();
const APP_E2E_DIR = pathJoin(process.cwd(), "e2e");
const NODE_DIR = pathJoin(process.cwd(), "node_modules");
const LIB_E2E = pathJoin(NODE_DIR, "@desoukya", "lib-e2e-js");

dotenv.config({
  path: `${APP_ROOT_DIR}/config/e2e.env`,
  debug: true,
  encoding: "UTF-8",
});

/**
 * Creates a delay for the specified timeout period
 *
 * @param {number} timeout
 */
const delay = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

/**
 * Display spinner and message when executing a promise.
 *
 * @param {Promise} promise
 * @param {string} message
 * @param {string} succeedMessage
 * @param {Boolean} rethrow
 */
const spin = async (
  dockerConfig,
  promise,
  message,
  succeedMessage,
  rethrow = true,
) => {
  const spinner = new spinnies();
  spinner.add("spinner-1", { text: message });
  let result;

  try {
    result = await Promise.resolve(promise);
    if (message === "Starting server") {
      await delay(dockerConfig?.serverStartupTimeout || 25000);
    }
    if (message === "Attempting to run e2e scenarios") {
      await delay(dockerConfig?.e2eStartupTimeout || 5000);
    }
    if (succeedMessage) {
      spinner.succeed("spinner-1", {
        text: _.isFunction(succeedMessage)
          ? succeedMessage(result)
          : succeedMessage,
      });
    }
  } catch (e) {
    spinner.fail("spinner-1", { text: e.message });
    if (rethrow) {
      throw new Error();
    }
  }
  return result;
};

/**
 * Kill all child processes
 *
 * @param {number[]} pids
 */
const killChildProcesses = (pids) => {
  const myArgs = process.argv.slice(2);
  const debug =
    myArgs.includes("debug") ||
    myArgs.includes("-debug") ||
    myArgs.includes("--debug");

  for (const pid of pids) {
    try {
      process.kill(pid);
    } catch (e) {
      if (debug) {
        console.log("e kill processes :>> ", e.message);
      }
    }
  }
  pids = [];
};

/**
 * Start, setup and pre-load a local mock mongo instance.
 */
const startEndtoEndTests = async () => {
  const dockerConfig = await require(`${APP_E2E_DIR}/config.js`);
  if (_.isEmpty(dockerConfig)) {
    throw Error("Ensure e2e/config.js has property dockerImages");
  }

  const myArgs = process.argv.slice(2);
  const debug =
    myArgs.includes("debug") ||
    myArgs.includes("-debug") ||
    myArgs.includes("--debug");

  try {
    // Start server
    // const startServerProcess = spawn(
    //   "node",
    //   ["-r", `${APP_ROOT_DIR}/dist/src/main.js`],
    //   {
    //     detached: true,
    //     stdio: debug ? "inherit" : "ignore",
    //   },
    // );
    // pids.push(startServerProcess.pid);
    // await spin(
    //   dockerConfig,
    //   new Promise((resolve) => resolve(startServerProcess)),
    //   `Starting server`,
    //   "Started server for e2e testing",
    // );

    // Execute e2e feature scenarios
    const e2eSteps = `${LIB_E2E}/src/step-definitions.js`;
    const startFrameworkProcess = spawn(
      `${NODE_DIR}/.bin/cucumber-js`,
      [
        "--format-options",
        '{"snippetInterface": "async-await"}',
        "-f",
        "json:cucumber.json",
        `${APP_E2E_DIR}/features/**/*.feature`,
        "-r",
        e2eSteps,
      ],
      {
        detached: true,
        stdio: debug ? "inherit" : "ignore",
      },
    );

    pids.push(startFrameworkProcess.pid);
    await spin(
      dockerConfig,
      new Promise((resolve) => resolve(startFrameworkProcess)),
      `Attempting to run e2e scenarios`,
      "Completed running all e2e scenarios",
    );

    // Generate HTML report
    const generateE2eReport = spawn("node", ["./report.js"], {
      detached: true,
      stdio: debug ? "inherit" : "ignore",
    });
    pids.push(generateE2eReport.pid);
    await spin(
      dockerConfig,
      new Promise((resolve) => resolve(generateE2eReport)),
      "Attempting to generate report",
      "Completed report generation",
    );
  } catch (e) {
    if (debug) {
      console.log("error spawning process:", e.message);
    }
    killChildProcesses(pids);
  }

  // free the service port
  try {
    await freePort(process.env.PORT, "tcp");
  } catch (e) {
    if (debug) {
      console.log("e freeing port :>> ", e.message);
    }
  }

  // Close process
  process.on("SIGTERM", async () => {
    if (debug) {
      console.log("SIGTERM :>> ");
    }
  });
  process.on("SIGINT", async () => {
    if (debug) {
      console.log("SIGINT :>> ");
    }
  });
  process.on("uncaughtException", async () => {
    if (debug) {
      console.log("uncaughtException :>> ");
    }
  });
  process.on("unhandledRejection", async () => {
    if (debug) {
      console.log("unhandledRejection :>> ");
    }
  });
  killChildProcesses(pids);
  process.exit(0);
};

startEndtoEndTests().catch((err) => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1);
});
