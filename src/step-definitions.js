const {
  setWorldConstructor,
  Given,
  When,
  Then,
} = require("@cucumber/cucumber");
const assert = require("assert");
const axios = require("axios");
const { isNil, isEmpty, isFinite, get } = require("lodash");
const pathJoin = require("node:path").join;

const E2E_APP_DIR = pathJoin(process.cwd(), "e2e");
const E2E_APP_FIXTURES_PAYLOADS = pathJoin(E2E_APP_DIR, "fixtures", "payloads");

console.log(
  "[step-definitions-0] process.env.COUCHBASE_DIGITAL_URI",
  process.env.COUCHBASE_DIGITAL_URI,
);
// override
process.env.COUCHBASE_DIGITAL_URI =
  process.env.MOCK_COUCHBASE_DIGITAL_URI || `couchbase://127.0.0.1`;

console.log(
  "[step-definitions-1] process.env.COUCHBASE_DIGITAL_URI",
  process.env.COUCHBASE_DIGITAL_URI,
);

/**
 * Creates an instance of cucumber
 */
setWorldConstructor(function (options) {
  this.context = { memoizer: {} };
});

/**
 * Checks if URI path contains dynamic references and substitutes their values from context accordingly
 *
 * @param {object} context
 * @param {string} path
 */
const resolveDynamicPathReferences = (context, path) => {
  // check if request path includes reference to previous response body fields ie. /[response.uuid]
  if (!isEmpty(context?.response?.data)) {
    return (
      "/" +
      path
        .split("/")
        .filter(Boolean)
        .map((uri) => {
          if (uri.includes("[response.") || uri.includes("[alias.")) {
            const fieldNames = uri
              .split(".")
              .slice(1)
              .filter(Boolean)
              .map((uri) => {
                if (uri.includes("]")) {
                  return uri.replace("]", "");
                }
                return uri;
              });
            return (
              get(context?.response?.data, fieldNames) ||
              get(context.memoizer, fieldNames)
            );
          }
          return uri;
        })
        .join("/")
    );
  }
  return path;
};

/******** GIVEN SCENARIOS ********/
Given("the API service {}", function () {
  this.context["serviceApiPath"] = `http://localhost:${process.env.PORT}`;
});

/******** WHEN SCENARIOS ********/
When("I set the {} header to {}", function (headerName, headerValue) {
  this.context["headers"][headerName] = headerValue;
});
When("I set a request body of {}", async function (data) {
  try {
    const input = JSON.parse(data);
    this.context["payload"] = input;
  } catch (e) {
    console.log("When I set a request body of {} :>> ", {
      data,
      message: e.message,
    });
  }
});
When("I set a request body fixture of {}", function (fileName) {
  if (!fileName) {
    return null;
  }
  const payload = require(`${E2E_APP_FIXTURES_PAYLOADS}/${fileName}`);
  this.context.payload = payload;
});
When("I send anonymous GET request to {}", async function (path) {
  try {
    const endpoint = resolveDynamicPathReferences(this.context, path);
    const results = await axios.get(
      `${this.context["serviceApiPath"]}${endpoint}`,
    );
    this.context["response"] = {
      status: results?.status,
      data: results?.data,
    };
  } catch (e) {
    console.log("[When I sent anonymous GET request to {}] e :>> ", e.message);
  }
});
When("I send anonymous POST request to {}", async function (path) {
  try {
    const endpoint = resolveDynamicPathReferences(this.context, path);
    const options = {
      headers: {
        ...this.context["headers"],
      },
    };

    const results = await axios.post(
      `${this.context["serviceApiPath"]}${endpoint}`,
      this.context["payload"],
      options,
    );
    this.context["response"] = {
      status: results?.status,
      data: results?.data,
    };
  } catch (e) {
    console.log("[When I sent anonymous POST request to {}] e :>> ", e.message);
  }
});
When("I send POST request to {}", async function (path) {
  try {
    const endpoint = resolveDynamicPathReferences(this.context, path);
    const options = {
      headers: {
        ...this.context["headers"],
        Authorization: `Bearer ${this.context["jwt"]["token"]}`,
      },
    };
    const results = await axios.post(
      `${this.context["serviceApiPath"]}${endpoint}`,
      this.context["payload"],
      options,
    );
    this.context["response"] = {
      status: results?.status,
      data: results?.data,
    };
  } catch (e) {
    console.log("[When I send POST request to {}] e :>> ", e.message);
  }
});
When("I send GET request to {}", async function (path) {
  try {
    const endpoint = resolveDynamicPathReferences(this.context, path);
    const options = {
      headers: {
        ...this.context["headers"],
        Authorization: `Bearer ${this.context["jwt"]["token"]}`,
      },
    };
    const results = await axios.get(
      `${this.context["serviceApiPath"]}${endpoint}`,
      options,
    );
    this.context["response"] = {
      status: results?.status,
      data: results?.data,
    };
  } catch (e) {
    console.log("[When I send GET request to {}] e :>> ", e.message);
  }
});

/******** THEN SCENARIOS ********/
Then("I get response code {int}", function (statusCode) {
  const status = this.context["response"] && this.context["response"].status;
  assert.equal(status, statusCode);
});
Then("I expect the response body to be empty", function () {
  const falsyValue =
    isNil(this.context["response"].data) ||
    isEmpty(this.context["response"].data) ||
    !isFinite(this.context["response"].data);
  assert.equal(falsyValue, true);
});
Then("I expect the response body to not be empty", function () {
  const truthyValue =
    !isEmpty(this.context["response"].data) ||
    isFinite(this.context["response"].data);
  assert.equal(truthyValue, true);
});
Then(
  "I expect the response body element {} to equal {}",
  function (responseProp, expectedResult) {
    const result = get(this.context["response"]["data"], responseProp);
    assert.equal(result, expectedResult);
  },
);
Then("I expect the response body element {} to exist", function (responseProp) {
  assert.equal(
    this.context["response"]["data"].hasOwnProperty(responseProp),
    true,
  );
});
Then(
  "I expect the response body element {} to not be empty",
  function (responseProp) {
    assert.equal(!isEmpty(this.context["response"].data[responseProp]), true);
  },
);
Then(
  "I expect the response body element {} to be empty",
  function (responseProp) {
    assert.equal(isEmpty(this.context["response"].data[responseProp]), true);
  },
);
Then(
  "I save response body element {} as {}",
  function (responseProp, aliasName) {
    const result = get(this.context["response"]["data"], responseProp);
    this.context.memoizer[aliasName] = result;
  },
);
Then(
  "I purge the {} db record with id {} from table {}",
  function (dbName, recordId, tableName) {
    // @TODO Add logic to remove record from db collection/table
  },
);
Then("I purge all {} db records from table {}", function (dbName, tableName) {
  // @TODO Add logic to remove all records from db collection/table
});
