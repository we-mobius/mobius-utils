/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./src/es/atom.js":
/*!************************!*\
  !*** ./src/es/atom.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.BaseAtom),
/* harmony export */   "BaseMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.BaseMediator),
/* harmony export */   "Data": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Data),
/* harmony export */   "Datar": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Datar),
/* harmony export */   "FlatMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.FlatMediator),
/* harmony export */   "Mutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Mutation),
/* harmony export */   "Mutator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Mutator),
/* harmony export */   "ReplayMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.ReplayMediator),
/* harmony export */   "TERMINATOR": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.TERMINATOR),
/* harmony export */   "Terminator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Terminator),
/* harmony export */   "TriggerMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.TriggerMediator),
/* harmony export */   "VACUO": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.VACUO),
/* harmony export */   "VOID": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.VOID),
/* harmony export */   "Vacuo": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Vacuo),
/* harmony export */   "Void": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.Void),
/* harmony export */   "arrayCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.arrayCaseT),
/* harmony export */   "arrayCombineLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.arrayCombineLatestT),
/* harmony export */   "arrayCombineT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.arrayCombineT),
/* harmony export */   "arrayZipLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.arrayZipLatestT),
/* harmony export */   "asIsDistinctEverT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.asIsDistinctEverT),
/* harmony export */   "asIsDistinctPreviousT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.asIsDistinctPreviousT),
/* harmony export */   "atomToData": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.atomToData),
/* harmony export */   "atomToMutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.atomToMutation),
/* harmony export */   "beObservedBy": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.beObservedBy),
/* harmony export */   "binaryHyperComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryHyperComposeAtom),
/* harmony export */   "binaryHyperPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryHyperPipeAtom),
/* harmony export */   "binaryLiftComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryLiftComposeAtom),
/* harmony export */   "binaryLiftPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryLiftPipeAtom),
/* harmony export */   "binaryTweenComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryTweenComposeAtom),
/* harmony export */   "binaryTweenPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.binaryTweenPipeAtom),
/* harmony export */   "caseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.caseT),
/* harmony export */   "combineLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.combineLatestT),
/* harmony export */   "combineT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.combineT),
/* harmony export */   "composeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.composeAtom),
/* harmony export */   "connectInterfaces": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.connectInterfaces),
/* harmony export */   "createArrayMSTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createArrayMSTache),
/* harmony export */   "createArraySMTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createArraySMTache),
/* harmony export */   "createAtomInArray": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createAtomInArray),
/* harmony export */   "createAtomInObject": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createAtomInObject),
/* harmony export */   "createDataFromEvent": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent),
/* harmony export */   "createDataFromFunction": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromFunction),
/* harmony export */   "createDataFromInterval": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromInterval),
/* harmony export */   "createDataFromIterable": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromIterable),
/* harmony export */   "createDataFromObservable": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromObservable),
/* harmony export */   "createDataFromTimeout": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromTimeout),
/* harmony export */   "createDataInArray": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataInArray),
/* harmony export */   "createDataInObject": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataInObject),
/* harmony export */   "createDataOf": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataOf),
/* harmony export */   "createDataWithReplay": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataWithReplay),
/* harmony export */   "createDataWithReplayMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataWithReplayMediator),
/* harmony export */   "createDataWithTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataWithTrigger),
/* harmony export */   "createDataWithTriggerMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataWithTriggerMediator),
/* harmony export */   "createEmptyData": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createEmptyData),
/* harmony export */   "createEmptyMutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createEmptyMutation),
/* harmony export */   "createEventTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createEventTrigger),
/* harmony export */   "createEventTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createEventTriggerF),
/* harmony export */   "createFunctionTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createFunctionTrigger),
/* harmony export */   "createFunctionTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createFunctionTriggerF),
/* harmony export */   "createGeneralDriver": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createGeneralDriver),
/* harmony export */   "createGeneralTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createGeneralTache),
/* harmony export */   "createIntervalTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createIntervalTrigger),
/* harmony export */   "createIntervalTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createIntervalTriggerF),
/* harmony export */   "createIterableTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createIterableTrigger),
/* harmony export */   "createIterableTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createIterableTriggerF),
/* harmony export */   "createMMTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMMTache),
/* harmony export */   "createMSTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMSTache),
/* harmony export */   "createMutationFromEvent": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromEvent),
/* harmony export */   "createMutationFromFunction": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromFunction),
/* harmony export */   "createMutationFromInterval": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromInterval),
/* harmony export */   "createMutationFromIterable": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromIterable),
/* harmony export */   "createMutationFromObservable": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromObservable),
/* harmony export */   "createMutationFromTimeout": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationFromTimeout),
/* harmony export */   "createMutationInArray": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationInArray),
/* harmony export */   "createMutationInObject": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationInObject),
/* harmony export */   "createMutationOf": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOf),
/* harmony export */   "createMutationOfLB": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLB),
/* harmony export */   "createMutationOfLL": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLL),
/* harmony export */   "createMutationOfLR": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLR),
/* harmony export */   "createMutationWithReplay": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationWithReplay),
/* harmony export */   "createMutationWithReplayMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationWithReplayMediator),
/* harmony export */   "createMutationWithTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationWithTrigger),
/* harmony export */   "createMutationWithTriggerMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createMutationWithTriggerMediator),
/* harmony export */   "createObjectMSTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createObjectMSTache),
/* harmony export */   "createObjectSMTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createObjectSMTache),
/* harmony export */   "createObservableTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createObservableTrigger),
/* harmony export */   "createObservableTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createObservableTriggerF),
/* harmony export */   "createSMTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createSMTache),
/* harmony export */   "createSSTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createSSTache),
/* harmony export */   "createTimeoutTrigger": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createTimeoutTrigger),
/* harmony export */   "createTimeoutTriggerF": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createTimeoutTriggerF),
/* harmony export */   "dataToData": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dataToData),
/* harmony export */   "dataToMutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dataToMutation),
/* harmony export */   "dataToMutationS": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dataToMutationS),
/* harmony export */   "debounceTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.debounceTimeT),
/* harmony export */   "defaultToT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.defaultToT),
/* harmony export */   "distinctEverT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.distinctEverT),
/* harmony export */   "distinctPreviousT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.distinctPreviousT),
/* harmony export */   "dynamicArrayCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicArrayCaseT),
/* harmony export */   "dynamicDebounceTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicDebounceTimeT),
/* harmony export */   "dynamicDefautToT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicDefautToT),
/* harmony export */   "dynamicDistinctEverT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicDistinctEverT),
/* harmony export */   "dynamicDistinctPreviousT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicDistinctPreviousT),
/* harmony export */   "dynamicEffectT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicEffectT),
/* harmony export */   "dynamicEmptyStartWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicEmptyStartWithT),
/* harmony export */   "dynamicFilterT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicFilterT),
/* harmony export */   "dynamicIifT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicIifT),
/* harmony export */   "dynamicMapT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicMapT),
/* harmony export */   "dynamicObjectCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicObjectCaseT),
/* harmony export */   "dynamicPluckT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicPluckT),
/* harmony export */   "dynamicSkipT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicSkipT),
/* harmony export */   "dynamicStartWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicStartWithT),
/* harmony export */   "dynamicSwitchT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicSwitchT),
/* harmony export */   "dynamicTakeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicTakeT),
/* harmony export */   "dynamicThrottleTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.dynamicThrottleTimeT),
/* harmony export */   "effectT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.effectT),
/* harmony export */   "emptyStartWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.emptyStartWithT),
/* harmony export */   "filterT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.filterT),
/* harmony export */   "formatEventTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatEventTriggerCreatorFlatArgs),
/* harmony export */   "formatFunctionTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatFunctionTriggerCreatorFlatArgs),
/* harmony export */   "formatIntervalTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatIntervalTriggerCreatorFlatArgs),
/* harmony export */   "formatIterableTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatIterableTriggerCreatorFlatArgs),
/* harmony export */   "formatObservableTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatObservableTriggerCreatorFlatArgs),
/* harmony export */   "formatTimeoutTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.formatTimeoutTriggerCreatorFlatArgs),
/* harmony export */   "getAtomType": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.getAtomType),
/* harmony export */   "iifT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.iifT),
/* harmony export */   "isAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isAtom),
/* harmony export */   "isData": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isData),
/* harmony export */   "isDatar": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isDatar),
/* harmony export */   "isFlatMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isFlatMediator),
/* harmony export */   "isMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isMediator),
/* harmony export */   "isMutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isMutation),
/* harmony export */   "isMutator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isMutator),
/* harmony export */   "isReplayMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isReplayMediator),
/* harmony export */   "isSameTypeOfAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isSameTypeOfAtom),
/* harmony export */   "isSameTypeOfMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isSameTypeOfMediator),
/* harmony export */   "isTerminator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isTerminator),
/* harmony export */   "isTriggerMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isTriggerMediator),
/* harmony export */   "isVacuo": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isVacuo),
/* harmony export */   "isVoid": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.isVoid),
/* harmony export */   "mapT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.mapT),
/* harmony export */   "mergeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.mergeT),
/* harmony export */   "mutationToData": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.mutationToData),
/* harmony export */   "mutationToDataS": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.mutationToDataS),
/* harmony export */   "mutationToMutation": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.mutationToMutation),
/* harmony export */   "nAryHyperComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryHyperComposeAtom),
/* harmony export */   "nAryHyperPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryHyperPipeAtom),
/* harmony export */   "nAryLiftComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryLiftComposeAtom),
/* harmony export */   "nAryLiftPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryLiftPipeAtom),
/* harmony export */   "nAryTweenComposeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryTweenComposeAtom),
/* harmony export */   "nAryTweenPipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nAryTweenPipeAtom),
/* harmony export */   "nilToVoidT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.nilToVoidT),
/* harmony export */   "objectCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.objectCaseT),
/* harmony export */   "objectCombineLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.objectCombineLatestT),
/* harmony export */   "objectCombineT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.objectCombineT),
/* harmony export */   "objectZipLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.objectZipLatestT),
/* harmony export */   "observe": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.observe),
/* harmony export */   "pairwiseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.pairwiseT),
/* harmony export */   "partitionT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.partitionT),
/* harmony export */   "pipeAtom": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.pipeAtom),
/* harmony export */   "pluckT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.pluckT),
/* harmony export */   "promiseSwitchT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.promiseSwitchT),
/* harmony export */   "replayWithLatest": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.replayWithLatest),
/* harmony export */   "replayWithoutLatest": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.replayWithoutLatest),
/* harmony export */   "skipT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.skipT),
/* harmony export */   "skipUntilT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.skipUntilT),
/* harmony export */   "skipWhileT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.skipWhileT),
/* harmony export */   "startWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.startWithT),
/* harmony export */   "staticArrayCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticArrayCaseT),
/* harmony export */   "staticDebounceTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticDebounceTimeT),
/* harmony export */   "staticDefaultToT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticDefaultToT),
/* harmony export */   "staticDistinctEverT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticDistinctEverT),
/* harmony export */   "staticDistinctPreviousT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticDistinctPreviousT),
/* harmony export */   "staticEffectT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticEffectT),
/* harmony export */   "staticEmptyStartWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticEmptyStartWithT),
/* harmony export */   "staticFilterT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticFilterT),
/* harmony export */   "staticIifT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticIifT),
/* harmony export */   "staticMapT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticMapT),
/* harmony export */   "staticObjectCaseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticObjectCaseT),
/* harmony export */   "staticPluckT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticPluckT),
/* harmony export */   "staticSkipT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticSkipT),
/* harmony export */   "staticStartWithT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticStartWithT),
/* harmony export */   "staticSwitchT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticSwitchT),
/* harmony export */   "staticTakeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticTakeT),
/* harmony export */   "staticThrottleTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.staticThrottleTimeT),
/* harmony export */   "switchT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.switchT),
/* harmony export */   "takeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.takeT),
/* harmony export */   "takeUntilT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.takeUntilT),
/* harmony export */   "takeWhileT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.takeWhileT),
/* harmony export */   "tapT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.tapT),
/* harmony export */   "tapValueT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.tapValueT),
/* harmony export */   "throttleTimeT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.throttleTimeT),
/* harmony export */   "truthyPairwiseT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.truthyPairwiseT),
/* harmony export */   "useGeneralDriver": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.useGeneralDriver),
/* harmony export */   "useGeneralTache": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.useGeneralTache),
/* harmony export */   "withDynamicHistoryT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withDynamicHistoryT),
/* harmony export */   "withHistoryT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withHistoryT),
/* harmony export */   "withLatestFromT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withLatestFromT),
/* harmony export */   "withMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withMediator),
/* harmony export */   "withReplayMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withReplayMediator),
/* harmony export */   "withStaticHistoryT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withStaticHistoryT),
/* harmony export */   "withTriggerMediator": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withTriggerMediator),
/* harmony export */   "withValueFlatted": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.withValueFlatted),
/* harmony export */   "zipLatestT": () => (/* reexport safe */ _atom_index_js__WEBPACK_IMPORTED_MODULE_0__.zipLatestT)
/* harmony export */ });
/* harmony import */ var _atom_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./atom/index.js */ "./src/es/atom/index.js");


/***/ }),

/***/ "./src/es/atom/atom.js":
/*!*****************************!*\
  !*** ./src/es/atom/atom.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseAtom": () => (/* reexport safe */ _atoms_base_atom_js__WEBPACK_IMPORTED_MODULE_0__.BaseAtom),
/* harmony export */   "isAtom": () => (/* reexport safe */ _atoms_base_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom),
/* harmony export */   "Data": () => (/* reexport safe */ _atoms_data_atom_js__WEBPACK_IMPORTED_MODULE_1__.Data),
/* harmony export */   "isData": () => (/* reexport safe */ _atoms_data_atom_js__WEBPACK_IMPORTED_MODULE_1__.isData),
/* harmony export */   "Mutation": () => (/* reexport safe */ _atoms_mutation_atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation),
/* harmony export */   "isMutation": () => (/* reexport safe */ _atoms_mutation_atom_js__WEBPACK_IMPORTED_MODULE_2__.isMutation)
/* harmony export */ });
/* harmony import */ var _atoms_base_atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./atoms/base.atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atoms_data_atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./atoms/data.atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atoms_mutation_atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./atoms/mutation.atom.js */ "./src/es/atom/atoms/mutation.atom.js");




/***/ }),

/***/ "./src/es/atom/atoms/base.atom.js":
/*!****************************************!*\
  !*** ./src/es/atom/atoms/base.atom.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isAtom": () => (/* binding */ isAtom),
/* harmony export */   "BaseAtom": () => (/* binding */ BaseAtom)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");


const isAtom = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isAtom;
/**
 * !! please consider BaseMediator when add property or method to BaseAtom
 */

class BaseAtom {
  get isAtom() {
    return true;
  }

  pipe(...args) {
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.pipe)(...args)(this);
  }

  compose(...args) {
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(...args)(this);
  }

}

/***/ }),

/***/ "./src/es/atom/atoms/data.atom.js":
/*!****************************************!*\
  !*** ./src/es/atom/atoms/data.atom.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isData": () => (/* binding */ isData),
/* harmony export */   "Data": () => (/* binding */ Data)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _mutation_atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mutation.atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _base_atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.atom.js */ "./src/es/atom/atoms/base.atom.js");




/**
 * @param { any } tar
 * @return { boolean }
 */

const isData = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isData;
class Data extends _base_atom_js__WEBPACK_IMPORTED_MODULE_1__.BaseAtom {
  constructor(value, options = {}) {
    super();

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    this._options = options;

    if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isDatar)(value)) {
      this._datar = value;
    } else {
      this._datar = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.of(value);
    }

    this._consumers = new Set();
  }
  /**
   * @return { 'DataAtom' } 'DataAtom'
   */


  get type() {
    return 'DataAtom';
  }
  /**
   * @return { true } true
   */


  get isData() {
    return true;
  }

  get isEmpty() {
    return this._datar.isEmpty;
  }

  static of(value, options = {}) {
    return new Data(value, options);
  }
  /**
   * Same as Data.of(VACUO)
   *
   * @return { Data }
   */


  static empty(options = {}) {
    return new Data(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.empty(), options);
  }
  /**
   * Static value of Data.
   *
   * @return { Datar } datar
   */


  get datar() {
    return this._datar;
  }
  /**
   * Static value of Data, same as Data.datar.value.
   *
   * @return { any } value
   */


  get value() {
    return this._datar.value;
  }
  /**
   * Steram value of Data.
   *
   * @param { function } consumer The consumer will be invoked by trigger method when there is a adequate value.
   * @return { { unsubscribe: function } } SubscriptionController
   */


  subscribe(consumer) {
    this._consumers.add(consumer);

    return {
      unsubscribe: () => {
        return this._consumers.delete(consumer);
      }
    };
  }
  /**
   * @param { Datar | undefined } datar
   * @return { void }
   */


  trigger(datar) {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(datar) && !(0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isDatar)(datar)) {
      throw new TypeError('Data must be triggered with a Datar.');
    }

    const _datar = datar || this.datar;

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(_datar)) {
      this._consumers.forEach(consumer => {
        consumer(_datar, this);
      });
    }
  }

  triggerValue(value) {
    return this.trigger(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.of(value));
  }
  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **upstream** of current Data, which is different from "beObservedBy" method.
   *
   * @param { Mutation } mutation (other data ->) mutation -> current data
   */


  observe(mutation) {
    if (!(0,_mutation_atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutation)(mutation)) {
      throw new TypeError('Data can only observe a Mutation!');
    }

    return mutation.subscribe((mutator, mutation) => {
      this.mutate(mutator, mutation);
    });
  }
  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **downstream** of current Data, which is different from "observe" method.
   *
   * @param { Mutation } mutation current data -> mutation (-> other data)
   */


  beObservedBy(mutation) {
    return mutation.observe(this);
  }
  /**
   * Change the value of Data in a static manner.
   *
   * take mutator-like param(convert to mutator)
   *   -> run mutator with current datar & contexts
   *   -> wrap and save result of mutator.run as new datar
   *   -> trigger consumers with new datar & contexts
   *
   * @param { Mutator | Mutation | function } mutator Used to produce new value with current datar.
   * @param { Mutation } mutation Provide to mutator's operation (function) as execute contexts.
   * @return { Data } Data(this)
   */


  mutate(mutator, mutation) {
    let _mutator;

    if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isMutator)(mutator)) {
      _mutator = mutator;
    } else if ((0,_mutation_atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutation)(mutator)) {
      _mutator = mutator.mutator;
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(mutator)) {
      _mutator = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.of(mutator);
    } else {
      throw new TypeError(`"mutator" is expected to be type of "Mutator" | "Mutation" | "Function", but received "${typeof mutator}".`);
    }

    let _mutation;

    if (!mutation) {
      _mutation = (0,_mutation_atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutation)(mutator) ? mutator : _mutation;
    } else {
      if ((0,_mutation_atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutation)(mutation)) {
        _mutation = mutation;
      } else {
        throw new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`);
      }
    }

    const _tempDatar = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.of(_mutator.run(this._datar, _mutation)).fill(_mutator); // NOTE: If result of operation is TERMINATOR,
    // do not update the datar or trigger the subscribers


    if (!(0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isTerminator)(_tempDatar.value)) {
      this._datar = _tempDatar;
      this.trigger();
    }

    return this;
  }
  /**
   * @param { function } trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Data's trigger method be triggerd with given value.
   * @param { { forceWrap?: boolean } } options
   * @accept ((datar -> trigger(datar)) -> controller, options)
   * @accept ((value -> trigger(datar)) -> controller, { forceWrap: true })
   * @return { {} } TriggerController
   */


  registerTrigger(trigger, options = {}) {
    if (!trigger) {
      throw new TypeError(`"trigger" is required, but received "${trigger}".`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(trigger)) {
      throw new TypeError(`"trigger" is expected to be type of "Function", but received "${typeof trigger}".`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    const {
      forceWrap = false
    } = options;

    const _internalTriggerFunction = (...args) => {
      if (!(0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isDatar)(args[0]) || forceWrap) {
        args[0] = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.of(args[0]);
      }

      return this.trigger(...args);
    };

    const controller = trigger(_internalTriggerFunction);
    return controller;
  }

}

/***/ }),

/***/ "./src/es/atom/atoms/mutation.atom.js":
/*!********************************************!*\
  !*** ./src/es/atom/atoms/mutation.atom.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMutation": () => (/* binding */ isMutation),
/* harmony export */   "Mutation": () => (/* binding */ Mutation)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _data_atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./data.atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _base_atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.atom.js */ "./src/es/atom/atoms/base.atom.js");




/**
 * @param { any } tar
 * @return { boolean }
 */

const isMutation = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isMutation;
class Mutation extends _base_atom_js__WEBPACK_IMPORTED_MODULE_1__.BaseAtom {
  constructor(operation, options = {}) {
    super();

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    this._options = options;

    if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isMutator)(operation)) {
      this._mutator = operation;
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(operation)) {
      this._mutator = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.of(operation);
    } else {
      throw new TypeError(`"operation" is expected to be type of "Mutator" | "Function", but received "${typeof operation}".`);
    }

    this._consumers = new Set();
  }
  /**
   * @return { 'MutationAtom' } 'MutationAtom'
   */


  get type() {
    return 'MutationAtom';
  }
  /**
   * @return { true } true
   */


  get isMutation() {
    return true;
  }

  get isEmpty() {
    return this._mutator.isEmpty;
  }

  static of(operation, options = {}) {
    return new Mutation(operation, options);
  }

  static empty(options = {}) {
    return new Mutation(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.empty(), options);
  }

  static ofLift(operation, options = {}) {
    const {
      liftType: type
    } = options;
    return new Mutation(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.lift(operation, {
      type
    }), { ...options,
      isLifted: true,
      origin_operation: operation
    });
  }

  static ofLiftBoth(operation, options = {}) {
    return new Mutation(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.liftBoth(operation), { ...options,
      isLifted: true,
      origin_operation: operation
    });
  }

  static ofLiftLeft(operation, options = {}) {
    return new Mutation(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.liftLeft(operation), { ...options,
      isLifted: true,
      origin_operation: operation
    });
  }

  static ofLiftRight(operation, options = {}) {
    return new Mutation(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.liftRight(operation), { ...options,
      isLifted: true,
      origin_operation: operation
    });
  }
  /**
   * Static value of Mutation.
   *
   * @return { Mutator } mutator
   */


  get mutator() {
    return this._mutator;
  }
  /**
   * @return { function } operation
   */


  get operation() {
    if (this._options && this._options.isLifted) {
      return this._options.origin_operation;
    } else {
      return this._mutator.operation;
    }
  }
  /**
   * Steram value of Mutation.
   *
   * @param { function } consumer The consumer will be invoked by trigger method when there is a adequate value.
   * @return { { unsubscribe: function } } SubscriptionController
   */


  subscribe(consumer) {
    this._consumers.add(consumer);

    return {
      unsubscribe: () => {
        return this._consumers.delete(consumer);
      }
    };
  }
  /**
   * @param { Mutator | undefined } mutator
   * @return { void }
   */


  trigger(mutator) {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(mutator) && !(0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isMutator)(mutator)) {
      throw new TypeError('Mutation must be triggered with a Mutator.');
    }

    const _mutator = mutator || this.mutator;

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(_mutator)) {
      this._consumers.forEach(consumer => {
        consumer(_mutator, this);
      });
    }
  }

  triggerOperation(operation) {
    return this.trigger(_meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.of(operation));
  }
  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **upstream** of current Mutation, which is different from "beObservedBy" method.
   *
   * @param { Mutation } mutation data -> current mutation (-> other data)
   */


  observe(data) {
    if (!(0,_data_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data)) {
      throw new TypeError('Mutation can only observe a Data!');
    }

    return data.subscribe((datar, data) => {
      this.mutate(datar, data);
    });
  }
  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **downstream** of current Mutation, which is different from "observe" method.
   *
   * @param { Mutation } mutation (other data ->) current mutation -> data
   */


  beObservedBy(data) {
    return data.observe(this);
  }
  /**
   * Change the value of Mutation in a static manner.
   *
   * take datar-like param(convert to datar)
   *   -> run datar with current mutator & contexts
   *   -> wrap and save result of datar.run as new mutator
   *   -> trigger consumers with new mutator & contexts
   *
   * @param { Datar | Data | any } datar Will be the 2nd param of mutator's operation.
   * @param { Data } data
   * @return { Mutation } Mutation(this)
   */


  mutate(datar, data) {
    let _datar = null;

    if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isDatar)(datar)) {
      _datar = datar;
    } else if ((0,_data_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(datar)) {
      _datar = datar.datar;
    } else {
      _datar = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Datar.of(datar);
    }

    if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isTerminator)(_datar.value)) return this;

    let _data;

    if (!data) {
      _data = (0,_data_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data) ? datar : _data;
    } else {
      if ((0,_data_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data)) {
        _data = data;
      } else {
        throw new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`);
      }
    } // NOTE: 运行效果相当于：const _tempMutator = this._mutator.fill(_datar)
    // 但实际意义完全不同


    const _tempMutator = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.of(_datar.run(this._mutator, _data)).fill(_datar);

    this._mutator = _tempMutator;
    this.trigger();
    return this;
  }
  /**
   * @param { function } trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Mutation's trigger method be triggerd with given value.
   * @param { { forceWrap?: boolean } } options
   * @accept ((mutator -> trigger(mutator)) -> controller, options)
   * @accept ((operation -> trigger(mutator)) -> controller, { forceWrap: true })
   * @return { {} } TriggerController
   */


  registerTrigger(trigger, options = {}) {
    if (!trigger) {
      throw new TypeError(`"trigger" is required, but received "${trigger}".`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(trigger)) {
      throw new TypeError(`"trigger" is expected to be type of "Function", but received "${typeof trigger}".`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    const {
      forceWrap = false
    } = options;

    const _internalTriggerFunction = (...args) => {
      if (!(0,_meta_js__WEBPACK_IMPORTED_MODULE_2__.isMutator)(args[0]) || forceWrap) {
        args[0] = _meta_js__WEBPACK_IMPORTED_MODULE_2__.Mutator.of(args[0]);
      }

      this.trigger(...args);
    };

    const controller = trigger(_internalTriggerFunction);
    return controller;
  }

}

/***/ }),

/***/ "./src/es/atom/drivers.js":
/*!********************************!*\
  !*** ./src/es/atom/drivers.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "connectInterfaces": () => (/* reexport safe */ _drivers_base_drivers_js__WEBPACK_IMPORTED_MODULE_0__.connectInterfaces),
/* harmony export */   "createGeneralDriver": () => (/* reexport safe */ _drivers_base_drivers_js__WEBPACK_IMPORTED_MODULE_0__.createGeneralDriver),
/* harmony export */   "useGeneralDriver": () => (/* reexport safe */ _drivers_base_drivers_js__WEBPACK_IMPORTED_MODULE_0__.useGeneralDriver)
/* harmony export */ });
/* harmony import */ var _drivers_base_drivers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drivers/base.drivers.js */ "./src/es/atom/drivers/base.drivers.js");


/***/ }),

/***/ "./src/es/atom/drivers/base.drivers.js":
/*!*********************************************!*\
  !*** ./src/es/atom/drivers/base.drivers.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGeneralDriver": () => (/* binding */ createGeneralDriver),
/* harmony export */   "connectInterfaces": () => (/* binding */ connectInterfaces),
/* harmony export */   "useGeneralDriver": () => (/* binding */ useGeneralDriver)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");





/**
 * @param { {
 *   prepareOptions?: ((options: object) => object),
 *   prepareDriverLevelContexts?: (() => object),
 *   prepareSingletonLevelContexts?: ((options: object, driverLevelContexts: object) => object),
 *   prepareInstance: (options: object, driverLevelContexts: object, singletonLevelContexts: object) => { inputs: object, outputs: object }
 * } | function } createOptions
 * @return { (options?: {}) => { inputs: object, outputs: object } } Driver
 */

const createGeneralDriver = (createOptions = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(createOptions) && !(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(createOptions)) {
    throw new TypeError(`"createOptions" is expected to be type of "Object" | "Function", but received "${typeof createOptions}".`);
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(createOptions)) {
    createOptions = {
      prepareSingletonLevelContexts: createOptions
    };
  }

  const {
    prepareOptions = options => options,
    prepareDriverLevelContexts = () => ({}),
    prepareSingletonLevelContexts = _ => ({}),
    prepareInstance = (_0, _1, singletonLevelContexts) => ({ ...singletonLevelContexts
    })
  } = createOptions;

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(prepareOptions)) {
    throw new TypeError(`"prepareOptions" is expected to be type of "Function", but received "${typeof prepareOptions}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(prepareDriverLevelContexts)) {
    throw new TypeError(`"prepareDriverLevelContexts" is expected to be type of "Function", but received "${typeof prepareDriverLevelContexts}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(prepareSingletonLevelContexts)) {
    throw new TypeError(`"prepareSingletonLevelContexts" is expected to be type of "Function", but received "${typeof prepareSingletonLevelContexts}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(prepareInstance)) {
    throw new TypeError(`"prepareInstance" is expected to be type of "Function", but received "${typeof prepareInstance}".`);
  }

  const driverLevelContexts = prepareDriverLevelContexts();

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(driverLevelContexts)) {
    throw new TypeError(`"driverLevelContexts" is expected to be type of "Object", but received "${typeof driverLevelContexts}"`);
  }
  /**
   * @param { object? } options In order to clarify the role of each configuration item,
   *                            the configuration is best to be in object format.
   * @return { { inputs: object, outputs: object } } DriverInterfaces
   */


  const driver = (options = {}) => {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    options = prepareOptions(options);

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`The returned value of "prepareOptions" is expected to be type of "Object", but received "${typeof options}".`);
    }

    const singletonLevelContexts = prepareSingletonLevelContexts(options, driverLevelContexts);

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(singletonLevelContexts)) {
      throw new TypeError(`"singletonLevelContexts" is expected to be type of "Object", but received "${typeof singletonLevelContexts}"`);
    }

    const {
      inputs = {},
      outputs = {}
    } = singletonLevelContexts;

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(inputs)) {
      throw new TypeError(`"inputs" returned as singletonLevelContexts is expected to be type of "Object", but received "${typeof inputs}"`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(outputs)) {
      throw new TypeError(`"outputs" returned as singletonLevelContexts is expected to be type of "Object", but received "${typeof outputs}"`);
    }

    const driverInterfaces = prepareInstance(options, driverLevelContexts, singletonLevelContexts);
    return driverInterfaces;
  };

  return driver;
};

const formatInterfaces = interfaces => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(interfaces)) {
    throw new TypeError(`"interfaces" is expected to be type of "Object", but received "${typeof interfaces}"`);
  }

  const {
    inputs: { ...inputs
    } = {},
    outputs: { ...outputs
    } = {}
  } = interfaces;

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(inputs)) {
    throw new TypeError(`"inputs" of interfaces is expected to be type of "Object", but received "${typeof inputs}"`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(outputs)) {
    throw new TypeError(`"outputs" of interfaces is expected to be type of "Object", but received "${typeof outputs}"`);
  }

  Object.entries(interfaces).forEach(([key, value]) => {
    if (key !== 'inputs' && key !== 'outputs') {
      inputs[key] = value;
    }
  });
  return {
    inputs: { ...inputs
    },
    outputs: { ...outputs
    }
  };
};

const connectInterfaces = (up, down) => {
  const normalize = value => (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(value) ? (0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, value) : (0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(value)); // The up & down value are expected to be type of Atom,
  //   -> one of the up | down value is required to be type of Atom at least.
  //   -> cause there is no way to get the auto-generated down Atom.


  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(up) && !(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(down)) {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(down)) {
      down.forEach(i => {
        if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(i)) {
          (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(normalize(up), i);
        } else {// do nothing
        }
      });
    } else {// do nothing
    }
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(up) && (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(down)) {
    // downstream atom do not need to be replayable
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(normalize(up), down);
  } else if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(up) && (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(down)) {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(normalize(up), down);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(up) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(down)) {
    Object.entries(up).forEach(([key, value]) => {
      if (down[key]) {
        connectInterfaces(value, down[key]);
      }
    });
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(up) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(down)) {
    up.forEach((value, idx) => {
      if (down[idx]) {
        connectInterfaces(value, down[idx]);
      }
    });
  } else {
    throw new TypeError('The up interfaces & down interfaces are expected to be the type combinations as follows:' + ' (Atom, Any) | (Any, Atom) | (Object | Object) | (Array | Array).');
  }
};
/**
 * @param { function } driver
 * @param { { } } driverOptions
 * @param { { inputs?: object, outputs?: object } } interfaces
 * @return { { inputs: object, outputs: object, ... } }
 */

const useGeneralDriver = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.looseCurryN)(3, (driver, driverOptions, interfaces) => {
  const driverInterfaces = driver(driverOptions);
  const {
    inputs: { ...innerInputs
    } = {},
    outputs: { ...innerOutputs
    } = {},
    ...others
  } = { ...driverInterfaces
  };
  const {
    inputs: { ...outerInputs
    } = {},
    outputs: { ...outerOutputs
    } = {}
  } = { ...formatInterfaces(interfaces)
  };
  connectInterfaces(outerInputs, innerInputs);
  connectInterfaces(innerOutputs, outerOutputs);
  return {
    inputs: innerInputs,
    outputs: innerOutputs,
    ...others
  };
});

/***/ }),

/***/ "./src/es/atom/helpers.js":
/*!********************************!*\
  !*** ./src/es/atom/helpers.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createDataOf": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createDataOf),
/* harmony export */   "createEmptyData": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createEmptyData),
/* harmony export */   "createEmptyMutation": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createEmptyMutation),
/* harmony export */   "createMutationOf": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOf),
/* harmony export */   "createMutationOfLB": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLB),
/* harmony export */   "createMutationOfLL": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLL),
/* harmony export */   "createMutationOfLR": () => (/* reexport safe */ _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createMutationOfLR),
/* harmony export */   "createAtomInArray": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createAtomInArray),
/* harmony export */   "createAtomInObject": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createAtomInObject),
/* harmony export */   "createDataInArray": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createDataInArray),
/* harmony export */   "createDataInObject": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createDataInObject),
/* harmony export */   "createMutationInArray": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createMutationInArray),
/* harmony export */   "createMutationInObject": () => (/* reexport safe */ _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__.createMutationInObject),
/* harmony export */   "createDataWithReplay": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createDataWithReplay),
/* harmony export */   "createDataWithReplayMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createDataWithReplayMediator),
/* harmony export */   "createDataWithTrigger": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createDataWithTrigger),
/* harmony export */   "createDataWithTriggerMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createDataWithTriggerMediator),
/* harmony export */   "createMutationWithReplay": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createMutationWithReplay),
/* harmony export */   "createMutationWithReplayMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createMutationWithReplayMediator),
/* harmony export */   "createMutationWithTrigger": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createMutationWithTrigger),
/* harmony export */   "createMutationWithTriggerMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.createMutationWithTriggerMediator),
/* harmony export */   "withMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.withMediator),
/* harmony export */   "withReplayMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.withReplayMediator),
/* harmony export */   "withTriggerMediator": () => (/* reexport safe */ _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__.withTriggerMediator),
/* harmony export */   "createDataFromEvent": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromEvent),
/* harmony export */   "createDataFromFunction": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromFunction),
/* harmony export */   "createDataFromInterval": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromInterval),
/* harmony export */   "createDataFromIterable": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromIterable),
/* harmony export */   "createDataFromObservable": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromObservable),
/* harmony export */   "createDataFromTimeout": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromTimeout),
/* harmony export */   "createEventTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createEventTrigger),
/* harmony export */   "createEventTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createEventTriggerF),
/* harmony export */   "createFunctionTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createFunctionTrigger),
/* harmony export */   "createFunctionTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createFunctionTriggerF),
/* harmony export */   "createIntervalTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createIntervalTrigger),
/* harmony export */   "createIntervalTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createIntervalTriggerF),
/* harmony export */   "createIterableTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createIterableTrigger),
/* harmony export */   "createIterableTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createIterableTriggerF),
/* harmony export */   "createMutationFromEvent": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromEvent),
/* harmony export */   "createMutationFromFunction": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromFunction),
/* harmony export */   "createMutationFromInterval": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromInterval),
/* harmony export */   "createMutationFromIterable": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromIterable),
/* harmony export */   "createMutationFromObservable": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromObservable),
/* harmony export */   "createMutationFromTimeout": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromTimeout),
/* harmony export */   "createObservableTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createObservableTrigger),
/* harmony export */   "createObservableTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createObservableTriggerF),
/* harmony export */   "createTimeoutTrigger": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createTimeoutTrigger),
/* harmony export */   "createTimeoutTriggerF": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createTimeoutTriggerF),
/* harmony export */   "formatEventTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatEventTriggerCreatorFlatArgs),
/* harmony export */   "formatFunctionTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatFunctionTriggerCreatorFlatArgs),
/* harmony export */   "formatIntervalTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatIntervalTriggerCreatorFlatArgs),
/* harmony export */   "formatIterableTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatIterableTriggerCreatorFlatArgs),
/* harmony export */   "formatObservableTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatObservableTriggerCreatorFlatArgs),
/* harmony export */   "formatTimeoutTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.formatTimeoutTriggerCreatorFlatArgs),
/* harmony export */   "atomToData": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.atomToData),
/* harmony export */   "atomToMutation": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.atomToMutation),
/* harmony export */   "dataToData": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.dataToData),
/* harmony export */   "dataToMutation": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.dataToMutation),
/* harmony export */   "dataToMutationS": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.dataToMutationS),
/* harmony export */   "mutationToData": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.mutationToData),
/* harmony export */   "mutationToDataS": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.mutationToDataS),
/* harmony export */   "mutationToMutation": () => (/* reexport safe */ _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__.mutationToMutation),
/* harmony export */   "observe": () => (/* binding */ observe),
/* harmony export */   "beObservedBy": () => (/* binding */ beObservedBy),
/* harmony export */   "getAtomType": () => (/* binding */ getAtomType),
/* harmony export */   "isSameTypeOfAtom": () => (/* binding */ isSameTypeOfAtom),
/* harmony export */   "isSameTypeOfMediator": () => (/* binding */ isSameTypeOfMediator),
/* harmony export */   "pipeAtom": () => (/* binding */ pipeAtom),
/* harmony export */   "composeAtom": () => (/* binding */ composeAtom),
/* harmony export */   "binaryTweenPipeAtom": () => (/* binding */ binaryTweenPipeAtom),
/* harmony export */   "binaryTweenComposeAtom": () => (/* binding */ binaryTweenComposeAtom),
/* harmony export */   "nAryTweenPipeAtom": () => (/* binding */ nAryTweenPipeAtom),
/* harmony export */   "nAryTweenComposeAtom": () => (/* binding */ nAryTweenComposeAtom),
/* harmony export */   "binaryLiftPipeAtom": () => (/* binding */ binaryLiftPipeAtom),
/* harmony export */   "binaryLiftComposeAtom": () => (/* binding */ binaryLiftComposeAtom),
/* harmony export */   "nAryLiftPipeAtom": () => (/* binding */ nAryLiftPipeAtom),
/* harmony export */   "nAryLiftComposeAtom": () => (/* binding */ nAryLiftComposeAtom),
/* harmony export */   "binaryHyperPipeAtom": () => (/* binding */ binaryHyperPipeAtom),
/* harmony export */   "binaryHyperComposeAtom": () => (/* binding */ binaryHyperComposeAtom),
/* harmony export */   "nAryHyperPipeAtom": () => (/* binding */ nAryHyperPipeAtom),
/* harmony export */   "nAryHyperComposeAtom": () => (/* binding */ nAryHyperComposeAtom)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/combinators.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mediators.js */ "./src/es/atom/mediators/base.mediators.js");
/* harmony import */ var _helpers_normal_create_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers/normal-create.helpers.js */ "./src/es/atom/helpers/normal-create.helpers.js");
/* harmony import */ var _helpers_batch_create_helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/batch-create.helpers.js */ "./src/es/atom/helpers/batch-create.helpers.js");
/* harmony import */ var _helpers_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/hybrid-create.helpers.js */ "./src/es/atom/helpers/hybrid-create.helpers.js");
/* harmony import */ var _helpers_derive_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers/derive-create.helpers.js */ "./src/es/atom/helpers/derive-create.helpers.js");
/* harmony import */ var _helpers_transform_helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./helpers/transform.helpers.js */ "./src/es/atom/helpers/transform.helpers.js");








const observe = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(2, 'observe');
const beObservedBy = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(2, 'beObservedBy');
const getAtomType = tar => {
  return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.isMediator)(tar) ? getAtomType(tar.atom) : tar.type;
};
const isSameTypeOfAtom = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.curryN)(2, (tarA, tarB) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_7__.isAtom)(tarA) || !(0,_atom_js__WEBPACK_IMPORTED_MODULE_7__.isAtom)(tarB)) {
    return false;
  } else {
    const atomTypeA = getAtomType(tarA);
    const atomTypeB = getAtomType(tarB);
    return atomTypeA === atomTypeB;
  }
});
const isSameTypeOfMediator = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.curryN)(2, (tarA, tarB) => (0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.isMediator)(tarA) && (0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.isMediator)(tarB) && tarA.type === tarB.type);
const pipeAtom = (...args) => {
  args.reverse().forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1]);
    }
  });
  return args[args.length - 1];
};
const composeAtom = (...args) => {
  args.forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1]);
    }
  });
  return args[0];
};
/**
 * Automatically pipe two atom
 *
 * - if they are in the different type, use normal pipe logic
 * - if they are in the same type, create a tween atom between them,
 *   then use normal pipe logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */

const binaryTweenPipeAtom = (upstreamAtom, downstreamAtom) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_7__.isAtom)(upstreamAtom)) {
    throw new TypeError('"upstreamAtom" argument of binaryTweenPipeAtom are expected to be type of "Mutation" or "Data".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_7__.isAtom)(downstreamAtom)) {
    throw new TypeError('"downstreamAtom" argument of binaryTweenPipeAtom are expected to be type of "Mutation" or "Data".');
  }

  if (!isSameTypeOfAtom(upstreamAtom, downstreamAtom)) {
    // data, mutation
    // mutation, data
    return pipeAtom(upstreamAtom, downstreamAtom);
  } else {
    // data, data
    // mutation, mutation
    let tweenAtom;

    if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_8__.isData)(upstreamAtom)) {
      tweenAtom = _atom_js__WEBPACK_IMPORTED_MODULE_9__.Mutation.ofLiftLeft(v => v);
    } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_9__.isMutation)(upstreamAtom)) {
      tweenAtom = _atom_js__WEBPACK_IMPORTED_MODULE_8__.Data.empty();
    } else {
      throw new TypeError('Unexpected type of Atom detected!');
    }

    return pipeAtom(upstreamAtom, tweenAtom, downstreamAtom);
  }
};
/**
 * Automatically compose two atom
 *
 * - if they are in the different type, use normal compose logic
 * - if they are in the same type, create a tween atom between them,
 *   then use normal compose logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */

const binaryTweenComposeAtom = (0,_functional_js__WEBPACK_IMPORTED_MODULE_10__.flip)(binaryTweenPipeAtom);
const nAryTweenPipeAtom = (...args) => {};
const nAryTweenComposeAtom = (...args) => {};
const binaryLiftPipeAtom = () => {};
const binaryLiftComposeAtom = () => {};
const nAryLiftPipeAtom = (...args) => {};
const nAryLiftComposeAtom = (...args) => {};
const binaryHyperPipeAtom = () => {};
const binaryHyperComposeAtom = () => {};
const nAryHyperPipeAtom = (...args) => {};
const nAryHyperComposeAtom = (...args) => {};

/***/ }),

/***/ "./src/es/atom/helpers/batch-create.helpers.js":
/*!*****************************************************!*\
  !*** ./src/es/atom/helpers/batch-create.helpers.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createDataInArray": () => (/* binding */ createDataInArray),
/* harmony export */   "createDataInObject": () => (/* binding */ createDataInObject),
/* harmony export */   "createMutationInArray": () => (/* binding */ createMutationInArray),
/* harmony export */   "createMutationInObject": () => (/* binding */ createMutationInObject),
/* harmony export */   "createAtomInArray": () => (/* binding */ createAtomInArray),
/* harmony export */   "createAtomInObject": () => (/* binding */ createAtomInObject)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _transform_helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transform.helpers.js */ "./src/es/atom/helpers/transform.helpers.js");





/**
 * items will be wrapped in Data.
 */

const forceWrapToData = item => _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.of(item);
/**
 * Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */


const wrapToData = item => (0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isData)(item) ? item : (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(item) ? (0,_transform_helpers_js__WEBPACK_IMPORTED_MODULE_2__.mutationToDataS)(item) : _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.of(item);
/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */


const createDataInArray = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (arr, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(arr)) {
    throw new TypeError(`"arr" argument in createDataInArray is expected to be type of "Array", but received ${typeof arr}.`);
  }

  const {
    forceWrap = false
  } = options;
  const wrapFn = forceWrap ? forceWrapToData : wrapToData;
  return arr.map(wrapFn);
});
/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */

const createDataInObject = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (obj, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj)) {
    throw new TypeError(`"obj" argument in createDataInObject is expected to be type of "Objcet", but received ${typeof obj}.`);
  }

  const {
    forceWrap = false
  } = options;
  const result = {};
  const wrapFn = forceWrap ? forceWrapToData : wrapToData;
  Object.entries(obj).map(([key, value]) => {
    result[key] = wrapFn(value);
  });
  return result;
});
/**
 * Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */

const forceWrapToMutation = item => _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.of(() => item);
/**
 * items will be wrapped in Mutation.
 */


const wrapToMutation = item => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isData)(item)) {
    return (0,_transform_helpers_js__WEBPACK_IMPORTED_MODULE_2__.dataToMutationS)(item);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(item)) {
    return item;
  } else if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_5__.isMutator)(item)) {
    return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.of(item);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isFunction)(item)) {
    return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftBoth(item);
  } else {
    return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.of(() => item);
  }
};
/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */


const createMutationInArray = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (arr, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(arr)) {
    throw new TypeError(`"arr" argument in createMutationInArray is expected to be type of "Array", but received ${typeof arr}.`);
  }

  const {
    forceWrap = false
  } = options;
  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation;
  return arr.map(wrapFn);
});
/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */

const createMutationInObject = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (obj, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj)) {
    throw new TypeError(`"obj" argument in createMutationInObject is expected to be type of "Objcet", but received ${typeof obj}.`);
  }

  const {
    forceWrap = false
  } = options;
  const result = {};
  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation;
  Object.entries(obj).map(([key, value]) => {
    result[key] = wrapFn(value);
  });
  return result;
});
/**
 * functions will be wrapped in Mutation, other values will be wrapped in Data.
 */

const forceWrapToAtom = item => _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.of(item);
/**
 * Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */


const wrapToAtom = item => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_6__.isAtom)(item)) {
    return item;
  } else if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_5__.isMutator)(item)) {
    return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.of(item);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isFunction)(item)) {
    return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftBoth(item);
  } else {
    return _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.of(item);
  }
};
/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */


const createAtomInArray = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (arr, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(arr)) {
    throw new TypeError(`"arr" argument in createAtomInArray is expected to be type of "Array", but received ${typeof arr}.`);
  }

  const {
    forceWrap = false
  } = options;
  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom;
  return arr.map(wrapFn);
});
/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */

const createAtomInObject = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (obj, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj)) {
    throw new TypeError(`"obj" argument in createMutationInObject is expected to be type of "Objcet", but received ${typeof obj}.`);
  }

  const {
    forceWrap = false
  } = options;
  const result = {};
  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom;
  Object.entries(obj).map(([key, value]) => {
    result[key] = wrapFn(value);
  });
  return result;
});

/***/ }),

/***/ "./src/es/atom/helpers/derive-create.helpers.js":
/*!******************************************************!*\
  !*** ./src/es/atom/helpers/derive-create.helpers.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createIterableTrigger": () => (/* binding */ createIterableTrigger),
/* harmony export */   "formatIterableTriggerCreatorFlatArgs": () => (/* binding */ formatIterableTriggerCreatorFlatArgs),
/* harmony export */   "createIterableTriggerF": () => (/* binding */ createIterableTriggerF),
/* harmony export */   "createDataFromIterable": () => (/* binding */ createDataFromIterable),
/* harmony export */   "createMutationFromIterable": () => (/* binding */ createMutationFromIterable),
/* harmony export */   "createEventTrigger": () => (/* binding */ createEventTrigger),
/* harmony export */   "formatEventTriggerCreatorFlatArgs": () => (/* binding */ formatEventTriggerCreatorFlatArgs),
/* harmony export */   "createEventTriggerF": () => (/* binding */ createEventTriggerF),
/* harmony export */   "createDataFromEvent": () => (/* binding */ createDataFromEvent),
/* harmony export */   "createMutationFromEvent": () => (/* binding */ createMutationFromEvent),
/* harmony export */   "createIntervalTrigger": () => (/* binding */ createIntervalTrigger),
/* harmony export */   "formatIntervalTriggerCreatorFlatArgs": () => (/* binding */ formatIntervalTriggerCreatorFlatArgs),
/* harmony export */   "createIntervalTriggerF": () => (/* binding */ createIntervalTriggerF),
/* harmony export */   "createDataFromInterval": () => (/* binding */ createDataFromInterval),
/* harmony export */   "createMutationFromInterval": () => (/* binding */ createMutationFromInterval),
/* harmony export */   "createTimeoutTrigger": () => (/* binding */ createTimeoutTrigger),
/* harmony export */   "formatTimeoutTriggerCreatorFlatArgs": () => (/* binding */ formatTimeoutTriggerCreatorFlatArgs),
/* harmony export */   "createTimeoutTriggerF": () => (/* binding */ createTimeoutTriggerF),
/* harmony export */   "createDataFromTimeout": () => (/* binding */ createDataFromTimeout),
/* harmony export */   "createMutationFromTimeout": () => (/* binding */ createMutationFromTimeout),
/* harmony export */   "createObservableTrigger": () => (/* binding */ createObservableTrigger),
/* harmony export */   "formatObservableTriggerCreatorFlatArgs": () => (/* binding */ formatObservableTriggerCreatorFlatArgs),
/* harmony export */   "createObservableTriggerF": () => (/* binding */ createObservableTriggerF),
/* harmony export */   "createDataFromObservable": () => (/* binding */ createDataFromObservable),
/* harmony export */   "createMutationFromObservable": () => (/* binding */ createMutationFromObservable),
/* harmony export */   "createFunctionTrigger": () => (/* binding */ createFunctionTrigger),
/* harmony export */   "formatFunctionTriggerCreatorFlatArgs": () => (/* binding */ formatFunctionTriggerCreatorFlatArgs),
/* harmony export */   "createFunctionTriggerF": () => (/* binding */ createFunctionTriggerF),
/* harmony export */   "createDataFromFunction": () => (/* binding */ createDataFromFunction),
/* harmony export */   "createMutationFromFunction": () => (/* binding */ createMutationFromFunction)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./hybrid-create.helpers.js */ "./src/es/atom/helpers/hybrid-create.helpers.js");



/************************************************************************************************************************
 *                                                 IterableTrigger creators
 ************************************************************************************************************************/

/**
 * @param iterable Iterable, which values will be trigged in sequence
 * @param autoStart Boolean, optional, default to false, indicate if the iterable will be iterated automatically
 * @param repeatable Boolean, optional, defautl to true, indicate if the iterable will be iterated repeatedly
 * @param handler Function, optional, default to asIS, will be apply to values before them passed to trigger
 */

const createIterableTrigger = ({
  iterable,
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs,
  autoStart = false,
  repeatable = true
} = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isIterable)(iterable)) {
    throw new TypeError('"iterable" is expected to be iterable.');
  }

  const iterateState = {
    times: 0,
    done: false,
    values: []
  };
  const internalTriggers = new WeakSet();

  const iterate = () => {
    try {
      iterateState.values = [...iterable];
      iterateState.values.forEach(i => {
        internalTriggers.forEach(trigger => {
          trigger(handler(i));
        });
      });
      iterateState.done = true;
      iterateState.times += 1;
    } catch (error) {}

    return iterateState;
  };

  return internalTrigger => {
    internalTriggers.add(internalTrigger);

    if (autoStart) {
      iterate();
    }

    return {
      start: () => {
        if (repeatable || iterateState.times === 0) {
          iterate();
        }

        return iterateState;
      },
      cancel: () => {}
    };
  };
};
const formatIterableTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    // accept ({ iterable, ... })
    // accept (Any)
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0]) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('iterable', args[0])) {
      res = args[0];
    } else {
      res = {
        iterable: args[0]
      };
    }
  } else if (args.length > 1) {
    const argsKeyList = ['autoStart', 'repeatable'];
    args.forEach(arg => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isIterable)(arg)) {
        res.iterable = res.iterable || arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(arg)) {
        res.handler = res.handler || arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean)(arg)) {
        res[argsKeyList.shift()] = arg;
      }
    });
  }

  return res;
};
const createIterableTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createIterableTrigger, formatIterableTriggerCreatorFlatArgs);
const createDataFromIterable = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createIterableTriggerF);
const createMutationFromIterable = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createIterableTriggerF);
/************************************************************************************************************************
 *                                                 EventTrigger creators
 ************************************************************************************************************************/

/**
 * @param target EventTarget, which has addEventListener method & removeEventListener method
 * @param type String, event type which will pass as first argument of addEventListener & removeEventListener
 * @param handler Function, optional, default to asIS, will be apply to event argument before it passed to trigger
 * @return Trigger
 */

const createEventTrigger = ({
  target,
  type,
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs
} = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isEventTarget)(target)) {
    throw new TypeError('"target" is expected to be an instance of EventTarget.');
  }

  return internalTrigger => {
    const listener = e => {
      internalTrigger(handler(e));
    };

    target.addEventListener(type, listener);
    return {
      cancel: () => {
        target.removeEventListener(type, listener);
      }
    };
  };
};
const formatEventTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    // accept ({ target: EventTarget, ... })
    // accept (Any)
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0]) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('target', args[0])) {
      res = args[0];
    } else {
      res = {
        target: args[0]
      };
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isGeneralObject)(arg)) {
        res.target = res.target || arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(arg)) {
        res.type = res.type || arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(arg)) {
        res.handler = res.handler || arg;
      }
    });
  }

  return res;
};
const createEventTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createEventTrigger, formatEventTriggerCreatorFlatArgs);
const createDataFromEvent = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createEventTriggerF);
const createMutationFromEvent = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createEventTriggerF);
/************************************************************************************************************************
 *                                                 IntervalTrigger creators
 ************************************************************************************************************************/

/**
 * @param start Number, optional, default to 0, (in millisecond) will be the start value of interval value
 * @param step Number, optional, default to 1000, (in millisecond) will add to start value when interval goes
 * @param interval Number, optional, default to 1000, (in millisecond) will be the ms argument of setInterval
 * @param autoStart Boolean, optional, default to true, indicate if the interval will auto start
 * @param handler Function, optional, default to asIs, will be apply to interval value before it passed to trigger
 * @return Trigger
 */

const createIntervalTrigger = ({
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs,
  start = 0,
  step = 1000,
  interval = 1000,
  autoStart = true
} = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  let i = start;
  let timer = 0;
  let started = false;
  const internalTriggers = new WeakSet();

  const startInterval = () => {
    started = true;

    try {
      timer = setInterval(() => {
        i += step;
        internalTriggers.forEach(trigger => {
          trigger(handler(i));
        });
      }, interval);
    } catch (error) {
      started = false;
    }

    return timer;
  };

  return internalTrigger => {
    internalTriggers.add(internalTrigger);

    if (!started && autoStart) {
      startInterval();
    }

    return {
      start: () => {
        if (!started) {
          return startInterval();
        }

        return timer;
      },
      cancel: () => {
        clearInterval(timer);
      }
    };
  };
};
const formatIntervalTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0])) {
      res = args[0];
    }
  } else if (args.length > 1) {
    const argsKeyList = ['start', 'step', 'interval', 'autoStart', 'handler'];
    args.forEach(val => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(val)) {
        res.handler = res.handler || val;
      } else {
        res[argsKeyList.shift()] = val;
      }
    });
  }

  return res;
};
const createIntervalTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createIntervalTrigger, formatIntervalTriggerCreatorFlatArgs);
const createDataFromInterval = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createIntervalTriggerF);
const createMutationFromInterval = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createIntervalTriggerF);
/************************************************************************************************************************
 *                                                 TimeoutTrigger creators
 ************************************************************************************************************************/

/**
 * @param timeout Number, required, (in millisecond) will be the ms argument of setTimeout
 * @param autoStart Boolean, optional, default to true, indicate if the timeout will auto start
 * @param handler Function, optional, default to asIs, result of its execution will be passed to trigger
 * @return Trigger
 */

const createTimeoutTrigger = ({
  timeout,
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs,
  autoStart = true
} = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isNumber)(timeout)) {
    throw new TypeError('"timeout" is required and expected to be a Number.');
  }

  let started = false;
  let timer = 0;
  const internalTriggers = new WeakSet();

  const start = () => {
    started = true;

    try {
      timer = setTimeout(() => {
        internalTriggers.forEach(trigger => {
          trigger(handler());
        });
      }, timeout);
    } catch (error) {
      started = false;
    }

    return timer;
  };

  return internalTrigger => {
    internalTriggers.add(internalTrigger);

    if (!started && autoStart) {
      start();
    }

    return {
      start: () => {
        if (!started) {
          return start();
        }

        return timer;
      },
      cancel: () => {
        clearTimeout(timer);
      }
    };
  };
};
const formatTimeoutTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0])) {
      res = args[0];
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isNumber)(arg)) {
        res.timeout = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('timeout', res) ? res.timeout : arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(arg)) {
        res.handler = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('handler', res) ? res.handler : arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean)(arg)) {
        res.autoStart = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('autoStart', res) ? res.autoStart : arg;
      }
    });
  }

  return res;
};
const createTimeoutTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createTimeoutTrigger, formatTimeoutTriggerCreatorFlatArgs);
const createDataFromTimeout = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createTimeoutTriggerF);
const createMutationFromTimeout = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createTimeoutTriggerF);
/************************************************************************************************************************
 *                                                 ObservableTrigger creators
 ************************************************************************************************************************/

/**
 * @param observable Observable, required
 * @param autoStart Boolean, optional, default to true, indicate if the Observable will be subscribed automatically
 * @param handler Function, optional, default to asIs, will be apply to emitted value of Observable before it passed to trigger
 * @return Trigger
 */

const createObservableTrigger = ({
  observable,
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs,
  autoStart = true
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObservable)(observable)) {
    throw new TypeError('"observable" is expected to be an observable object which implements the subscribe method.');
  }

  let started = false;
  let subscription;
  const internalTriggers = new WeakSet();

  const start = () => {
    try {
      started = true;
      subscription = observable.subscribe(val => {
        internalTriggers.forEach(trigger => {
          trigger(handler(val));
        });
      });
    } catch (error) {
      started = false;
    }

    return subscription;
  };

  return internalTrigger => {
    internalTriggers.add(internalTrigger);

    if (!started && autoStart) {
      start();
    }

    return {
      start: () => {
        if (!started) {
          return start();
        }

        return subscription;
      },
      cancel: () => {
        return subscription.unsubscribe();
      }
    };
  };
};
const formatObservableTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0])) {
      res = args[0];
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObservable)(arg)) {
        res.observable = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('observable', res) ? res.observable : arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(arg)) {
        res.handler = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('handler', res) ? res.handler : arg;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean)(arg)) {
        res.autoStart = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('autoStart', res) ? res.autoStart : arg;
      }
    });
  }

  return res;
};
const createObservableTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createObservableTrigger, formatObservableTriggerCreatorFlatArgs);
const createDataFromObservable = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createObservableTriggerF);
const createMutationFromObservable = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createObservableTriggerF);
/************************************************************************************************************************
 *                                                 normal function trigger creators
 ************************************************************************************************************************/

/**
 * @param agent Function, required, which takes emitFunction as argument, it will execute in create process
 * @param autoStart Boolean, optional, default to true, indicate if the shouldEmit will be set to true initially
 * @param handler Function, optional, default to asIs, will be apply to emitted value of emitFunction before it passed to trigger
 * @return Trigger
 */

const createFunctionTrigger = ({
  agent,
  handler = _internal_js__WEBPACK_IMPORTED_MODULE_0__.asIs,
  autoStart = true
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(agent)) {
    throw new TypeError('"agent" is expected to be a Function.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(handler)) {
    throw new TypeError('"handler" is expected to be a Function.');
  }

  let shouldEmit = autoStart;
  return internalTrigger => {
    let emitFunction = (...args) => {
      if (shouldEmit) {
        internalTrigger(handler(...args));
      }
    };

    agent(emitFunction);
    return {
      start: () => {
        shouldEmit = true;
      },
      pause: () => {
        shouldEmit = false;
      },
      cancel: () => {
        shouldEmit = false;
        emitFunction = null;
      }
    };
  };
};
const formatFunctionTriggerCreatorFlatArgs = (...args) => {
  let res = {};

  if (args.length === 1) {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(args[0])) {
      res = args[0];
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(args[0])) {
      res.agent = args[0];
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(arg)) {
        if (!res.agent) {
          res.agent = arg;
        } else if (!res.handler) {
          res.handler = arg;
        }
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean)(arg)) {
        res.autoStart = (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty)('autoStart', res) ? res.autoStart : arg;
      }
    });
  }

  return res;
};
const createFunctionTriggerF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(createFunctionTrigger, formatFunctionTriggerCreatorFlatArgs);
const createDataFromFunction = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger, createFunctionTriggerF);
const createMutationFromFunction = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_hybrid_create_helpers_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger, createFunctionTriggerF);

/***/ }),

/***/ "./src/es/atom/helpers/hybrid-create.helpers.js":
/*!******************************************************!*\
  !*** ./src/es/atom/helpers/hybrid-create.helpers.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "withMediator": () => (/* binding */ withMediator),
/* harmony export */   "withReplayMediator": () => (/* binding */ withReplayMediator),
/* harmony export */   "withTriggerMediator": () => (/* binding */ withTriggerMediator),
/* harmony export */   "createDataWithReplayMediator": () => (/* binding */ createDataWithReplayMediator),
/* harmony export */   "createMutationWithReplayMediator": () => (/* binding */ createMutationWithReplayMediator),
/* harmony export */   "createDataWithTriggerMediator": () => (/* binding */ createDataWithTriggerMediator),
/* harmony export */   "createMutationWithTriggerMediator": () => (/* binding */ createMutationWithTriggerMediator),
/* harmony export */   "createDataWithReplay": () => (/* binding */ createDataWithReplay),
/* harmony export */   "createMutationWithReplay": () => (/* binding */ createMutationWithReplay),
/* harmony export */   "createDataWithTrigger": () => (/* binding */ createDataWithTrigger),
/* harmony export */   "createMutationWithTrigger": () => (/* binding */ createMutationWithTrigger)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/trigger.mediators.js");



/**
 * create mediator of given atom, then return array of given atom & created mediator
 *
 * @param atom Atom
 * @param mediator Mediator
 * @param options optional, options of specified Mediator
 */

const withMediator = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (atom, mediator, options) => {
  const _mediator = mediator.of(atom, options);

  return [atom, _mediator];
});
const withReplayMediator = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(1, (atom, options = {}) => withMediator(atom, _mediators_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator, options));
const withTriggerMediator = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(1, (atom, options = {}) => withMediator(atom, _mediators_js__WEBPACK_IMPORTED_MODULE_2__.TriggerMediator, options));
/**
 * @return [data, replayMediator]
 */

const createDataWithReplayMediator = (options = {}) => withReplayMediator(_atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty(), options);
/**
 * @return [mutation, replayMediator]
 */

const createMutationWithReplayMediator = (options = {}) => withReplayMediator(_atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.empty(), options);
/**
 * @return [data, triggerMediator]
 */

const createDataWithTriggerMediator = () => withTriggerMediator(_atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
/**
 * @return [mutation, triggerMediator]
 */

const createMutationWithTriggerMediator = () => withTriggerMediator(_atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.empty());
/**
 * @param options optional, options of ReplayMediator
 * @return [data, replayMediator, options]
 */

const createDataWithReplay = (options = {}) => {
  const [data, replayMediator] = createDataWithReplayMediator(options);
  return [data, replayMediator, options];
};
/**
 * @param options optional, options of ReplayMediator
 * @return [mutation, replayMediator, options]
 */

const createMutationWithReplay = (options = {}) => {
  const [mutation, replayMediator] = createMutationWithReplayMediator(options);
  return [mutation, replayMediator, options];
};
/**
 * @param trigger Trigger
 * @return [data, triggerMediator, trigger, controller]
 */

const createDataWithTrigger = trigger => {
  const [data, triggerMediator] = createDataWithTriggerMediator();
  const controller = triggerMediator.register(trigger);
  return [data, triggerMediator, trigger, controller];
};
/**
 * @param trigger Trigger
 * @return [mutation, triggerMediator, trigger, controller]
 */

const createMutationWithTrigger = trigger => {
  const [mutation, triggerMediator] = createMutationWithTriggerMediator();
  const controller = triggerMediator.register(trigger);
  return [mutation, triggerMediator, trigger, controller];
};

/***/ }),

/***/ "./src/es/atom/helpers/normal-create.helpers.js":
/*!******************************************************!*\
  !*** ./src/es/atom/helpers/normal-create.helpers.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createEmptyData": () => (/* binding */ createEmptyData),
/* harmony export */   "createEmptyMutation": () => (/* binding */ createEmptyMutation),
/* harmony export */   "createDataOf": () => (/* binding */ createDataOf),
/* harmony export */   "createMutationOf": () => (/* binding */ createMutationOf),
/* harmony export */   "createMutationOfLL": () => (/* binding */ createMutationOfLL),
/* harmony export */   "createMutationOfLR": () => (/* binding */ createMutationOfLR),
/* harmony export */   "createMutationOfLB": () => (/* binding */ createMutationOfLB)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");


const createEmptyData = () => _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.empty();
const createEmptyMutation = () => _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.empty();
const createDataOf = (value, options) => _atom_js__WEBPACK_IMPORTED_MODULE_0__.Data.of(value, options);
const createMutationOf = (operation, options) => {
  if (!options || !(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.of(operation);
  return _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLift(operation, options);
};
const createMutationOfLL = (operation, options) => _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftLeft(operation, options);
const createMutationOfLR = (operation, options) => _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftRight(operation, options);
const createMutationOfLB = (operation, options) => _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftBoth(operation, options);

/***/ }),

/***/ "./src/es/atom/helpers/transform.helpers.js":
/*!**************************************************!*\
  !*** ./src/es/atom/helpers/transform.helpers.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mutationToDataS": () => (/* binding */ mutationToDataS),
/* harmony export */   "mutationToData": () => (/* binding */ mutationToData),
/* harmony export */   "dataToData": () => (/* binding */ dataToData),
/* harmony export */   "atomToData": () => (/* binding */ atomToData),
/* harmony export */   "dataToMutationS": () => (/* binding */ dataToMutationS),
/* harmony export */   "dataToMutation": () => (/* binding */ dataToMutation),
/* harmony export */   "mutationToMutation": () => (/* binding */ mutationToMutation),
/* harmony export */   "atomToMutation": () => (/* binding */ atomToMutation)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");




const DEFAULT_MUTATION_OPTIONS = {
  liftType: 'both'
};
/**
 * @param mutation Mutation
 * @return atom Data
 */

const mutationToDataS = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(1, (mutation, options = {}) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(mutation)) {
    throw new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _data = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty(options);

  _data.observe(mutation);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(mutation)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _data);
  } else {
    return _data;
  }
});
/**
 * @param transform Function
 * @param mutation Mutation
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "mutation"
 */

const mutationToData = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, mutation, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(mutation)) {
    throw new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _data = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();

  const _mutation = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLift(transform, options);

  const _data2 = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();

  _data2.observe(_mutation);

  _mutation.observe(_data);

  _data.observe(mutation);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(mutation)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _data2);
  } else {
    return _data2;
  }
});
/**
 * @param transform Function
 * @param data Data | ReplayMediator
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "data"
 */

const dataToData = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, data, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data)) {
    throw new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _mutation = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLift(transform, options);

  const _data = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();

  _data.observe(_mutation);

  _mutation.observe(data);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(data)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _data);
  } else {
    return _data;
  }
});
/**
 * @param transform Function
 * @param atom Atom
 * @param options Object, optional
 * @return atom Data
 */

const atomToData = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, atom, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(atom)) {
    throw new TypeError(`"atom" is expected to be type of "Mutation" | "Data", but received "${typeof atom}".`);
  }

  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(atom)) {
    return mutationToData(transform, atom, options);
  }

  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(atom)) {
    return dataToData(transform, atom, options);
  }

  throw new TypeError('Unrecognized type of "Atom" received in atomToData, expected "Mutation" | "Data".');
});
/**
 * @param data Data
 * @return atom Mutation
 */

const dataToMutationS = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(1, (data, options = {}) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data)) {
    throw new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _mutation = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftBoth(prev => prev, options);

  _mutation.observe(data);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(data)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _mutation);
  } else {
    return _mutation;
  }
});
/**
 * @param transform Function
 * @param data Atom
 * @param options Object, optional
 * @retrun atom Mutation
 */

const dataToMutation = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, data, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(data)) {
    throw new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _mutation = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLift(transform, options);

  _mutation.observe(data);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(data)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _mutation);
  } else {
    return _mutation;
  }
});
/**
 * @param transform Function
 * @param mutation Mutation
 * @param options Object, optional
 * @return atom Mutation
 */

const mutationToMutation = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, mutation, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(mutation)) {
    throw new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const _data = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();

  const _mutation = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLift(transform, options);

  _mutation.observe(_data);

  _data.observe(mutation);

  if ((0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.isReplayMediator)(mutation)) {
    return (0,_mediators_js__WEBPACK_IMPORTED_MODULE_4__.replayWithLatest)(1, _mutation);
  } else {
    return _mutation;
  }
});
/**
 * @param transform Function
 * @param atom Atom
 * @param options Object, optional
 * @param atom Mutation
 */

const atomToMutation = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (transform, atom, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isFunction)(transform)) {
    throw new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`);
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(atom)) {
    throw new TypeError(`"atom" is expected to be type of "Mutation" | "Data", but received "${typeof atom}".`);
  }

  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation)(atom)) {
    return mutationToMutation(transform, atom, options);
  }

  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(atom)) {
    return dataToMutation(transform, atom, options);
  }

  throw new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "Mutation" | "Data".');
});

/***/ }),

/***/ "./src/es/atom/index.js":
/*!******************************!*\
  !*** ./src/es/atom/index.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Datar": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.Datar),
/* harmony export */   "Mutator": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.Mutator),
/* harmony export */   "TERMINATOR": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.TERMINATOR),
/* harmony export */   "Terminator": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.Terminator),
/* harmony export */   "VACUO": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.VACUO),
/* harmony export */   "VOID": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.VOID),
/* harmony export */   "Vacuo": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.Vacuo),
/* harmony export */   "Void": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.Void),
/* harmony export */   "isDatar": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.isDatar),
/* harmony export */   "isMutator": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.isMutator),
/* harmony export */   "isTerminator": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.isTerminator),
/* harmony export */   "isVacuo": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.isVacuo),
/* harmony export */   "isVoid": () => (/* reexport safe */ _meta_js__WEBPACK_IMPORTED_MODULE_0__.isVoid),
/* harmony export */   "BaseAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.BaseAtom),
/* harmony export */   "Data": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.Data),
/* harmony export */   "Mutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation),
/* harmony export */   "isAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom),
/* harmony export */   "isData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.isData),
/* harmony export */   "isMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_1__.isMutation),
/* harmony export */   "BaseMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.BaseMediator),
/* harmony export */   "FlatMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.FlatMediator),
/* harmony export */   "ReplayMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.ReplayMediator),
/* harmony export */   "TriggerMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.TriggerMediator),
/* harmony export */   "isFlatMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.isFlatMediator),
/* harmony export */   "isMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.isMediator),
/* harmony export */   "isReplayMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.isReplayMediator),
/* harmony export */   "isTriggerMediator": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.isTriggerMediator),
/* harmony export */   "replayWithLatest": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest),
/* harmony export */   "replayWithoutLatest": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithoutLatest),
/* harmony export */   "withValueFlatted": () => (/* reexport safe */ _mediators_js__WEBPACK_IMPORTED_MODULE_2__.withValueFlatted),
/* harmony export */   "arrayCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.arrayCaseT),
/* harmony export */   "arrayCombineLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.arrayCombineLatestT),
/* harmony export */   "arrayCombineT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.arrayCombineT),
/* harmony export */   "arrayZipLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.arrayZipLatestT),
/* harmony export */   "asIsDistinctEverT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.asIsDistinctEverT),
/* harmony export */   "asIsDistinctPreviousT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.asIsDistinctPreviousT),
/* harmony export */   "caseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.caseT),
/* harmony export */   "combineLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.combineLatestT),
/* harmony export */   "combineT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.combineT),
/* harmony export */   "createArrayMSTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createArrayMSTache),
/* harmony export */   "createArraySMTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createArraySMTache),
/* harmony export */   "createGeneralTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createGeneralTache),
/* harmony export */   "createMMTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createMMTache),
/* harmony export */   "createMSTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createMSTache),
/* harmony export */   "createObjectMSTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createObjectMSTache),
/* harmony export */   "createObjectSMTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createObjectSMTache),
/* harmony export */   "createSMTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createSMTache),
/* harmony export */   "createSSTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.createSSTache),
/* harmony export */   "debounceTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.debounceTimeT),
/* harmony export */   "defaultToT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.defaultToT),
/* harmony export */   "distinctEverT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.distinctEverT),
/* harmony export */   "distinctPreviousT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.distinctPreviousT),
/* harmony export */   "dynamicArrayCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicArrayCaseT),
/* harmony export */   "dynamicDebounceTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDebounceTimeT),
/* harmony export */   "dynamicDefautToT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDefautToT),
/* harmony export */   "dynamicDistinctEverT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDistinctEverT),
/* harmony export */   "dynamicDistinctPreviousT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDistinctPreviousT),
/* harmony export */   "dynamicEffectT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicEffectT),
/* harmony export */   "dynamicEmptyStartWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicEmptyStartWithT),
/* harmony export */   "dynamicFilterT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicFilterT),
/* harmony export */   "dynamicIifT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicIifT),
/* harmony export */   "dynamicMapT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicMapT),
/* harmony export */   "dynamicObjectCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicObjectCaseT),
/* harmony export */   "dynamicPluckT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicPluckT),
/* harmony export */   "dynamicSkipT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicSkipT),
/* harmony export */   "dynamicStartWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicStartWithT),
/* harmony export */   "dynamicSwitchT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicSwitchT),
/* harmony export */   "dynamicTakeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicTakeT),
/* harmony export */   "dynamicThrottleTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicThrottleTimeT),
/* harmony export */   "effectT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.effectT),
/* harmony export */   "emptyStartWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.emptyStartWithT),
/* harmony export */   "filterT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.filterT),
/* harmony export */   "iifT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.iifT),
/* harmony export */   "mapT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.mapT),
/* harmony export */   "mergeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.mergeT),
/* harmony export */   "nilToVoidT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.nilToVoidT),
/* harmony export */   "objectCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.objectCaseT),
/* harmony export */   "objectCombineLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.objectCombineLatestT),
/* harmony export */   "objectCombineT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.objectCombineT),
/* harmony export */   "objectZipLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.objectZipLatestT),
/* harmony export */   "pairwiseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.pairwiseT),
/* harmony export */   "partitionT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.partitionT),
/* harmony export */   "pluckT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.pluckT),
/* harmony export */   "promiseSwitchT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.promiseSwitchT),
/* harmony export */   "skipT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.skipT),
/* harmony export */   "skipUntilT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.skipUntilT),
/* harmony export */   "skipWhileT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.skipWhileT),
/* harmony export */   "startWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.startWithT),
/* harmony export */   "staticArrayCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticArrayCaseT),
/* harmony export */   "staticDebounceTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticDebounceTimeT),
/* harmony export */   "staticDefaultToT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticDefaultToT),
/* harmony export */   "staticDistinctEverT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticDistinctEverT),
/* harmony export */   "staticDistinctPreviousT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticDistinctPreviousT),
/* harmony export */   "staticEffectT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticEffectT),
/* harmony export */   "staticEmptyStartWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticEmptyStartWithT),
/* harmony export */   "staticFilterT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticFilterT),
/* harmony export */   "staticIifT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticIifT),
/* harmony export */   "staticMapT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticMapT),
/* harmony export */   "staticObjectCaseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticObjectCaseT),
/* harmony export */   "staticPluckT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticPluckT),
/* harmony export */   "staticSkipT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticSkipT),
/* harmony export */   "staticStartWithT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticStartWithT),
/* harmony export */   "staticSwitchT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticSwitchT),
/* harmony export */   "staticTakeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticTakeT),
/* harmony export */   "staticThrottleTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.staticThrottleTimeT),
/* harmony export */   "switchT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.switchT),
/* harmony export */   "takeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.takeT),
/* harmony export */   "takeUntilT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.takeUntilT),
/* harmony export */   "takeWhileT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.takeWhileT),
/* harmony export */   "tapT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.tapT),
/* harmony export */   "tapValueT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.tapValueT),
/* harmony export */   "throttleTimeT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.throttleTimeT),
/* harmony export */   "truthyPairwiseT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.truthyPairwiseT),
/* harmony export */   "useGeneralTache": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.useGeneralTache),
/* harmony export */   "withDynamicHistoryT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.withDynamicHistoryT),
/* harmony export */   "withHistoryT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.withHistoryT),
/* harmony export */   "withLatestFromT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.withLatestFromT),
/* harmony export */   "withStaticHistoryT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.withStaticHistoryT),
/* harmony export */   "zipLatestT": () => (/* reexport safe */ _taches_js__WEBPACK_IMPORTED_MODULE_3__.zipLatestT),
/* harmony export */   "connectInterfaces": () => (/* reexport safe */ _drivers_js__WEBPACK_IMPORTED_MODULE_4__.connectInterfaces),
/* harmony export */   "createGeneralDriver": () => (/* reexport safe */ _drivers_js__WEBPACK_IMPORTED_MODULE_4__.createGeneralDriver),
/* harmony export */   "useGeneralDriver": () => (/* reexport safe */ _drivers_js__WEBPACK_IMPORTED_MODULE_4__.useGeneralDriver),
/* harmony export */   "atomToData": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.atomToData),
/* harmony export */   "atomToMutation": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.atomToMutation),
/* harmony export */   "beObservedBy": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.beObservedBy),
/* harmony export */   "binaryHyperComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryHyperComposeAtom),
/* harmony export */   "binaryHyperPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryHyperPipeAtom),
/* harmony export */   "binaryLiftComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryLiftComposeAtom),
/* harmony export */   "binaryLiftPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryLiftPipeAtom),
/* harmony export */   "binaryTweenComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenComposeAtom),
/* harmony export */   "binaryTweenPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom),
/* harmony export */   "composeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.composeAtom),
/* harmony export */   "createAtomInArray": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createAtomInArray),
/* harmony export */   "createAtomInObject": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createAtomInObject),
/* harmony export */   "createDataFromEvent": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromEvent),
/* harmony export */   "createDataFromFunction": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromFunction),
/* harmony export */   "createDataFromInterval": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromInterval),
/* harmony export */   "createDataFromIterable": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromIterable),
/* harmony export */   "createDataFromObservable": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromObservable),
/* harmony export */   "createDataFromTimeout": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataFromTimeout),
/* harmony export */   "createDataInArray": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataInArray),
/* harmony export */   "createDataInObject": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataInObject),
/* harmony export */   "createDataOf": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataOf),
/* harmony export */   "createDataWithReplay": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataWithReplay),
/* harmony export */   "createDataWithReplayMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataWithReplayMediator),
/* harmony export */   "createDataWithTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataWithTrigger),
/* harmony export */   "createDataWithTriggerMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createDataWithTriggerMediator),
/* harmony export */   "createEmptyData": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createEmptyData),
/* harmony export */   "createEmptyMutation": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createEmptyMutation),
/* harmony export */   "createEventTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createEventTrigger),
/* harmony export */   "createEventTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createEventTriggerF),
/* harmony export */   "createFunctionTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createFunctionTrigger),
/* harmony export */   "createFunctionTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createFunctionTriggerF),
/* harmony export */   "createIntervalTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createIntervalTrigger),
/* harmony export */   "createIntervalTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createIntervalTriggerF),
/* harmony export */   "createIterableTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createIterableTrigger),
/* harmony export */   "createIterableTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createIterableTriggerF),
/* harmony export */   "createMutationFromEvent": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromEvent),
/* harmony export */   "createMutationFromFunction": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromFunction),
/* harmony export */   "createMutationFromInterval": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromInterval),
/* harmony export */   "createMutationFromIterable": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromIterable),
/* harmony export */   "createMutationFromObservable": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromObservable),
/* harmony export */   "createMutationFromTimeout": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationFromTimeout),
/* harmony export */   "createMutationInArray": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationInArray),
/* harmony export */   "createMutationInObject": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationInObject),
/* harmony export */   "createMutationOf": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationOf),
/* harmony export */   "createMutationOfLB": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationOfLB),
/* harmony export */   "createMutationOfLL": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationOfLL),
/* harmony export */   "createMutationOfLR": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationOfLR),
/* harmony export */   "createMutationWithReplay": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationWithReplay),
/* harmony export */   "createMutationWithReplayMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationWithReplayMediator),
/* harmony export */   "createMutationWithTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationWithTrigger),
/* harmony export */   "createMutationWithTriggerMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createMutationWithTriggerMediator),
/* harmony export */   "createObservableTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createObservableTrigger),
/* harmony export */   "createObservableTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createObservableTriggerF),
/* harmony export */   "createTimeoutTrigger": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createTimeoutTrigger),
/* harmony export */   "createTimeoutTriggerF": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.createTimeoutTriggerF),
/* harmony export */   "dataToData": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.dataToData),
/* harmony export */   "dataToMutation": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.dataToMutation),
/* harmony export */   "dataToMutationS": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.dataToMutationS),
/* harmony export */   "formatEventTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatEventTriggerCreatorFlatArgs),
/* harmony export */   "formatFunctionTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatFunctionTriggerCreatorFlatArgs),
/* harmony export */   "formatIntervalTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatIntervalTriggerCreatorFlatArgs),
/* harmony export */   "formatIterableTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatIterableTriggerCreatorFlatArgs),
/* harmony export */   "formatObservableTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatObservableTriggerCreatorFlatArgs),
/* harmony export */   "formatTimeoutTriggerCreatorFlatArgs": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.formatTimeoutTriggerCreatorFlatArgs),
/* harmony export */   "getAtomType": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.getAtomType),
/* harmony export */   "isSameTypeOfAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isSameTypeOfAtom),
/* harmony export */   "isSameTypeOfMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isSameTypeOfMediator),
/* harmony export */   "mutationToData": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.mutationToData),
/* harmony export */   "mutationToDataS": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.mutationToDataS),
/* harmony export */   "mutationToMutation": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.mutationToMutation),
/* harmony export */   "nAryHyperComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryHyperComposeAtom),
/* harmony export */   "nAryHyperPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryHyperPipeAtom),
/* harmony export */   "nAryLiftComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryLiftComposeAtom),
/* harmony export */   "nAryLiftPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryLiftPipeAtom),
/* harmony export */   "nAryTweenComposeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryTweenComposeAtom),
/* harmony export */   "nAryTweenPipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.nAryTweenPipeAtom),
/* harmony export */   "observe": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.observe),
/* harmony export */   "pipeAtom": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom),
/* harmony export */   "withMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.withMediator),
/* harmony export */   "withReplayMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.withReplayMediator),
/* harmony export */   "withTriggerMediator": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_5__.withTriggerMediator)
/* harmony export */ });
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./atom.js */ "./src/es/atom/atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mediators.js */ "./src/es/atom/mediators.js");
/* harmony import */ var _taches_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./taches.js */ "./src/es/atom/taches.js");
/* harmony import */ var _drivers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./drivers.js */ "./src/es/atom/drivers.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helpers.js */ "./src/es/atom/helpers.js");







/***/ }),

/***/ "./src/es/atom/mediators.js":
/*!**********************************!*\
  !*** ./src/es/atom/mediators.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseMediator": () => (/* reexport safe */ _mediators_base_mediators_js__WEBPACK_IMPORTED_MODULE_0__.BaseMediator),
/* harmony export */   "isMediator": () => (/* reexport safe */ _mediators_base_mediators_js__WEBPACK_IMPORTED_MODULE_0__.isMediator),
/* harmony export */   "TriggerMediator": () => (/* reexport safe */ _mediators_trigger_mediators_js__WEBPACK_IMPORTED_MODULE_1__.TriggerMediator),
/* harmony export */   "isTriggerMediator": () => (/* reexport safe */ _mediators_trigger_mediators_js__WEBPACK_IMPORTED_MODULE_1__.isTriggerMediator),
/* harmony export */   "ReplayMediator": () => (/* reexport safe */ _mediators_replay_mediators_js__WEBPACK_IMPORTED_MODULE_2__.ReplayMediator),
/* harmony export */   "isReplayMediator": () => (/* reexport safe */ _mediators_replay_mediators_js__WEBPACK_IMPORTED_MODULE_2__.isReplayMediator),
/* harmony export */   "replayWithLatest": () => (/* reexport safe */ _mediators_replay_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest),
/* harmony export */   "replayWithoutLatest": () => (/* reexport safe */ _mediators_replay_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithoutLatest),
/* harmony export */   "FlatMediator": () => (/* reexport safe */ _mediators_flat_mediators_js__WEBPACK_IMPORTED_MODULE_3__.FlatMediator),
/* harmony export */   "isFlatMediator": () => (/* reexport safe */ _mediators_flat_mediators_js__WEBPACK_IMPORTED_MODULE_3__.isFlatMediator),
/* harmony export */   "withValueFlatted": () => (/* reexport safe */ _mediators_flat_mediators_js__WEBPACK_IMPORTED_MODULE_3__.withValueFlatted)
/* harmony export */ });
/* harmony import */ var _mediators_base_mediators_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mediators/base.mediators.js */ "./src/es/atom/mediators/base.mediators.js");
/* harmony import */ var _mediators_trigger_mediators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mediators/trigger.mediators.js */ "./src/es/atom/mediators/trigger.mediators.js");
/* harmony import */ var _mediators_replay_mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mediators/replay.mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _mediators_flat_mediators_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mediators/flat.mediators.js */ "./src/es/atom/mediators/flat.mediators.js");





/***/ }),

/***/ "./src/es/atom/mediators/base.mediators.js":
/*!*************************************************!*\
  !*** ./src/es/atom/mediators/base.mediators.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMediator": () => (/* binding */ isMediator),
/* harmony export */   "BaseMediator": () => (/* binding */ BaseMediator)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");


const isMediator = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isMediator;
class BaseMediator {
  constructor(atom) {
    if (new.target === BaseMediator) {
      throw new Error('BaseMediator can not be instantiated!');
    }

    this._atom = atom;
  }
  /***********************************************************
   *             Mediator's propertys and methods
   ***********************************************************/


  get isMediator() {
    return true;
  }
  /***********************************************************
   *                Atom's propertys and methods
   ***********************************************************/


  get atom() {
    return this._atom;
  }

  get isAtom() {
    return this._atom.isAtom;
  }

  get isData() {
    return this._atom.isData;
  }

  get isMutation() {
    return this._atom.isMutation;
  }

  get isEmpty() {
    return this._atom.isEmpty;
  }

  get datar() {
    if (this.isData) {
      return this._atom.datar;
    } else {
      throw new TypeError('There is no "datar" property on Mutation instance.');
    }
  }

  get value() {
    if (this.isData) {
      return this._atom.value;
    } else {
      throw new TypeError('There is no "value" property on Mutation instance.');
    }
  }

  get mutator() {
    if (this.isMutation) {
      return this._atom.mutator;
    } else {
      throw new TypeError('There is no "mutator" property on Data instance.');
    }
  }

  get operation() {
    if (this.isMutation) {
      return this._atom.operation;
    } else {
      throw new TypeError('There is no "operation" property on Data instance.');
    }
  }

  subscribe(...args) {
    return this._atom.subscribe(...args);
  }

  trigger(...args) {
    return this._atom.trigger(...args);
  }

  triggerValue(...args) {
    if (this.isData) {
      return this._atom.triggerValue(...args);
    } else {
      throw new TypeError('There is no "triggerValue" method on Mutation instance.');
    }
  }

  triggerOperation(...args) {
    if (this.isMutation) {
      return this._atom.triggerOperation(...args);
    } else {
      throw new TypeError('There is no "triggerOperation" method on Data instance.');
    }
  }

  observe(...args) {
    return this._atom.observe(...args);
  }

  beObservedBy(...args) {
    return this._atom.beObservedBy(...args);
  }

  mutate(...args) {
    return this._atom.mutate(...args);
  }

  registerTrigger(...args) {
    return this._atom.registerTrigger(...args);
  }

  pipe(...args) {
    // ! do not use:
    // ! return this._atom.pipe(...args)
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.pipe)(...args)(this);
  }

  compose(...args) {
    // ! do not use:
    // ! return this._atom.compose(...args)
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(...args)(this);
  }

  release() {
    this._atom = null;
  }

}

/***/ }),

/***/ "./src/es/atom/mediators/flat.mediators.js":
/*!*************************************************!*\
  !*** ./src/es/atom/mediators/flat.mediators.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isFlatMediator": () => (/* binding */ isFlatMediator),
/* harmony export */   "FlatMediator": () => (/* binding */ FlatMediator),
/* harmony export */   "withValueFlatted": () => (/* binding */ withValueFlatted)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.mediators.js */ "./src/es/atom/mediators/base.mediators.js");




const isFlatMediator = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isFlatMediator;
class FlatMediator extends _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__.BaseMediator {
  constructor(atom, options) {
    const flattedD = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Data.empty();
    super(flattedD);
    this._atom = flattedD;
    this._origin_atom = atom;
    this._connection = null;
    this._subscribeController = null;
    this.options = options; // initialize

    const {
      autoConnect
    } = this.options;

    if (autoConnect) {
      this.connect();
    }
  }

  get type() {
    return 'FlatMediator';
  }

  get isFlatMediator() {
    return true;
  }

  static of(atom, options) {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isAtom)(atom)) {
      throw new TypeError('FlatMediator can apply to an Atom only.');
    }

    const {
      autoConnect = true
    } = options;
    return new FlatMediator(atom, {
      autoConnect
    });
  }

  connect() {
    if (this._origin_atom.isData) {
      // Data -> extract value(Data) -> asIsM -> newData
      const asIsM = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.ofLiftLeft(prevD => prevD);
      this._subscribeController = this._origin_atom.subscribe(({
        value
      }) => {
        const subscribeController1 = this._atom.observe(asIsM);

        const subscribeController2 = asIsM.observe(value); // value is a normal Data which means it will not replay the latest value automatically

        value.trigger();
        this._connection = {
          unsubscribe: () => {
            subscribeController1.unsubscribe();
            subscribeController2.unsubscribe();
          }
        };
      });
    } else if (this.isMutation) {
      // Mutation -> tempData -> extract value(Data) -> asIsM -> newData
      const tempData = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Data.empty();
      const asIsM = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.ofLiftLeft(prevD => prevD);
      this._subscribeController = tempData.subscribe(({
        value
      }) => {
        const subscribeController1 = this._atom.observe(asIsM);

        const subscribeController2 = asIsM.observe(value); // value is a normal Data which means it will not replay the latest value automatically

        value.trigger();
        this._connection = {
          unsubscribe: () => {
            subscribeController1.unsubscribe();
            subscribeController2.unsubscribe();
          }
        };
      });
      tempData.observe(this._origin_atom);
    }
  }

  disconnect() {
    if (this._connection) {
      this._connection.unsubscribe();

      this._connection = null;
    }
  }

  release() {
    this._subscribeController.unsubscribe();

    super.release();
  }

}
const withValueFlatted = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.looseCurryN)(1, (atom, options = {}) => {
  return FlatMediator.of(atom, options);
});

/***/ }),

/***/ "./src/es/atom/mediators/replay.mediators.js":
/*!***************************************************!*\
  !*** ./src/es/atom/mediators/replay.mediators.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isReplayMediator": () => (/* binding */ isReplayMediator),
/* harmony export */   "ReplayMediator": () => (/* binding */ ReplayMediator),
/* harmony export */   "replayWithoutLatest": () => (/* binding */ replayWithoutLatest),
/* harmony export */   "replayWithLatest": () => (/* binding */ replayWithLatest)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.mediators.js */ "./src/es/atom/mediators/base.mediators.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");




const isReplayMediator = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isReplayMediator;
class ReplayMediator extends _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__.BaseMediator {
  constructor(atom, replayTime = 1) {
    super(atom);
    this._history = [];
    this._consumers = [];
    this.setReplayTime(replayTime);
    this._subscribeController = atom.subscribe(val => {
      this._history.push(val);

      this._setHistory();
    });
  }

  get type() {
    return 'ReplayMediator';
  }

  get isReplayMediator() {
    return true;
  }
  /**
   * @param options Number | Object
   */


  static of(atom, options) {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(atom)) {
      throw new TypeError('ReplayMediator can apply to an Atom only.');
    }

    if (isReplayMediator(atom)) {
      return atom;
    }

    let _options = {};

    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isNumber)(options)) {
      _options.replayTime = options;
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      _options = { ..._options,
        ...options
      };
    } else {
      throw new TypeError(`"options" argument of ReplayMediator is expected to be type of "Number" | "Object", but received ${typeof options}.`);
    }

    const {
      replayTime,
      autoTrigger = true
    } = _options;

    const _mediator = new ReplayMediator(atom, replayTime);

    if (autoTrigger) {
      atom.trigger();
    }

    return _mediator;
  }

  setReplayTime(replayTime) {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isNumber)(replayTime)) {
      throw new TypeError('repalyTime is expected to be a Number.');
    }

    this._replayTime = Math.floor(Math.abs(replayTime));

    this._setHistory();
  }

  _setHistory() {
    const t = this._history.length - this._replayTime;
    this._history = this._history.slice(t >= 0 ? t : 0);
  }

  replayTo(consumer) {
    this._history.forEach(val => {
      consumer(val);
    });
  }

  replay() {
    this._consumers.forEach(consumer => {
      this.replayTo(consumer);
    });
  }

  subscribe(consumer) {
    this._consumers.push(consumer);

    const subscribeController = this._atom.subscribe(consumer);

    this.replayTo(consumer);
    return subscribeController;
  } // NOTE: important!!!
  // !!! important


  beObservedBy(...args) {
    return args[0].observe(this);
  }

  release() {
    this._subscribeController.unsubscribe();

    super.release();
  }

}
const replayWithoutLatest = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.curryN)(2, (replayTime, atom) => {
  return ReplayMediator.of(atom, {
    replayTime,
    autoTrigger: false
  });
});
const replayWithLatest = (0,_functional_js__WEBPACK_IMPORTED_MODULE_3__.curryN)(2, (replayTime, atom) => {
  return ReplayMediator.of(atom, {
    replayTime,
    autoTrigger: true
  });
});

/***/ }),

/***/ "./src/es/atom/mediators/trigger.mediators.js":
/*!****************************************************!*\
  !*** ./src/es/atom/mediators/trigger.mediators.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isTriggerMediator": () => (/* binding */ isTriggerMediator),
/* harmony export */   "TriggerMediator": () => (/* binding */ TriggerMediator)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.mediators.js */ "./src/es/atom/mediators/base.mediators.js");



const isTriggerMediator = tar => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isTriggerMediator;
class TriggerMediator extends _base_mediators_js__WEBPACK_IMPORTED_MODULE_1__.BaseMediator {
  constructor(atom) {
    super(atom); // _map :: (trigger, controller)

    this._map = new WeakMap();
  }

  get type() {
    return 'TriggerMediator';
  }

  get isTriggerMediator() {
    return true;
  }

  static of(atom) {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(atom)) {
      throw new TypeError('TriggerMediator can apply to an Atom only.');
    }

    return new TriggerMediator(atom);
  }

  get map() {
    return this._map;
  } // _add :: (trigger, controller) -> Map


  _add(trigger, controller) {
    return this._map.set(trigger, controller);
  } // _remove :: trigger -> Boolean


  _remove(trigger) {
    return this._map.delete(trigger);
  }

  register(trigger, options) {
    const controller = this._atom.registerTrigger(trigger, options);

    controller && this._add(trigger, controller);
    return controller;
  }

  get(trigger) {
    return this._map.get(trigger);
  } // remove :: trigger -> Boolean


  remove(trigger) {
    const controller = this._map.get(trigger);

    controller && controller.cancel();
    return this._remove(trigger);
  } // removeAll :: () -> Boolean


  removeAll() {
    let successFlag = false;

    this._map.forEach((controller, trigger) => {
      controller.cancel();
      successFlag = this._remove(trigger) && successFlag;
    });

    return successFlag;
  }

  release() {
    this.removeAll();
    super.release();
  }

}

/***/ }),

/***/ "./src/es/atom/meta.js":
/*!*****************************!*\
  !*** ./src/es/atom/meta.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isDatar": () => (/* binding */ isDatar),
/* harmony export */   "isMutator": () => (/* binding */ isMutator),
/* harmony export */   "isVoid": () => (/* binding */ isVoid),
/* harmony export */   "isTerminator": () => (/* binding */ isTerminator),
/* harmony export */   "isVacuo": () => (/* binding */ isVacuo),
/* harmony export */   "Void": () => (/* binding */ Void),
/* harmony export */   "VOID": () => (/* binding */ VOID),
/* harmony export */   "Terminator": () => (/* binding */ Terminator),
/* harmony export */   "TERMINATOR": () => (/* binding */ TERMINATOR),
/* harmony export */   "Vacuo": () => (/* binding */ Vacuo),
/* harmony export */   "VACUO": () => (/* binding */ VACUO),
/* harmony export */   "Datar": () => (/* binding */ Datar),
/* harmony export */   "Mutator": () => (/* binding */ Mutator)
/* harmony export */ });
/* harmony import */ var _internal_base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/base.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");


/**
 *    Metas
 * Void       -> Void's role in Atom world is same as undefined & null 's role in normal JavaScript world.
 *               It is designed to replace values that can be converted to false, such as undefined & null.
 *               So falsy values can flowing through the Atoms as normal values flowing.
 *               For the typical usages, please check nilToVoidT & defaultT.
 * Terminator -> Terminator is designed as a signal for "interruption" of Atom Flow.
 *               Mutation will not mutate(trigger an operation to update the downstream data's value)
 *                 a Data or Datar which value is Terminator.
 *               Data will not mutate(update own value to income operation's result) a Mutation or Mutator or Operation
 *                 which result is Terminator.
 *               For the typical usages, please check filterT or skipT or takeT.
 * Vacuo      -> A value that can serve as the value (for Datar, or operation for Mutator)
 *                 of Datar and Mutator at the same time.
 * Datar      -> Designed to carry the value of Data.
 * Mutator    -> Designed to carry the operation of Mutation.
 */

const isDatar = tar => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isDatar;
const isMutator = tar => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isMutator;
const isVoid = tar => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isVoid;
const isTerminator = tar => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar) && tar.isTerminator;
const isVacuo = tar => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(tar) && tar.isVacuo;
/**
 *—————————————————————————————————————————————— Nothing Particle ————————————————————————————————————————————————————
 */

/**
 *
 */

class Void {
  get isVoid() {
    return true;
  }

}
const VOID = new Void();
/**
 *—————————————————————————————————————————————— Terminator Particle ————————————————————————————————————————————————————
 */

/**
 *
 */

class Terminator {
  get isTerminator() {
    return true;
  }

}
const TERMINATOR = new Terminator();
/**
 *—————————————————————————————————————————————— Vacuo Particle ————————————————————————————————————————————————————
 */

/**
 * 利用 JavaScript Function is also an Object 的特性，
 * 使 Vacuo 既能够作为 Datar.of() 也能作为 Mutator.of() 的参数，
 * 从而实现 Empty Datar 和 Empty Mutator。
 *
 * 因为要兼容浏览器扩展的执行环境，所以 class Vacuo extends Function 语法无法使用
 *   -> Refer: https://developer.chrome.com/docs/apps/contentSecurityPolicy/
 */

const Vacuo = () => {
  const internalVacuo = function () {};

  Object.defineProperty(internalVacuo, 'isVacuo', {
    get: () => {
      return true;
    }
  });
  Object.defineProperty(internalVacuo, 'isEmpty', {
    get: () => {
      return true;
    }
  });
  return internalVacuo;
};
const VACUO = Vacuo();
/**
 *—————————————————————————————————————————————— Datar Particle ————————————————————————————————————————————————————
 */

/**
 *
 */

class Datar {
  constructor(value, mutator = VACUO, options = {}) {
    if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(mutator) && !isMutator(mutator) && !isVacuo(mutator)) {
      throw new TypeError(`The 2nd parameter of Datar's constructor is expected to be type of "Mutator" | "Vacuo" | "Undefined", but received "${typeof mutator}".`);
    }

    this._options = options;
    this.value = value;
    this.mutator = mutator;
  }

  static of(value, mutator = undefined, options = {}) {
    return new Datar(value, mutator, options);
  }

  static empty() {
    return new Datar(VACUO);
  }

  get isDatar() {
    return true;
  }

  get isEmpty() {
    return isVacuo(this.value);
  }
  /**
   * @param { Mutator | Vacuo } mutator
   * @return { Datar } this(Datar)
   */


  fill(mutator) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw new TypeError(`The 1st parameter of Datar's fill method is expected to be type of "Mutator" | "Vacuo", but received "${typeof mutator}".`);
    }

    this.mutator = mutator;
    return this;
  }

  fillEmpty() {
    this.mutator = VACUO;
    return this;
  }

  fillAuto(mutator = VACUO) {
    return this.fill(mutator);
  }
  /**
   * Rarely used, this method exists to ensure the symmetry of Datar and Mutator.
   *
   * @param { Mutator | Vacuo } mutator default to VACUO
   * @return { function | Vacuo } operation function | Vacuo
   */


  run(mutator = VACUO, ...args) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw new TypeError(`The 1st parameter of Datar's run method is expected to be type of "Mutator" | "Vacuo", but received "${typeof mutator}".`);
    } // return operation or vacuo


    return isMutator(mutator) ? mutator.operation : mutator;
  }

}
/**
 *—————————————————————————————————————————————— Mutator Particle ————————————————————————————————————————————————————
 */

/**
 * @param { any } operation
 */

const checkOperation = operation => {
  if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(operation)) {
    throw new TypeError(`"operation" is expected to be type of "Function", but received "${typeof operation}".`);
  }
};
/**
 * @param { any } tar
 * @return { boolean } true | false
 */


const isValidOperationTarget = tar => isDatar(tar) || isVacuo(tar);
/**
 *
 */


class Mutator {
  constructor(operation, datar = VACUO, options = {}) {
    if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(datar) && !isValidOperationTarget(datar)) {
      throw new TypeError(`The 2nd parameter of Mutator's constructor is expected to be type of "Datar" | "Vacuo" | "Undefined", but received "${typeof datar}".`);
    }

    checkOperation(operation);
    this._options = options;
    this.operation = operation;
    this.datar = datar;
  }

  static of(operation, datar = undefined, options = {}) {
    return new Mutator(operation, datar, options);
  }

  static empty() {
    return new Mutator(VACUO);
  }

  get isMutator() {
    return true;
  }

  get isEmpty() {
    return isVacuo(this.operation);
  }

  static checkOperation(operation) {
    checkOperation(operation);
  }

  static isValidOpTar(tar) {
    return isValidOperationTarget(tar);
  }

  static isValidOperationTarget(tar) {
    return isValidOperationTarget(tar);
  }
  /**
   * Dispatch opration to correct lift method according to the given options.
   *
   * @param { function } operation
   * @param { { type: 'both' | 'left' | 'right' } } options
   */


  static lift(operation, options) {
    if (!options) {
      throw new TypeError(`"options" is required for lift method of Mutator, but received "${options}".`);
    }

    if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
      throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
    }

    const {
      type
    } = options;

    if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isString)(type)) {
      throw new TypeError(`"type" is expected to be type of "String", but received "${typeof type}".`);
    }

    if (type === 'both') {
      return this.liftBoth(operation);
    } else if (type === 'left') {
      return this.liftLeft(operation);
    } else if (type === 'right') {
      return this.liftRight(operation);
    } else {
      throw new TypeError(`"type" is expected be one of "both" | "left" | "right", but received "${type}".`);
    }
  }
  /**
   * Automatically unwrap both left & right param to value.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */


  static liftBoth(operation) {
    checkOperation(operation);
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.looseCurryN)(2, (prevDatar, datar, ...args) => {
      return operation(isValidOperationTarget(prevDatar) ? prevDatar.value : prevDatar, isValidOperationTarget(datar) ? datar.value : datar, ...args);
    });
  }
  /**
   * Automatically unwrap left param to value， keep right param Datar.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */


  static liftLeft(operation) {
    checkOperation(operation);
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.looseCurryN)(2, (prevDatar, datar, ...args) => {
      return operation(isValidOperationTarget(prevDatar) ? prevDatar.value : prevDatar, datar, ...args);
    });
  }
  /**
   * Automatically unwrap right param to value， keep left param Datar.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */


  static liftRight(operation) {
    checkOperation(operation);
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.looseCurryN)(2, (prevDatar, datar, ...args) => {
      return operation(prevDatar, isValidOperationTarget(datar) ? datar.value : datar, ...args);
    });
  }
  /**
   * @param { Datar | Vacuo } mutator
   * @return { Mutator } this(Mutator)
   */


  fill(datar) {
    if (!isValidOperationTarget(datar)) {
      throw new TypeError(`The 1st parameter of Mutator's fill method is expected to be type of "Datar" | "Vacuo", but received "${typeof mutator}".`);
    }

    this.datar = datar;
    return this;
  }

  fillEmpty() {
    this.datar = VACUO;
    return this;
  }

  fillAuto(datar = VACUO) {
    return this.fill(datar);
  }
  /**
   * Atom Flow: Data A -> Mutation -> Data B
   *
   *   -> Data A is observed by Mutation, Mutation is observed by Data B;
   *
   *   -> Data A emits a datar, Mutation takes that datar as the 1st parameter of operation;
   *
   *   -> Mutation takes datar from Data A, then emits a mutator, Data B will take that mutator;
   *
   *   -> Data B takes mutator from Mutation, then pass its own datar to that mutator's operation as the 2nd parameter;
   *
   *   -> The operation evaluates while it has both two parameters, the result will be wrapped in a new datar;
   *
   *   -> The new datar will be the new datar of Data B.
   *
   * @param { Datar | Vacuo } datar default to VACUO
   * @return { any }
   */


  run(datar = VACUO, ...args) {
    // 保证 Mutator 的 operation 接收到的两个必要参数都是合法的操作对象
    return this.operation(this.datar, isValidOperationTarget(datar) ? datar : Datar.of(datar), ...args);
  }

}

/***/ }),

/***/ "./src/es/atom/taches.js":
/*!*******************************!*\
  !*** ./src/es/atom/taches.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createArrayMSTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createArrayMSTache),
/* harmony export */   "createArraySMTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createArraySMTache),
/* harmony export */   "createGeneralTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createGeneralTache),
/* harmony export */   "createMMTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createMMTache),
/* harmony export */   "createMSTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createMSTache),
/* harmony export */   "createObjectMSTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createObjectMSTache),
/* harmony export */   "createObjectSMTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createObjectSMTache),
/* harmony export */   "createSMTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createSMTache),
/* harmony export */   "createSSTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.createSSTache),
/* harmony export */   "useGeneralTache": () => (/* reexport safe */ _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__.useGeneralTache),
/* harmony export */   "nilToVoidT": () => (/* reexport safe */ _taches_nilToVoid_taches_js__WEBPACK_IMPORTED_MODULE_1__.nilToVoidT),
/* harmony export */   "partitionT": () => (/* reexport safe */ _taches_partition_taches_js__WEBPACK_IMPORTED_MODULE_2__.partitionT),
/* harmony export */   "defaultToT": () => (/* reexport safe */ _taches_defaultTo_taches_js__WEBPACK_IMPORTED_MODULE_3__.defaultToT),
/* harmony export */   "dynamicDefautToT": () => (/* reexport safe */ _taches_defaultTo_taches_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDefautToT),
/* harmony export */   "staticDefaultToT": () => (/* reexport safe */ _taches_defaultTo_taches_js__WEBPACK_IMPORTED_MODULE_3__.staticDefaultToT),
/* harmony export */   "dynamicPluckT": () => (/* reexport safe */ _taches_pluck_taches_js__WEBPACK_IMPORTED_MODULE_4__.dynamicPluckT),
/* harmony export */   "pluckT": () => (/* reexport safe */ _taches_pluck_taches_js__WEBPACK_IMPORTED_MODULE_4__.pluckT),
/* harmony export */   "staticPluckT": () => (/* reexport safe */ _taches_pluck_taches_js__WEBPACK_IMPORTED_MODULE_4__.staticPluckT),
/* harmony export */   "dynamicMapT": () => (/* reexport safe */ _taches_map_taches_js__WEBPACK_IMPORTED_MODULE_5__.dynamicMapT),
/* harmony export */   "mapT": () => (/* reexport safe */ _taches_map_taches_js__WEBPACK_IMPORTED_MODULE_5__.mapT),
/* harmony export */   "staticMapT": () => (/* reexport safe */ _taches_map_taches_js__WEBPACK_IMPORTED_MODULE_5__.staticMapT),
/* harmony export */   "dynamicFilterT": () => (/* reexport safe */ _taches_filter_taches_js__WEBPACK_IMPORTED_MODULE_6__.dynamicFilterT),
/* harmony export */   "filterT": () => (/* reexport safe */ _taches_filter_taches_js__WEBPACK_IMPORTED_MODULE_6__.filterT),
/* harmony export */   "staticFilterT": () => (/* reexport safe */ _taches_filter_taches_js__WEBPACK_IMPORTED_MODULE_6__.staticFilterT),
/* harmony export */   "dynamicStartWithT": () => (/* reexport safe */ _taches_startWith_taches_js__WEBPACK_IMPORTED_MODULE_7__.dynamicStartWithT),
/* harmony export */   "startWithT": () => (/* reexport safe */ _taches_startWith_taches_js__WEBPACK_IMPORTED_MODULE_7__.startWithT),
/* harmony export */   "staticStartWithT": () => (/* reexport safe */ _taches_startWith_taches_js__WEBPACK_IMPORTED_MODULE_7__.staticStartWithT),
/* harmony export */   "dynamicEmptyStartWithT": () => (/* reexport safe */ _taches_emptyStartWith_taches_js__WEBPACK_IMPORTED_MODULE_8__.dynamicEmptyStartWithT),
/* harmony export */   "emptyStartWithT": () => (/* reexport safe */ _taches_emptyStartWith_taches_js__WEBPACK_IMPORTED_MODULE_8__.emptyStartWithT),
/* harmony export */   "staticEmptyStartWithT": () => (/* reexport safe */ _taches_emptyStartWith_taches_js__WEBPACK_IMPORTED_MODULE_8__.staticEmptyStartWithT),
/* harmony export */   "debounceTimeT": () => (/* reexport safe */ _taches_debounce_taches_js__WEBPACK_IMPORTED_MODULE_9__.debounceTimeT),
/* harmony export */   "dynamicDebounceTimeT": () => (/* reexport safe */ _taches_debounce_taches_js__WEBPACK_IMPORTED_MODULE_9__.dynamicDebounceTimeT),
/* harmony export */   "staticDebounceTimeT": () => (/* reexport safe */ _taches_debounce_taches_js__WEBPACK_IMPORTED_MODULE_9__.staticDebounceTimeT),
/* harmony export */   "dynamicThrottleTimeT": () => (/* reexport safe */ _taches_throttle_taches_js__WEBPACK_IMPORTED_MODULE_10__.dynamicThrottleTimeT),
/* harmony export */   "staticThrottleTimeT": () => (/* reexport safe */ _taches_throttle_taches_js__WEBPACK_IMPORTED_MODULE_10__.staticThrottleTimeT),
/* harmony export */   "throttleTimeT": () => (/* reexport safe */ _taches_throttle_taches_js__WEBPACK_IMPORTED_MODULE_10__.throttleTimeT),
/* harmony export */   "pairwiseT": () => (/* reexport safe */ _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__.pairwiseT),
/* harmony export */   "truthyPairwiseT": () => (/* reexport safe */ _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__.truthyPairwiseT),
/* harmony export */   "withDynamicHistoryT": () => (/* reexport safe */ _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__.withDynamicHistoryT),
/* harmony export */   "withHistoryT": () => (/* reexport safe */ _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__.withHistoryT),
/* harmony export */   "withStaticHistoryT": () => (/* reexport safe */ _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__.withStaticHistoryT),
/* harmony export */   "dynamicSwitchT": () => (/* reexport safe */ _taches_switch_taches_js__WEBPACK_IMPORTED_MODULE_12__.dynamicSwitchT),
/* harmony export */   "promiseSwitchT": () => (/* reexport safe */ _taches_switch_taches_js__WEBPACK_IMPORTED_MODULE_12__.promiseSwitchT),
/* harmony export */   "staticSwitchT": () => (/* reexport safe */ _taches_switch_taches_js__WEBPACK_IMPORTED_MODULE_12__.staticSwitchT),
/* harmony export */   "switchT": () => (/* reexport safe */ _taches_switch_taches_js__WEBPACK_IMPORTED_MODULE_12__.switchT),
/* harmony export */   "asIsDistinctPreviousT": () => (/* reexport safe */ _taches_distinctPrevious_taches_js__WEBPACK_IMPORTED_MODULE_13__.asIsDistinctPreviousT),
/* harmony export */   "distinctPreviousT": () => (/* reexport safe */ _taches_distinctPrevious_taches_js__WEBPACK_IMPORTED_MODULE_13__.distinctPreviousT),
/* harmony export */   "dynamicDistinctPreviousT": () => (/* reexport safe */ _taches_distinctPrevious_taches_js__WEBPACK_IMPORTED_MODULE_13__.dynamicDistinctPreviousT),
/* harmony export */   "staticDistinctPreviousT": () => (/* reexport safe */ _taches_distinctPrevious_taches_js__WEBPACK_IMPORTED_MODULE_13__.staticDistinctPreviousT),
/* harmony export */   "asIsDistinctEverT": () => (/* reexport safe */ _taches_distinctEver_taches_js__WEBPACK_IMPORTED_MODULE_14__.asIsDistinctEverT),
/* harmony export */   "distinctEverT": () => (/* reexport safe */ _taches_distinctEver_taches_js__WEBPACK_IMPORTED_MODULE_14__.distinctEverT),
/* harmony export */   "dynamicDistinctEverT": () => (/* reexport safe */ _taches_distinctEver_taches_js__WEBPACK_IMPORTED_MODULE_14__.dynamicDistinctEverT),
/* harmony export */   "staticDistinctEverT": () => (/* reexport safe */ _taches_distinctEver_taches_js__WEBPACK_IMPORTED_MODULE_14__.staticDistinctEverT),
/* harmony export */   "dynamicSkipT": () => (/* reexport safe */ _taches_skip_taches_js__WEBPACK_IMPORTED_MODULE_15__.dynamicSkipT),
/* harmony export */   "skipT": () => (/* reexport safe */ _taches_skip_taches_js__WEBPACK_IMPORTED_MODULE_15__.skipT),
/* harmony export */   "staticSkipT": () => (/* reexport safe */ _taches_skip_taches_js__WEBPACK_IMPORTED_MODULE_15__.staticSkipT),
/* harmony export */   "skipUntilT": () => (/* reexport safe */ _taches_skipUntil_taches_js__WEBPACK_IMPORTED_MODULE_16__.skipUntilT),
/* harmony export */   "skipWhileT": () => (/* reexport safe */ _taches_skipWhile_taches_js__WEBPACK_IMPORTED_MODULE_17__.skipWhileT),
/* harmony export */   "dynamicTakeT": () => (/* reexport safe */ _taches_take_taches_js__WEBPACK_IMPORTED_MODULE_18__.dynamicTakeT),
/* harmony export */   "staticTakeT": () => (/* reexport safe */ _taches_take_taches_js__WEBPACK_IMPORTED_MODULE_18__.staticTakeT),
/* harmony export */   "takeT": () => (/* reexport safe */ _taches_take_taches_js__WEBPACK_IMPORTED_MODULE_18__.takeT),
/* harmony export */   "takeUntilT": () => (/* reexport safe */ _taches_takeUntil_taches_js__WEBPACK_IMPORTED_MODULE_19__.takeUntilT),
/* harmony export */   "takeWhileT": () => (/* reexport safe */ _taches_takeWhile_taches_js__WEBPACK_IMPORTED_MODULE_20__.takeWhileT),
/* harmony export */   "dynamicIifT": () => (/* reexport safe */ _taches_iif_taches_js__WEBPACK_IMPORTED_MODULE_21__.dynamicIifT),
/* harmony export */   "iifT": () => (/* reexport safe */ _taches_iif_taches_js__WEBPACK_IMPORTED_MODULE_21__.iifT),
/* harmony export */   "staticIifT": () => (/* reexport safe */ _taches_iif_taches_js__WEBPACK_IMPORTED_MODULE_21__.staticIifT),
/* harmony export */   "arrayCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.arrayCaseT),
/* harmony export */   "caseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.caseT),
/* harmony export */   "dynamicArrayCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.dynamicArrayCaseT),
/* harmony export */   "dynamicObjectCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.dynamicObjectCaseT),
/* harmony export */   "objectCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.objectCaseT),
/* harmony export */   "staticArrayCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.staticArrayCaseT),
/* harmony export */   "staticObjectCaseT": () => (/* reexport safe */ _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__.staticObjectCaseT),
/* harmony export */   "arrayCombineT": () => (/* reexport safe */ _taches_combine_taches_js__WEBPACK_IMPORTED_MODULE_23__.arrayCombineT),
/* harmony export */   "combineT": () => (/* reexport safe */ _taches_combine_taches_js__WEBPACK_IMPORTED_MODULE_23__.combineT),
/* harmony export */   "objectCombineT": () => (/* reexport safe */ _taches_combine_taches_js__WEBPACK_IMPORTED_MODULE_23__.objectCombineT),
/* harmony export */   "arrayCombineLatestT": () => (/* reexport safe */ _taches_combineLatest_taches_js__WEBPACK_IMPORTED_MODULE_24__.arrayCombineLatestT),
/* harmony export */   "combineLatestT": () => (/* reexport safe */ _taches_combineLatest_taches_js__WEBPACK_IMPORTED_MODULE_24__.combineLatestT),
/* harmony export */   "objectCombineLatestT": () => (/* reexport safe */ _taches_combineLatest_taches_js__WEBPACK_IMPORTED_MODULE_24__.objectCombineLatestT),
/* harmony export */   "mergeT": () => (/* reexport safe */ _taches_merge_taches_js__WEBPACK_IMPORTED_MODULE_25__.mergeT),
/* harmony export */   "arrayZipLatestT": () => (/* reexport safe */ _taches_zip_taches_js__WEBPACK_IMPORTED_MODULE_26__.arrayZipLatestT),
/* harmony export */   "objectZipLatestT": () => (/* reexport safe */ _taches_zip_taches_js__WEBPACK_IMPORTED_MODULE_26__.objectZipLatestT),
/* harmony export */   "zipLatestT": () => (/* reexport safe */ _taches_zip_taches_js__WEBPACK_IMPORTED_MODULE_26__.zipLatestT),
/* harmony export */   "withLatestFromT": () => (/* reexport safe */ _taches_withLatestFrom_taches_js__WEBPACK_IMPORTED_MODULE_27__.withLatestFromT),
/* harmony export */   "dynamicEffectT": () => (/* reexport safe */ _taches_effect_taches_js__WEBPACK_IMPORTED_MODULE_28__.dynamicEffectT),
/* harmony export */   "effectT": () => (/* reexport safe */ _taches_effect_taches_js__WEBPACK_IMPORTED_MODULE_28__.effectT),
/* harmony export */   "staticEffectT": () => (/* reexport safe */ _taches_effect_taches_js__WEBPACK_IMPORTED_MODULE_28__.staticEffectT),
/* harmony export */   "tapT": () => (/* reexport safe */ _taches_tap_taches_js__WEBPACK_IMPORTED_MODULE_29__.tapT),
/* harmony export */   "tapValueT": () => (/* reexport safe */ _taches_tap_taches_js__WEBPACK_IMPORTED_MODULE_29__.tapValueT)
/* harmony export */ });
/* harmony import */ var _taches_base_taches_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./taches/base.taches.js */ "./src/es/atom/taches/base.taches.js");
/* harmony import */ var _taches_nilToVoid_taches_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./taches/nilToVoid.taches.js */ "./src/es/atom/taches/nilToVoid.taches.js");
/* harmony import */ var _taches_partition_taches_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./taches/partition.taches.js */ "./src/es/atom/taches/partition.taches.js");
/* harmony import */ var _taches_defaultTo_taches_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./taches/defaultTo.taches.js */ "./src/es/atom/taches/defaultTo.taches.js");
/* harmony import */ var _taches_pluck_taches_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./taches/pluck.taches.js */ "./src/es/atom/taches/pluck.taches.js");
/* harmony import */ var _taches_map_taches_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./taches/map.taches.js */ "./src/es/atom/taches/map.taches.js");
/* harmony import */ var _taches_filter_taches_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./taches/filter.taches.js */ "./src/es/atom/taches/filter.taches.js");
/* harmony import */ var _taches_startWith_taches_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./taches/startWith.taches.js */ "./src/es/atom/taches/startWith.taches.js");
/* harmony import */ var _taches_emptyStartWith_taches_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./taches/emptyStartWith.taches.js */ "./src/es/atom/taches/emptyStartWith.taches.js");
/* harmony import */ var _taches_debounce_taches_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./taches/debounce.taches.js */ "./src/es/atom/taches/debounce.taches.js");
/* harmony import */ var _taches_throttle_taches_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./taches/throttle.taches.js */ "./src/es/atom/taches/throttle.taches.js");
/* harmony import */ var _taches_withHistory_taches_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./taches/withHistory.taches.js */ "./src/es/atom/taches/withHistory.taches.js");
/* harmony import */ var _taches_switch_taches_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./taches/switch.taches.js */ "./src/es/atom/taches/switch.taches.js");
/* harmony import */ var _taches_distinctPrevious_taches_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./taches/distinctPrevious.taches.js */ "./src/es/atom/taches/distinctPrevious.taches.js");
/* harmony import */ var _taches_distinctEver_taches_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./taches/distinctEver.taches.js */ "./src/es/atom/taches/distinctEver.taches.js");
/* harmony import */ var _taches_skip_taches_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./taches/skip.taches.js */ "./src/es/atom/taches/skip.taches.js");
/* harmony import */ var _taches_skipUntil_taches_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./taches/skipUntil.taches.js */ "./src/es/atom/taches/skipUntil.taches.js");
/* harmony import */ var _taches_skipWhile_taches_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./taches/skipWhile.taches.js */ "./src/es/atom/taches/skipWhile.taches.js");
/* harmony import */ var _taches_take_taches_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./taches/take.taches.js */ "./src/es/atom/taches/take.taches.js");
/* harmony import */ var _taches_takeUntil_taches_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./taches/takeUntil.taches.js */ "./src/es/atom/taches/takeUntil.taches.js");
/* harmony import */ var _taches_takeWhile_taches_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./taches/takeWhile.taches.js */ "./src/es/atom/taches/takeWhile.taches.js");
/* harmony import */ var _taches_iif_taches_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./taches/iif.taches.js */ "./src/es/atom/taches/iif.taches.js");
/* harmony import */ var _taches_case_taches_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./taches/case.taches.js */ "./src/es/atom/taches/case.taches.js");
/* harmony import */ var _taches_combine_taches_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./taches/combine.taches.js */ "./src/es/atom/taches/combine.taches.js");
/* harmony import */ var _taches_combineLatest_taches_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./taches/combineLatest.taches.js */ "./src/es/atom/taches/combineLatest.taches.js");
/* harmony import */ var _taches_merge_taches_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./taches/merge.taches.js */ "./src/es/atom/taches/merge.taches.js");
/* harmony import */ var _taches_zip_taches_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./taches/zip.taches.js */ "./src/es/atom/taches/zip.taches.js");
/* harmony import */ var _taches_withLatestFrom_taches_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./taches/withLatestFrom.taches.js */ "./src/es/atom/taches/withLatestFrom.taches.js");
/* harmony import */ var _taches_effect_taches_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./taches/effect.taches.js */ "./src/es/atom/taches/effect.taches.js");
/* harmony import */ var _taches_tap_taches_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./taches/tap.taches.js */ "./src/es/atom/taches/tap.taches.js");
// creators
 // Single to Single

 // Single to Multi

 // Multi to Single


























 // utils



/***/ }),

/***/ "./src/es/atom/taches/base.taches.js":
/*!*******************************************!*\
  !*** ./src/es/atom/taches/base.taches.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGeneralTache": () => (/* binding */ createGeneralTache),
/* harmony export */   "useGeneralTache": () => (/* binding */ useGeneralTache),
/* harmony export */   "createSSTache": () => (/* binding */ createSSTache),
/* harmony export */   "createSMTache": () => (/* binding */ createSMTache),
/* harmony export */   "createArraySMTache": () => (/* binding */ createArraySMTache),
/* harmony export */   "createObjectSMTache": () => (/* binding */ createObjectSMTache),
/* harmony export */   "createMSTache": () => (/* binding */ createMSTache),
/* harmony export */   "createArrayMSTache": () => (/* binding */ createArrayMSTache),
/* harmony export */   "createObjectMSTache": () => (/* binding */ createObjectMSTache),
/* harmony export */   "createMMTache": () => (/* binding */ createMMTache)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");





 // S -> Single, M -> Multi

const DEFAULT_MUTATION_OPTIONS = {
  liftType: 'both'
};
/**
 * @param { {} | function } createOptions
 * @return { function }
 */

const createGeneralTache = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(2, (createOptions = {}, tacheOptions = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(createOptions) && !(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(createOptions)) {
    throw new TypeError(`"createOptions" is expected to be type of "Object" | "Function", but received "${typeof createOptions}".`);
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(createOptions)) {
    createOptions = {
      prepareMidpiece: createOptions
    };
  }

  const {
    prepareTacheLevelContexts = () => ({}),
    prepareOptions = options => options,
    prepareInput = (_0, _1, source) => source,
    prepareMidpiece = () => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftBoth(any => any),
    prepareOutput = () => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty(),
    connect = (options, [inputs, midpieces, outputs]) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(midpieces, outputs);
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(inputs, midpieces);
    }
  } = createOptions;
  const tacheLevelContexts = prepareTacheLevelContexts();

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(tacheLevelContexts)) {
    throw new TypeError(`"tacheLevelContexts" is expected to be type of "Object", but received "${typeof tacheLevelContexts}".`);
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(tacheOptions)) {
    throw new TypeError(`"tacheOptions" is expected to be type of "Object", but received "${typeof tacheOptions}".`);
  }

  tacheOptions = prepareOptions(tacheOptions);

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(tacheOptions)) {
    throw new TypeError(`The returned value of "prepareOptions" is expected to be type of "Object", but received "${typeof tacheOptions}".`);
  }

  return (...sources) => {
    const inputs = prepareInput(tacheOptions, tacheLevelContexts, sources.length > 1 ? sources : sources[0]);
    const midpieces = prepareMidpiece(tacheOptions, tacheLevelContexts, inputs);
    const outputs = prepareOutput(tacheOptions, tacheLevelContexts, midpieces);
    connect(tacheOptions, tacheLevelContexts, [inputs, midpieces, outputs]);
    return outputs;
  };
});
/**
 * @param { function } tacheMaker partial applied createGeneralTache
 */

const useGeneralTache = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(3, (tacheMaker, tacheOptions, ...sources) => {
  const tache = tacheMaker(tacheOptions);
  const outputs = sources.length > 1 ? tache(...sources) : tache(sources[0]);
  return outputs;
});
/**
 * @param { function | object }  operation
 * @param { ?{ type?: string } } options which type is LiftType the operation will use
 * @accept ({ operation, options? })
 * @accept (operation, options?)
 * @return TacheMaker
 */

const createSSTache = (operation, options = { ...DEFAULT_MUTATION_OPTIONS
}) => {
  // @accept ({ operation, options? })
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(operation) && operation.operation) {
    options = operation.options ? { ...DEFAULT_MUTATION_OPTIONS,
      ...operation.options
    } : { ...DEFAULT_MUTATION_OPTIONS
    };
    operation = operation.operation;
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(operation)) {
    throw new TypeError(`"operation" is expected to be type of "Function", but received ${typeof operation}.`);
  }

  const {
    liftType = 'both'
  } = options;
  /**
   * @param { Atom }target
   * @return { Data }
   */

  return target => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(target)) {
      throw new TypeError('"target" is expected to be type of "Atom".');
    }

    const mutation = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLift(operation, {
      liftType
    });
    const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(mutation, outputD);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, mutation);
    return outputD;
  };
};
/**
 * @accept ({}) -> ({ name: { operation, options? } | operation, ...})
 * @accept ([]) -> ([{ operation, options? } | operation ...])
 * @accept (...) -> ({ operation, options? } | operation, ...)
 * @return TacheMaker
 */

const createSMTache = (...args) => {
  if (args.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(args[0])) {
    return createObjectSMTache(args[0]);
  }

  if (args.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(args[0])) {
    return createArraySMTache(...args[0]);
  }

  if (args.length > 1) {
    return createArraySMTache(...args);
  }
};
/**
 * @accept ({ operation, options? } | operation, ...)
 * @accept ([{ operation, options? } | operation ...])
 * @return TacheMaker
 */

const createArraySMTache = (...configArr) => {
  // @accept ([{ operation, options? } | operation ...])
  if (configArr.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(configArr[0])) {
    configArr = configArr[0];
  }

  configArr = configArr.map(config => {
    let operation, options;

    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config) && config.operation) {
      // @accept config -> { operation, options? }
      options = config.options ? { ...DEFAULT_MUTATION_OPTIONS,
        ...config.options
      } : { ...DEFAULT_MUTATION_OPTIONS
      };
      operation = config.operation;
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(config)) {
      // @accept config -> operation
      options = { ...DEFAULT_MUTATION_OPTIONS
      };
      operation = config;
    } else {
      throw new TypeError(`"config" is expected to be type of "Object" | "Function", but received ${typeof config}.`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(operation)) {
      throw new TypeError(`"operation" is expected to be type of "Function", but received ${typeof config}.`);
    }

    return {
      operation,
      options
    };
  });
  /**
   * @param target Atom
   * @return Array of Data
   */

  return target => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(target)) {
      throw new TypeError('"target" is expected to be type of "Atom".');
    }

    const mutations = configArr.map(({
      operation,
      options
    }) => {
      const {
        liftType = 'both'
      } = options;
      return _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLift(operation, {
        liftType
      });
    });
    const outputs = Array.from({
      length: configArr.length
    }).map(() => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
    outputs.forEach((output, index) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(mutations[index], output);
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, mutations[index]);
    });
    return outputs;
  };
};
/**
 * @param { {} } configObj
 * @accept ({ name: { operation, options? } | operation, ...})
 * @return TacheMaker
 */

const createObjectSMTache = configObj => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(configObj)) {
    throw new TypeError(`"configObj" is expected to be type of "Object", but received ${typeof configObj}.`);
  }

  configObj = Object.entries(configObj).reduce((acc, [name, config]) => {
    let operation, options;

    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config) && config.operation) {
      options = config.options ? { ...DEFAULT_MUTATION_OPTIONS,
        ...config.options
      } : { ...DEFAULT_MUTATION_OPTIONS
      };
      operation = config.operation;
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(config)) {
      options = { ...DEFAULT_MUTATION_OPTIONS
      };
      operation = config;
    } else {
      throw new TypeError(`"config" is expected to be type of "Object" | "Function", but received ${typeof config}.`);
    }

    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(operation)) {
      throw new TypeError(`"operation" is expected to be type of "Function", but received ${typeof config}.`);
    }

    acc[name] = acc[name] || {
      operation,
      options
    };
    return acc;
  }, {});
  /**
   * @param target Atom
   * @return Object of Data
   */

  return target => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(target)) {
      throw new TypeError('"target" is expected to be type of "Atom".');
    }

    const mutations = Object.entries(configObj).reduce((acc, [name, {
      operation,
      options
    }]) => {
      const {
        liftType = 'both'
      } = options;
      acc[name] = acc[name] || _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLift(operation, {
        liftType
      });
      return acc;
    }, {});
    const outputs = Object.entries(configObj).reduce((acc, [name]) => {
      acc[name] = acc[name] || _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
      return acc;
    }, {});
    Object.entries(outputs).forEach(([name, output]) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(mutations[name], output);
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, mutations[name]);
    });
    return outputs;
  };
};
/**
 * @param { ?{ sourcesType?: 'Array' | "Object" } } config
 * @return TacheMaker
 */

const createMSTache = (config = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config)) {
    throw new TypeError(`"config" is expected to be type of "Object", but received "${typeof config}".`);
  }

  const {
    sourcesType
  } = config;

  if (sourcesType.toLowerCase() === 'array') {
    return createArrayMSTache(config);
  }

  if (sourcesType.toLowerCase() === 'object') {
    return createObjectMSTache(config);
  }
  /**
   * @accept ({ name: Atom | Any, ...})
   * @accept ([Atom | Any, ...])
   * @accept (Atom | Any, ...)
   * @return Data
   */


  return (...sources) => {
    if (sources.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(sources[0])) {
      return createObjectMSTache(config)(sources[0]);
    }

    if (sources.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(sources[0])) {
      return createArrayMSTache(config)(...sources[0]);
    }

    if (sources.length > 1) {
      return createArraySMTache(config)(...sources);
    }
  };
};
/**
 * @param { ?{
 *   numberOfSources?: number,
 *   acceptNonAtom?: boolean,
 *   opCustomizeType?: 'fully' | 'partly',
 *   opLiftType?: 'both' | 'left' | 'right',
 *   operation: function,
 *   autoUpdateContexts?: boolean
 * } } config
 * @return TacheMaker
 */

const createArrayMSTache = (config = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config)) {
    throw new TypeError(`"config" is expected to be type of "Object", but received ${typeof config}.`);
  }

  const {
    numberOfSources = undefined,
    acceptNonAtom = true,
    opCustomizeType = 'partly',
    opLiftType = 'both',
    operation,
    autoUpdateContexts = true
  } = config;

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(opCustomizeType)) {
    throw new TypeError(`"opCustomizeType" is expected to be type of "String", but received "${typeof opCustomizeType}".`);
  }

  if (opCustomizeType.toLowerCase() !== 'partly' && opCustomizeType.toLowerCase() !== 'fully') {
    throw new TypeError(`"opCustomizeType" is expected to be "fully" | "partly", but received "${opCustomizeType}".`);
  }

  if (operation === undefined) {
    throw new TypeError('"operation" is required when use makeArrayMSTache to make tache.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(operation)) {
    throw new TypeError(`"operation" is expected to be type of "Function", but received ${typeof operation}.`);
  }
  /**
   * @accept (Atom, ...)
   * @accept ([Atom, ...])
   * @return Data
   */


  const tache = (...sources) => {
    if (!acceptNonAtom) {
      sources.forEach(source => {
        if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(source)) {
          throw new TypeError(`"source" is expected to be type of "Atom", but received ${typeof source}.`);
        }
      });
    } else {
      sources = sources.map(source => {
        return (0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(source) ? source : (0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(source));
      });
    }

    const length = sources.length;
    const wrapMutations = Array.from({
      length
    }).map((val, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      id: idx,
      value: prev
    })));
    const wrappedDatas = Array.from({
      length
    }).map(() => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
    const trunkM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLift((() => {
      const baseContexts = {
        numberOfSources: length,
        TERMINATOR: _meta_js__WEBPACK_IMPORTED_MODULE_7__.TERMINATOR
      };

      if (opCustomizeType.toLowerCase() === 'fully') {
        const contexts = { ...baseContexts
        };
        const actualOperation = operation(contexts);

        if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(actualOperation)) {
          throw new TypeError('"operation" is expected to return a "Function" when "opCustomizeType" is specified to "fully".');
        }

        return actualOperation;
      }

      if (opCustomizeType.toLowerCase() === 'partly') {
        const contexts = { ...baseContexts,
          states: Array.from({
            length: length
          }),
          values: Array.from({
            length: length
          })
        }; // actual operation which will takes prevDatar(or its value) & datar(ot its value) as argument

        return (prev, cur, mutation, ...args) => {
          if (autoUpdateContexts) {
            const {
              id,
              value
            } = prev;
            contexts.states[id] = true;
            contexts.values[id] = value;
          }

          return operation(prev, cur, mutation, contexts, ...args);
        };
      }
    })(), {
      liftType: opLiftType
    });
    const output = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(trunkM, output);
    wrappedDatas.forEach(data => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(data, trunkM);
    });
    wrapMutations.forEach((wrapMutation, idx) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapMutation, wrappedDatas[idx]);
    });
    sources.forEach((source, idx) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(source, wrapMutations[idx]);
    });
    return output;
  };

  if (numberOfSources) {
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN)(numberOfSources, tache);
  } else {
    return (...sources) => {
      if (sources.length === 1 && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(sources[0])) {
        sources = sources[0];
      }

      return tache(...sources);
    };
  }
};
/**
 * @param { ?{
 *   acceptNonAtom?: boolean,
 *   opCustomizeType?: 'fully' | 'partly',
 *   opLiftType?: 'both' | 'left' | 'right',
 *   operation: function,
 *   autoUpdateContexts?: boolean
 * } }config
 * @return TacheMaker
 */

const createObjectMSTache = (config = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config)) {
    throw new TypeError(`"config" is expected to be type of "Object", but received "${typeof config}".`);
  }

  const {
    acceptNonAtom = true,
    opCustomizeType = 'partly',
    opLiftType = 'both',
    operation,
    autoUpdateContexts = true
  } = config;

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(opCustomizeType)) {
    throw new TypeError(`"opCustomizeType" is expected to be type of "String", but received "${typeof opCustomizeType}".`);
  }

  if (opCustomizeType.toLowerCase() !== 'partly' && opCustomizeType.toLowerCase() !== 'fully') {
    throw new TypeError(`"opCustomizeType" is expected to be "fully" | "partly", but received "${opCustomizeType}".`);
  }

  if (operation === undefined) {
    throw new TypeError('"operation" is required when use makeObjectMSTache to make tache.');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(operation)) {
    throw new TypeError(`"operation" is expected to be type of "Function", but received "${typeof operation}".`);
  }
  /**
   * @param sources Object
   * @accept ({ name: Atom | Any, ...})
   * @return Data
   */


  const tache = sources => {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(sources)) {
      throw new TypeError(`"sources" is expected to be type of "Object", but received "${typeof sources}".`);
    }

    if (!acceptNonAtom) {
      Object.values(sources).forEach(source => {
        if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(source)) {
          throw new TypeError(`"source" is expected to be type of "Atom", but received "${typeof source}".`);
        }
      });
    } else {
      sources = Object.entries(sources).reduce((newSources, [name, source]) => {
        newSources[name] = newSources[name] || ((0,_atom_js__WEBPACK_IMPORTED_MODULE_5__.isAtom)(source) ? source : (0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(source)));
        return newSources;
      }, {});
    }

    const wrapMutations = Object.entries(sources).reduce((mutations, [key]) => {
      mutations[key] = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
        key: key,
        value: prev
      }));
      return mutations;
    }, {});
    const wrappedDatas = Object.entries(sources).reduce((datas, [key]) => {
      datas[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
      return datas;
    }, {});
    const trunkM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLift((() => {
      const baseContexts = {
        keysOfSources: Object.keys(sources),
        TERMINATOR: _meta_js__WEBPACK_IMPORTED_MODULE_7__.TERMINATOR
      };

      if (opCustomizeType.toLowerCase() === 'fully') {
        const contexts = { ...baseContexts
        };
        const actualOperation = operation(contexts);

        if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(actualOperation)) {
          throw new TypeError('"operation" is expected to return a "Function" when "opCustomizeType" is specified to "fully".');
        }

        return actualOperation;
      }

      if (opCustomizeType.toLowerCase() === 'partly') {
        const contexts = { ...baseContexts,
          states: Object.keys(sources).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
          values: Object.keys(sources).reduce((acc, key) => {
            acc[key] = undefined;
            return acc;
          }, {})
        }; // actual operation which will takes prevDatar(or its value) & datar(ot its value) as argument

        return (prev, cur, mutation, ...args) => {
          if (autoUpdateContexts) {
            const {
              key,
              value
            } = prev;
            contexts.states[key] = true;
            contexts.values[key] = value;
          }

          return operation(prev, cur, mutation, contexts, ...args);
        };
      }
    })(), {
      liftType: opLiftType
    });
    const output = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(trunkM, output);
    Object.values(wrappedDatas).forEach(data => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(data, trunkM);
    });
    Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapMutation, wrappedDatas[key]);
    });
    Object.entries(sources).forEach(([key, source]) => {
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(source, wrapMutations[key]);
    });
    return output;
  };

  return tache;
}; // TODO: waiting for suitable usage scenarios

const createMMTache = () => {
  throw new Error('makeMMTache to be developed.');
};

/***/ }),

/***/ "./src/es/atom/taches/case.taches.js":
/*!*******************************************!*\
  !*** ./src/es/atom/taches/case.taches.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "caseT": () => (/* binding */ caseT),
/* harmony export */   "arrayCaseT": () => (/* binding */ arrayCaseT),
/* harmony export */   "dynamicArrayCaseT": () => (/* binding */ dynamicArrayCaseT),
/* harmony export */   "staticArrayCaseT": () => (/* binding */ staticArrayCaseT),
/* harmony export */   "objectCaseT": () => (/* binding */ objectCaseT),
/* harmony export */   "dynamicObjectCaseT": () => (/* binding */ dynamicObjectCaseT),
/* harmony export */   "staticObjectCaseT": () => (/* binding */ staticObjectCaseT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param preds Array | Object
 * @param cases Array | Object
 * @param target Atom
 * @return atom Data
 */

const caseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(preds) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(cases)) {
    return objectCaseT(preds, cases, target);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(cases)) {
    return arrayCaseT(preds, cases, target);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(preds) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds) || (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(cases)) {
    throw new TypeError('"preds" & "cases" argument of caseT are expected to be the same type.');
  } else {
    throw new TypeError('"preds & "cases" argument of caseT are expected to be type of "Object" | "Array".');
  }
});
/**
 * @param preds Array, [ Function, Atom ] | [ Atom ]
 * @param cases Array, [ Any, Atom ] | [ Atom ]
 * @param target Atom
 * @return atom Data
 */

const arrayCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds)) {
    throw new TypeError('"preds" argument of arrayCaseT is expected to be type of "Array".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(cases)) {
    throw new TypeError('"cases" argument of arrayCaseT is expected to be type of "Array".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".');
  }

  if (preds.some(v => !(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(v)) || cases.some(v => !(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(v))) {
    return staticArrayCaseT(preds, cases, target);
  } else {
    return dynamicArrayCaseT(preds, cases, target);
  }
});
/**
 * @param preds Array, [ Atom ]
 * @param cases Array, [ Atom ]
 * @param target Atom
 * @return atom Data
 */

const dynamicArrayCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds)) {
    throw new TypeError('"preds" argument of dynamicArrayCaseT is expected to be type of "Array".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(cases)) {
    throw new TypeError('"cases" argument of dynamicArrayCaseT is expected to be type of "Array".');
  }

  if (preds.length !== cases.length) {
    throw new TypeError('Lengths of "preds" & "cases" argument of arrayCaseT are expected to be equal.');
  }

  preds.forEach(pred => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {
      throw new TypeError('"pred" in "preds" argument of dynamicArrayCaseT are expected to be type of "Atom".');
    }
  });
  cases.forEach(item => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(item)) {
      throw new TypeError('"case" in "cases" argument of dynamicArrayCaseT are expected to be type of "Atom".');
    }
  });

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".');
  }

  const wrapPredMutations = preds.map((pred, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    id: idx,
    type: 'pred',
    value: prev
  })));
  const wrapCaseMutations = cases.map((v, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    id: idx,
    type: 'case',
    value: prev
  })));
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedPredDatas = preds.map(() => _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty());
  const wrappedCaseDatas = cases.map(() => _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty());
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  const caseM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      pred: Array.from({
        length: preds.length
      }),
      case: Array.from({
        length: cases.length
      }),
      target: false
    };
    const _internalValues = {
      pred: Array.from({
        length: preds.length
      }),
      case: Array.from({
        length: cases.length
      }),
      target: undefined
    };
    return prev => {
      const {
        id,
        type,
        value
      } = prev;

      if (type !== 'pred' && type !== 'case' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in caseM, expected to be "pred" | "case" | "target", but received "${type}"`);
      }

      if (type === 'pred' || type === 'case') {
        _internalStates[type][id] = true;
        _internalValues[type][id] = value;
      }

      if (type === 'target') {
        _internalStates[type] = true;
        _internalValues[type] = value;
      }

      if (!_internalStates.target || _internalStates.pred.some(v => !v)) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'pred' || type === 'case') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'target') {
        let matched = false;
        let res;

        for (let i = 0, len = _internalValues.pred.length; i < len; i++) {
          if (matched) {
            break;
          } else {
            if (_internalValues.pred[i](_internalValues.target)) {
              matched = true;
              res = _internalStates.case[i] ? _internalValues.case[i] : _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
            }

            return matched ? res : _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
          }
        }

        return res;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(caseM, outputD);
  wrapPredMutations.forEach((mutation, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(mutation, wrappedPredDatas[idx], caseM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(preds[idx], mutation);
  });
  wrapCaseMutations.forEach((mutation, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(mutation, wrappedCaseDatas[idx], caseM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(cases[idx], mutation);
  });
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(wrapTargetM, wrappedTargetD, caseM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param preds Array, [ Function, Atom ]
 * @param cases Array, [ Any, Atom ]
 * @param target Atom
 * @return atom Data
 */

const staticArrayCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(preds)) {
    throw new TypeError('"preds" argument of staticArrayCaseT is expected to be type of "Array".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(cases)) {
    throw new TypeError('"cases" argument of staticArrayCaseT is expected to be type of "Array".');
  }

  preds.forEach((pred, idx) => {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
      preds[idx] = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(pred));
    } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {// do nothing
    } else {
      throw new TypeError('"pred" in "preds" argument of staticArrayCaseT are expected to be type of "Function" | "Atom".');
    }
  });
  cases.forEach((item, idx) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(item)) {
      cases[idx] = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(item));
    }
  });
  return dynamicArrayCaseT(preds, cases, target);
});
/**
 * @param preds Object, { Function, Atom } | { Atom }
 * @param cases Object, { Any, Atom } | { Atom }
 * @param target Atom
 * @return atom Data
 */

const objectCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(preds)) {
    throw new TypeError('"preds" argument of objectCaseT is expected to be type of  "Object".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(cases)) {
    throw new TypeError('"cases" argument of objectCaseT is expected to be type of  "Object".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of objectCaseT is expected to be type of "Atom".');
  }

  if (Object.values(preds).some(v => !(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(v)) || Object.values(cases).some(v => !(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(v))) {
    return staticObjectCaseT(preds, cases, target);
  } else {
    return dynamicObjectCaseT(preds, cases, target);
  }
});
/**
 * @param preds Object, { Atom }
 * @param cases Object, { Atom }
 * @param target Atom
 * @return atom Data
 */

const dynamicObjectCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(preds)) {
    throw new TypeError('"preds" argument of dynamicObjectCaseT is expected to be type of "Object".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(cases)) {
    throw new TypeError('"cases" argument of dynamicObjectCaseT is expected to be type of  "Object".');
  }

  if (new Set([...Object.keys(preds), ...Object.keys(cases)]).size !== Object.keys(preds).length) {
    throw new TypeError('"preds" & "cases" argument of dynamicObjectCaseT are expected to have same keys.');
  }

  Object.values(preds).forEach(item => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(item)) {
      throw new TypeError('"pred" in "preds" argument of dynamicObjectCaseT are expected to be type of "Atom".');
    }
  });
  Object.values(cases).forEach(item => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(item)) {
      throw new TypeError('"case" in "cases" argument of dynamicObjectCaseT are expected to be type of "Atom".');
    }
  });

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".');
  }

  const wrapPredMutations = Object.entries(preds).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
      key: key,
      type: 'pred',
      value: prev
    }));
    return acc;
  }, {});
  const wrapCaseMutations = Object.entries(cases).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
      key: key,
      type: 'case',
      value: prev
    }));
    return acc;
  }, {});
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedPredDatas = Object.entries(preds).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
    return acc;
  }, {});
  const wrappedCaseDatas = Object.entries(cases).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
    return acc;
  }, {});
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  const caseM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      pred: {},
      case: {},
      target: false
    };
    const _internalValues = {
      pred: {},
      case: {},
      target: undefined
    };
    return prev => {
      const {
        key,
        type,
        value
      } = prev;

      if (type !== 'pred' && type !== 'case' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in caseM, expected to be "pred" | "case" | "target", but received "${type}".`);
      }

      if (type === 'pred' || type === 'case') {
        _internalStates[type][key] = true;
        _internalValues[type][key] = value;
      }

      if (type === 'target') {
        _internalStates[type] = true;
        _internalValues[type] = value;
      }

      if (!_internalStates.target || Object.values(_internalStates.pred).some(v => !v)) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'pred' || type === 'case') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        let matched = false;
        let res;
        const keys = Object.keys(_internalValues.pred);

        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];

          if (matched) {
            break;
          } else {
            if (_internalValues.pred[key](_internalValues.target)) {
              matched = true;
              res = _internalStates.case[key] ? _internalValues.case[key] : _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
            }

            return matched ? res : _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
          }
        }

        return res;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(caseM, outputD);
  Object.entries(wrapPredMutations).forEach(([key, mutation]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(mutation, wrappedPredDatas[key], caseM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(preds[key], mutation);
  });
  Object.entries(wrapCaseMutations).forEach(([key, mutation]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(mutation, wrappedCaseDatas[key], caseM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(cases[key], mutation);
  });
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.pipeAtom)(wrapTargetM, wrappedTargetD, caseM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_6__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param preds Object, { Function, Atom }
 * @param cases Object, { Any, Atom }
 * @parem target Atom
 * @return atom Data
 */

const staticObjectCaseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (preds, cases, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(preds)) {
    throw new TypeError('"preds" argument of staticObjectCaseT is expected to be type of "Object".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(cases)) {
    throw new TypeError('"cases" argument of staticObjectCaseT is expected to be type of  "Object".');
  }

  Object.entries(preds).forEach(([key, pred]) => {
    if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
      preds[key] = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(pred));
    } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {// do nothing
    } else {
      throw new TypeError('"pred" in "preds" argument of staticObjectCaseT are expected to be type of "Function" | "Atom".');
    }
  });
  Object.entries(cases).forEach(([key, item]) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(item)) {
      cases[key] = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(item));
    }
  });
  return dynamicObjectCaseT(preds, cases, target);
});

/***/ }),

/***/ "./src/es/atom/taches/combine.taches.js":
/*!**********************************************!*\
  !*** ./src/es/atom/taches/combine.taches.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineT": () => (/* binding */ combineT),
/* harmony export */   "arrayCombineT": () => (/* binding */ arrayCombineT),
/* harmony export */   "objectCombineT": () => (/* binding */ objectCombineT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */

const combineT = (...args) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(args[0]) || (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(args[0])) {
    return arrayCombineT(...args);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(args[0])) {
    return objectCombineT(...args);
  } else {
    throw new TypeError('Arguments of combineT are expected to be type of Atom | [Atom] | { Atom }.');
  }
};
/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */

const arrayCombineT = (...args) => {
  let atoms = args[0];

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(atoms)) {
    atoms = args;
  }

  const inputAtoms = atoms.map(atom => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of combineT are expected to be type of "Atom".');
    }

    return atom;
  });
  const length = atoms.length;
  const wrapMutations = Array.from({
    length
  }).map((val, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    id: idx,
    value: prev
  })));
  const wrappedDatas = Array.from({
    length
  }).map(() => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
  const combineM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from({
      length
    });

    const _intervalValues = Array.from({
      length
    });

    return prev => {
      const {
        id,
        value
      } = prev;
      if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(value)) return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      _internalStates[id] = true;
      _intervalValues[id] = value;
      return [..._intervalValues];
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(Array.from({
    length
  }));
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(combineM, outputD);
  wrappedDatas.forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, combineM);
  });
  wrapMutations.forEach((wrapMutation, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[idx]);
  });
  inputAtoms.forEach((atom, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(atom, wrapMutations[idx]);
  });
  return outputD;
};
/**
 * @param obj Object, { Atom }
 * @return atom Data
 */

const objectCombineT = obj => {
  const inputAtoms = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of objectCombineT are expected to be type of "Atom".');
    }

    acc[key] = atom;
    return acc;
  }, {});
  const wrapMutations = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      key: key,
      value: prev
    }));
    return acc;
  }, {});
  const wrappedDatas = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    return acc;
  }, {});
  const combineM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = Object.keys(obj).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    const _intervalValues = Object.keys(obj).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});

    return prev => {
      const {
        key,
        value
      } = prev;
      if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(value)) return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      _internalStates[key] = true;
      _intervalValues[key] = value;
      return { ..._intervalValues
      };
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(Object.keys(obj).reduce((acc, key) => {
    acc[key] = undefined;
    return acc;
  }, {}));
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(combineM, outputD);
  Object.values(wrappedDatas).forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, combineM);
  });
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[key]);
  });
  Object.entries(inputAtoms).forEach(([key, atom]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(atom, wrapMutations[key]);
  });
  return outputD;
};

/***/ }),

/***/ "./src/es/atom/taches/combineLatest.taches.js":
/*!****************************************************!*\
  !*** ./src/es/atom/taches/combineLatest.taches.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineLatestT": () => (/* binding */ combineLatestT),
/* harmony export */   "arrayCombineLatestT": () => (/* binding */ arrayCombineLatestT),
/* harmony export */   "objectCombineLatestT": () => (/* binding */ objectCombineLatestT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */

const combineLatestT = (...args) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(args[0]) || (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(args[0])) {
    return arrayCombineLatestT(...args);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(args[0])) {
    return objectCombineLatestT(...args);
  } else {
    throw new TypeError('Arguments of combineLatestT are expected to be type of Atom | [Atom] | { Atom }.');
  }
};
/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */

const arrayCombineLatestT = (...args) => {
  let atoms = args[0];

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(atoms)) {
    atoms = args;
  }

  const inputAtoms = atoms.map(atom => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of combineT are expected to be type of "Atom".');
    }

    return atom;
  });
  const length = atoms.length;
  const wrapMutations = Array.from({
    length
  }).map((val, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    id: idx,
    value: prev
  })));
  const wrappedDatas = Array.from({
    length
  }).map(() => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
  const combineM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from({
      length
    });

    const _intervalValues = Array.from({
      length
    });

    return prev => {
      const {
        id,
        value
      } = prev;
      if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(value)) return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      _internalStates[id] = true;
      _intervalValues[id] = value;

      if (_internalStates.every(val => val)) {
        return [..._intervalValues];
      } else {
        return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(combineM, outputD);
  wrappedDatas.forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, combineM);
  });
  wrapMutations.forEach((wrapMutation, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[idx]);
  });
  inputAtoms.forEach((atom, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(atom, wrapMutations[idx]);
  });
  return outputD;
};
/**
 * @param obj Object, { Atom }
 * @return atom Data
 */

const objectCombineLatestT = obj => {
  const inputAtoms = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of objectCombineLatestT are expected to be type of "Atom".');
    }

    acc[key] = atom;
    return acc;
  }, {});
  const wrapMutations = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      key: key,
      value: prev
    }));
    return acc;
  }, {});
  const wrappedDatas = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    return acc;
  }, {});
  const combineM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = Object.keys(obj).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    const _intervalValues = Object.keys(obj).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});

    return prev => {
      const {
        key,
        value
      } = prev;
      if ((0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(value)) return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      _internalStates[key] = true;
      _intervalValues[key] = value;

      if (Object.values(_internalStates).every(val => val)) {
        return { ..._intervalValues
        };
      } else {
        return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(combineM, outputD);
  Object.values(wrappedDatas).forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, combineM);
  });
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[key]);
  });
  Object.entries(inputAtoms).forEach(([key, atom]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(atom, wrapMutations[key]);
  });
  return outputD;
};

/***/ }),

/***/ "./src/es/atom/taches/debounce.taches.js":
/*!***********************************************!*\
  !*** ./src/es/atom/taches/debounce.taches.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "debounceTimeT": () => (/* binding */ debounceTimeT),
/* harmony export */   "dynamicDebounceTimeT": () => (/* binding */ dynamicDebounceTimeT),
/* harmony export */   "staticDebounceTimeT": () => (/* binding */ staticDebounceTimeT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");






/**
 * @param timer Number | Atom
 * @param target Atom
 * @return atom Data
 */

const debounceTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (timer, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(timer)) {
    return staticDebounceTimeT(timer, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(timer)) {
    return dynamicDebounceTimeT(timer, target);
  } else {
    throw new TypeError('"timer" argument of debounceTimeT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * the value target will only triggered when timer atom has at least one value
 *
 * @param timer Atom, which value is used as debounce time(in milliseconds)
 * @param target Atom, which value will be debounced with specified time
 * @return atom Data
 */

const dynamicDebounceTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (timer, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(timer)) {
    throw new TypeError('"timer" argument of dynamicDebounceTimeT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicDebounceTimeT is expected to be type of "Atom".');
  }

  const wrapTimerM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'timer',
    value: prev
  }));
  const wrappedTimerD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTimerM, wrappedTimerD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const debounceM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    const _internalStates = {
      timer: false,
      target: false,
      clock: 0
    };
    const _internalValues = {
      timer: undefined,
      target: undefined
    }; // actual mutation operation function

    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'timer' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in debounceM, expected to be "timer" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.timer || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'timer') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        clearTimeout(_internalStates.clock);
        _internalStates.clock = setTimeout(() => {
          debounceM.triggerOperation(() => _internalValues.target);
        }, _internalValues.timer);
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTimerD, debounceM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, debounceM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(debounceM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(timer, wrapTimerM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param ms Atom, which will be used as debounce time(in milliseconds)
 * @param target Atom, which value will be debounced with specified time
 * @return atom Data
 */

const staticDebounceTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (ms, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(ms)) {
    throw new TypeError('"ms" argument of staticDebounceTimeT is expected to be type of "Number".');
  }

  return dynamicDebounceTimeT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(ms)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/defaultTo.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/defaultTo.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultToT": () => (/* binding */ defaultToT),
/* harmony export */   "dynamicDefautToT": () => (/* binding */ dynamicDefautToT),
/* harmony export */   "staticDefaultToT": () => (/* binding */ staticDefaultToT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");





/**
 * Takes a default value and a target atom as argument,
 * emit given default value if value of target atom isVoid.
 *
 * - dynamic version: default value must be an Atom.
 * - static version: default value can be any type of value.
 *
 * @param default Any | Atom
 * @param target Atom
 * @return atom Data
 */

const defaultToT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (dft, target) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(dft)) {
    return dynamicDefautToT(dft, target);
  } else {
    return staticDefaultToT(dft, target);
  }
});
/**
 * @param default Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicDefautToT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (dft, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(dft)) {
    throw new TypeError('"dft" argument of dynamicDefautToT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicDefautToT is expected to be type of "Atom".');
  }

  const wrapDftM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'dft',
    value: prev
  }));
  const wrappedDftD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapDftM, wrappedDftD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const defaultM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      dft: false,
      target: false
    };
    const _internalValues = {
      dft: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'dft' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in defaultM, expected to be "dft" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.dft || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'dft') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return (0,_meta_js__WEBPACK_IMPORTED_MODULE_5__.isVoid)(_internalValues.target) ? _internalValues.dft : _internalValues.target;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedDftD, defaultM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, defaultM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(defaultM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(dft, wrapDftM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param default Any
 * @param target Atom
 * @return atom Data
 */

const staticDefaultToT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (dft, target) => {
  return dynamicDefautToT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(dft)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/distinctEver.taches.js":
/*!***************************************************!*\
  !*** ./src/es/atom/taches/distinctEver.taches.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "distinctEverT": () => (/* binding */ distinctEverT),
/* harmony export */   "dynamicDistinctEverT": () => (/* binding */ dynamicDistinctEverT),
/* harmony export */   "staticDistinctEverT": () => (/* binding */ staticDistinctEverT),
/* harmony export */   "asIsDistinctEverT": () => (/* binding */ asIsDistinctEverT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param transform Function | Atom
 * @param target Atom
 * @return atom Data
 */

const distinctEverT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(transform)) {
    return staticDistinctEverT(transform, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(transform)) {
    return dynamicDistinctEverT(transform, target);
  } else {
    throw new TypeError('"transform" argument of distinctEverT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * @param transform Atom, atom of transform Funtion which will
 *                  take a value as input and return a value as distinct compare unit
 * @param target Atom
 * @return atom Data
 */

const dynamicDistinctEverT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(transform)) {
    throw new TypeError('"transform" argument of dynamicDistinctEverT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicDistinctEverT is expected to be type of "Atom".');
  }

  const wrapTransformM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'transform',
    value: prev
  }));
  const wrappedTransformD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTransformM, wrappedTransformD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const distinctM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      transform: false,
      target: false,
      history: []
    };
    const _internalValues = {
      transform: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'transform' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in distinctM, expected to be "transform" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.transform || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'transform') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        const transformed = _internalValues.transform(_internalValues.target);

        const history = _internalStates.history;

        if (history.includes(transformed)) {
          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        } else {
          history.push(transformed);
          return _internalValues.target;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, distinctM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTransformD, distinctM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(distinctM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(transform, wrapTransformM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param transform Function
 * @param target Atom
 * @return atom Data
 */

const staticDistinctEverT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(transform)) {
    throw new TypeError('"transform" argument of staticDistinctEverT is expected to be type of "Function".');
  }

  return dynamicDistinctEverT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(transform)), target);
});
/**
 * @param target Atom
 * @return atom Data
 */

const asIsDistinctEverT = distinctEverT(v => v);

/***/ }),

/***/ "./src/es/atom/taches/distinctPrevious.taches.js":
/*!*******************************************************!*\
  !*** ./src/es/atom/taches/distinctPrevious.taches.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "distinctPreviousT": () => (/* binding */ distinctPreviousT),
/* harmony export */   "dynamicDistinctPreviousT": () => (/* binding */ dynamicDistinctPreviousT),
/* harmony export */   "staticDistinctPreviousT": () => (/* binding */ staticDistinctPreviousT),
/* harmony export */   "asIsDistinctPreviousT": () => (/* binding */ asIsDistinctPreviousT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param transform Function | Atom
 * @param target Atom
 * @return atom Data
 */

const distinctPreviousT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(transform)) {
    return staticDistinctPreviousT(transform, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(transform)) {
    return dynamicDistinctPreviousT(transform, target);
  } else {
    throw new TypeError('"transform" argument of distinctPreviousT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * @param transform Atom, atom of transform Funtion which will
 *                  take a value as input and return a value as distinct compare unit
 * @param target Atom
 * @return atom Data
 */

const dynamicDistinctPreviousT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(transform)) {
    throw new TypeError('"transform" argument of dynamicDistinctPreviousT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicDistinctPreviousT is expected to be type of "Atom".');
  }

  const wrapTransformM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'transform',
    value: prev
  }));
  const wrappedTransformD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTransformM, wrappedTransformD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const distinctM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      transform: false,
      target: false,
      previous: undefined
    };
    const _internalValues = {
      transform: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'transform' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "transform" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.transform || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'transform') {
        // change of transform will not trigger target value emittion
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        const prevTransformed = _internalValues.transform(_internalStates.previous);

        const transformed = _internalValues.transform(_internalValues.target);

        if (prevTransformed === transformed) {
          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        } else {
          _internalStates.previous = _internalValues.target;
          return _internalValues.target;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, distinctM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTransformD, distinctM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(distinctM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(transform, wrapTransformM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param transform Function
 * @param target Atom
 * @return atom Data
 */

const staticDistinctPreviousT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (transform, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(transform)) {
    throw new TypeError('"transform" argument of staticDistinctPreviousT is expected to be type of "Function".');
  }

  return dynamicDistinctPreviousT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(transform)), target);
});
/**
 * @param target Atom
 * @return atom Data
 */

const asIsDistinctPreviousT = distinctPreviousT(v => v);

/***/ }),

/***/ "./src/es/atom/taches/effect.taches.js":
/*!*********************************************!*\
  !*** ./src/es/atom/taches/effect.taches.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "effectT": () => (/* binding */ effectT),
/* harmony export */   "dynamicEffectT": () => (/* binding */ dynamicEffectT),
/* harmony export */   "staticEffectT": () => (/* binding */ staticEffectT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param effect Function | Atom, takes a effect function that takes
 *               an emit function, a target value, and a instantly emit value set function.
 * @param target Atom
 * @return atom Data
 */

const effectT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (effect, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(effect)) {
    return staticEffectT(effect, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(effect)) {
    return dynamicEffectT(effect, target);
  } else {
    throw new TypeError('"effect" argument of effectT is expected to be type of "Function" or "Atom"');
  }
});
/**
 * @param effect Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicEffectT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (effect, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(effect)) {
    throw new TypeError('"effect" argument of dynamicEffectT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicEffectT is expected to be type of "Atom".');
  }

  const wrapEffectM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'effect',
    value: prev
  }));
  const wrappedEffectD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapEffectM, wrappedEffectD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const effectM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      effect: false,
      target: false
    };
    const _internalValues = {
      effect: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'effect' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in effectM, expected to be "effect" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.effect || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'effect') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        let hasSetReturned = false;

        let _returned;

        const result = _internalValues.effect(value => {
          effectM.triggerOperation(() => value);
        }, _internalValues.target, returned => {
          hasSetReturned = true;
          _returned = returned;
        });

        return hasSetReturned ? _returned : result || _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedEffectD, effectM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, effectM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(effectM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(effect, wrapEffectM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param effect Function
 * @param target Atom
 * @return atom Data
 */

const staticEffectT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (effect, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(effect)) {
    throw new TypeError('"effect" argument of staticEffectT is expected to be type of "Function".');
  }

  return dynamicEffectT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(effect)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/emptyStartWith.taches.js":
/*!*****************************************************!*\
  !*** ./src/es/atom/taches/emptyStartWith.taches.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "emptyStartWithT": () => (/* binding */ emptyStartWithT),
/* harmony export */   "dynamicEmptyStartWithT": () => (/* binding */ dynamicEmptyStartWithT),
/* harmony export */   "staticEmptyStartWithT": () => (/* binding */ staticEmptyStartWithT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");





const emptyStartWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(start)) {
    return dynamicEmptyStartWithT(start, target);
  } else {
    return staticEmptyStartWithT(start, target);
  }
});
/**
 * @param start Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicEmptyStartWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(start)) {
    throw new TypeError('"start" argument of dynamicEmptyStartWithT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicEmptyStartWithT is expected to be type of "Atom".');
  }

  start = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, start);
  target = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, target);
  const wrapStartM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'start',
    value: prev
  }));
  const wrappedStartD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapStartM, wrappedStartD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const startM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      start: false,
      target: false,
      startExpired: false
    };
    const _internalValues = {
      start: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'start' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in startM, expected to be "start" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (type === 'target') {
        return _internalValues.target;
      } // redundant conditional judgement


      if (type === 'start' && _internalStates.startExpired) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true;
        return _internalStates.target ? _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR : _internalValues.start;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedStartD, startM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, startM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(startM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(start, wrapStartM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param start Any
 * @param target Atom
 * @return atom Data
 */

const staticEmptyStartWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  return dynamicEmptyStartWithT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(start)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/filter.taches.js":
/*!*********************************************!*\
  !*** ./src/es/atom/taches/filter.taches.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filterT": () => (/* binding */ filterT),
/* harmony export */   "dynamicFilterT": () => (/* binding */ dynamicFilterT),
/* harmony export */   "staticFilterT": () => (/* binding */ staticFilterT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param pred Function | Atom
 * @param target Atom
 * @return atom Data
 */

const filterT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (pred, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
    return staticFilterT(pred, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {
    return dynamicFilterT(pred, target);
  } else {
    throw new TypeError('"pred" argument of filterT is expected to be type of "Function" or "Atom".');
  }
});
/**
 * @param pred Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicFilterT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (pred, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {
    throw new TypeError('"pred" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  const wrapPredM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'pred',
    value: prev
  }));
  const wrappedPredD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapPredM, wrappedPredD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const filterM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      pred: false,
      target: false,
      index: -1
    };
    const _internalValues = {
      pred: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'pred' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in filterM, expected to be "pred" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.pred || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'pred') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1;
        return _internalValues.pred(_internalValues.target, _internalStates.index) ? _internalValues.target : _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedPredD, filterM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, filterM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(filterM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(pred, wrapPredM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param pred Function
 * @param target Atom
 * @return atom Data
 */

const staticFilterT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (pred, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
    throw new TypeError('"pred" argument of staticFilterT is expected to be type of "Function".');
  }

  return dynamicFilterT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(pred)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/iif.taches.js":
/*!******************************************!*\
  !*** ./src/es/atom/taches/iif.taches.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "iifT": () => (/* binding */ iifT),
/* harmony export */   "dynamicIifT": () => (/* binding */ dynamicIifT),
/* harmony export */   "staticIifT": () => (/* binding */ staticIifT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param pred Function | Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */

const iifT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(4, (pred, trueTarget, falseTarget, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
    return staticIifT(pred, trueTarget, falseTarget, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {
    return dynamicIifT(pred, trueTarget, falseTarget, target);
  } else {
    throw new TypeError('"pred" argument of iifT is expected to be type of "Function" | "Atom".');
  }
});
/**
 * @param pred Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicIifT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(4, (pred, trueTarget, falseTarget, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(pred)) {
    throw new TypeError('"pred" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(trueTarget)) {
    throw new TypeError('"trueTarget" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(falseTarget)) {
    throw new TypeError('"falseTarget" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicFilterT is expected to be type of "Atom".');
  }

  const wrapPredM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'pred',
    value: prev
  }));
  const wrappedPredD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapPredM, wrappedPredD);
  const wrapTrueTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'trueTarget',
    value: prev
  }));
  const wrappedTrueTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTrueTargetM, wrappedTrueTargetD);
  const wrapFalseTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'falseTarget',
    value: prev
  }));
  const wrappedFalseTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapFalseTargetM, wrappedFalseTargetD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const filterM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      pred: false,
      trueTarget: false,
      falseTarget: false,
      target: false,
      index: -1
    };
    const _internalValues = {
      pred: undefined,
      trueTarget: undefined,
      falseTarget: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'pred' && type !== 'trueTarget' && type !== 'falseTarget' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in filterM, expected to be "pred" | "trueTarget" | "falseTarget" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.pred || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'pred') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'trueTarget' || type === 'falseTarget') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1;

        const predRes = _internalValues.pred(_internalValues.target, _internalStates.index);

        if (predRes) {
          return _internalStates.trueTarget ? _internalValues.trueTarget : _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        } else {
          return _internalStates.falseTarget ? _internalValues.falseTarget : _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedPredD, filterM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTrueTargetD, filterM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedFalseTargetD, filterM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(filterM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(pred, wrapPredM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(trueTarget, wrapTrueTargetM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(falseTarget, wrapFalseTargetM);
  return outputD;
});
/**
 * @param pred Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */

const staticIifT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(4, (pred, trueTarget, falseTarget, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(pred)) {
    throw new TypeError('"pred" argument of staticIifT is expected to be type of "Function".');
  }

  return dynamicIifT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(pred)), trueTarget, falseTarget, target);
});

/***/ }),

/***/ "./src/es/atom/taches/map.taches.js":
/*!******************************************!*\
  !*** ./src/es/atom/taches/map.taches.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mapT": () => (/* binding */ mapT),
/* harmony export */   "dynamicMapT": () => (/* binding */ dynamicMapT),
/* harmony export */   "staticMapT": () => (/* binding */ staticMapT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param fn Function | Atom
 * @param target Atom
 * @return atom Data
 */

const mapT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (fn, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(fn)) {
    return staticMapT(fn, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(fn)) {
    return dynamicMapT(fn, target);
  } else {
    throw new TypeError('"fn" argument of mapT is expected to be type of "Function" or "Atom".');
  }
});
/**
 * @param fn Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicMapT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (fn, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(fn)) {
    throw new TypeError('"fn" argument of dynamicMapT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicMapT is expected to be type of "Atom".');
  }

  const wrapMapM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'map',
    value: prev
  }));
  const wrappedMapD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMapM, wrappedMapD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const mapM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      map: false,
      target: false,
      index: -1
    };
    const _internalValues = {
      map: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'map' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in mapM, expected to be "map" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.map || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'map') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1;
        return _internalValues.map(_internalValues.target, _internalStates.index);
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedMapD, mapM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, mapM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(mapM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(fn, wrapMapM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param fn Function
 * @param target Atom
 * @return atom Data
 */

const staticMapT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (fn, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(fn)) {
    throw new TypeError('"fn" argument of staticMapT is expected to be type of "Function".');
  }

  return dynamicMapT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(fn)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/merge.taches.js":
/*!********************************************!*\
  !*** ./src/es/atom/taches/merge.taches.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeT": () => (/* binding */ mergeT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");



/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */

const mergeT = (...args) => {
  let atoms = args[0];

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(atoms)) {
    atoms = args;
  }

  const inputAtoms = atoms.map(atom => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(atom)) {
      throw new TypeError('Arguments of mergeT are expected to be type of "Atom".');
    }

    return atom;
  });
  const mergeM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => prev);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(mergeM, outputD);
  inputAtoms.forEach(atom => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(atom, mergeM);
  });
  return outputD;
};

/***/ }),

/***/ "./src/es/atom/taches/nilToVoid.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/nilToVoid.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "nilToVoidT": () => (/* binding */ nilToVoidT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * Replace nil value(i.e. undefined, null) with VOID
 *
 * @param { Atom } target
 * @return Data
 */

const nilToVoidT = target => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(target)) {
    throw new TypeError('"target" argument of nilToVoidT is expected to be type of "Atom" only.');
  }

  const transM = _atom_js__WEBPACK_IMPORTED_MODULE_1__.Mutation.ofLiftLeft(prev => (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.isNil)(prev) ? _meta_js__WEBPACK_IMPORTED_MODULE_3__.VOID : prev);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(transM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, transM);
  return outputD;
};

/***/ }),

/***/ "./src/es/atom/taches/partition.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/partition.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "partitionT": () => (/* binding */ partitionT)
/* harmony export */ });
const partitionT = () => {};

/***/ }),

/***/ "./src/es/atom/taches/pluck.taches.js":
/*!********************************************!*\
  !*** ./src/es/atom/taches/pluck.taches.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pluckT": () => (/* binding */ pluckT),
/* harmony export */   "dynamicPluckT": () => (/* binding */ dynamicPluckT),
/* harmony export */   "staticPluckT": () => (/* binding */ staticPluckT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param selector String | Array | Atom
 * @param target Atom
 * @return atom Data
 */

const pluckT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (selector, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(selector) || (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(selector)) {
    return staticPluckT(selector, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(selector)) {
    return dynamicPluckT(selector, target);
  } else {
    throw new TypeError('"selector" argument of pluckT is expected to be type of "String" | "Array" | "Atom".');
  }
});
/**
 * @param selector Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicPluckT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (selector, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(selector)) {
    throw new TypeError('"selector" argument of dynamicPluckT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"selector" argument of dynamicPluckT is expected to be type of "Atom".');
  }

  const wrapSelectorM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'selector',
    value: prev
  }));
  const wrappedSelectorD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapSelectorM, wrappedSelectorD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const pluckM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      selector: false,
      target: false
    };
    const _internalValues = {
      selector: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'selector' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in pluckM, expected to be "selector" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.selector || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'selector') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return (0,_internal_js__WEBPACK_IMPORTED_MODULE_7__.getByPath)(_internalValues.selector, _internalValues.target);
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedSelectorD, pluckM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, pluckM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(pluckM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(selector, wrapSelectorM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param selector String | Array
 * @param target Atom
 * @return atom Data
 */

const staticPluckT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (selector, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(selector) && !(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(selector)) {
    throw new TypeError('"selector" argument of staticPluckT is expected to be type of "String" | "Array".');
  }

  return dynamicPluckT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_8__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(selector)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/skip.taches.js":
/*!*******************************************!*\
  !*** ./src/es/atom/taches/skip.taches.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipT": () => (/* binding */ skipT),
/* harmony export */   "dynamicSkipT": () => (/* binding */ dynamicSkipT),
/* harmony export */   "staticSkipT": () => (/* binding */ staticSkipT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */

const skipT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(n)) {
    return staticSkipT(n, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    return dynamicSkipT(n, target);
  } else {
    throw new TypeError('"n" argument of skipT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicSkipT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    throw new TypeError('"n" argument of dynamicSkipT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicSkipT is expected to be type of "Atom".');
  }

  const wrapNumM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'n',
    value: prev
  }));
  const wrappedNumD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapNumM, wrappedNumD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const skipM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      n: false,
      target: false,
      index: -1,
      skiped: 0
    };
    const _internalValues = {
      n: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'n' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "n" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.n || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'n') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        if (_internalStates.skiped < _internalStates.n) {
          _internalStates.skiped = _internalStates.skiped + 1;
          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        } else {
          return _internalValues.target;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedNumD, skipM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, skipM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(skipM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(n, wrapNumM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param n Number
 * @param target Atom
 * @return atom Data
 */

const staticSkipT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    throw new TypeError('"n" argument of staticSkipT is expected to be type of "Number".');
  }

  return dynamicSkipT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(n)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/skipUntil.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/skipUntil.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipUntilT": () => (/* binding */ skipUntilT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param cond Atom
 * @param target Atom
 * @return atom Data
 */

const skipUntilT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (cond, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(cond)) {
    throw new TypeError('"cond" argument of skipUntilT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of skipUntilT is expected to be type of "Atom".');
  }

  const wrapCondM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'cond',
    value: prev
  }));
  const wrappedCondD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapCondM, wrappedCondD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const skipM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      cond: false,
      target: false
    };
    const _intervalValues = {
      cond: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'cond' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "cond" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _intervalValues[type] = value;

      if (!_internalStates.cond || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'cond') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return _intervalValues.target;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedCondD, skipM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, skipM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(skipM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(cond, wrapCondM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});

/***/ }),

/***/ "./src/es/atom/taches/skipWhile.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/skipWhile.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipWhileT": () => (/* binding */ skipWhileT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param cond Atom
 * @param target Atom
 * @return atom Data
 */

const skipWhileT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (cond, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(cond)) {
    throw new TypeError('"cond" argument of skipWhileT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of skipWhileT is expected to be type of "Atom".');
  }

  const wrapCondM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'cond',
    value: Boolean(prev)
  }));
  const wrappedCondD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapCondM, wrappedCondD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const skipM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      cond: false,
      target: false
    };
    const _intervalValues = {
      cond: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'cond' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "cond" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _intervalValues[type] = value;

      if (!_internalStates.cond || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'cond') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return _intervalValues.cond ? _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR : _intervalValues.target;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedCondD, skipM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, skipM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(skipM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(cond, wrapCondM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});

/***/ }),

/***/ "./src/es/atom/taches/startWith.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/startWith.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "startWithT": () => (/* binding */ startWithT),
/* harmony export */   "dynamicStartWithT": () => (/* binding */ dynamicStartWithT),
/* harmony export */   "staticStartWithT": () => (/* binding */ staticStartWithT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");





const startWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(start)) {
    return dynamicStartWithT(start, target);
  } else {
    return staticStartWithT(start, target);
  }
});
/**
 * @param start Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicStartWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(start)) {
    throw new TypeError('"start" argument of dynamicStartWithT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicStartWithT is expected to be type of "Atom".');
  }

  start = (0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, start);
  const wrapStartM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'start',
    value: prev
  }));
  const wrappedStartD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapStartM, wrappedStartD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const startM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      start: false,
      target: false,
      startExpired: false
    };
    const _internalValues = {
      start: undefined,
      target: undefined,
      targetQueue: []
    };
    return (prev, _, mutation) => {
      const {
        type,
        value
      } = prev;

      if (type !== 'start' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in startM, expected to be "start" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (type === 'target') {
        if (_internalStates.startExpired) {
          return _internalValues.target;
        } else {
          _internalValues.targetQueue.push(value);

          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        }
      } // redundant conditional judgement


      if (type === 'start' && _internalStates.startExpired) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true;

        _internalValues.targetQueue.unshift(value);

        _internalValues.targetQueue.forEach(target => {
          mutation.triggerOperation(() => target);
        });

        _internalValues.targetQueue.length = 0;
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedStartD, startM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, startM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(startM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(start, wrapStartM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param start Any
 * @param target Atom
 * @return atom Data
 */

const staticStartWithT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (start, target) => {
  return dynamicStartWithT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_2__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(start)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/switch.taches.js":
/*!*********************************************!*\
  !*** ./src/es/atom/taches/switch.taches.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "switchT": () => (/* binding */ switchT),
/* harmony export */   "dynamicSwitchT": () => (/* binding */ dynamicSwitchT),
/* harmony export */   "staticSwitchT": () => (/* binding */ staticSwitchT),
/* harmony export */   "promiseSwitchT": () => (/* binding */ promiseSwitchT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






const switchTacheFactory = mutationFactory => {
  return (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (to, from) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(to)) {
      throw new TypeError('"to" argument of switchT is expected to be type of "Atom".');
    }

    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(from)) {
      throw new TypeError('"from" argument of switchT is expected to be type of "Atom".');
    }

    const wrapToM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      type: 'to',
      value: prev
    }));
    const wrappedToD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapToM, wrappedToD);
    const wrapFromM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      type: 'from',
      value: prev
    }));
    const wrappedFromD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapFromM, wrappedFromD); // const switchM = Mutation.ofLiftLeft(operation)

    const switchM = mutationFactory();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedToD, switchM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedFromD, switchM);
    const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(switchM, outputD);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(to, wrapToM);
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(from, wrapFromM);
    return outputD;
  });
};
/**
 * @param to Atom | Any
 * @param from Atom
 * @return atom Data
 */


const switchT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (to, from) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(to)) {
    return dynamicSwitchT(to, from);
  } else {
    return staticSwitchT(to, from);
  }
});
/**
 * switch Tache will emits a "to" value when "from" value comes.
 *
 * If there is not "to" value to emit when "from" value comes,
 * it will emit a TERMINATOR which will stop the stream.
 *
 * @param to Atom
 * @param from Atom
 * @return atom Data
 */

const dynamicSwitchT = switchTacheFactory(() => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
  const _internalStates = {
    from: false,
    to: false
  };
  const _internalValues = {
    from: undefined,
    to: undefined
  };
  return prev => {
    const {
      type,
      value
    } = prev;

    if (type !== 'from' && type !== 'to') {
      throw new TypeError(`Unexpected type of wrapped Data received in switchM, expected to be "from" | "to", but received "${type}"`);
    }

    _internalStates[type] = true;
    _internalValues[type] = value;

    if (!_internalStates.from || !_internalStates.to) {
      return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
    }

    if (type === 'to') {
      return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
    } // redundant conditional judgement


    if (type === 'from') {
      return _internalValues.to;
    }
  };
})()));
/**
 * @param to Any
 * @param from Atom
 * @return atom Data
 */

const staticSwitchT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (to, from) => {
  return dynamicSwitchT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_6__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(to)), from);
});
/**
 * promiseSwitch Tache will emits a "to" value when "from" value comes.
 *
 * If there is no "to" value to emit when "from" value comes,
 * it will make a promise that to emit "to" value when it comes sooner.
 *
 * @param to Atom
 * @param from Atom
 * @return atom Data
 */

const promiseSwitchT = switchTacheFactory(() => {
  const switchM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      from: false,
      to: false,
      promise: false
    };
    const _internalValues = {
      from: undefined,
      to: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'from' && type !== 'to') {
        throw new TypeError(`Unexpected type of wrapped Data received in switchM, expected to be "from" | "to", but received "${type}"`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (type === 'to') {
        if (_internalStates.promise) {
          switchM.triggerOperation(() => _internalValues.to);
          _internalStates.promise = false;
        }

        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'from') {
        if (_internalStates.to) {
          return _internalValues.to;
        } else {
          _internalStates.promise = true;
          return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
        }
      }
    };
  })());
  return switchM;
});

/***/ }),

/***/ "./src/es/atom/taches/take.taches.js":
/*!*******************************************!*\
  !*** ./src/es/atom/taches/take.taches.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeT": () => (/* binding */ takeT),
/* harmony export */   "dynamicTakeT": () => (/* binding */ dynamicTakeT),
/* harmony export */   "staticTakeT": () => (/* binding */ staticTakeT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");






/**
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */

const takeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(n)) {
    return staticTakeT(n, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    return dynamicTakeT(n, target);
  } else {
    throw new TypeError('"n" argument of takeT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */

const dynamicTakeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    throw new TypeError('"n" argument of dynamicTakeT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicTakeT is expected to be type of "Atom".');
  }

  const wrapNumM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'n',
    value: parseInt(prev)
  }));
  const wrappedNumD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapNumM, wrappedNumD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const takeM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      n: false,
      target: false,
      taked: 0
    };
    const _internalValues = {
      n: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'n' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "n" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.n || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'n') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        if (_internalStates.taked < _internalStates.n) {
          _internalStates.taked = _internalStates.taked + 1;
          return _internalValues.target;
        } else {
          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedNumD, takeM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, takeM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(takeM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(n, wrapNumM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @todo release atom when specified num of value has emited
 *
 * @param n Number
 * @param target Atom
 * @return atom Data
 */

const staticTakeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  return dynamicTakeT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(n)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/takeUntil.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/takeUntil.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeUntilT": () => (/* binding */ takeUntilT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param cond Atom
 * @param target Atom
 * @return atom Data
 */

const takeUntilT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (cond, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(cond)) {
    throw new TypeError('"cond" argument of takeUntilT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of takeUntilT is expected to be type of "Atom".');
  }

  const wrapCondM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'cond',
    value: prev
  }));
  const wrappedCondD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapCondM, wrappedCondD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const takeM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      cond: false,
      target: false
    };
    const _intervalValues = {
      cond: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'cond' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "cond" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _intervalValues[type] = value;

      if (_internalStates.cond) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return _intervalValues.target;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedCondD, takeM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, takeM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(takeM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(cond, wrapCondM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});

/***/ }),

/***/ "./src/es/atom/taches/takeWhile.taches.js":
/*!************************************************!*\
  !*** ./src/es/atom/taches/takeWhile.taches.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeWhileT": () => (/* binding */ takeWhileT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param cond Atom
 * @param target Atom
 * @return atom Data
 */

const takeWhileT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (cond, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(cond)) {
    throw new TypeError('"cond" argument of takeWhileT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of takeWhileT is expected to be type of "Atom".');
  }

  const wrapCondM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'cond',
    value: Boolean(prev)
  }));
  const wrappedCondD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapCondM, wrappedCondD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const takeM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      cond: false,
      target: false
    };
    const _intervalValues = {
      cond: undefined,
      target: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'cond' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received, expected to be "cond" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _intervalValues[type] = value;

      if (!_internalStates.cond || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }

      if (type === 'cond') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        return _intervalValues.cond ? _intervalValues.target : _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedCondD, takeM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, takeM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(takeM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(cond, wrapCondM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});

/***/ }),

/***/ "./src/es/atom/taches/tap.taches.js":
/*!******************************************!*\
  !*** ./src/es/atom/taches/tap.taches.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tapT": () => (/* binding */ tapT),
/* harmony export */   "tapValueT": () => (/* binding */ tapValueT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");


/**
 * @param effect Function
 * @param atom Atom
 */

const tapT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (effect, atom) => {
  effect(atom);
  return atom;
});
/**
 * @param name String? ""
 * @param level String? "LOG"(0) | "INFO"(1) | "WARN"(2) | "ERROR"(3)
 * @return tap Tache
 */

const tapValueT = (name = '', level = 0) => tapT(atom => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(name)) {
    level = name;
    name = '';
  }

  const levelDict = {
    LOG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    0: 'log',
    1: 'info',
    2: 'warn',
    3: 'error'
  };
  level = levelDict[level];
  const colorDict = {
    log: '#30CFCF',
    // cyan
    info: '#3030CF',
    // blue
    warn: '#CF8030',
    // orange
    error: '#CF3030' // red

  };
  atom.subscribe(({
    value
  }) => {
    let stringified = '';

    try {
      stringified = JSON.stringify(value);
    } catch (e) {// do nothing
    }

    console[level](`%c ${level.toUpperCase()} %c ${name || 'tapLogValueT'}` + ': %c' + value + '%c', `background: ${colorDict[level]}; padding: 1px; border-radius: 3px 0 0 3px; color: #FFFFFF;`, 'background: #6600FF; padding: 1px; border-radius: 0 0 0 0; color: #FFFFFF;', 'background: #66FF00; padding: 1px 10px; border-radius: 0 3px 3px 0; color: #000000;', 'background: transparent; color: #00000;', value, stringified);
  });
  return atom;
});

/***/ }),

/***/ "./src/es/atom/taches/throttle.taches.js":
/*!***********************************************!*\
  !*** ./src/es/atom/taches/throttle.taches.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "throttleTimeT": () => (/* binding */ throttleTimeT),
/* harmony export */   "dynamicThrottleTimeT": () => (/* binding */ dynamicThrottleTimeT),
/* harmony export */   "staticThrottleTimeT": () => (/* binding */ staticThrottleTimeT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");






/**
 * @param timer Number | Atom
 * @param target Atom
 * @return atom Data
 */

const throttleTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (timer, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(timer)) {
    return staticThrottleTimeT(timer, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(timer)) {
    return dynamicThrottleTimeT(timer, target);
  } else {
    throw new TypeError('"timer" argument of throttleTimeT is expected to be type of "Number" or "Atom".');
  }
});
/**
 * the value target will only triggered when timer atom has at least one value
 *
 * @param timer Atom, which value is used as throttle time(in milliseconds)
 * @param target Atom, which value will be throttled with specified time
 * @return atom Data
 */

const dynamicThrottleTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (timer, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(timer)) {
    throw new TypeError('"timer" argument of dynamicThrottleTimeT is expected to be type of "Atom".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of dynamicThrottleTimeT is expected to be type of "Atom".');
  }

  const wrapTimerM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'timer',
    value: prev
  }));
  const wrappedTimerD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTimerM, wrappedTimerD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const throttleM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    const _internalStates = {
      timer: false,
      target: false,
      clock: 0,
      canEmit: true
    };
    const _internalValues = {
      timer: undefined,
      target: undefined
    }; // actual mutation operation function

    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'timer' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in throttleM, expected to be "timer" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (!_internalStates.timer || !_internalStates.target) {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'timer') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'target') {
        if (_internalStates.canEmit) {
          _internalStates.canEmit = false;
          _internalStates.clock = setTimeout(() => {
            clearTimeout(_internalStates.clock);
            _internalStates.canEmit = true;
          }, _internalValues.timer);
          return _internalValues.target;
        } else {
          return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
        }
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTimerD, throttleM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, throttleM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(throttleM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(timer, wrapTimerM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param ms Atom, which will be used as throttle time(in milliseconds)
 * @param target Atom, which value will be throttled with specified time
 * @return atom Data
 */

const staticThrottleTimeT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (ms, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(ms)) {
    throw new TypeError('"ms" argument of staticThrottleTimeT is expected to be type of "Number".');
  }

  return dynamicThrottleTimeT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(ms)), target);
});

/***/ }),

/***/ "./src/es/atom/taches/withHistory.taches.js":
/*!**************************************************!*\
  !*** ./src/es/atom/taches/withHistory.taches.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "withHistoryT": () => (/* binding */ withHistoryT),
/* harmony export */   "withDynamicHistoryT": () => (/* binding */ withDynamicHistoryT),
/* harmony export */   "withStaticHistoryT": () => (/* binding */ withStaticHistoryT),
/* harmony export */   "pairwiseT": () => (/* binding */ pairwiseT),
/* harmony export */   "truthyPairwiseT": () => (/* binding */ truthyPairwiseT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _mediators_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../mediators.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _filter_taches_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./filter.taches.js */ "./src/es/atom/taches/filter.taches.js");







/**
 * Takes a "n" which value will be used as length of history's length,
 * it can be type of Number or Atom.
 *
 * Returned atom will emits specified number of target's value as an array.
 *
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */

const withHistoryT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(n)) {
    return withStaticHistoryT(n, target);
  } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    return withDynamicHistoryT(n, target);
  } else {
    throw new TypeError('"n" argument of withHistoryT is expected to be type of "Number" or "Atom"');
  }
});
/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */

const withDynamicHistoryT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(n)) {
    throw new TypeError('"n" argument of withDynamicHistoryT is expected to be type of "Mutation" or "Data".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.isAtom)(target)) {
    throw new TypeError('"target" argument of withDynamicHistoryT is expected to be type of "Mutation" or "Data".');
  }

  const wrapNumM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'n',
    value: parseInt(prev)
  }));
  const wrappedNumD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapNumM, wrappedNumD);
  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const withHistoryM = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    // history :: [latest, ..., oldest]
    const _internalStates = {
      n: false,
      target: false,
      history: []
    };
    const _internalValues = {
      n: undefined,
      target: undefined
    }; // actual mutation operation function

    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'n' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in withHistoryM, expected to be "n" | "target", but received "${type}"`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;
      const {
        history
      } = _internalStates;

      if (type === 'n') {
        history.length = value;
        return _meta_js__WEBPACK_IMPORTED_MODULE_6__.TERMINATOR;
      }

      if (type === 'target') {
        history.pop();
        history.unshift(value);
        return [...history];
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedNumD, withHistoryM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrappedTargetD, withHistoryM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(withHistoryM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(n, wrapNumM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(target, wrapTargetM);
  return outputD;
});
/**
 * @param n Number
 * @param target Atom
 * @return Atom
 */

const withStaticHistoryT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (n, target) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(n)) {
    throw new TypeError('"n" argument of withStaticHistoryT is expected to be type of "Number".');
  }

  return withDynamicHistoryT((0,_mediators_js__WEBPACK_IMPORTED_MODULE_7__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(n)), target);
});
/**
 * Returned atom will emits the previous and current value of target atom as an array.
 *
 * @param target Atom
 * @return Atom
 */

const pairwiseT = withHistoryT(2);
const truthyPairwiseT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.pipe)(pairwiseT, (0,_filter_taches_js__WEBPACK_IMPORTED_MODULE_8__.filterT)(v => v[0] && v[1]));

/***/ }),

/***/ "./src/es/atom/taches/withLatestFrom.taches.js":
/*!*****************************************************!*\
  !*** ./src/es/atom/taches/withLatestFrom.taches.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "withLatestFromT": () => (/* binding */ withLatestFromT)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param target Atom
 * @param source Atom
 * @return atom Data
 */

const withLatestFromT = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (target, source) => {
  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(target)) {
    throw new TypeError('"target" argument of withLatestFromT is expected to be type of "Mutation" or "Data".');
  }

  if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(source)) {
    throw new TypeError('"source" argument of withLatestFromT is expected to be type of "Mutation" or "Data".');
  }

  const wrapTargetM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'target',
    value: prev
  }));
  const wrappedTargetD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapTargetM, wrappedTargetD);
  const wrapSourceM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    type: 'source',
    value: prev
  }));
  const wrappedSourceD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrapSourceM, wrappedSourceD);
  const withLatestFromM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalStates = {
      target: false,
      source: false
    };
    const _internalValues = {
      target: undefined,
      source: undefined
    };
    return prev => {
      const {
        type,
        value
      } = prev;

      if (type !== 'source' && type !== 'target') {
        throw new TypeError(`Unexpected type of wrapped Data received in withLatestFromM, expected to be "source" | "target", but received "${type}".`);
      }

      _internalStates[type] = true;
      _internalValues[type] = value;

      if (type === 'target') {
        return _meta_js__WEBPACK_IMPORTED_MODULE_5__.TERMINATOR;
      } // redundant conditional judgement


      if (type === 'source') {
        return _internalStates.target ? [_internalValues.source, _internalValues.target] : [_internalValues.source];
      }
    };
  })());
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedTargetD, withLatestFromM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(wrappedSourceD, withLatestFromM);
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.pipeAtom)(withLatestFromM, outputD);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(target, wrapTargetM);
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_4__.binaryTweenPipeAtom)(source, wrapSourceM);
  return outputD;
});

/***/ }),

/***/ "./src/es/atom/taches/zip.taches.js":
/*!******************************************!*\
  !*** ./src/es/atom/taches/zip.taches.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zipLatestT": () => (/* binding */ zipLatestT),
/* harmony export */   "arrayZipLatestT": () => (/* binding */ arrayZipLatestT),
/* harmony export */   "objectZipLatestT": () => (/* binding */ objectZipLatestT)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../meta.js */ "./src/es/atom/meta.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers.js */ "./src/es/atom/helpers.js");




/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */

const zipLatestT = (...args) => {
  if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(args[0]) || (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(args[0])) {
    return arrayZipLatestT(...args);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(args[0])) {
    return objectZipLatestT(...args);
  } else {
    throw new TypeError('Arguments of zipLatestT are expected to be type of Atom | [Atom] | { Atom }.');
  }
};
/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */

const arrayZipLatestT = (...args) => {
  let atoms = args[0];

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(atoms)) {
    atoms = args;
  }

  const inputDatas = atoms.map(atom => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of arrayZipLatestT are expected to be type of "Atom".');
    }

    return atom;
  });
  const wrapMutations = Array.from({
    length: atoms.length
  }).map((val, idx) => _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
    id: idx,
    value: prev
  })));
  const wrappedDatas = Array.from({
    length: atoms.length
  }).map(() => _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty());
  const zipM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalState = Array.from({
      length: atoms.length
    });

    const _intervalValues = Array.from({
      length: atoms.length
    });

    return prev => {
      const {
        id,
        value
      } = prev;
      _internalState[id] = true;
      _intervalValues[id] = value;

      if (_internalState.every(val => val) && _intervalValues.every(val => !(0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(val))) {
        _internalState.forEach((_, idx) => {
          _internalState[idx] = false;
        });

        return [..._intervalValues];
      } else {
        return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(zipM, outputD);
  wrappedDatas.forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, zipM);
  });
  wrapMutations.forEach((wrapMutation, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[idx]);
  });
  inputDatas.forEach((data, idx) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(data, wrapMutations[idx]);
  });
  return outputD;
};
/**
 * @param obj Object, { Atom }
 * @return atom Data
 */

const objectZipLatestT = obj => {
  const inputDatas = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!(0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.isAtom)(atom)) {
      throw new TypeError('Arguments of objectZipLatestT are expected to be type of "Atom".');
    }

    acc[key] = atom;
    return acc;
  }, {});
  const wrapMutations = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft(prev => ({
      key: key,
      value: prev
    }));
    return acc;
  }, {});
  const wrappedDatas = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
    return acc;
  }, {});
  const zipM = _atom_js__WEBPACK_IMPORTED_MODULE_2__.Mutation.ofLiftLeft((() => {
    const _internalState = Object.keys(obj).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    const _intervalValues = Object.keys(obj).reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {});

    return prev => {
      const {
        key,
        value
      } = prev;
      _internalState[key] = true;
      _intervalValues[key] = value;

      if (Object.values(_internalState).every(val => val) && Object.values(_intervalValues).every(val => !(0,_meta_js__WEBPACK_IMPORTED_MODULE_4__.isTerminator)(val))) {
        Object.keys(_internalState).forEach(key => {
          _internalState[key] = false;
        });
        return { ..._intervalValues
        };
      } else {
        return _meta_js__WEBPACK_IMPORTED_MODULE_4__.TERMINATOR;
      }
    };
  })());
  const outputD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
  (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(zipM, outputD);
  Object.values(wrappedDatas).forEach(data => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(data, zipM);
  });
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.pipeAtom)(wrapMutation, wrappedDatas[key]);
  });
  Object.entries(inputDatas).forEach(([key, data]) => {
    (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.binaryTweenPipeAtom)(data, wrapMutations[key]);
  });
  return outputD;
};

/***/ }),

/***/ "./src/es/external.js":
/*!****************************!*\
  !*** ./src/es/external.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_ERROR_RESPONSE_CODE": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_ERROR_RESPONSE_CODE),
/* harmony export */   "DEFAULT_FAIL_RESPONSE_CODE": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_FAIL_RESPONSE_CODE),
/* harmony export */   "DEFAULT_SUCCESS_RESPONSE_CODE": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SUCCESS_RESPONSE_CODE),
/* harmony export */   "DEFAULT_UNKNOWN_RESPONSE_CODE": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_UNKNOWN_RESPONSE_CODE),
/* harmony export */   "adaptMultiPlatform": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.adaptMultiPlatform),
/* harmony export */   "adaptMultiPlatformAwait": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.adaptMultiPlatformAwait),
/* harmony export */   "addClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.addClass),
/* harmony export */   "array": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.array),
/* harmony export */   "asGetRequest": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.asGetRequest),
/* harmony export */   "asPostRequest": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.asPostRequest),
/* harmony export */   "axios": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.axios),
/* harmony export */   "biu": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.biu),
/* harmony export */   "boolean": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.boolean),
/* harmony export */   "classArrToObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classArrToObj),
/* harmony export */   "classArrToStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classArrToStr),
/* harmony export */   "classObjToArr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classObjToArr),
/* harmony export */   "classObjToStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classObjToStr),
/* harmony export */   "classStrToArr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classStrToArr),
/* harmony export */   "classStrToObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.classStrToObj),
/* harmony export */   "completeStateD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.completeStateD),
/* harmony export */   "completeStateRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.completeStateRD),
/* harmony export */   "containClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.containClass),
/* harmony export */   "documentD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.documentD),
/* harmony export */   "documentRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.documentRD),
/* harmony export */   "domLoadedD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.domLoadedD),
/* harmony export */   "domLoadedRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.domLoadedRD),
/* harmony export */   "formatClassTo": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatClassTo),
/* harmony export */   "formatErrorResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatErrorResponse),
/* harmony export */   "formatFailResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatFailResponse),
/* harmony export */   "formatResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatResponse),
/* harmony export */   "formatResponseMakerFlattenArgs": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatResponseMakerFlattenArgs),
/* harmony export */   "formatSuccessResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatSuccessResponse),
/* harmony export */   "formatUnknownResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.formatUnknownResponse),
/* harmony export */   "globalVar": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.globalVar),
/* harmony export */   "hasValidResponseCode": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.hasValidResponseCode),
/* harmony export */   "injectScript": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.injectScript),
/* harmony export */   "inspect": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.inspect),
/* harmony export */   "interactiveStateD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.interactiveStateD),
/* harmony export */   "interactiveStateRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.interactiveStateRD),
/* harmony export */   "is": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.is),
/* harmony export */   "isErrorResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isErrorResponse),
/* harmony export */   "isFailResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isFailResponse),
/* harmony export */   "isInBrowser": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isInBrowser),
/* harmony export */   "isInNode": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isInNode),
/* harmony export */   "isInWXMINA": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isInWXMINA),
/* harmony export */   "isInWeb": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isInWeb),
/* harmony export */   "isPathnameEqual": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isPathnameEqual),
/* harmony export */   "isPathnameLooseEqual": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isPathnameLooseEqual),
/* harmony export */   "isPathnameStrictEqual": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isPathnameStrictEqual),
/* harmony export */   "isResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isResponse),
/* harmony export */   "isResponseCode": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isResponseCode),
/* harmony export */   "isSuccessResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isSuccessResponse),
/* harmony export */   "isUnknowResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.isUnknowResponse),
/* harmony export */   "makeBaseResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeBaseResponse),
/* harmony export */   "makeCustomEvent": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeCustomEvent),
/* harmony export */   "makeElementBasedMessageProxy": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeElementBasedMessageProxy),
/* harmony export */   "makeErrorResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeErrorResponse),
/* harmony export */   "makeErrorResponseF": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeErrorResponseF),
/* harmony export */   "makeEventHandler": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeEventHandler),
/* harmony export */   "makeFailResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeFailResponse),
/* harmony export */   "makeFailResponseF": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeFailResponseF),
/* harmony export */   "makeGeneralEventHandler": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeGeneralEventHandler),
/* harmony export */   "makeLinedTigerLogger": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeLinedTigerLogger),
/* harmony export */   "makeScopeManager": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeScopeManager),
/* harmony export */   "makeSuccessResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeSuccessResponse),
/* harmony export */   "makeSuccessResponseF": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeSuccessResponseF),
/* harmony export */   "makeTigerLogger": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeTigerLogger),
/* harmony export */   "makeUniqueString": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeUniqueString),
/* harmony export */   "makeUnknownResponse": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeUnknownResponse),
/* harmony export */   "makeUnknownResponseF": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.makeUnknownResponseF),
/* harmony export */   "modifyBiuConfig": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.modifyBiuConfig),
/* harmony export */   "neatenClassStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.neatenClassStr),
/* harmony export */   "neatenPathname": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.neatenPathname),
/* harmony export */   "neatenQueryStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.neatenQueryStr),
/* harmony export */   "neatenSearch": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.neatenSearch),
/* harmony export */   "number": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.number),
/* harmony export */   "object": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.object),
/* harmony export */   "pathnameToArray": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.pathnameToArray),
/* harmony export */   "pathnameToString": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.pathnameToString),
/* harmony export */   "perf": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.perf),
/* harmony export */   "pollingToGetNode": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.pollingToGetNode),
/* harmony export */   "prefixClassWith": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.prefixClassWith),
/* harmony export */   "queryObjToQueryStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.queryObjToQueryStr),
/* harmony export */   "queryObjToSearch": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.queryObjToSearch),
/* harmony export */   "queryStrToQueryObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.queryStrToQueryObj),
/* harmony export */   "queryStrToSearch": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.queryStrToSearch),
/* harmony export */   "readyStateD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.readyStateD),
/* harmony export */   "readyStateRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.readyStateRD),
/* harmony export */   "removeClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeClass),
/* harmony export */   "removePrefixOfClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removePrefixOfClass),
/* harmony export */   "removeRepetition": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeRepetition),
/* harmony export */   "removeRepetitionExcept": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeRepetitionExcept),
/* harmony export */   "removeRepetitionOf": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeRepetitionOf),
/* harmony export */   "removeRepetitionOfEmpty": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeRepetitionOfEmpty),
/* harmony export */   "removeRepetitionOfSlash": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.removeRepetitionOfSlash),
/* harmony export */   "replaceClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.replaceClass),
/* harmony export */   "searchToQueryObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.searchToQueryObj),
/* harmony export */   "searchToQueryStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.searchToQueryStr),
/* harmony export */   "stdLineLog": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.stdLineLog),
/* harmony export */   "string": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.string),
/* harmony export */   "struct": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.struct),
/* harmony export */   "toClassArr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toClassArr),
/* harmony export */   "toClassObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toClassObj),
/* harmony export */   "toClassStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toClassStr),
/* harmony export */   "toQueryObj": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toQueryObj),
/* harmony export */   "toQueryStr": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toQueryStr),
/* harmony export */   "toSearch": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toSearch),
/* harmony export */   "toggleClass": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.toggleClass),
/* harmony export */   "windowD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowD),
/* harmony export */   "windowLoadedD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowLoadedD),
/* harmony export */   "windowLoadedRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowLoadedRD),
/* harmony export */   "windowRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowRD),
/* harmony export */   "windowResizeD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowResizeD),
/* harmony export */   "windowResizeRD": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.windowResizeRD),
/* harmony export */   "withCredentials": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.withCredentials),
/* harmony export */   "withDataExtracted": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.withDataExtracted),
/* harmony export */   "withJSONContent": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.withJSONContent),
/* harmony export */   "withoutCredentials": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.withoutCredentials),
/* harmony export */   "wxmina": () => (/* reexport safe */ _external_index_js__WEBPACK_IMPORTED_MODULE_0__.wxmina)
/* harmony export */ });
/* harmony import */ var _external_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./external/index.js */ "./src/es/external/index.js");


/***/ }),

/***/ "./src/es/external/app.js":
/*!********************************!*\
  !*** ./src/es/external/app.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "globalVar": () => (/* binding */ globalVar),
/* harmony export */   "makeEventHandler": () => (/* binding */ makeEventHandler),
/* harmony export */   "makeGeneralEventHandler": () => (/* binding */ makeGeneralEventHandler),
/* harmony export */   "makeElementBasedMessageProxy": () => (/* binding */ makeElementBasedMessageProxy)
/* harmony export */ });
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/helpers/derive-create.helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/helpers/transform.helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/mutation.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/taches/filter.taches.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _event_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./event.js */ "./src/es/external/event.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./dom.js */ "./src/es/external/dom.js");




const GLOBAL_VARS = new Map();
const globalVar = (key, value) => {
  if (value) {
    GLOBAL_VARS.set(key, value);
  }

  return GLOBAL_VARS.get(key);
};
const makeEventHandler = (handler = v => v) => {
  let eventHandler;

  const agent = handler => {
    eventHandler = handler;
  };

  const [data, triggerMediator, trigger] = (0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromFunction)(agent, e => handler(e));
  return [eventHandler, data, triggerMediator, trigger];
};
const makeGeneralEventHandler = (handler = v => v) => {
  const [eventHandler, data, triggerMediator, trigger] = makeEventHandler(handler);
  const eventHandlerRD = (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.dataToData)(() => eventHandler, _event_js__WEBPACK_IMPORTED_MODULE_2__.completeStateRD);
  return [eventHandlerRD, eventHandler, data, triggerMediator, trigger];
};

const _elementBasedMessageProxyMap = new Map();

globalVar('elementBasedMessageProxyMap', _elementBasedMessageProxyMap);
const makeElementBasedMessageProxy = (id, type, name) => {
  const proxy = _elementBasedMessageProxyMap.get(id + type);

  if (proxy) {
    return proxy;
  }

  let ele = document.getElementById(id);

  if (!ele) {
    const tempEle = document.createElement('div');
    tempEle.id = id;
    tempEle.style.display = 'none';
    document.body.appendChild(tempEle);
    ele = tempEle;
  }

  const ElementBasedMessageProxy = class {
    constructor(ele, type, name) {
      const [data] = (0,_atom_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent)(ele, type);
      const onymousInnerMessageD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
      const onymousSendM = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.ofLiftBoth(prev => {
        let detail, options;

        if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isObject)(prev)) {
          if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty)('detail', prev) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty)('options', prev)) {
            detail = prev.detail;
            options = prev.options;
          } else {
            detail = prev;
          }
        } else {
          detail = {
            data: prev
          };
        }

        detail.from = name;
        ele.dispatchEvent((0,_dom_js__WEBPACK_IMPORTED_MODULE_7__.makeCustomEvent)(type, detail, options));
        return {
          type,
          detail,
          options
        };
      });
      const anonymousSendM = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Mutation.ofLiftBoth(prev => {
        let detail, options;

        if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isObject)(prev)) {
          if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty)('detail', prev) && (0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty)('options', prev)) {
            detail = prev.detail;
            options = prev.options;
          } else {
            detail = prev;
          }
        } else {
          detail = {
            data: prev
          };
        }

        ele.dispatchEvent((0,_dom_js__WEBPACK_IMPORTED_MODULE_7__.makeCustomEvent)(type, detail, options));
        return {
          type,
          detail,
          options
        };
      });
      const sendedD = _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data.empty();
      (0,_atom_js__WEBPACK_IMPORTED_MODULE_8__.pipeAtom)(onymousInnerMessageD, onymousSendM, sendedD);
      (0,_atom_js__WEBPACK_IMPORTED_MODULE_8__.pipeAtom)(anonymousSendM, sendedD);
      this.element = ele;
      this.type = type;
      this.name = name;
      this.innerMessageD = onymousInnerMessageD;
      this.sender = onymousSendM;
      this.onymousSender = onymousSendM;
      this.anonymousSender = onymousSendM;
      this.sendedD = sendedD;
      const namedReceiver = (0,_atom_js__WEBPACK_IMPORTED_MODULE_9__.filterT)(prev => prev.detail.to === name, data);
      this.receiver = namedReceiver;
      this.broadReceiver = data;
      this.namedReceiver = namedReceiver;
      this.anonymousReceiver = (0,_atom_js__WEBPACK_IMPORTED_MODULE_9__.filterT)(prev => prev.detail.from === undefined, data);
    }

    customizeReveiver(cond) {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isFunction)(cond)) {
        return (0,_atom_js__WEBPACK_IMPORTED_MODULE_9__.filterT)(cond, this.broadReceiver);
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isObject)(cond)) {
        // TODO
        console.warn("TODO: Object type of cond as customizeReveiver's argument, you got a broadReceiver instead.");
        return this.broadReceiver;
      } else {
        throw new TypeError('"cond" is expected to be a Function or an Object');
      }
    }

    send(message) {
      if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(message)) {
        return this.sender.observe(message);
      } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_4__.isMutation)(message)) {
        return this.sender.observe((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.mutationToDataS)(message));
      } else {
        this.innerMessageD.triggerValue(message);
      }
    }

    receive(handler) {
      if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_4__.isMutation)(handler)) {
        return handler.observe(this.receiver);
      } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.isData)(handler)) {
        return (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.dataToMutationS)(handler).observe(this.receiver);
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isFunction)(handler)) {
        return this.receiver.subscribe(({
          value
        }) => {
          handler(value);
        });
      } else {
        throw new TypeError('"handler" is expected to be type of Mutation | Data | Function.');
      }
    }

    receiveDetail(handler) {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.isFunction)(handler)) {
        return this.receiver.subscribe(({
          value: e
        }) => {
          handler(e.detail);
        });
      } else if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_10__.isAtom)(handler)) {
        return (0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.atomToMutation)(e => e.detail, handler).observe(this.receiver);
      } else {
        throw new TypeError('"handler" is expected to be type of Mutation | Data | Function.');
      }
    }

  };

  const _proxy = new ElementBasedMessageProxy(ele, type, name);

  _elementBasedMessageProxyMap.set(id + type, _proxy);

  return _proxy;
};

/***/ }),

/***/ "./src/es/external/class.js":
/*!**********************************!*\
  !*** ./src/es/external/class.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "neatenClassStr": () => (/* binding */ neatenClassStr),
/* harmony export */   "classStrToArr": () => (/* binding */ classStrToArr),
/* harmony export */   "classArrToObj": () => (/* binding */ classArrToObj),
/* harmony export */   "classStrToObj": () => (/* binding */ classStrToObj),
/* harmony export */   "classObjToArr": () => (/* binding */ classObjToArr),
/* harmony export */   "classArrToStr": () => (/* binding */ classArrToStr),
/* harmony export */   "classObjToStr": () => (/* binding */ classObjToStr),
/* harmony export */   "toClassStr": () => (/* binding */ toClassStr),
/* harmony export */   "toClassArr": () => (/* binding */ toClassArr),
/* harmony export */   "toClassObj": () => (/* binding */ toClassObj),
/* harmony export */   "formatClassTo": () => (/* binding */ formatClassTo),
/* harmony export */   "prefixClassWith": () => (/* binding */ prefixClassWith),
/* harmony export */   "removePrefixOfClass": () => (/* binding */ removePrefixOfClass),
/* harmony export */   "addClass": () => (/* binding */ addClass),
/* harmony export */   "removeClass": () => (/* binding */ removeClass),
/* harmony export */   "toggleClass": () => (/* binding */ toggleClass),
/* harmony export */   "replaceClass": () => (/* binding */ replaceClass),
/* harmony export */   "containClass": () => (/* binding */ containClass)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");


/**
 * @param str same as value of class attribute on HTML tags
 * @return classString str
 * @example
 * ```js
 * 'mobius-base mobius-theme--light'
 * '.mobius-base.mobius-theme--light'
 * '.mobius-base mobius-theme--light'
 * ```
 */

const neatenClassStr = str => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(str)) {
    throw new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`);
  }

  return str.replace('.', ' ').replace(/\s+/g, ' ').trim();
};
/**
 * @param str class string
 * @return classArray array of classnames
 * @example
 * ```js
 * ['mobius-base', 'mobius-theme--light']
 * ```
 */

const classStrToArr = str => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(str)) {
    throw new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`);
  }

  return neatenClassStr(str).split(' ').filter(s => s.length > 0);
};
/**
 * @param arr array of classnames
 * @return classObject which use key as classname and value as exist of classname
 * @example
 * ```js
 * {
 *  'mobius-base': true,
 *  'mobius-theme--light': true
 * }
 * ```
 */

const classArrToObj = arr => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(arr)) {
    throw new TypeError(`"arr" is expected to be type of Array, but received typeof "${arr}".`);
  }

  const obj = arr.flat(Infinity).filter(_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});
  return obj;
};
/**
 * @param str classString
 * @return classObject
 */

const classStrToObj = str => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(str)) {
    throw new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`);
  }

  const arr = classStrToArr(str);
  const obj = classArrToObj(arr);
  return obj;
};
/**
 * @param obj classObject
 * @return classArray
 */

const classObjToArr = obj => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(obj)) {
    throw new TypeError(`"obj" is expected to be type of Object, but received typeof "${obj}".`);
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === true) {
      acc.push(key);
    }

    return acc;
  }, []);
};
/**
 * @param arr classArray
 * @return classString
 */

const classArrToStr = arr => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(arr)) {
    throw new TypeError(`"arr" is expected to be type of Array, but received typeof "${arr}".`);
  }

  const str = arr.flat(Infinity).filter(_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString).filter(s => s.length > 0).join(' ');
  return str;
};
/**
 * @param obj classObject
 * @return classString
 */

const classObjToStr = obj => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(obj)) {
    throw new TypeError(`"obj" is expected to be type of Object, but received typeof "${obj}".`);
  }

  const arr = classObjToArr(obj);
  const str = classArrToStr(arr);
  return str;
};
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classString
 */

const toClassStr = tar => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(tar)) {
    return '' + tar;
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(tar)) {
    return classArrToStr(tar);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar)) {
    return classObjToStr(tar);
  } else {
    throw new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`);
  }
};
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classArray
 */

const toClassArr = tar => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(tar)) {
    return classStrToArr(tar);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(tar)) {
    return [...tar.flat(Infinity).filter(_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)];
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar)) {
    return classObjToArr(tar);
  } else {
    throw new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`);
  }
};
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classObject
 */

const toClassObj = tar => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(tar)) {
    return classStrToObj(tar);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(tar)) {
    return classArrToObj(tar);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(tar)) {
    return { ...tar
    };
  } else {
    throw new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`);
  }
};
/**
 * @param target classString | classArray | classObject
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */

const formatClassTo = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (target, cls) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(target)) {
    return toClassStr(cls);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(target)) {
    return toClassObj(cls);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
    return toClassArr(cls);
  } else {
    throw new TypeError(`"target" is expected to be type of String | Array | Object, but received typeof ${target}`);
  }
});
/**
 * @param prefix String
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */

const prefixClassWith = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (prefix, cls) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(cls)) {
    const classArr = classStrToArr(cls).map(item => item.indexOf(prefix) === 0 ? item : prefix + item);
    const classStr = classArrToStr(classArr);
    return classStr;
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(cls)) {
    const classObj = Object.entries(cls).reduce((acc, [key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key : prefix + key;

      acc[_key] = value;
      return acc;
    }, {});
    return classObj;
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(cls)) {
    const classArr = cls.map(item => item.indexOf(prefix) === 0 ? item : prefix + item);
    return classArr;
  } else {
    throw new Error(`"cls"(aka. class) is expected to be type of String | Array | Object, but received ${cls}`);
  }
});
/**
 * @param prefix String
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */

const removePrefixOfClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (prefix, cls) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(cls)) {
    const classArr = classStrToArr(cls).map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length);
      }

      return item;
    });
    const classStr = classArr.join(' ');
    return classStr;
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(cls)) {
    const classObj = Object.entries(cls).reduce((acc, [key, value]) => {
      if (key.indexOf(prefix) === 0) {
        acc[key.slice(prefix.length)] = value;
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});
    return classObj;
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(cls)) {
    const classArr = cls.map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length);
      }

      return item;
    });
    return classArr;
  } else {
    throw new Error(`"cls"(aka. class) is expected to be type of String | Array | Object, but received ${cls}`);
  }
});
const addClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (added, target) => {
  const addedClassObj = toClassObj(added);
  const targetClassObj = toClassObj(target);
  const resClassObj = { ...targetClassObj,
    ...addedClassObj
  };
  return formatClassTo(target, resClassObj);
});
const removeClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (removed, target) => {
  const removedClassObj = toClassObj(removed);
  Object.keys(removedClassObj).forEach(key => {
    removedClassObj[key] = false;
  });
  const targetClassObj = toClassObj(target);
  const resClassObj = { ...targetClassObj,
    ...removedClassObj
  };
  return formatClassTo(target, resClassObj);
});
const toggleClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (toggled, target) => {
  const toggledClassArr = toClassArr(toggled);
  const targetClassObj = toClassObj(target);
  toggledClassArr.forEach(cls => {
    targetClassObj[cls] = !targetClassObj[cls];
  });
  return formatClassTo(target, targetClassObj);
});
const replaceClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (replaced, target) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(replaced)) {
    const targetClassObj = toClassObj(target);
    Object.entries(replaced).forEach(([prev, cur]) => {
      if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(prev) || !(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(cur)) {
        return;
      }

      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)(prev, targetClassObj)) {
        if (cur !== '') {
          targetClassObj[cur] = targetClassObj[prev];
        }

        delete targetClassObj[prev];
      }
    });
    return formatClassTo(target, targetClassObj);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(replaced)) {
    const replacedArr = replaced.filter(item => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(item) && item.length > 0 || (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(item)).map(item => {
      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(item)) {
        if (item.length === 1) {
          return [item[0], ''];
        } else if (item.length === 2) {
          return item;
        } else if (item.length > 2) {
          return item.slice(0, 2);
        } else {
          throw new Error('Unexpected error happened!');
        }
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(item)) {
        return [item, ''];
      }
    });
    const targetClassObj = toClassObj(target);
    replacedArr.forEach(replaced => {
      const [prev, cur] = replaced;

      if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(prev) || !(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(cur)) {
        return;
      }

      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)(prev, targetClassObj)) {
        if (cur !== '') {
          targetClassObj[cur] = targetClassObj[prev];
        }

        delete targetClassObj[prev];
      }
    });
    return formatClassTo(target, targetClassObj);
  } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(replaced)) {
    return replaceClass(toClassArr(replaced), target);
  } else {
    throw new TypeError(`"replaced" is expected to be type of String | Array | Object, but received ${replaced}`);
  }
});
const containClass = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.curryN)(2, (contained, target) => {
  const containedClassArr = toClassArr(contained);
  const targetClassArr = toClassArr(target);
  return containedClassArr.every(item => targetClassArr.includes(item));
}); // const classStr = ' mobius-add .   del'
// const classArr = [['mobius-add'], ['del']]
// const classObj = { 'mobius-add': true, del: false }
// console.log('【Type transformation】')
// console.log(classStrToArr(classStr))
// console.log(classArrToObj(classArr))
// console.log(classStrToObj(classStr))
// console.log(classObjToArr(classObj))
// console.log(classArrToStr(classArr))
// console.log(classObjToStr(classObj))
// console.log('【prefix】')
// console.log(prefixClassWith('mobius-', classStr))
// console.log(prefixClassWith('mobius-', classArr))
// console.log(prefixClassWith('mobius-', classObj))
// console.log(removePrefixOfClass('mobius-', classStr))
// console.log(removePrefixOfClass('mobius-', classArr))
// console.log(removePrefixOfClass('mobius-', classObj))
// console.log('【add】')
// console.log(addClass(classArr, classObj))
// console.log(addClass(classStr, classObj))
// console.log('【remove】')
// console.log(removeClass(classStr, classObj))
// console.log(removeClass(classArr, classObj))
// console.log('【toggle】')
// console.log(toggleClass(classStr, classObj))
// console.log(toggleClass(classArr, classObj))
// console.log('【replace】')
// console.log(replaceClass(classStr, classObj))
// console.log(replaceClass(classArr, classObj))
// console.log(replaceClass({ 'mobius-add': 'add', del: 'mobius-del' }, classObj))
// console.log('【contain】')
// console.log(containClass(classStr, classObj))
// console.log(containClass(classArr, classObj))
// console.log(containClass(classArr, { 'mobius-add': true, del: true }))
// console.log(prefixClassWith('mobius-', ''))

/***/ }),

/***/ "./src/es/external/debug.js":
/*!**********************************!*\
  !*** ./src/es/external/debug.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "perf": () => (/* binding */ perf),
/* harmony export */   "stdLineLog": () => (/* binding */ stdLineLog),
/* harmony export */   "makeTigerLogger": () => (/* binding */ makeTigerLogger),
/* harmony export */   "makeLinedTigerLogger": () => (/* binding */ makeLinedTigerLogger),
/* harmony export */   "inspect": () => (/* binding */ inspect)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");

const perf = {
  get now() {
    return Math.round(performance.now());
  }

};
const stdLineLog = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curry)((file, fnName, description) => `[${perf.now}][${file}] ${fnName}: ${description}...`);
const makeTigerLogger = textGen => (text, appends) => console.log(textGen(text || ''), appends || '');
const makeLinedTigerLogger = (file, fileName) => makeTigerLogger(stdLineLog(file, fileName)); // @ref: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/appendix_a.html
// inspect :: a -> String

const inspect = x => {
  if (x && typeof x.inspect === 'function') {
    return x.inspect();
  }

  function inspectFn(f) {
    return f.name ? f.name : f.toString();
  }

  function inspectTerm(t) {
    switch (typeof t) {
      case 'string':
        return `'${t}'`;

      case 'object':
        {
          const ts = Object.keys(t).map(k => [k, inspect(t[k])]);
          return `{${ts.map(kv => kv.join(': ')).join(', ')}}`;
        }

      default:
        return String(t);
    }
  }

  function inspectArgs(args) {
    return Array.isArray(args) ? `[${args.map(inspect).join(', ')}]` : inspectTerm(args);
  }

  return typeof x === 'function' ? inspectFn(x) : inspectArgs(x);
};

/***/ }),

/***/ "./src/es/external/dom.js":
/*!********************************!*\
  !*** ./src/es/external/dom.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "injectScript": () => (/* binding */ injectScript),
/* harmony export */   "makeCustomEvent": () => (/* binding */ makeCustomEvent),
/* harmony export */   "pollingToGetNode": () => (/* binding */ pollingToGetNode)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");


const injectScript = (src, onload = () => {}, removeAfterLoad = false) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.src = src;

  script.onload = (...args) => {
    onload(...args);

    if (removeAfterLoad) {
      script.parentNode.removeChild(script);
    }
  };

  document.head.appendChild(script);
  return script;
};
const makeCustomEvent = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (type, detail, options) => new CustomEvent(type, { ...(options || {}),
  detail: {
    eventType: type,
    ...(detail || {})
  }
}));
/**
 * @param selector String, id | selector
 * @param interval Number, polling interval (in ms)
 * @return undefined
 */

const pollingToGetNode = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (selector, interval, callback) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(selector)) {
    throw new TypeError('"selector" argument of pollingToGetNode is expected to be type of "String".');
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(interval)) {
    throw new TypeError('"interval" argument of pollingToGetNode is expected to be type of "Number".');
  }

  let node;
  let timer = 0;
  timer = setInterval(() => {
    if (selector.includes('#') || selector.includes('.')) {
      node = node || document.querySelector(selector);
    } else {
      node = node || document.getElementById(selector);
    }

    if (node) {
      clearInterval(timer);
      callback(node);
    }
  }, interval);
});

/***/ }),

/***/ "./src/es/external/environment.js":
/*!****************************************!*\
  !*** ./src/es/external/environment.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isInWXMINA": () => (/* binding */ isInWXMINA),
/* harmony export */   "isInWeb": () => (/* binding */ isInWeb),
/* harmony export */   "isInBrowser": () => (/* binding */ isInBrowser),
/* harmony export */   "isInNode": () => (/* binding */ isInNode),
/* harmony export */   "wxmina": () => (/* binding */ wxmina),
/* harmony export */   "adaptMultiPlatform": () => (/* binding */ adaptMultiPlatform),
/* harmony export */   "adaptMultiPlatformAwait": () => (/* binding */ adaptMultiPlatformAwait)
/* harmony export */ });
// eslint-disable-next-line no-undef
const isInWXMINA = () => typeof wx !== 'undefined' && wx.canIUse;
const isInWeb = () => typeof document === 'object';
const isInBrowser = isInWeb;
const isInNode = () => typeof global !== 'undefined';
let wxmina;

if (isInWXMINA()) {
  // eslint-disable-next-line no-undef
  wxmina = wx;
}


const adaptMultiPlatform = ({
  webFn = () => {},
  nodeFn = () => {},
  wxminaFn = () => {},
  defaultFn = () => {}
} = {}) => {
  if (isInWeb()) {
    webFn && webFn();
  } else if (isInNode()) {
    nodeFn && nodeFn();
  } else if (isInWXMINA()) {
    wxminaFn && wxminaFn();
  } else {
    defaultFn && defaultFn();
  }
};
const adaptMultiPlatformAwait = async ({
  webFn = () => {},
  nodeFn = () => {},
  wxminaFn = () => {},
  defaultFn = () => {}
} = {}) => {
  if (isInWeb()) {
    webFn && (await webFn());
  } else if (isInNode()) {
    nodeFn && (await nodeFn());
  } else if (isInWXMINA()) {
    wxminaFn && (await wxminaFn());
  } else {
    defaultFn && (await defaultFn());
  }
};

/***/ }),

/***/ "./src/es/external/event.js":
/*!**********************************!*\
  !*** ./src/es/external/event.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "domLoadedD": () => (/* binding */ domLoadedD),
/* harmony export */   "domLoadedRD": () => (/* binding */ domLoadedRD),
/* harmony export */   "windowLoadedD": () => (/* binding */ windowLoadedD),
/* harmony export */   "windowLoadedRD": () => (/* binding */ windowLoadedRD),
/* harmony export */   "readyStateD": () => (/* binding */ readyStateD),
/* harmony export */   "readyStateRD": () => (/* binding */ readyStateRD),
/* harmony export */   "interactiveStateD": () => (/* binding */ interactiveStateD),
/* harmony export */   "interactiveStateRD": () => (/* binding */ interactiveStateRD),
/* harmony export */   "completeStateD": () => (/* binding */ completeStateD),
/* harmony export */   "completeStateRD": () => (/* binding */ completeStateRD),
/* harmony export */   "windowResizeD": () => (/* binding */ windowResizeD),
/* harmony export */   "windowResizeRD": () => (/* binding */ windowResizeRD),
/* harmony export */   "windowD": () => (/* binding */ windowD),
/* harmony export */   "windowRD": () => (/* binding */ windowRD),
/* harmony export */   "documentD": () => (/* binding */ documentD),
/* harmony export */   "documentRD": () => (/* binding */ documentRD)
/* harmony export */ });
/* harmony import */ var _atom_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../atom/index.js */ "./src/es/atom/helpers/derive-create.helpers.js");
/* harmony import */ var _atom_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom/index.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _atom_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom/index.js */ "./src/es/atom/taches/filter.taches.js");
/* harmony import */ var _atom_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom/index.js */ "./src/es/atom/atoms/data.atom.js");
 // ref: https://zh.javascript.info/onload-ondomcontentloaded
// ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState

const domLoadedD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent)(document, 'DOMContentLoaded')[0];
const domLoadedRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(domLoadedD, {
  autoTrigger: true
});
const windowLoadedD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent)(window, 'load')[0];
const windowLoadedRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(windowLoadedD, {
  autoTrigger: true
});
const readyStateD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent)(document, 'readystatechange', () => document.readyState)[0];
const readyStateRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(readyStateD, {
  autoTrigger: true
});
readyStateD.triggerValue(document.readyState);
const interactiveStateD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_2__.filterT)(v => v === 'interactive' || v === 'complete', readyStateRD);
const interactiveStateRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(interactiveStateD, {
  autoTrigger: true
});
const completeStateD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_2__.filterT)(v => v === 'complete', readyStateRD);
const completeStateRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(completeStateD, {
  autoTrigger: true
});
const windowResizeD = (0,_atom_index_js__WEBPACK_IMPORTED_MODULE_0__.createDataFromEvent)(window, 'resize')[0];
const windowResizeRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(windowResizeD, {
  autoTrigger: true
});
windowResizeD.triggerValue({
  type: 'resize',
  target: window
});
const windowD = _atom_index_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(window);
const windowRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(windowD, {
  autoTrigger: true
});
const documentD = _atom_index_js__WEBPACK_IMPORTED_MODULE_3__.Data.of(document);
const documentRD = _atom_index_js__WEBPACK_IMPORTED_MODULE_1__.ReplayMediator.of(documentD, {
  autoTrigger: true
});

/***/ }),

/***/ "./src/es/external/index.js":
/*!**********************************!*\
  !*** ./src/es/external/index.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeUniqueString": () => (/* reexport safe */ _unique_js__WEBPACK_IMPORTED_MODULE_0__.makeUniqueString),
/* harmony export */   "addClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.addClass),
/* harmony export */   "classArrToObj": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classArrToObj),
/* harmony export */   "classArrToStr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classArrToStr),
/* harmony export */   "classObjToArr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classObjToArr),
/* harmony export */   "classObjToStr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classObjToStr),
/* harmony export */   "classStrToArr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classStrToArr),
/* harmony export */   "classStrToObj": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.classStrToObj),
/* harmony export */   "containClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.containClass),
/* harmony export */   "formatClassTo": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.formatClassTo),
/* harmony export */   "neatenClassStr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.neatenClassStr),
/* harmony export */   "prefixClassWith": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.prefixClassWith),
/* harmony export */   "removeClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.removeClass),
/* harmony export */   "removePrefixOfClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.removePrefixOfClass),
/* harmony export */   "replaceClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.replaceClass),
/* harmony export */   "toClassArr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.toClassArr),
/* harmony export */   "toClassObj": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.toClassObj),
/* harmony export */   "toClassStr": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.toClassStr),
/* harmony export */   "toggleClass": () => (/* reexport safe */ _class_js__WEBPACK_IMPORTED_MODULE_1__.toggleClass),
/* harmony export */   "isPathnameEqual": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameEqual),
/* harmony export */   "isPathnameLooseEqual": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameLooseEqual),
/* harmony export */   "isPathnameStrictEqual": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameStrictEqual),
/* harmony export */   "neatenPathname": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.neatenPathname),
/* harmony export */   "neatenQueryStr": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.neatenQueryStr),
/* harmony export */   "neatenSearch": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.neatenSearch),
/* harmony export */   "pathnameToArray": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.pathnameToArray),
/* harmony export */   "pathnameToString": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.pathnameToString),
/* harmony export */   "queryObjToQueryStr": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.queryObjToQueryStr),
/* harmony export */   "queryObjToSearch": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.queryObjToSearch),
/* harmony export */   "queryStrToQueryObj": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.queryStrToQueryObj),
/* harmony export */   "queryStrToSearch": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.queryStrToSearch),
/* harmony export */   "removeRepetition": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetition),
/* harmony export */   "removeRepetitionExcept": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionExcept),
/* harmony export */   "removeRepetitionOf": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOf),
/* harmony export */   "removeRepetitionOfEmpty": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOfEmpty),
/* harmony export */   "removeRepetitionOfSlash": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOfSlash),
/* harmony export */   "searchToQueryObj": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.searchToQueryObj),
/* harmony export */   "searchToQueryStr": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.searchToQueryStr),
/* harmony export */   "toQueryObj": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.toQueryObj),
/* harmony export */   "toQueryStr": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.toQueryStr),
/* harmony export */   "toSearch": () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_2__.toSearch),
/* harmony export */   "asGetRequest": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.asGetRequest),
/* harmony export */   "asPostRequest": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.asPostRequest),
/* harmony export */   "axios": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.axios),
/* harmony export */   "biu": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.biu),
/* harmony export */   "modifyBiuConfig": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.modifyBiuConfig),
/* harmony export */   "withCredentials": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.withCredentials),
/* harmony export */   "withDataExtracted": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.withDataExtracted),
/* harmony export */   "withJSONContent": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.withJSONContent),
/* harmony export */   "withoutCredentials": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_3__.withoutCredentials),
/* harmony export */   "DEFAULT_ERROR_RESPONSE_CODE": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_ERROR_RESPONSE_CODE),
/* harmony export */   "DEFAULT_FAIL_RESPONSE_CODE": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_FAIL_RESPONSE_CODE),
/* harmony export */   "DEFAULT_SUCCESS_RESPONSE_CODE": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_SUCCESS_RESPONSE_CODE),
/* harmony export */   "DEFAULT_UNKNOWN_RESPONSE_CODE": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_UNKNOWN_RESPONSE_CODE),
/* harmony export */   "formatErrorResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatErrorResponse),
/* harmony export */   "formatFailResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatFailResponse),
/* harmony export */   "formatResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatResponse),
/* harmony export */   "formatResponseMakerFlattenArgs": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatResponseMakerFlattenArgs),
/* harmony export */   "formatSuccessResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatSuccessResponse),
/* harmony export */   "formatUnknownResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.formatUnknownResponse),
/* harmony export */   "hasValidResponseCode": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.hasValidResponseCode),
/* harmony export */   "isErrorResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isErrorResponse),
/* harmony export */   "isFailResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isFailResponse),
/* harmony export */   "isResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isResponse),
/* harmony export */   "isResponseCode": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isResponseCode),
/* harmony export */   "isSuccessResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isSuccessResponse),
/* harmony export */   "isUnknowResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.isUnknowResponse),
/* harmony export */   "makeBaseResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeBaseResponse),
/* harmony export */   "makeErrorResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeErrorResponse),
/* harmony export */   "makeErrorResponseF": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeErrorResponseF),
/* harmony export */   "makeFailResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeFailResponse),
/* harmony export */   "makeFailResponseF": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeFailResponseF),
/* harmony export */   "makeSuccessResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeSuccessResponse),
/* harmony export */   "makeSuccessResponseF": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeSuccessResponseF),
/* harmony export */   "makeUnknownResponse": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeUnknownResponse),
/* harmony export */   "makeUnknownResponseF": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_4__.makeUnknownResponseF),
/* harmony export */   "array": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.array),
/* harmony export */   "boolean": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.boolean),
/* harmony export */   "is": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.is),
/* harmony export */   "number": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.number),
/* harmony export */   "object": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.object),
/* harmony export */   "string": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.string),
/* harmony export */   "struct": () => (/* reexport safe */ _struct_js__WEBPACK_IMPORTED_MODULE_5__.struct),
/* harmony export */   "inspect": () => (/* reexport safe */ _debug_js__WEBPACK_IMPORTED_MODULE_6__.inspect),
/* harmony export */   "makeLinedTigerLogger": () => (/* reexport safe */ _debug_js__WEBPACK_IMPORTED_MODULE_6__.makeLinedTigerLogger),
/* harmony export */   "makeTigerLogger": () => (/* reexport safe */ _debug_js__WEBPACK_IMPORTED_MODULE_6__.makeTigerLogger),
/* harmony export */   "perf": () => (/* reexport safe */ _debug_js__WEBPACK_IMPORTED_MODULE_6__.perf),
/* harmony export */   "stdLineLog": () => (/* reexport safe */ _debug_js__WEBPACK_IMPORTED_MODULE_6__.stdLineLog),
/* harmony export */   "adaptMultiPlatform": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.adaptMultiPlatform),
/* harmony export */   "adaptMultiPlatformAwait": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.adaptMultiPlatformAwait),
/* harmony export */   "isInBrowser": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.isInBrowser),
/* harmony export */   "isInNode": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.isInNode),
/* harmony export */   "isInWXMINA": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.isInWXMINA),
/* harmony export */   "isInWeb": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.isInWeb),
/* harmony export */   "wxmina": () => (/* reexport safe */ _environment_js__WEBPACK_IMPORTED_MODULE_7__.wxmina),
/* harmony export */   "completeStateD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.completeStateD),
/* harmony export */   "completeStateRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.completeStateRD),
/* harmony export */   "documentD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.documentD),
/* harmony export */   "documentRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.documentRD),
/* harmony export */   "domLoadedD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.domLoadedD),
/* harmony export */   "domLoadedRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.domLoadedRD),
/* harmony export */   "interactiveStateD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.interactiveStateD),
/* harmony export */   "interactiveStateRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.interactiveStateRD),
/* harmony export */   "readyStateD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.readyStateD),
/* harmony export */   "readyStateRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.readyStateRD),
/* harmony export */   "windowD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowD),
/* harmony export */   "windowLoadedD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowLoadedD),
/* harmony export */   "windowLoadedRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowLoadedRD),
/* harmony export */   "windowRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowRD),
/* harmony export */   "windowResizeD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowResizeD),
/* harmony export */   "windowResizeRD": () => (/* reexport safe */ _event_js__WEBPACK_IMPORTED_MODULE_8__.windowResizeRD),
/* harmony export */   "injectScript": () => (/* reexport safe */ _dom_js__WEBPACK_IMPORTED_MODULE_9__.injectScript),
/* harmony export */   "makeCustomEvent": () => (/* reexport safe */ _dom_js__WEBPACK_IMPORTED_MODULE_9__.makeCustomEvent),
/* harmony export */   "pollingToGetNode": () => (/* reexport safe */ _dom_js__WEBPACK_IMPORTED_MODULE_9__.pollingToGetNode),
/* harmony export */   "globalVar": () => (/* reexport safe */ _app_js__WEBPACK_IMPORTED_MODULE_10__.globalVar),
/* harmony export */   "makeElementBasedMessageProxy": () => (/* reexport safe */ _app_js__WEBPACK_IMPORTED_MODULE_10__.makeElementBasedMessageProxy),
/* harmony export */   "makeEventHandler": () => (/* reexport safe */ _app_js__WEBPACK_IMPORTED_MODULE_10__.makeEventHandler),
/* harmony export */   "makeGeneralEventHandler": () => (/* reexport safe */ _app_js__WEBPACK_IMPORTED_MODULE_10__.makeGeneralEventHandler),
/* harmony export */   "makeScopeManager": () => (/* reexport safe */ _scope_js__WEBPACK_IMPORTED_MODULE_11__.makeScopeManager)
/* harmony export */ });
/* harmony import */ var _unique_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./unique.js */ "./src/es/external/unique.js");
/* harmony import */ var _class_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./class.js */ "./src/es/external/class.js");
/* harmony import */ var _path_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./path.js */ "./src/es/external/path.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./request.js */ "./src/es/external/request.js");
/* harmony import */ var _response_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./response.js */ "./src/es/external/response.js");
/* harmony import */ var _struct_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./struct.js */ "./src/es/external/struct.js");
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./debug.js */ "./src/es/external/debug.js");
/* harmony import */ var _environment_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./environment.js */ "./src/es/external/environment.js");
/* harmony import */ var _event_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./event.js */ "./src/es/external/event.js");
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./dom.js */ "./src/es/external/dom.js");
/* harmony import */ var _app_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./app.js */ "./src/es/external/app.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./scope.js */ "./src/es/external/scope.js");













/***/ }),

/***/ "./src/es/external/path.js":
/*!*********************************!*\
  !*** ./src/es/external/path.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeRepetition": () => (/* binding */ removeRepetition),
/* harmony export */   "removeRepetitionOf": () => (/* binding */ removeRepetitionOf),
/* harmony export */   "removeRepetitionExcept": () => (/* binding */ removeRepetitionExcept),
/* harmony export */   "removeRepetitionOfEmpty": () => (/* binding */ removeRepetitionOfEmpty),
/* harmony export */   "removeRepetitionOfSlash": () => (/* binding */ removeRepetitionOfSlash),
/* harmony export */   "neatenPathname": () => (/* binding */ neatenPathname),
/* harmony export */   "pathnameToArray": () => (/* binding */ pathnameToArray),
/* harmony export */   "pathnameToString": () => (/* binding */ pathnameToString),
/* harmony export */   "isPathnameStrictEqual": () => (/* binding */ isPathnameStrictEqual),
/* harmony export */   "isPathnameLooseEqual": () => (/* binding */ isPathnameLooseEqual),
/* harmony export */   "isPathnameEqual": () => (/* binding */ isPathnameEqual),
/* harmony export */   "neatenSearch": () => (/* binding */ neatenSearch),
/* harmony export */   "neatenQueryStr": () => (/* binding */ neatenQueryStr),
/* harmony export */   "queryStrToQueryObj": () => (/* binding */ queryStrToQueryObj),
/* harmony export */   "queryObjToQueryStr": () => (/* binding */ queryObjToQueryStr),
/* harmony export */   "searchToQueryStr": () => (/* binding */ searchToQueryStr),
/* harmony export */   "searchToQueryObj": () => (/* binding */ searchToQueryObj),
/* harmony export */   "queryStrToSearch": () => (/* binding */ queryStrToSearch),
/* harmony export */   "queryObjToSearch": () => (/* binding */ queryObjToSearch),
/* harmony export */   "toSearch": () => (/* binding */ toSearch),
/* harmony export */   "toQueryStr": () => (/* binding */ toQueryStr),
/* harmony export */   "toQueryObj": () => (/* binding */ toQueryObj)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/array.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/string.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/hybrid.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");

 // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Location
// @see https://npm.taobao.org/mirrors/node/latest/docs/api/url.html
// @see https://github.com/medialize/URI.js
// removeRepetition :: [a] -> [a]

const removeRepetition = (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.reject)((item, index, arr) => {
  return arr[index - 1] !== undefined ? item === arr[index - 1] : false;
}); // removeRepetitionOf :: [a] -> ([a] -> [a])

const removeRepetitionOf = ofList => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.reject)((item, index, arr) => {
  return arr[index - 1] !== undefined && ofList.includes(item) ? item === arr[index - 1] : false;
}); // removeRepetitionExcept :: [a] -> ([a] -> [a])

const removeRepetitionExcept = exceptList => (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.reject)((item, index, arr) => {
  return arr[index - 1] !== undefined && !exceptList.includes(item) ? item === arr[index - 1] : false;
}); // removeRepetitionOfEmpty :: [a] -> ([a] -> [a])

const removeRepetitionOfEmpty = removeRepetitionOf(['']);
const removeRepetitionOfSlash = removeRepetitionOf(['/']);
/**
 * - remove repetition of slash & empty char
 * - add '' or '/' as prefix of pathname
 */

const neatenPathname = pathname => {
  // ['path', 'to', 'page'] -> join('/') -> 'path/to/page'
  //   -> expected to be: '/path/to/page', unshift('') solve the problem
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(pathname)) {
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(removeRepetitionOfEmpty, (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.unshift)(''))(pathname);
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(pathname)) {
    return (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)('/'), removeRepetitionOfEmpty, (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.unshift)(''), (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.split)('/'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)(''), removeRepetitionOfSlash, _internal_js__WEBPACK_IMPORTED_MODULE_0__.toArray)(pathname);
  }
};
const pathnameToArray = pathname => {
  const neatedPathname = neatenPathname(pathname);

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(neatedPathname)) {
    return neatedPathname;
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(neatedPathname)) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.split)('/', neatedPathname);
  }
};
const pathnameToString = pathname => {
  const neatedPathname = neatenPathname(pathname);

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(neatedPathname)) {
    return neatedPathname;
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(neatedPathname)) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)('/', neatedPathname);
  }
}; // 判断两个 pathname 是否相等，有两种模式
//  -> 严格模式：字符串形式的 pathname 必须完全相同
//    -> '/app/page' equals '/app/page'
//    -> '/app/page' not equals '/app/page/'
//  -> 宽松模式：模糊处理路径名最后的 '/'
//    -> '/app/page' equals '/app/page/'

const isPathnameStrictEqual = (pathname1, pathname2) => pathnameToString(pathname1) === pathnameToString(pathname2);
const isPathnameLooseEqual = (pathname1, pathname2) => {
  const preCook = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)('/'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.filter)(_internal_js__WEBPACK_IMPORTED_MODULE_4__.isTruthy), pathnameToArray);
  return preCook(pathname1) === preCook(pathname2);
};
const isPathnameEqual = (mode, pathnames) => {
  // @accept { mode, pathnames }
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_5__.allPass)([_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject, (0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty)('pathnames'), (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray, (0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.prop)('pathnames'))], mode)) {
    pathnames = mode.pathnames;
    mode = mode.mode || 'strict';
    return isPathnameEqual(mode, pathnames);
  }

  mode = mode || 'strict';
  if (mode === 'strict') return isPathnameStrictEqual(...pathnames);
  if (mode === 'loose') return isPathnameLooseEqual(...pathnames);
}; // console.log('\n[path.js] pathnameToString:')
// console.log(pathnameToString(['app', 'page1']))
// console.log(pathnameToString(['', 'app', 'page1', '']))
// console.log(pathnameToString(['', 'app', 'page1', '', '']))
// console.log(pathnameToString(['', '', 'app', 'page1', '', '']))
// console.log(pathnameToString('/app/page1'))
// console.log(pathnameToString('//app/page1'))
// console.log(pathnameToString('//app//page1'))
// console.log(pathnameToString('//app//page1/'))
// console.log(pathnameToString('//app//page1//'))
// console.log('\n[path.js] pathnameToArray:')
// console.log(pathnameToArray(['app', 'page1']))
// console.log(pathnameToArray(['', 'app', 'page1', '']))
// console.log(pathnameToArray(['', 'app', 'page1', '', '']))
// console.log(pathnameToArray(['', '', 'app', 'page1', '', '']))
// console.log(pathnameToArray('/app/page1'))
// console.log(pathnameToArray('//app/page1'))
// console.log(pathnameToArray('//app//page1'))
// console.log(pathnameToArray('//app//page1/'))
// console.log(pathnameToArray('//app//page1//'))
// console.log('\n[path.js] isPathnameStrictEqual:')
// console.log(isPathnameStrictEqual('//app//page1//', ['', 'app', 'page1']))
// console.log(isPathnameStrictEqual('//app//page1//', ['', 'app', 'page1', '']))
// console.log('\n[path.js] isPathnameLooseEqual:')
// console.log(isPathnameLooseEqual('//app//page1//', ['', 'app', 'page1']))
// console.log(isPathnameLooseEqual('//app//page1//', ['', 'app', 'page1', '']))

const neatenSearch = str => (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.isStartWith)('?', str) ? str : `?${str}`;
const neatenQueryStr = str => (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.isStartWith)('?', str) ? str.substring(1) : str;
const queryStrToQueryObj = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.reduce)((acc, cur) => {
  if (!cur) return acc;
  const [key, value] = cur.split('=');
  acc[key] = decodeURIComponent(value);
  return acc;
}, {}), (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.split)('&'), neatenQueryStr);
const queryObjToQueryStr = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)('&'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.map)((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.join)('=')), (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.map)(([k, v]) => [k, encodeURIComponent(v)]), _internal_js__WEBPACK_IMPORTED_MODULE_6__.entries);
const searchToQueryStr = neatenQueryStr;
const searchToQueryObj = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(queryStrToQueryObj, searchToQueryStr);
const queryStrToSearch = neatenSearch;
const queryObjToSearch = (0,_functional_js__WEBPACK_IMPORTED_MODULE_2__.compose)(queryStrToSearch, queryObjToQueryStr);
const toSearch = sth => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(sth)) return neatenSearch(sth);
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(sth)) return queryObjToSearch(sth);
};
const toQueryStr = sth => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(sth)) return neatenQueryStr(sth);
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(sth)) return queryObjToQueryStr(sth);
};
const toQueryObj = sth => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(sth)) return queryStrToQueryObj(sth); // NOTE: queryStrToQueryObj 自带 neatenQueryStr

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(sth)) return sth;
}; // console.log('\n[path.js] neatenSearch:')
// console.log(neatenSearch('a=1&b=2&c=3'))
// console.log(neatenSearch('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryStrToQueryObj:')
// console.log(queryStrToQueryObj('a=1&b=2&c=3'))
// console.log(queryStrToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryObjToQueryStr:')
// console.log(queryObjToQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] searchToQueryStr:')
// console.log(searchToQueryStr('?a=1&b=2&c=3'))
// console.log('\n[path.js] searchToQueryObj:')
// console.log(searchToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryStrToSearch:')
// console.log(queryStrToSearch('a=1&b=2&c=3'))
// console.log('\n[path.js] queryObjToSearch:')
// console.log(queryObjToSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toSearch:')
// console.log(toSearch('a=1&b=2&c=3'))
// console.log(toSearch('?a=1&b=2&c=3'))
// console.log(toSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toQueryStr:')
// console.log(toQueryStr('a=1&b=2&c=3'))
// console.log(toQueryStr('?a=1&b=2&c=3'))
// console.log(toQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toQueryObj:')
// console.log(toQueryObj('a=1&b=2&c=3'))
// console.log(toQueryObj('?a=1&b=2&c=3'))
// console.log(toQueryObj({ a: '1', b: '2', c: '3' }))

/***/ }),

/***/ "./src/es/external/request.js":
/*!************************************!*\
  !*** ./src/es/external/request.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "axios": () => (/* reexport default export from named module */ axios__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   "biu": () => (/* binding */ biu),
/* harmony export */   "modifyBiuConfig": () => (/* binding */ modifyBiuConfig),
/* harmony export */   "asPostRequest": () => (/* binding */ asPostRequest),
/* harmony export */   "asGetRequest": () => (/* binding */ asGetRequest),
/* harmony export */   "withJSONContent": () => (/* binding */ withJSONContent),
/* harmony export */   "withCredentials": () => (/* binding */ withCredentials),
/* harmony export */   "withoutCredentials": () => (/* binding */ withoutCredentials),
/* harmony export */   "withDataExtracted": () => (/* binding */ withDataExtracted)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/combinators.js");
/* harmony import */ var _response_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./response.js */ "./src/es/external/response.js");
/* harmony import */ var _environment_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./environment.js */ "./src/es/external/environment.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");






/***************************************************************
 *                            biu
 ***************************************************************/

const _commonDefaultConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
}; // biu(config)
// biu(modifier, config)
// biu(config, modifier)
// NOTE: 在没有指定 responseModifier 的情况下，通过 biu 拿到的一定是格式良好的 response
// WARN: 即使是指定 responseModifier，也并不推荐 modifier 修改 response 的数据结构

const biu = (config, _) => {
  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(_)) {
    config = _(config || {});
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(config)) {
    config = config(_ || {});
  }

  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(config)) {
    throw TypeError('Config is expected to be an object, please check your config or config modifier whick should return an config object.');
  }

  config = { ..._commonDefaultConfig,
    ...config
  };
  return new Promise((resolve, reject) => {
    const _useAxios = () => {
      axios__WEBPACK_IMPORTED_MODULE_0__({ ...config
      }).then(response => {
        if (response.status !== 200) {
          reject(new Error(`${response.status}: ${response.statusText}`));
        }

        return response;
      }).then(resolve).catch(reject);
    };

    const _useWxRequest = () => {
      try {
        // @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
        _environment_js__WEBPACK_IMPORTED_MODULE_2__.wxmina.request({
          dataType: 'json',
          responseType: 'text',
          ...config,
          header: { ...(config.headers || {})
          },
          success: resolve,
          fail: reject
        });
      } catch (e) {
        reject(e);
      }
    };

    (0,_environment_js__WEBPACK_IMPORTED_MODULE_2__.adaptMultiPlatform)({
      webFn: _useAxios,
      nodeFn: _useAxios,
      wxminaFn: _useWxRequest
    });
  }).then(result => {
    if (!config.withDataExtracted) return result;
    if (!result.data) return (0,_response_js__WEBPACK_IMPORTED_MODULE_3__.makeErrorResponseF)(new Error('There is no "data" field in request result.'));
    const response = result.data;

    if ((0,_response_js__WEBPACK_IMPORTED_MODULE_3__.isSuccessResponse)(response)) {
      // TODO: 适配多接口返回值捆绑的情况（far away | nerver）
      const type = (0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.get)(config, 'data.payload.type');
      const actualData = (0,_internal_js__WEBPACK_IMPORTED_MODULE_4__.get)(response, `data.${type}`);

      if (type && actualData) {
        response.data = actualData;
      }
    }

    return response;
  }).then(response => {
    const responseModifier = config.responseModifier || _internal_js__WEBPACK_IMPORTED_MODULE_1__.asIs;
    return responseModifier(response);
  }).catch(_response_js__WEBPACK_IMPORTED_MODULE_3__.makeErrorResponseF);
};
const modifyBiuConfig = (0,_functional_js__WEBPACK_IMPORTED_MODULE_5__.flip)(_internal_js__WEBPACK_IMPORTED_MODULE_4__.hardDeepMerge); // or: obj => hardDeepMerge(_, obj)
// biu(equiped(asPostRequest)({ url: 'https://example.com' }))
// biu(equiped(asPostRequest), { url: 'https://example.com' })
// biu({ url: 'https://example.com' }, equiped(asPostRequest))

const asPostRequest = modifyBiuConfig({
  method: 'POST'
});
const asGetRequest = modifyBiuConfig({
  method: 'GET'
});
const withJSONContent = modifyBiuConfig({
  headers: {
    'Content-Type': 'application/json'
  }
});
const withCredentials = modifyBiuConfig({
  withCredentials: true
});
const withoutCredentials = modifyBiuConfig({
  withCredentials: false
}); // Mobius 的 API 规范中，success 响应的数据存在深层嵌套，如:
//  -> { status: 'success', data: { [REQUEST_TYPE]: actualData } }
// withDataExtracted 可以将冗余嵌套移除

const withDataExtracted = modifyBiuConfig({
  withDataExtracted: true
});

/***/ }),

/***/ "./src/es/external/response.js":
/*!*************************************!*\
  !*** ./src/es/external/response.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeBaseResponse": () => (/* binding */ makeBaseResponse),
/* harmony export */   "formatResponseMakerFlattenArgs": () => (/* binding */ formatResponseMakerFlattenArgs),
/* harmony export */   "makeSuccessResponse": () => (/* binding */ makeSuccessResponse),
/* harmony export */   "makeFailResponse": () => (/* binding */ makeFailResponse),
/* harmony export */   "makeErrorResponse": () => (/* binding */ makeErrorResponse),
/* harmony export */   "makeUnknownResponse": () => (/* binding */ makeUnknownResponse),
/* harmony export */   "makeSuccessResponseF": () => (/* binding */ makeSuccessResponseF),
/* harmony export */   "makeFailResponseF": () => (/* binding */ makeFailResponseF),
/* harmony export */   "makeErrorResponseF": () => (/* binding */ makeErrorResponseF),
/* harmony export */   "makeUnknownResponseF": () => (/* binding */ makeUnknownResponseF),
/* harmony export */   "isResponseCode": () => (/* binding */ isResponseCode),
/* harmony export */   "hasValidResponseCode": () => (/* binding */ hasValidResponseCode),
/* harmony export */   "isResponse": () => (/* binding */ isResponse),
/* harmony export */   "isSuccessResponse": () => (/* binding */ isSuccessResponse),
/* harmony export */   "isFailResponse": () => (/* binding */ isFailResponse),
/* harmony export */   "isErrorResponse": () => (/* binding */ isErrorResponse),
/* harmony export */   "isUnknowResponse": () => (/* binding */ isUnknowResponse),
/* harmony export */   "DEFAULT_SUCCESS_RESPONSE_CODE": () => (/* binding */ DEFAULT_SUCCESS_RESPONSE_CODE),
/* harmony export */   "DEFAULT_FAIL_RESPONSE_CODE": () => (/* binding */ DEFAULT_FAIL_RESPONSE_CODE),
/* harmony export */   "DEFAULT_ERROR_RESPONSE_CODE": () => (/* binding */ DEFAULT_ERROR_RESPONSE_CODE),
/* harmony export */   "DEFAULT_UNKNOWN_RESPONSE_CODE": () => (/* binding */ DEFAULT_UNKNOWN_RESPONSE_CODE),
/* harmony export */   "formatSuccessResponse": () => (/* binding */ formatSuccessResponse),
/* harmony export */   "formatFailResponse": () => (/* binding */ formatFailResponse),
/* harmony export */   "formatErrorResponse": () => (/* binding */ formatErrorResponse),
/* harmony export */   "formatUnknownResponse": () => (/* binding */ formatUnknownResponse),
/* harmony export */   "formatResponse": () => (/* binding */ formatResponse)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/object.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/hybrid.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");
/* eslint-disable camelcase */


const makeBaseResponse = ({
  code,
  code_message,
  status,
  status_message,
  data
}) => ({
  code: code,
  code_message: code_message,
  status: status,
  status_message: status_message || '',
  data: data || {}
});
const formatResponseMakerFlattenArgs = (...args) => {
  const objectArgs = args.reduce((res, arg) => {
    // isError 检测应该在 isString 之前，即对于 ErrorResponse，自定义的 status_message 优先级大于 error.message
    // 检测顺序： isResponse -> isResponseCode -> isObject
    if (isResponse(arg)) {
      res = { ...arg
      };
    } else if (isResponseCode(arg)) {
      res = { ...res,
        ...arg
      };
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isError)(arg)) {
      // 避免覆盖自定义 status_message
      res = { ...res,
        status_message: res.status_message || arg.message,
        data: {
          error: arg
        }
      };
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(arg)) {
      // 自定义 status_message 可以覆盖 error.message
      res = { ...res,
        status_message: arg
      };
    } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(arg)) {
      res.data = res.data || {};
      res = { ...res,
        data: { ...res.data,
          ...arg
        }
      };
    } else {
      res.data = res.data || {};
      res.data.response = res.data.response || [];
      res.data.response.push(arg);
    }

    return res;
  }, {});
  return objectArgs;
};
const makeSuccessResponse = ({
  code,
  code_message,
  status_message,
  data
}) => makeBaseResponse({
  code,
  code_message,
  status: 'success',
  status_message,
  data
});
const makeFailResponse = ({
  code,
  code_message,
  status_message,
  data
}) => makeBaseResponse({
  code,
  code_message,
  status: 'fail',
  status_message,
  data
});
const makeErrorResponse = ({
  code,
  code_message,
  status_message,
  data
}) => makeBaseResponse({
  code,
  code_message,
  status: 'error',
  status_message,
  data
});
const makeUnknownResponse = ({
  code,
  code_message,
  status_message,
  data
}) => {
  console.warn(`[MobiusUtils][data] makeUnknownResponse: unknown response detected, ${JSON.stringify({
    code,
    code_message,
    status_message,
    data
  })}`);
  return makeBaseResponse({
    code,
    code_message,
    status: 'unknown',
    status_message,
    data
  });
};
const makeSuccessResponseF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(makeSuccessResponse, formatResponseMakerFlattenArgs);
const makeFailResponseF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(makeFailResponse, formatResponseMakerFlattenArgs);
const makeErrorResponseF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(makeErrorResponse, formatResponseMakerFlattenArgs);
const makeUnknownResponseF = (0,_functional_js__WEBPACK_IMPORTED_MODULE_1__.compose)(makeUnknownResponse, formatResponseMakerFlattenArgs);
const propStatusEq = (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.propEq)('status');
const isResponseCode = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject, (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)('code'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)('code_message')]);
const hasValidResponseCode = isResponseCode;
const isResponse = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject, // hasOwnProperty('code'), hasOwnProperty('code_message'), // response code is not required
(0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)('status'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)('status_message'), (0,_internal_js__WEBPACK_IMPORTED_MODULE_2__.hasOwnProperty)('data')]);
const isSuccessResponse = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([isResponse, propStatusEq('success')]);
const isFailResponse = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([isResponse, propStatusEq('fail')]);
const isErrorResponse = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([isResponse, propStatusEq('error')]);
const isUnknowResponse = (0,_internal_js__WEBPACK_IMPORTED_MODULE_3__.allPass)([isResponse, propStatusEq('unknown')]);
const DEFAULT_SUCCESS_RESPONSE_CODE = {
  code: 0,
  code_message: 'SUCCESS'
};
const DEFAULT_FAIL_RESPONSE_CODE = {
  code: 2,
  code_message: 'FAIL'
};
const DEFAULT_ERROR_RESPONSE_CODE = {
  code: 1,
  code_message: 'UNDIFINED_RUNTIME_ERROR'
};
const DEFAULT_UNKNOWN_RESPONSE_CODE = {
  code: 3,
  code_message: 'UNKNOWN_RESPONSE'
};
const formatSuccessResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response,
      ...DEFAULT_SUCCESS_RESPONSE_CODE
    };
  }

  return response;
};
const formatFailResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response,
      ...DEFAULT_FAIL_RESPONSE_CODE
    };
  }

  return response;
};
const formatErrorResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response,
      ...DEFAULT_ERROR_RESPONSE_CODE
    };
  }

  return response;
};
const formatUnknownResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response,
      ...DEFAULT_UNKNOWN_RESPONSE_CODE
    };
  }

  return response;
};
const formatResponse = response => {
  if (isResponse(response)) {
    if (isSuccessResponse(response)) return formatSuccessResponse(response);
    if (isFailResponse(response)) return formatFailResponse(response);
    if (isErrorResponse(response)) return formatErrorResponse(response);
    if (isUnknowResponse(response)) return formatUnknownResponse(response);
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(response)) {
    return makeSuccessResponse({ ...DEFAULT_SUCCESS_RESPONSE_CODE,
      status_message: 'success response',
      data: { ...response
      }
    });
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(response)) {
    return makeFailResponse({ ...DEFAULT_FAIL_RESPONSE_CODE,
      status_message: response,
      data: {
        response: {}
      }
    });
  }

  if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isError)(response)) {
    return makeErrorResponse({ ...DEFAULT_ERROR_RESPONSE_CODE,
      status_message: response.message,
      data: {
        error: response
      }
    });
  }

  return makeUnknownResponse({ ...DEFAULT_UNKNOWN_RESPONSE_CODE,
    status_message: 'So sad, unknown response occurred ;(',
    data: {
      response: [response]
    }
  });
};

/***/ }),

/***/ "./src/es/external/scope.js":
/*!**********************************!*\
  !*** ./src/es/external/scope.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeScopeManager": () => (/* binding */ makeScopeManager)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/base.atom.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/helpers.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/mediators/replay.mediators.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atom.js */ "./src/es/atom/atoms/data.atom.js");


/**
 * Map{
 *   [Creator | CreatorInfo]: ScopeManager{
 *     [scope]: Instance,
 *     ...
 *   },
 *   ...
 * }
 */

const SCOPE_MANAGERS = new Map();
/**
 * @param { object | function } creator
 * @param { object? } options
 * @return ScopeManager
 */

const createScopeManager = (creator, options) => {
  if (!creator) throw new TypeError('"creator" is required!');
  const scopeMap = new Map();
  const promiseMap = new Map();
  return {
    getCreator: () => creator,
    getOptions: () => options,

    /**
     * @param { string } scope
     * @return { boolean } given scope is registered or not
     */
    isRegisteredScope: scope => !!scopeMap.get(scope),

    /**
     * @param { string } scope
     * @return { boolean }
     */
    releaseScope: scope => {
      return scopeMap.delete(scope);
    },
    releaseManager: () => {
      const {
        isStray,
        strayFlag
      } = options;

      if (isStray) {
        let res = false;
        SCOPE_MANAGERS.forEach((val, key) => {
          if (!res && key.flag === strayFlag) {
            res = SCOPE_MANAGERS.delete(key);
          }
        });
        return res;
      } else {
        return SCOPE_MANAGERS.delete(creator);
      }
    },

    /**
     * register an instance with given scope,
     * if there is none, create one,
     * if there is one, just return it.
     *
     * @param { string | object } scope
     * @param { { instance?, params? }? } options can be omitted when the type of scope is Object
     *
     * @accept ({ scope, instance?, params? })
     * @accept (scope, { instance?, params? })
     *
     * @return instance
     */
    registerScope: (scope, options) => {
      let _scope, _instance, _params; // accept ({ scope, instance?, params? })


      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(scope)) {
        _instance = scope.instance;
        _params = scope.params;
        _scope = scope.scope;
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(scope)) {
        // accept (scope, { instance?, params? })
        _scope = scope;

        if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
          _instance = options.instance;
          _params = options.params;
        } else {
          _params = options;
        }
      } else {
        throw new TypeError(`first argument of registerScope is expected to be type of "String" | "Object", but received "${typeof scope}".`);
      }

      if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(_scope)) throw new TypeError(`"scope" is required and is expected to be type of "String", but received "${typeof _scope}".`);
      if (!creator && !_instance) throw new TypeError('"creator" is not given, "instance" is required!');

      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(_params)) {
        _params = { ..._params,
          '@scopeName': _scope
        };
      }

      let instance = scopeMap.get(_scope); // If there is no instance registered, create one.
      // Then check if there is a promise has been made, if so, trigger it

      if (!instance) {
        instance = _instance || ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(creator) ? _params ? (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isArray)(_params) ? creator(..._params) : creator(_params) : creator({
          '@scopeName': _scope
        }) : creator);
        scopeMap.set(_scope, instance);
        const promise = promiseMap.get(_scope);

        if (promise) {
          if ((0,_atom_js__WEBPACK_IMPORTED_MODULE_1__.isAtom)(instance)) {
            (0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.binaryTweenPipeAtom)((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.replayWithLatest)(1, instance), promise);
          } else {
            (0,_atom_js__WEBPACK_IMPORTED_MODULE_2__.binaryTweenPipeAtom)((0,_atom_js__WEBPACK_IMPORTED_MODULE_3__.replayWithLatest)(1, _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.of(instance)), promise);
          }
        }
      }

      return instance;
    },

    /**
     * @param { string | object } scope
     * @param { { acceptPromise?: true }? }options
     *
     * @accept accept ({ scope, options | ...options })
     * @accept accept (scope, options? )
     *
     * @return instance | Atom of instance
     */
    getInstance: (scope, options = {}) => {
      // accept ({ scope, options | ...options })
      const _scope = (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(scope) ? scope.scope : scope;

      if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(_scope)) throw new TypeError(`"scope" is required and is expected to be type of "String", but received "${typeof _scope}".`);

      if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(scope)) {
        if (!scope.options) {
          options = Object.assign({}, scope);
          delete options.scope;
        } else {
          options = scope.options;
        }
      } else if ((0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isString)(scope)) {
        options = options || {};
      }

      if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
        throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
      }

      const {
        acceptPromise = true
      } = options;
      const instance = scopeMap.get(_scope);
      if (instance) return instance;
      if (!acceptPromise) return false;
      const promise = promiseMap.get(_scope);
      if (promise) return promise;

      const _promise = _atom_js__WEBPACK_IMPORTED_MODULE_4__.Data.empty();

      promiseMap.set(_scope, _promise);
      return _promise;
    },
    // ! use function declaration to keep "this" context

    /**
     * registerScope -> getInstance
     */
    scope: function (scope) {
      this.registerScope(scope);
      return this.getInstance(scope);
    }
  };
};
/**
 * @param creator Any
 * @param { { isStray?: false, strayFlag?: string } } options
 * @return ScopeManager
 */


const makeScopeManager = (creator, options = {}) => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(options)) {
    throw new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`);
  }

  const {
    isStray = false,
    strayFlag
  } = options;
  let manager;

  if (isStray) {
    manager = createScopeManager(creator, options);
    SCOPE_MANAGERS.set({
      creator,
      options: {
        isStray,
        strayFlag
      },
      flag: strayFlag
    }, manager);
  } else {
    manager = SCOPE_MANAGERS.get(creator);

    if (!manager) {
      manager = createScopeManager(creator, options);
      SCOPE_MANAGERS.set(creator, manager);
    }
  }

  return manager;
};

/***/ }),

/***/ "./src/es/external/struct.js":
/*!***********************************!*\
  !*** ./src/es/external/struct.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "struct": () => (/* binding */ struct),
/* harmony export */   "boolean": () => (/* binding */ boolean),
/* harmony export */   "string": () => (/* binding */ string),
/* harmony export */   "number": () => (/* binding */ number),
/* harmony export */   "array": () => (/* binding */ array),
/* harmony export */   "object": () => (/* binding */ object),
/* harmony export */   "is": () => (/* binding */ is)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional.js */ "./src/es/functional/helpers.js");


const struct = (0,_functional_js__WEBPACK_IMPORTED_MODULE_0__.curryS)((type, validatorMaker) => {
  return config => val => {
    const res = validatorMaker(config)(val);
    const {
      isValid
    } = res;
    const detail = res.detail || {};
    const {
      path,
      message
    } = detail;
    return [isValid, isValid ? undefined : message || 'Expected a value of type `' + type + `\`${path ? ' for `' + path + '`' : ''} but received "${JSON.stringify(val)}".`];
  };
});
const boolean = struct('Boolean', () => val => {
  return {
    isValid: (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isBoolean)(val)
  };
});
const string = struct('String', () => val => {
  return {
    isValid: (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isString)(val)
  };
});
const number = struct('Number', () => val => {
  return {
    isValid: (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber)(val)
  };
});
const array = struct('Array', config => val => {
  if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(val) || !config) {
    return {
      isValid: (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray)(val)
    };
  }

  return val.reduce((acc, item) => {
    const [isValid, message] = config(item);
    acc.isValid = !acc.isValid ? false : isValid;
    acc.detail.message = acc.detail.message || message;
    return acc;
  }, {
    isValid: true,
    detail: {
      message: undefined
    }
  });
});
const object = struct('Object', () => val => {
  return {
    isValid: (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject)(val)
  };
});
const is = (data, struct) => {
  console.log(struct(data));
  return struct(data)[0];
}; // console.info(is({}, object()))
// console.info(is(312312, string()))
// console.info(is([123], array(string())))

/***/ }),

/***/ "./src/es/external/unique.js":
/*!***********************************!*\
  !*** ./src/es/external/unique.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeUniqueString": () => (/* binding */ makeUniqueString)
/* harmony export */ });
const _fingerPrint = 'mobius'.split('');
/**
 * @param seed String, default to 'unique'
 * @return String
 */


const makeUniqueString = (seed = 'unique') => {
  _fingerPrint.unshift(_fingerPrint.pop());

  const fingerPrint = _fingerPrint.join('');

  return `${seed}--${+new Date()}-${fingerPrint}`;
};

/***/ }),

/***/ "./src/es/functional.js":
/*!******************************!*\
  !*** ./src/es/functional.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Either": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Either),
/* harmony export */   "IO": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.IO),
/* harmony export */   "Identity": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Identity),
/* harmony export */   "Just": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Just),
/* harmony export */   "Left": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Left),
/* harmony export */   "Maybe": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Maybe),
/* harmony export */   "Nothing": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Nothing),
/* harmony export */   "Right": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Right),
/* harmony export */   "Task": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Task),
/* harmony export */   "Z": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.Z),
/* harmony export */   "always": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.always),
/* harmony export */   "ap": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.ap),
/* harmony export */   "apply": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.apply),
/* harmony export */   "applyTo": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.applyTo),
/* harmony export */   "argPlaceholder": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.argPlaceholder),
/* harmony export */   "binary": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.binary),
/* harmony export */   "cata": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.cata),
/* harmony export */   "chain": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.chain),
/* harmony export */   "compose": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.compose),
/* harmony export */   "compose2": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.compose2),
/* harmony export */   "composeB": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.composeB),
/* harmony export */   "composeL": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.composeL),
/* harmony export */   "composeR": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.composeR),
/* harmony export */   "constant": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.constant),
/* harmony export */   "converge": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.converge),
/* harmony export */   "curry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.curry),
/* harmony export */   "curryN": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.curryN),
/* harmony export */   "curryS": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.curryS),
/* harmony export */   "duplication": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.duplication),
/* harmony export */   "either": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.either),
/* harmony export */   "eitherToMaybe": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.eitherToMaybe),
/* harmony export */   "flip": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.flip),
/* harmony export */   "identity": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.identity),
/* harmony export */   "internalCurry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.internalCurry),
/* harmony export */   "internalCurryN": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.internalCurryN),
/* harmony export */   "internalLooseCurry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurry),
/* harmony export */   "internalLooseCurryN": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurryN),
/* harmony export */   "invoker": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.invoker),
/* harmony export */   "io": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.io),
/* harmony export */   "isApplicative": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.isApplicative),
/* harmony export */   "isArgPlaceholder": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.isArgPlaceholder),
/* harmony export */   "isFunctor": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.isFunctor),
/* harmony export */   "isMonad": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.isMonad),
/* harmony export */   "isMonoid": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.isMonoid),
/* harmony export */   "just": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.just),
/* harmony export */   "kite": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.kite),
/* harmony export */   "left": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.left),
/* harmony export */   "lift": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.lift),
/* harmony export */   "liftA2": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.liftA2),
/* harmony export */   "liftA3": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.liftA3),
/* harmony export */   "liftA4": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.liftA4),
/* harmony export */   "liftA5": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.liftA5),
/* harmony export */   "liftN": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.liftN),
/* harmony export */   "looseBinary": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseBinary),
/* harmony export */   "looseCurry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseCurry),
/* harmony export */   "looseCurryN": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN),
/* harmony export */   "looseCurryS": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryS),
/* harmony export */   "looseInvoker": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseInvoker),
/* harmony export */   "looseNAry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseNAry),
/* harmony export */   "looseUnary": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.looseUnary),
/* harmony export */   "maybe": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.maybe),
/* harmony export */   "maybeToEither": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.maybeToEither),
/* harmony export */   "memorize": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.memorize),
/* harmony export */   "nAry": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.nAry),
/* harmony export */   "nothing": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.nothing),
/* harmony export */   "of": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.of),
/* harmony export */   "omega": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.omega),
/* harmony export */   "orElse": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.orElse),
/* harmony export */   "orJust": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.orJust),
/* harmony export */   "perform": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.perform),
/* harmony export */   "performUnsafeIO": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.performUnsafeIO),
/* harmony export */   "pipe": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.pipe),
/* harmony export */   "pipeL": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.pipeL),
/* harmony export */   "pipeR": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.pipeR),
/* harmony export */   "psi": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.psi),
/* harmony export */   "right": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.right),
/* harmony export */   "run": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.run),
/* harmony export */   "safe": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.safe),
/* harmony export */   "substitution": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.substitution),
/* harmony export */   "substitution2": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.substitution2),
/* harmony export */   "tap": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.tap),
/* harmony export */   "thrush": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.thrush),
/* harmony export */   "unary": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.unary),
/* harmony export */   "vireo": () => (/* reexport safe */ _functional_index_js__WEBPACK_IMPORTED_MODULE_0__.vireo)
/* harmony export */ });
/* harmony import */ var _functional_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functional/index.js */ "./src/es/functional/index.js");


/***/ }),

/***/ "./src/es/functional/_private.js":
/*!***************************************!*\
  !*** ./src/es/functional/_private.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "inspect": () => (/* binding */ inspect)
/* harmony export */ });
const inspect = x => {
  if (x && typeof x.inspect === 'function') {
    return x.inspect();
  }

  function inspectFn(f) {
    return f.name ? f.name : f.toString();
  }

  function inspectTerm(t) {
    switch (typeof t) {
      case 'string':
        return `'${t}'`;

      case 'object':
        {
          const ts = Object.keys(t).map(k => [k, inspect(t[k])]);
          return `{${ts.map(kv => kv.join(': ')).join(', ')}}`;
        }

      default:
        return String(t);
    }
  }

  function inspectArgs(args) {
    return Array.isArray(args) ? `[${args.map(inspect).join(', ')}]` : inspectTerm(args);
  }

  return typeof x === 'function' ? inspectFn(x) : inspectArgs(x);
};

/***/ }),

/***/ "./src/es/functional/combinators.js":
/*!******************************************!*\
  !*** ./src/es/functional/combinators.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "omega": () => (/* binding */ omega),
/* harmony export */   "constant": () => (/* binding */ constant),
/* harmony export */   "always": () => (/* binding */ always),
/* harmony export */   "kite": () => (/* binding */ kite),
/* harmony export */   "flip": () => (/* binding */ flip),
/* harmony export */   "apply": () => (/* binding */ apply),
/* harmony export */   "applyTo": () => (/* binding */ applyTo),
/* harmony export */   "thrush": () => (/* binding */ thrush),
/* harmony export */   "vireo": () => (/* binding */ vireo),
/* harmony export */   "duplication": () => (/* binding */ duplication),
/* harmony export */   "substitution": () => (/* binding */ substitution),
/* harmony export */   "substitution2": () => (/* binding */ substitution2),
/* harmony export */   "converge": () => (/* binding */ converge),
/* harmony export */   "compose2": () => (/* binding */ compose2),
/* harmony export */   "psi": () => (/* binding */ psi),
/* harmony export */   "composeB": () => (/* binding */ composeB),
/* harmony export */   "Z": () => (/* binding */ Z)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");
 // @ref: https://www.youtube.com/watch?v=3VQ382QG-y4
// A combinator is a function with no free variables.
//   -> 函数体中所有的变量都来自于参数
//   -> isCombinator: x => x, x => y => x
//   -> isNotCombinator: x => y, x => x * y
// @ref: https://gist.github.com/Avaq/1f0636ec5c8d6aed2e45
// @ref: https://crocks.dev/docs/functions/combinators.html
// I
// @Haskell: id
// @use: identity
// identity :: a -> a

const identity = x => x; // O, omega
// @use: self-application
// O :: f -> f

const omega = f => f(f); // K, Kestrel
// @Haskell: const
// @use: true, first, const
// constant :: a -> b -> a

const constant = x => () => x;
const always = constant; // KI, Kite = KI = CK
// @Haskell: const id
// derived from: constant(identity)
// @use: false, second
// kite :: a -> b -> b

const kite = a => b => b; // C, Cardinal
// @Haskell: flip
// @use: reverse arguments
// flip :: (a -> b -> c) -> b -> a -> c

const flip = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (f, x, y) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(y)(x)); // apply :: (a -> b) -> a -> b

const apply = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (f, x) => f(x)); // T, Thrush = CI
// @Haskell: flip id
// @use: hold an argument
// thrush :: a -> (a -> b) -> b

const applyTo = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (x, f) => f(x));
const thrush = applyTo; // V, Vireo = BCT
// @Haskell: flip . flip id
// @use: hold a pair of args
// vireo :: a -> b -> (a -> b -> c) -> c

const vireo = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (x, y, f) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(x)(y)); // W, join
// duplication :: (a -> a -> b) -> a -> b

const duplication = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (f, x) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(x)(x)); // substitution :: (a -> b -> c) -> (a - b) -> a -> c

const substitution = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (f, g, x) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(x)(g(x))); // sustitution2 :: (a -> b -> c) -> (b -> a) -> b -> c

const substitution2 = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (f, g, x) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(g(x))(x)); // converge :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d

const converge = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(4, (f, g, h, x) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(g(x))(h(x))); // compose2 ::  (c -> d -> e) -> (a -> c) -> (b -> d) -> a -> b -> e

const compose2 = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(5, (f, g, h, x, y) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(g(x))(h(y))); // on
// psi :: (b → b → c) → (a → b) → a → a → c

const psi = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(4, (f, g, x, y) => (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)(f)(g(x))(g(y))); // B, Bluebird
// @Haskell: (.)
// @use: composition
// composeB :: (b -> c) -> (a -> b) -> a -> c

const composeB = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (f, g, x) => f(g(x))); // Y :: (a -> a) -> a
// export const Y = fixPoint = ...
// ! Can not build in JavaScript
// Z
// Y Combinator's variation in JavaScript

const Z = g => (f => g((...args) => f(f)(...args)))(f => g((...args) => f(f)(...args))); // const f = g => n => n === 0 ? 1 : n * g(n - 1)
// console.log(Z(f)(5))

/***/ }),

/***/ "./src/es/functional/either.monad.js":
/*!*******************************************!*\
  !*** ./src/es/functional/either.monad.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Either": () => (/* binding */ Either),
/* harmony export */   "Left": () => (/* binding */ Left),
/* harmony export */   "Right": () => (/* binding */ Right),
/* harmony export */   "left": () => (/* binding */ left),
/* harmony export */   "right": () => (/* binding */ right),
/* harmony export */   "either": () => (/* binding */ either)
/* harmony export */ });
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_private.js */ "./src/es/functional/_private.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _combinators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combinators.js */ "./src/es/functional/combinators.js");


 // @ref: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/

class Either {
  constructor(x) {
    this._value = x;
  }

  get value() {
    return this._value;
  }

  static of(x) {
    return new Right(x);
  }

  static right(x) {
    return new Right(x);
  }

  static left(x) {
    return new Left(x);
  }

}
class Left extends Either {
  get isLeft() {
    return true;
  }

  get isRight() {
    return false;
  }

  static of(x) {
    throw new Error('`of` called on class Left (value) instead of Either (type)');
  }

  inspect() {
    return `Left(${(0,_private_js__WEBPACK_IMPORTED_MODULE_0__.inspect)(this._value)})`;
  }

  map() {
    return this;
  }

  join() {
    return this;
  }

  chain() {
    return this;
  }

  ap() {
    return this;
  }

  cata({
    Left,
    Right
  }) {
    return Left(this._value);
  } // ----- Traversable (Either a)


  sequence(of) {
    return of(this);
  }

  traverse(of, fn) {
    return of(this);
  }

}
class Right extends Either {
  get isLeft() {
    return false;
  }

  get isRight() {
    return true;
  }

  static of(x) {
    throw new Error('`of` called on class Right (value) instead of Either (type)');
  }

  inspect() {
    return `Right(${(0,_private_js__WEBPACK_IMPORTED_MODULE_0__.inspect)(this._value)})`;
  }

  map(fn) {
    return Either.of(fn(this._value));
  }

  join() {
    return this._value;
  }

  chain(fn) {
    return fn(this._value);
  }

  ap(mfn) {
    return this.map(mfn._value);
  }

  cata({
    Left,
    Right
  }) {
    return Right(this._value);
  } // ----- Traversable (Either a)


  sequence(of) {
    return this.traverse(of, _combinators_js__WEBPACK_IMPORTED_MODULE_1__.identity);
  }

  traverse(of, fn) {
    fn(this._value).map(Either.of);
  }

} // left :: a -> Either a b

const left = a => new Left(a); // right :: b -> Either a b

const right = b => new Right(b); // either :: (a -> c) -> (b -> c) -> Either a b -> c

const either = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_2__.curry)((f, g, e) => {
  if (e.isLeft) {
    return f(e.value);
  }

  return g(e.value);
});

/***/ }),

/***/ "./src/es/functional/helpers.js":
/*!**************************************!*\
  !*** ./src/es/functional/helpers.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "argPlaceholder": () => (/* binding */ argPlaceholder),
/* harmony export */   "isArgPlaceholder": () => (/* binding */ isArgPlaceholder),
/* harmony export */   "looseCurryS": () => (/* binding */ looseCurryS),
/* harmony export */   "curryS": () => (/* binding */ curryS),
/* harmony export */   "internalLooseCurry": () => (/* binding */ internalLooseCurry),
/* harmony export */   "looseCurry": () => (/* binding */ looseCurry),
/* harmony export */   "internalCurry": () => (/* binding */ internalCurry),
/* harmony export */   "curry": () => (/* binding */ curry),
/* harmony export */   "internalCurryN": () => (/* binding */ internalCurryN),
/* harmony export */   "curryN": () => (/* binding */ curryN),
/* harmony export */   "internalLooseCurryN": () => (/* binding */ internalLooseCurryN),
/* harmony export */   "looseCurryN": () => (/* binding */ looseCurryN),
/* harmony export */   "composeL": () => (/* binding */ composeL),
/* harmony export */   "composeR": () => (/* binding */ composeR),
/* harmony export */   "pipeL": () => (/* binding */ pipeL),
/* harmony export */   "pipeR": () => (/* binding */ pipeR),
/* harmony export */   "compose": () => (/* binding */ compose),
/* harmony export */   "pipe": () => (/* binding */ pipe),
/* harmony export */   "memorize": () => (/* binding */ memorize),
/* harmony export */   "invoker": () => (/* binding */ invoker),
/* harmony export */   "looseInvoker": () => (/* binding */ looseInvoker),
/* harmony export */   "nAry": () => (/* binding */ nAry),
/* harmony export */   "looseNAry": () => (/* binding */ looseNAry),
/* harmony export */   "binary": () => (/* binding */ binary),
/* harmony export */   "looseBinary": () => (/* binding */ looseBinary),
/* harmony export */   "unary": () => (/* binding */ unary),
/* harmony export */   "looseUnary": () => (/* binding */ looseUnary),
/* harmony export */   "tap": () => (/* binding */ tap)
/* harmony export */ });
/* harmony import */ var _internal_base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/base.js */ "./src/es/internal/base.js");
// use '../internal/base.js' instead of '../internal.js' to avoid ↓
//   - ReferenceError: Cannot access '***' before initialization
//   - because some of internal modules import the "../functional.js"
 // NOTE: 重复实现了 boolean.js 中的 complement 以避免循环引用

const _complement = fn => compose(x => !x, fn);

const argPlaceholder = {
  // compatible with ramda.js
  '@@functional/placeholder': true,
  isArgPlaceholder: true
};
const isArgPlaceholder = placeholder => (0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(placeholder) && Object.prototype.hasOwnProperty.call(placeholder, 'isArgPlaceholder') && placeholder.isArgPlaceholder; // loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N

const looseCurryS = (fn, ...args) => {
  if (args.length >= fn.length) {
    return fn(...args);
  } else {
    return (...args2) => looseCurryS(fn, ...args, ...args2);
  }
};
const curryS = (fn, ...args) => {
  const targetNum = fn.length;

  if (args.length >= targetNum) {
    return fn(...args.slice(0, targetNum));
  } else {
    return (...args2) => curryS(fn, ...args, ...args2);
  }
}; // loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N

const internalLooseCurry = (fn, filled, ...args) => {
  let innerArgs = filled || [];
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? args.length > 0 ? args.shift() : innerArg : innerArg);
  innerArgs = innerArgs.concat(args);
  const targetNum = fn.length;
  const validArgs = innerArgs.slice(0, targetNum);
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length;

  if (validLen >= targetNum) {
    return fn(...innerArgs);
  } else {
    return (...extraArgs) => internalLooseCurry(fn, innerArgs, ...extraArgs);
  }
};
const looseCurry = (fn, ...args) => internalLooseCurry(fn, [], ...args);
const internalCurry = (fn, filled, ...args) => {
  let innerArgs = filled || [];
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? args.length > 0 ? args.shift() : innerArg : innerArg);
  innerArgs = innerArgs.concat(args);
  const targetNum = fn.length;
  const validArgs = innerArgs.slice(0, targetNum);
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length;

  if (validLen >= targetNum) {
    return fn(...validArgs);
  } else {
    return (...extraArgs) => internalCurry(fn, validArgs, ...extraArgs);
  }
};
const curry = (fn, ...args) => internalCurry(fn, [], ...args); // loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N

const internalCurryN = (n, fn, filled, ...args) => {
  let innerArgs = filled || [];
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? args.length > 0 ? args.shift() : innerArg : innerArg);
  innerArgs = innerArgs.concat(args);
  const validArgs = innerArgs.slice(0, n);
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length;

  if (validLen >= n) {
    return fn(...validArgs);
  } else {
    return (...args2) => internalCurryN(n, fn, validArgs, ...args2);
  }
};
const curryN = (n, fn, ...args) => internalCurryN(n, fn, [], ...args); // export const curry1 = (fn, ...args) => internalCurryN(1, fn, [], ...args) // just for consistency
// export const curry2 = (fn, ...args) => internalCurryN(2, fn, [], ...args)
// ...

const internalLooseCurryN = (n, fn, filled, ...args) => {
  let innerArgs = filled || [];
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? args.length > 0 ? args.shift() : innerArg : innerArg);
  innerArgs = innerArgs.concat(args);
  const validArgsLen = innerArgs.slice(0, n).filter(_complement(isArgPlaceholder)).length;

  if (validArgsLen >= n) {
    return fn(...innerArgs);
  } else {
    return (...extraArgs) => internalLooseCurryN(n, fn, innerArgs, ...extraArgs);
  }
};
/**
 * @return { function | any }
 */

const looseCurryN = (n, fn, ...args) => internalLooseCurryN(n, fn, [], ...args); // NOTE: 另外一种 compose 实现
// @see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
// const compose = (...args) => value => args.reduceRight((acc, fn) => fn(acc), value)
// 本质是一个闭包，直觉上不喜欢（虽然能够带来一些调试上的好处）
//   -> @see: https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
// 下面这种更符合函数式思维，实现上更接近数学定义

const composeL = (...fns) => fns.reduce((g, f) => (...args) => f(g(...args)), fns.shift() || _internal_base_js__WEBPACK_IMPORTED_MODULE_0__.asIs);
const composeR = (...fns) => composeL(...fns.reverse());
const pipeL = composeR;
const pipeR = composeL;
const compose = composeR;
const pipe = composeL;
const memorize = (fn, hasher) => {
  const cache = {};

  hasher = hasher || ((...args) => JSON.stringify(args));

  return (...args) => {
    const hash = hasher(args);

    if (!cache[hash]) {
      cache[hash] = fn.apply(undefined, args);
    }

    return cache[hash];
  };
};

const invokerFactory = curryFn => (n, key) => curryFn(n, (...args) => {
  // curry function controlls how many args will be passed in
  const target = args[args.length - 1];
  if (!target[key]) throw Error(`Can not find "${key}" method in target.'`);
  if (!(0,_internal_base_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target[key])) throw Error(`"${key}" property in target is not a function.`);
  return target[key](...args.slice(0, args.length - 1));
});

const invoker = invokerFactory(curryN);
const looseInvoker = invokerFactory(looseCurryN);
const nAry = curry((n, fn) => curryN(n, fn));
const looseNAry = curry((n, fn) => looseCurryN(n, fn));
const binary = fn => curry((x, y) => fn(x, y)); // nAry(2, fn)

const looseBinary = fn => looseCurry((x, y, ...args) => fn(x, y, ...args)); // looseNAry(2, fn)

const unary = fn => x => fn(x);
const looseUnary = fn => (x, ...args) => fn(x, ...args);
const tap = fn => (...args) => {
  fn(...args);
  return args[0];
};
/*
                  arguments num controller & curry test
*/
// const add = (x, y, z) => { console.log(x, y, z) }
// unary(add)(1, 2, 3) // 1, undefined, undefined
// binary(add)(1, 2, 3) // 1, 2, undefined
// nAry(1, add)(1, 2, 3) // 1, undefined, undefined
// nAry(2, add)(1, 2, 3) // 1, 2, undefined
// nAry(3, add)(1, 2, 3) // 1, 2, 3
// looseUnary(add)(1, 2, 3) // 1, 2, 3
// looseBinary(add)(1, 2, 3) // 1, 2, 3
// looseNAry(1, add)(1, 2, 3) // 1, 2, 3
// looseNAry(2, add)(1, 2, 3) // 1, 2, 3
// looseNAry(3, add)(1, 2, 3) // 1, 2, 3
// const gg = (a, b) => {
//   console.warn(a, b)
// }
// const ff = (a, b) => {
//   curry(gg)(a)
// }
// ff(1)

/***/ }),

/***/ "./src/es/functional/identity.monad.js":
/*!*********************************************!*\
  !*** ./src/es/functional/identity.monad.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Identity": () => (/* binding */ Identity)
/* harmony export */ });
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_private.js */ "./src/es/functional/_private.js");
/* harmony import */ var _combinators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combinators.js */ "./src/es/functional/combinators.js");


class Identity {
  constructor(x) {
    this._value = x;
  }

  of(x) {
    return new Identity(x);
  }

  get value() {
    return this._value;
  }

  get isIdentity() {
    return true;
  }

  inspect() {
    return `Identity(${(0,_private_js__WEBPACK_IMPORTED_MODULE_0__.inspect)(this._value)})`;
  }

  map(fn) {
    return Identity.of(fn(this._value));
  }

  join() {
    return this._value;
  }

  chain(fn) {
    return fn(this._value);
  } // ----- Traversable Identity


  sequence(of) {
    return this.traverse(of, _combinators_js__WEBPACK_IMPORTED_MODULE_1__.identity);
  }

  traverse(of, fn) {
    return fn(this._value).map(Identity.of);
  }

}

/***/ }),

/***/ "./src/es/functional/index.js":
/*!************************************!*\
  !*** ./src/es/functional/index.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "argPlaceholder": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.argPlaceholder),
/* harmony export */   "binary": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.binary),
/* harmony export */   "compose": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.compose),
/* harmony export */   "composeL": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.composeL),
/* harmony export */   "composeR": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.composeR),
/* harmony export */   "curry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry),
/* harmony export */   "curryN": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN),
/* harmony export */   "curryS": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryS),
/* harmony export */   "internalCurry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.internalCurry),
/* harmony export */   "internalCurryN": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.internalCurryN),
/* harmony export */   "internalLooseCurry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurry),
/* harmony export */   "internalLooseCurryN": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurryN),
/* harmony export */   "invoker": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker),
/* harmony export */   "isArgPlaceholder": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isArgPlaceholder),
/* harmony export */   "looseBinary": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseBinary),
/* harmony export */   "looseCurry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseCurry),
/* harmony export */   "looseCurryN": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN),
/* harmony export */   "looseCurryS": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryS),
/* harmony export */   "looseInvoker": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseInvoker),
/* harmony export */   "looseNAry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseNAry),
/* harmony export */   "looseUnary": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.looseUnary),
/* harmony export */   "memorize": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.memorize),
/* harmony export */   "nAry": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.nAry),
/* harmony export */   "pipe": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.pipe),
/* harmony export */   "pipeL": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.pipeL),
/* harmony export */   "pipeR": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.pipeR),
/* harmony export */   "tap": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.tap),
/* harmony export */   "unary": () => (/* reexport safe */ _helpers_js__WEBPACK_IMPORTED_MODULE_0__.unary),
/* harmony export */   "Z": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.Z),
/* harmony export */   "always": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.always),
/* harmony export */   "apply": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.apply),
/* harmony export */   "applyTo": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.applyTo),
/* harmony export */   "compose2": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.compose2),
/* harmony export */   "composeB": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.composeB),
/* harmony export */   "constant": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.constant),
/* harmony export */   "converge": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.converge),
/* harmony export */   "duplication": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.duplication),
/* harmony export */   "flip": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.flip),
/* harmony export */   "identity": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.identity),
/* harmony export */   "kite": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.kite),
/* harmony export */   "omega": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.omega),
/* harmony export */   "psi": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.psi),
/* harmony export */   "substitution": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.substitution),
/* harmony export */   "substitution2": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.substitution2),
/* harmony export */   "thrush": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.thrush),
/* harmony export */   "vireo": () => (/* reexport safe */ _combinators_js__WEBPACK_IMPORTED_MODULE_1__.vireo),
/* harmony export */   "Either": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Either),
/* harmony export */   "IO": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.IO),
/* harmony export */   "Identity": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Identity),
/* harmony export */   "Just": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Just),
/* harmony export */   "Left": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Left),
/* harmony export */   "Maybe": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Maybe),
/* harmony export */   "Nothing": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Nothing),
/* harmony export */   "Right": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Right),
/* harmony export */   "Task": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.Task),
/* harmony export */   "ap": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.ap),
/* harmony export */   "cata": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.cata),
/* harmony export */   "chain": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.chain),
/* harmony export */   "either": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.either),
/* harmony export */   "eitherToMaybe": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.eitherToMaybe),
/* harmony export */   "io": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.io),
/* harmony export */   "isApplicative": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.isApplicative),
/* harmony export */   "isFunctor": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.isFunctor),
/* harmony export */   "isMonad": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.isMonad),
/* harmony export */   "isMonoid": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.isMonoid),
/* harmony export */   "just": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.just),
/* harmony export */   "left": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.left),
/* harmony export */   "lift": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.lift),
/* harmony export */   "liftA2": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.liftA2),
/* harmony export */   "liftA3": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.liftA3),
/* harmony export */   "liftA4": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.liftA4),
/* harmony export */   "liftA5": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.liftA5),
/* harmony export */   "liftN": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.liftN),
/* harmony export */   "maybe": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.maybe),
/* harmony export */   "maybeToEither": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.maybeToEither),
/* harmony export */   "nothing": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.nothing),
/* harmony export */   "of": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.of),
/* harmony export */   "orElse": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.orElse),
/* harmony export */   "orJust": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.orJust),
/* harmony export */   "perform": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.perform),
/* harmony export */   "performUnsafeIO": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.performUnsafeIO),
/* harmony export */   "right": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.right),
/* harmony export */   "run": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.run),
/* harmony export */   "safe": () => (/* reexport safe */ _monads_js__WEBPACK_IMPORTED_MODULE_2__.safe)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _combinators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combinators.js */ "./src/es/functional/combinators.js");
/* harmony import */ var _monads_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./monads.js */ "./src/es/functional/monads.js");




/***/ }),

/***/ "./src/es/functional/io.monad.js":
/*!***************************************!*\
  !*** ./src/es/functional/io.monad.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IO": () => (/* binding */ IO),
/* harmony export */   "io": () => (/* binding */ io),
/* harmony export */   "run": () => (/* binding */ run),
/* harmony export */   "perform": () => (/* binding */ perform),
/* harmony export */   "performUnsafeIO": () => (/* binding */ performUnsafeIO)
/* harmony export */ });
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_private.js */ "./src/es/functional/_private.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _combinators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combinators.js */ "./src/es/functional/combinators.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");




class IO {
  constructor(fn) {
    if (!(0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(fn)) {
      throw new Error('IO requires a function.');
    }

    this._value = fn;
  }

  static of(fn) {
    return new IO(fn);
  }

  static const(x) {
    return new IO((0,_combinators_js__WEBPACK_IMPORTED_MODULE_1__.constant)(x));
  }

  get isIO() {
    return true;
  }

  inspect() {
    return `IO(${(0,_private_js__WEBPACK_IMPORTED_MODULE_2__.inspect)(this._value)})`;
  }

  run(...args) {
    return this._value(...args);
  }

  perform(...args) {
    return this._value(...args);
  }

  performUnsafeIO(...args) {
    return this._value(...args);
  }

  map(fn) {
    return new IO((0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.compose)(fn, this._value));
  }

  join() {
    return new IO(() => this.performUnsafeIO().performUnsafeIO());
  }

  chain(fn) {
    return this.map(fn).join(); // return new IO(() => fn(this.performUnsafeIO()).performUnsafeIO())
    // return fn(this.performUnsafeIO())
  } // !


  ap(mfn) {
    return this.chain(mfn._value);
  }

} // creator

const io = fn => new IO(fn); // helpers

const run = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (mIO, ...args) => mIO.run(...args));
const perform = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (mIO, ...args) => mIO.perform(...args));
const performUnsafeIO = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.looseCurryN)(1, (mIO, ...args) => mIO.performUnsafeIO(...args));

/***/ }),

/***/ "./src/es/functional/maybe.monad.js":
/*!******************************************!*\
  !*** ./src/es/functional/maybe.monad.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Maybe": () => (/* binding */ Maybe),
/* harmony export */   "Just": () => (/* binding */ Just),
/* harmony export */   "Nothing": () => (/* binding */ Nothing),
/* harmony export */   "just": () => (/* binding */ just),
/* harmony export */   "nothing": () => (/* binding */ nothing),
/* harmony export */   "safe": () => (/* binding */ safe),
/* harmony export */   "orElse": () => (/* binding */ orElse),
/* harmony export */   "orJust": () => (/* binding */ orJust),
/* harmony export */   "maybe": () => (/* binding */ maybe)
/* harmony export */ });
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_private.js */ "./src/es/functional/_private.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/base.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");



/**
 * Custom Maybe Monad used in FP in JS book written in ES6
 * Author: Luis Atencio
 * Customized by cigaret.
 * ref: https://stackoverflow.com/questions/50512370/folktale-fantasyland-maybe-not-working-as-expected/57552439#57552439
 * comment: Just\Some
 */

class Maybe {
  static of(a) {
    return Maybe.just(a);
  }

  static just(a) {
    return new Just(a);
  }

  static nothing() {
    return new Nothing();
  }

  static fromNullable(a) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isNull)(a) ? Maybe.nothing() : Maybe.just(a);
  }

  static fromUndefinedable(a) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(a) ? Maybe.nothing() : Maybe.just(a);
  }

  static fromFalsyable(a) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isFalsy)(a) ? Maybe.nothing() : Maybe.just(a);
  }

  static fromNilable(a) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_1__.isNil)(a) ? Maybe.nothing() : Maybe.just(a);
  }

  static fromEmptyable(a) {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(a) ? Maybe.nothing() : Maybe.just(a);
  }

  get isNothing() {
    return false;
  }

  get isJust() {
    return false;
  }

  get isMaybe() {
    return true;
  }

} // Derived class Just -> Presence of a value
// Or named `Some` in some other monad implements

class Just extends Maybe {
  constructor(value) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  get isJust() {
    return true;
  }

  get isNothing() {
    return false;
  }

  inspect() {
    return `Maybe.Just(${(0,_private_js__WEBPACK_IMPORTED_MODULE_2__.inspect)(this._value)})`;
  }

  map(fn) {
    return Maybe.just(fn(this._value));
  }

  join() {
    return this._value;
  }

  chain(fn) {
    return fn(this._value);
  }

  ap(mfn) {
    return this.map(mfn._value);
  }

  orJust() {
    return this;
  }

  orElse() {
    return this;
  }

  filter(fn) {
    return fn(this._value) ? this : Maybe.nothing();
  }

  cata({
    Just,
    Nothing
  }) {
    return Just(this._value);
  }

} // Derived class Empty -> Abscense of a value

class Nothing extends Maybe {
  get value() {
    throw new TypeError("Can't extract the value of a Nothing.");
  }

  get isNothing() {
    return true;
  }

  get isJust() {
    return false;
  }

  inspect() {
    return 'Maybe.Nothing';
  }

  map(fn) {
    return this;
  }

  join() {
    return this;
  }

  chain(fn) {
    return this;
  }

  ap(mfn) {
    return this;
  }

  orJust(dlft) {
    return Maybe.of(dlft);
  }

  orElse(maybeMonad) {
    return maybeMonad;
  }

  filter() {
    return this;
  }

  cata({
    Just,
    Nothing
  }) {
    return Nothing();
  }

} // just :: Maybe a -> Just a

const just = a => new Just(a); // nothing :: Maybe () -> Nothing

const nothing = () => new Nothing(); // @see: https://crocks.dev/docs/crocks/Maybe.html#safe
// safe :: (a -> Boolean) -> a -> Maybe a

const safe = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.curry)((pred, val) => pred(val) ? just(val) : nothing()); // helpers

const orElse = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.invoker)(2, 'orElse');
const orJust = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.invoker)(2, 'orJust'); // maybe :: b -> (a -> b) -> Maybe a -> b

const maybe = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.curry)((v, f, m) => {
  if (m.isNothing) {
    return v;
  }

  return f(m.value);
});

/***/ }),

/***/ "./src/es/functional/monads.js":
/*!*************************************!*\
  !*** ./src/es/functional/monads.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Identity": () => (/* reexport safe */ _identity_monad_js__WEBPACK_IMPORTED_MODULE_0__.Identity),
/* harmony export */   "Just": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.Just),
/* harmony export */   "Maybe": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.Maybe),
/* harmony export */   "Nothing": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.Nothing),
/* harmony export */   "just": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.just),
/* harmony export */   "maybe": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.maybe),
/* harmony export */   "nothing": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.nothing),
/* harmony export */   "orElse": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.orElse),
/* harmony export */   "orJust": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.orJust),
/* harmony export */   "safe": () => (/* reexport safe */ _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.safe),
/* harmony export */   "Either": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.Either),
/* harmony export */   "Left": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.Left),
/* harmony export */   "Right": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.Right),
/* harmony export */   "either": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.either),
/* harmony export */   "left": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.left),
/* harmony export */   "right": () => (/* reexport safe */ _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.right),
/* harmony export */   "IO": () => (/* reexport safe */ _io_monad_js__WEBPACK_IMPORTED_MODULE_3__.IO),
/* harmony export */   "io": () => (/* reexport safe */ _io_monad_js__WEBPACK_IMPORTED_MODULE_3__.io),
/* harmony export */   "perform": () => (/* reexport safe */ _io_monad_js__WEBPACK_IMPORTED_MODULE_3__.perform),
/* harmony export */   "performUnsafeIO": () => (/* reexport safe */ _io_monad_js__WEBPACK_IMPORTED_MODULE_3__.performUnsafeIO),
/* harmony export */   "run": () => (/* reexport safe */ _io_monad_js__WEBPACK_IMPORTED_MODULE_3__.run),
/* harmony export */   "Task": () => (/* reexport safe */ _task_monad_js__WEBPACK_IMPORTED_MODULE_4__.Task),
/* harmony export */   "isFunctor": () => (/* binding */ isFunctor),
/* harmony export */   "isMonad": () => (/* binding */ isMonad),
/* harmony export */   "isApplicative": () => (/* binding */ isApplicative),
/* harmony export */   "isMonoid": () => (/* binding */ isMonoid),
/* harmony export */   "of": () => (/* binding */ of),
/* harmony export */   "chain": () => (/* binding */ chain),
/* harmony export */   "ap": () => (/* binding */ ap),
/* harmony export */   "cata": () => (/* binding */ cata),
/* harmony export */   "liftN": () => (/* binding */ liftN),
/* harmony export */   "lift": () => (/* binding */ lift),
/* harmony export */   "liftA2": () => (/* binding */ liftA2),
/* harmony export */   "liftA3": () => (/* binding */ liftA3),
/* harmony export */   "liftA4": () => (/* binding */ liftA4),
/* harmony export */   "liftA5": () => (/* binding */ liftA5),
/* harmony export */   "maybeToEither": () => (/* binding */ maybeToEither),
/* harmony export */   "eitherToMaybe": () => (/* binding */ eitherToMaybe)
/* harmony export */ });
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../internal.js */ "./src/es/internal/array.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _either_monad_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./either.monad.js */ "./src/es/functional/either.monad.js");
/* harmony import */ var _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./maybe.monad.js */ "./src/es/functional/maybe.monad.js");
/* harmony import */ var _identity_monad_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity.monad.js */ "./src/es/functional/identity.monad.js");
/* harmony import */ var _io_monad_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./io.monad.js */ "./src/es/functional/io.monad.js");
/* harmony import */ var _task_monad_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./task.monad.js */ "./src/es/functional/task.monad.js");








 // predicate functions
// @see https://crocks.dev/docs/functions/predicate-functions.html

const isFunctor = m => {};
const isMonad = m => {};
const isApplicative = m => {};
const isMonoid = m => {}; // ……
// point-free functions

const of = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(2, 'of');
const chain = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(2, 'chain');
const ap = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(2, 'ap');
const cata = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.invoker)(1, 'cata'); // helper functions

const liftN = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.curry)((fnArgsLen, fn) => {
  const lifted = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.curryN)(fnArgsLen, fn);
  return (0,_helpers_js__WEBPACK_IMPORTED_MODULE_5__.curryN)(fnArgsLen, (...args) => {
    return (0,_internal_js__WEBPACK_IMPORTED_MODULE_6__.reduce)(ap, args[0].map(lifted), args.slice(1));
  });
});
const lift = fn => liftN(fn.length, fn); // export const liftA2 = curry((f, a, b) => b.ap(a.map(f)))
// export const liftA3 = curry((f, a, b, c) => c.ap(b.ap(a.map(f))))

const liftA2 = liftN(2);
const liftA3 = liftN(3);
const liftA4 = liftN(4);
const liftA5 = liftN(5); // ...
// transformation functions

const maybeToEither = (left, m) => {
  if (m.isNothing) {
    return _either_monad_js__WEBPACK_IMPORTED_MODULE_2__.Either.left(left);
  }

  return m.chain(_either_monad_js__WEBPACK_IMPORTED_MODULE_2__.Either.right);
};
const eitherToMaybe = e => {
  if (e.isLeft) {
    return _maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.Maybe.nothing();
  }

  return e.chain(_maybe_monad_js__WEBPACK_IMPORTED_MODULE_1__.Maybe.just);
};

/***/ }),

/***/ "./src/es/functional/task.monad.js":
/*!*****************************************!*\
  !*** ./src/es/functional/task.monad.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Task": () => (/* binding */ Task)
/* harmony export */ });
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_private.js */ "./src/es/functional/_private.js");
 // Task\Continuation\Lazy Promise\Future

class Task {
  // ({ reject, resolve }) => resolve(a)
  constructor(fn) {
    this._value = fn;
  }

  static of(x) {
    return new Task(({
      reject,
      resolve
    }) => resolve(x));
  }

  get isTask() {
    return true;
  }

  inspect() {
    return `Task(${(0,_private_js__WEBPACK_IMPORTED_MODULE_0__.inspect)(this._value)})`;
  }

  fork({
    reject,
    resolve
  }) {
    return this._value({
      reject,
      resolve
    });
  } // fn :: a -> a


  map(fn) {
    return new Task(({
      reject,
      resolve
    }) => this.fork({
      reject: reject,
      resolve: x => resolve(fn(x))
    }));
  }

  join() {
    return new Task(({
      reject,
      resolve
    }) => this.fork({
      reject: reject,
      resolve: mx => mx.fork({
        reject,
        resolve: x => resolve(x)
      })
    })); // return this.chain(identity)
  } // fn :: a -> ma


  chain(fn) {
    return new Task(({
      reject,
      resolve
    }) => this.fork({
      reject: reject,
      resolve: x => fn(x).fork({
        reject,
        resolve
      })
    }));
  } // mfn :: a -> a


  ap(mfn) {
    return this.map(mfn._value);
  }

}

/***/ }),

/***/ "./src/es/index.js":
/*!*************************!*\
  !*** ./src/es/index.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Either": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Either),
/* harmony export */   "IO": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.IO),
/* harmony export */   "Identity": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Identity),
/* harmony export */   "Just": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Just),
/* harmony export */   "Left": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Left),
/* harmony export */   "Maybe": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Maybe),
/* harmony export */   "Nothing": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Nothing),
/* harmony export */   "Right": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Right),
/* harmony export */   "Task": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Task),
/* harmony export */   "Z": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.Z),
/* harmony export */   "always": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.always),
/* harmony export */   "ap": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.ap),
/* harmony export */   "apply": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.apply),
/* harmony export */   "applyTo": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.applyTo),
/* harmony export */   "argPlaceholder": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.argPlaceholder),
/* harmony export */   "binary": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.binary),
/* harmony export */   "cata": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.cata),
/* harmony export */   "chain": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.chain),
/* harmony export */   "compose": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.compose),
/* harmony export */   "compose2": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.compose2),
/* harmony export */   "composeB": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.composeB),
/* harmony export */   "composeL": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.composeL),
/* harmony export */   "composeR": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.composeR),
/* harmony export */   "constant": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.constant),
/* harmony export */   "converge": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.converge),
/* harmony export */   "curry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.curry),
/* harmony export */   "curryN": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.curryN),
/* harmony export */   "curryS": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.curryS),
/* harmony export */   "duplication": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.duplication),
/* harmony export */   "either": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.either),
/* harmony export */   "eitherToMaybe": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.eitherToMaybe),
/* harmony export */   "flip": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.flip),
/* harmony export */   "identity": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.identity),
/* harmony export */   "internalCurry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.internalCurry),
/* harmony export */   "internalCurryN": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.internalCurryN),
/* harmony export */   "internalLooseCurry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurry),
/* harmony export */   "internalLooseCurryN": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.internalLooseCurryN),
/* harmony export */   "invoker": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.invoker),
/* harmony export */   "io": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.io),
/* harmony export */   "isApplicative": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.isApplicative),
/* harmony export */   "isArgPlaceholder": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.isArgPlaceholder),
/* harmony export */   "isFunctor": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.isFunctor),
/* harmony export */   "isMonad": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.isMonad),
/* harmony export */   "isMonoid": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.isMonoid),
/* harmony export */   "just": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.just),
/* harmony export */   "kite": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.kite),
/* harmony export */   "left": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.left),
/* harmony export */   "lift": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.lift),
/* harmony export */   "liftA2": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.liftA2),
/* harmony export */   "liftA3": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.liftA3),
/* harmony export */   "liftA4": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.liftA4),
/* harmony export */   "liftA5": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.liftA5),
/* harmony export */   "liftN": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.liftN),
/* harmony export */   "looseBinary": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseBinary),
/* harmony export */   "looseCurry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurry),
/* harmony export */   "looseCurryN": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryN),
/* harmony export */   "looseCurryS": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseCurryS),
/* harmony export */   "looseInvoker": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseInvoker),
/* harmony export */   "looseNAry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseNAry),
/* harmony export */   "looseUnary": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.looseUnary),
/* harmony export */   "maybe": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.maybe),
/* harmony export */   "maybeToEither": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.maybeToEither),
/* harmony export */   "memorize": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.memorize),
/* harmony export */   "nAry": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.nAry),
/* harmony export */   "nothing": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.nothing),
/* harmony export */   "of": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.of),
/* harmony export */   "omega": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.omega),
/* harmony export */   "orElse": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.orElse),
/* harmony export */   "orJust": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.orJust),
/* harmony export */   "perform": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.perform),
/* harmony export */   "performUnsafeIO": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.performUnsafeIO),
/* harmony export */   "pipe": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.pipe),
/* harmony export */   "pipeL": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.pipeL),
/* harmony export */   "pipeR": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.pipeR),
/* harmony export */   "psi": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.psi),
/* harmony export */   "right": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.right),
/* harmony export */   "run": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.run),
/* harmony export */   "safe": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.safe),
/* harmony export */   "substitution": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.substitution),
/* harmony export */   "substitution2": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.substitution2),
/* harmony export */   "tap": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.tap),
/* harmony export */   "thrush": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.thrush),
/* harmony export */   "unary": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.unary),
/* harmony export */   "vireo": () => (/* reexport safe */ _functional_js__WEBPACK_IMPORTED_MODULE_0__.vireo),
/* harmony export */   "allPass": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.allPass),
/* harmony export */   "and": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.and),
/* harmony export */   "anyPass": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.anyPass),
/* harmony export */   "asIs": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.asIs),
/* harmony export */   "asNull": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.asNull),
/* harmony export */   "asUndefined": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.asUndefined),
/* harmony export */   "assign": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.assign),
/* harmony export */   "assignTo": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.assignTo),
/* harmony export */   "between": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.between),
/* harmony export */   "complement": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.complement),
/* harmony export */   "concat": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.concat),
/* harmony export */   "debounce": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.debounce),
/* harmony export */   "deepCopy": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.deepCopy),
/* harmony export */   "deepCopyViaJSON": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.deepCopyViaJSON),
/* harmony export */   "defaultProps": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.defaultProps),
/* harmony export */   "emptifyObj": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.emptifyObj),
/* harmony export */   "entries": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.entries),
/* harmony export */   "equals": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.equals),
/* harmony export */   "every": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.every),
/* harmony export */   "filter": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.filter),
/* harmony export */   "filterFalsy": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.filterFalsy),
/* harmony export */   "filterTruthy": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.filterTruthy),
/* harmony export */   "flat": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.flat),
/* harmony export */   "forEach": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.forEach),
/* harmony export */   "get": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.get),
/* harmony export */   "getByPath": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.getByPath),
/* harmony export */   "hardDeepMerge": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.hardDeepMerge),
/* harmony export */   "hasOwnProperty": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.hasOwnProperty),
/* harmony export */   "humanize": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.humanize),
/* harmony export */   "ifElse": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.ifElse),
/* harmony export */   "iif": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.iif),
/* harmony export */   "iife": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.iife),
/* harmony export */   "includes": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.includes),
/* harmony export */   "indexOf": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.indexOf),
/* harmony export */   "intersection": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.intersection),
/* harmony export */   "isAllSpace": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isAllSpace),
/* harmony export */   "isArray": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isArray),
/* harmony export */   "isAsyncFn": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncFn),
/* harmony export */   "isAsyncGeneratorFunction": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isAsyncGeneratorFunction),
/* harmony export */   "isBoolean": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isBoolean),
/* harmony export */   "isDate": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isDate),
/* harmony export */   "isDefined": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isDefined),
/* harmony export */   "isDocument": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isDocument),
/* harmony export */   "isEmailAddress": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEmailAddress),
/* harmony export */   "isEmpty": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEmpty),
/* harmony export */   "isEmptyArr": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyArr),
/* harmony export */   "isEmptyObj": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyObj),
/* harmony export */   "isEmptyStr": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEmptyStr),
/* harmony export */   "isError": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isError),
/* harmony export */   "isEven": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEven),
/* harmony export */   "isEventTarget": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isEventTarget),
/* harmony export */   "isFalse": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isFalse),
/* harmony export */   "isFalsy": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isFalsy),
/* harmony export */   "isFunction": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isFunction),
/* harmony export */   "isGeneralObject": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isGeneralObject),
/* harmony export */   "isGeneratorFunction": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isGeneratorFunction),
/* harmony export */   "isIterable": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isIterable),
/* harmony export */   "isMap": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isMap),
/* harmony export */   "isNil": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isNil),
/* harmony export */   "isNotNil": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isNotNil),
/* harmony export */   "isNull": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isNull),
/* harmony export */   "isNumber": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isNumber),
/* harmony export */   "isObject": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isObject),
/* harmony export */   "isObservable": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isObservable),
/* harmony export */   "isOdd": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isOdd),
/* harmony export */   "isOutDated": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isOutDated),
/* harmony export */   "isPhoneNum": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isPhoneNum),
/* harmony export */   "isPromise": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isPromise),
/* harmony export */   "isQQId": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isQQId),
/* harmony export */   "isRegExp": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isRegExp),
/* harmony export */   "isSet": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isSet),
/* harmony export */   "isStartWith": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isStartWith),
/* harmony export */   "isString": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isString),
/* harmony export */   "isSymbol": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isSymbol),
/* harmony export */   "isTelNum": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isTelNum),
/* harmony export */   "isTrue": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isTrue),
/* harmony export */   "isTruthy": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isTruthy),
/* harmony export */   "isUndefined": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isUndefined),
/* harmony export */   "isWeakMap": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isWeakMap),
/* harmony export */   "isWeakSet": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isWeakSet),
/* harmony export */   "isWindow": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.isWindow),
/* harmony export */   "join": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.join),
/* harmony export */   "keys": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.keys),
/* harmony export */   "looseEquals": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.looseEquals),
/* harmony export */   "map": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.map),
/* harmony export */   "maxOf": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.maxOf),
/* harmony export */   "maxTo": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.maxTo),
/* harmony export */   "minOf": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.minOf),
/* harmony export */   "minTo": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.minTo),
/* harmony export */   "noop": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.noop),
/* harmony export */   "not": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.not),
/* harmony export */   "once": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.once),
/* harmony export */   "or": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.or),
/* harmony export */   "packing": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.packing),
/* harmony export */   "pop": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.pop),
/* harmony export */   "prop": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.prop),
/* harmony export */   "propEq": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.propEq),
/* harmony export */   "push": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.push),
/* harmony export */   "randomString": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.randomString),
/* harmony export */   "reduce": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.reduce),
/* harmony export */   "reject": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.reject),
/* harmony export */   "replace": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.replace),
/* harmony export */   "shift": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.shift),
/* harmony export */   "shuffle": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.shuffle),
/* harmony export */   "slice": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.slice),
/* harmony export */   "smartDeepMerge": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.smartDeepMerge),
/* harmony export */   "some": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.some),
/* harmony export */   "split": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.split),
/* harmony export */   "strictEquals": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.strictEquals),
/* harmony export */   "throttle": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.throttle),
/* harmony export */   "throttleTime": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.throttleTime),
/* harmony export */   "toArray": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.toArray),
/* harmony export */   "toLowerCase": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.toLowerCase),
/* harmony export */   "toString": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.toString),
/* harmony export */   "toUpperCase": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.toUpperCase),
/* harmony export */   "trim": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.trim),
/* harmony export */   "trimLeft": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.trimLeft),
/* harmony export */   "trimRight": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.trimRight),
/* harmony export */   "truthyKeys": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.truthyKeys),
/* harmony export */   "truthyValues": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.truthyValues),
/* harmony export */   "union": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.union),
/* harmony export */   "unique": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.unique),
/* harmony export */   "unless": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.unless),
/* harmony export */   "unshift": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.unshift),
/* harmony export */   "values": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.values),
/* harmony export */   "when": () => (/* reexport safe */ _internal_js__WEBPACK_IMPORTED_MODULE_1__.when),
/* harmony export */   "DEFAULT_ERROR_RESPONSE_CODE": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_ERROR_RESPONSE_CODE),
/* harmony export */   "DEFAULT_FAIL_RESPONSE_CODE": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_FAIL_RESPONSE_CODE),
/* harmony export */   "DEFAULT_SUCCESS_RESPONSE_CODE": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_SUCCESS_RESPONSE_CODE),
/* harmony export */   "DEFAULT_UNKNOWN_RESPONSE_CODE": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_UNKNOWN_RESPONSE_CODE),
/* harmony export */   "adaptMultiPlatform": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.adaptMultiPlatform),
/* harmony export */   "adaptMultiPlatformAwait": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.adaptMultiPlatformAwait),
/* harmony export */   "addClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.addClass),
/* harmony export */   "array": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.array),
/* harmony export */   "asGetRequest": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.asGetRequest),
/* harmony export */   "asPostRequest": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.asPostRequest),
/* harmony export */   "axios": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.axios),
/* harmony export */   "biu": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.biu),
/* harmony export */   "boolean": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.boolean),
/* harmony export */   "classArrToObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classArrToObj),
/* harmony export */   "classArrToStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classArrToStr),
/* harmony export */   "classObjToArr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classObjToArr),
/* harmony export */   "classObjToStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classObjToStr),
/* harmony export */   "classStrToArr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classStrToArr),
/* harmony export */   "classStrToObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.classStrToObj),
/* harmony export */   "completeStateD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.completeStateD),
/* harmony export */   "completeStateRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.completeStateRD),
/* harmony export */   "containClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.containClass),
/* harmony export */   "documentD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.documentD),
/* harmony export */   "documentRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.documentRD),
/* harmony export */   "domLoadedD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.domLoadedD),
/* harmony export */   "domLoadedRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.domLoadedRD),
/* harmony export */   "formatClassTo": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatClassTo),
/* harmony export */   "formatErrorResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatErrorResponse),
/* harmony export */   "formatFailResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatFailResponse),
/* harmony export */   "formatResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatResponse),
/* harmony export */   "formatResponseMakerFlattenArgs": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatResponseMakerFlattenArgs),
/* harmony export */   "formatSuccessResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatSuccessResponse),
/* harmony export */   "formatUnknownResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.formatUnknownResponse),
/* harmony export */   "globalVar": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.globalVar),
/* harmony export */   "hasValidResponseCode": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.hasValidResponseCode),
/* harmony export */   "injectScript": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.injectScript),
/* harmony export */   "inspect": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.inspect),
/* harmony export */   "interactiveStateD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.interactiveStateD),
/* harmony export */   "interactiveStateRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.interactiveStateRD),
/* harmony export */   "is": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.is),
/* harmony export */   "isErrorResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isErrorResponse),
/* harmony export */   "isFailResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isFailResponse),
/* harmony export */   "isInBrowser": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isInBrowser),
/* harmony export */   "isInNode": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isInNode),
/* harmony export */   "isInWXMINA": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isInWXMINA),
/* harmony export */   "isInWeb": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isInWeb),
/* harmony export */   "isPathnameEqual": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameEqual),
/* harmony export */   "isPathnameLooseEqual": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameLooseEqual),
/* harmony export */   "isPathnameStrictEqual": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isPathnameStrictEqual),
/* harmony export */   "isResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isResponse),
/* harmony export */   "isResponseCode": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isResponseCode),
/* harmony export */   "isSuccessResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isSuccessResponse),
/* harmony export */   "isUnknowResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.isUnknowResponse),
/* harmony export */   "makeBaseResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeBaseResponse),
/* harmony export */   "makeCustomEvent": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeCustomEvent),
/* harmony export */   "makeElementBasedMessageProxy": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeElementBasedMessageProxy),
/* harmony export */   "makeErrorResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeErrorResponse),
/* harmony export */   "makeErrorResponseF": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeErrorResponseF),
/* harmony export */   "makeEventHandler": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeEventHandler),
/* harmony export */   "makeFailResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeFailResponse),
/* harmony export */   "makeFailResponseF": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeFailResponseF),
/* harmony export */   "makeGeneralEventHandler": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeGeneralEventHandler),
/* harmony export */   "makeLinedTigerLogger": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeLinedTigerLogger),
/* harmony export */   "makeScopeManager": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeScopeManager),
/* harmony export */   "makeSuccessResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeSuccessResponse),
/* harmony export */   "makeSuccessResponseF": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeSuccessResponseF),
/* harmony export */   "makeTigerLogger": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeTigerLogger),
/* harmony export */   "makeUniqueString": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeUniqueString),
/* harmony export */   "makeUnknownResponse": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeUnknownResponse),
/* harmony export */   "makeUnknownResponseF": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.makeUnknownResponseF),
/* harmony export */   "modifyBiuConfig": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.modifyBiuConfig),
/* harmony export */   "neatenClassStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.neatenClassStr),
/* harmony export */   "neatenPathname": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.neatenPathname),
/* harmony export */   "neatenQueryStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.neatenQueryStr),
/* harmony export */   "neatenSearch": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.neatenSearch),
/* harmony export */   "number": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.number),
/* harmony export */   "object": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.object),
/* harmony export */   "pathnameToArray": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.pathnameToArray),
/* harmony export */   "pathnameToString": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.pathnameToString),
/* harmony export */   "perf": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.perf),
/* harmony export */   "pollingToGetNode": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.pollingToGetNode),
/* harmony export */   "prefixClassWith": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.prefixClassWith),
/* harmony export */   "queryObjToQueryStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.queryObjToQueryStr),
/* harmony export */   "queryObjToSearch": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.queryObjToSearch),
/* harmony export */   "queryStrToQueryObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.queryStrToQueryObj),
/* harmony export */   "queryStrToSearch": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.queryStrToSearch),
/* harmony export */   "readyStateD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.readyStateD),
/* harmony export */   "readyStateRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.readyStateRD),
/* harmony export */   "removeClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeClass),
/* harmony export */   "removePrefixOfClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removePrefixOfClass),
/* harmony export */   "removeRepetition": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetition),
/* harmony export */   "removeRepetitionExcept": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionExcept),
/* harmony export */   "removeRepetitionOf": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOf),
/* harmony export */   "removeRepetitionOfEmpty": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOfEmpty),
/* harmony export */   "removeRepetitionOfSlash": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.removeRepetitionOfSlash),
/* harmony export */   "replaceClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.replaceClass),
/* harmony export */   "searchToQueryObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.searchToQueryObj),
/* harmony export */   "searchToQueryStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.searchToQueryStr),
/* harmony export */   "stdLineLog": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.stdLineLog),
/* harmony export */   "string": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.string),
/* harmony export */   "struct": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.struct),
/* harmony export */   "toClassArr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toClassArr),
/* harmony export */   "toClassObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toClassObj),
/* harmony export */   "toClassStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toClassStr),
/* harmony export */   "toQueryObj": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toQueryObj),
/* harmony export */   "toQueryStr": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toQueryStr),
/* harmony export */   "toSearch": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toSearch),
/* harmony export */   "toggleClass": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.toggleClass),
/* harmony export */   "windowD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowD),
/* harmony export */   "windowLoadedD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowLoadedD),
/* harmony export */   "windowLoadedRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowLoadedRD),
/* harmony export */   "windowRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowRD),
/* harmony export */   "windowResizeD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowResizeD),
/* harmony export */   "windowResizeRD": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.windowResizeRD),
/* harmony export */   "withCredentials": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.withCredentials),
/* harmony export */   "withDataExtracted": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.withDataExtracted),
/* harmony export */   "withJSONContent": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.withJSONContent),
/* harmony export */   "withoutCredentials": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.withoutCredentials),
/* harmony export */   "wxmina": () => (/* reexport safe */ _external_js__WEBPACK_IMPORTED_MODULE_2__.wxmina),
/* harmony export */   "BaseAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.BaseAtom),
/* harmony export */   "BaseMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.BaseMediator),
/* harmony export */   "Data": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Data),
/* harmony export */   "Datar": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Datar),
/* harmony export */   "FlatMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.FlatMediator),
/* harmony export */   "Mutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutation),
/* harmony export */   "Mutator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Mutator),
/* harmony export */   "ReplayMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.ReplayMediator),
/* harmony export */   "TERMINATOR": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.TERMINATOR),
/* harmony export */   "Terminator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Terminator),
/* harmony export */   "TriggerMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.TriggerMediator),
/* harmony export */   "VACUO": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.VACUO),
/* harmony export */   "VOID": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.VOID),
/* harmony export */   "Vacuo": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Vacuo),
/* harmony export */   "Void": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.Void),
/* harmony export */   "arrayCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.arrayCaseT),
/* harmony export */   "arrayCombineLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.arrayCombineLatestT),
/* harmony export */   "arrayCombineT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.arrayCombineT),
/* harmony export */   "arrayZipLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.arrayZipLatestT),
/* harmony export */   "asIsDistinctEverT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.asIsDistinctEverT),
/* harmony export */   "asIsDistinctPreviousT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.asIsDistinctPreviousT),
/* harmony export */   "atomToData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.atomToData),
/* harmony export */   "atomToMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.atomToMutation),
/* harmony export */   "beObservedBy": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.beObservedBy),
/* harmony export */   "binaryHyperComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryHyperComposeAtom),
/* harmony export */   "binaryHyperPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryHyperPipeAtom),
/* harmony export */   "binaryLiftComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryLiftComposeAtom),
/* harmony export */   "binaryLiftPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryLiftPipeAtom),
/* harmony export */   "binaryTweenComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryTweenComposeAtom),
/* harmony export */   "binaryTweenPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.binaryTweenPipeAtom),
/* harmony export */   "caseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.caseT),
/* harmony export */   "combineLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.combineLatestT),
/* harmony export */   "combineT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.combineT),
/* harmony export */   "composeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.composeAtom),
/* harmony export */   "connectInterfaces": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.connectInterfaces),
/* harmony export */   "createArrayMSTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createArrayMSTache),
/* harmony export */   "createArraySMTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createArraySMTache),
/* harmony export */   "createAtomInArray": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createAtomInArray),
/* harmony export */   "createAtomInObject": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createAtomInObject),
/* harmony export */   "createDataFromEvent": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromEvent),
/* harmony export */   "createDataFromFunction": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromFunction),
/* harmony export */   "createDataFromInterval": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromInterval),
/* harmony export */   "createDataFromIterable": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromIterable),
/* harmony export */   "createDataFromObservable": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromObservable),
/* harmony export */   "createDataFromTimeout": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataFromTimeout),
/* harmony export */   "createDataInArray": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataInArray),
/* harmony export */   "createDataInObject": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataInObject),
/* harmony export */   "createDataOf": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataOf),
/* harmony export */   "createDataWithReplay": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithReplay),
/* harmony export */   "createDataWithReplayMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithReplayMediator),
/* harmony export */   "createDataWithTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTrigger),
/* harmony export */   "createDataWithTriggerMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createDataWithTriggerMediator),
/* harmony export */   "createEmptyData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createEmptyData),
/* harmony export */   "createEmptyMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createEmptyMutation),
/* harmony export */   "createEventTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createEventTrigger),
/* harmony export */   "createEventTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createEventTriggerF),
/* harmony export */   "createFunctionTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createFunctionTrigger),
/* harmony export */   "createFunctionTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createFunctionTriggerF),
/* harmony export */   "createGeneralDriver": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createGeneralDriver),
/* harmony export */   "createGeneralTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createGeneralTache),
/* harmony export */   "createIntervalTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createIntervalTrigger),
/* harmony export */   "createIntervalTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createIntervalTriggerF),
/* harmony export */   "createIterableTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createIterableTrigger),
/* harmony export */   "createIterableTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createIterableTriggerF),
/* harmony export */   "createMMTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMMTache),
/* harmony export */   "createMSTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMSTache),
/* harmony export */   "createMutationFromEvent": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromEvent),
/* harmony export */   "createMutationFromFunction": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromFunction),
/* harmony export */   "createMutationFromInterval": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromInterval),
/* harmony export */   "createMutationFromIterable": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromIterable),
/* harmony export */   "createMutationFromObservable": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromObservable),
/* harmony export */   "createMutationFromTimeout": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationFromTimeout),
/* harmony export */   "createMutationInArray": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationInArray),
/* harmony export */   "createMutationInObject": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationInObject),
/* harmony export */   "createMutationOf": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationOf),
/* harmony export */   "createMutationOfLB": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationOfLB),
/* harmony export */   "createMutationOfLL": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationOfLL),
/* harmony export */   "createMutationOfLR": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationOfLR),
/* harmony export */   "createMutationWithReplay": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithReplay),
/* harmony export */   "createMutationWithReplayMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithReplayMediator),
/* harmony export */   "createMutationWithTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTrigger),
/* harmony export */   "createMutationWithTriggerMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createMutationWithTriggerMediator),
/* harmony export */   "createObjectMSTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createObjectMSTache),
/* harmony export */   "createObjectSMTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createObjectSMTache),
/* harmony export */   "createObservableTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createObservableTrigger),
/* harmony export */   "createObservableTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createObservableTriggerF),
/* harmony export */   "createSMTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createSMTache),
/* harmony export */   "createSSTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createSSTache),
/* harmony export */   "createTimeoutTrigger": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createTimeoutTrigger),
/* harmony export */   "createTimeoutTriggerF": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.createTimeoutTriggerF),
/* harmony export */   "dataToData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dataToData),
/* harmony export */   "dataToMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dataToMutation),
/* harmony export */   "dataToMutationS": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dataToMutationS),
/* harmony export */   "debounceTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.debounceTimeT),
/* harmony export */   "defaultToT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.defaultToT),
/* harmony export */   "distinctEverT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.distinctEverT),
/* harmony export */   "distinctPreviousT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.distinctPreviousT),
/* harmony export */   "dynamicArrayCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicArrayCaseT),
/* harmony export */   "dynamicDebounceTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDebounceTimeT),
/* harmony export */   "dynamicDefautToT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDefautToT),
/* harmony export */   "dynamicDistinctEverT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDistinctEverT),
/* harmony export */   "dynamicDistinctPreviousT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicDistinctPreviousT),
/* harmony export */   "dynamicEffectT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicEffectT),
/* harmony export */   "dynamicEmptyStartWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicEmptyStartWithT),
/* harmony export */   "dynamicFilterT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicFilterT),
/* harmony export */   "dynamicIifT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicIifT),
/* harmony export */   "dynamicMapT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicMapT),
/* harmony export */   "dynamicObjectCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicObjectCaseT),
/* harmony export */   "dynamicPluckT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicPluckT),
/* harmony export */   "dynamicSkipT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicSkipT),
/* harmony export */   "dynamicStartWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicStartWithT),
/* harmony export */   "dynamicSwitchT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicSwitchT),
/* harmony export */   "dynamicTakeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicTakeT),
/* harmony export */   "dynamicThrottleTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.dynamicThrottleTimeT),
/* harmony export */   "effectT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.effectT),
/* harmony export */   "emptyStartWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.emptyStartWithT),
/* harmony export */   "filterT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.filterT),
/* harmony export */   "formatEventTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatEventTriggerCreatorFlatArgs),
/* harmony export */   "formatFunctionTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatFunctionTriggerCreatorFlatArgs),
/* harmony export */   "formatIntervalTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatIntervalTriggerCreatorFlatArgs),
/* harmony export */   "formatIterableTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatIterableTriggerCreatorFlatArgs),
/* harmony export */   "formatObservableTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatObservableTriggerCreatorFlatArgs),
/* harmony export */   "formatTimeoutTriggerCreatorFlatArgs": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.formatTimeoutTriggerCreatorFlatArgs),
/* harmony export */   "getAtomType": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.getAtomType),
/* harmony export */   "iifT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.iifT),
/* harmony export */   "isAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isAtom),
/* harmony export */   "isData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isData),
/* harmony export */   "isDatar": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isDatar),
/* harmony export */   "isFlatMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isFlatMediator),
/* harmony export */   "isMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isMediator),
/* harmony export */   "isMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutation),
/* harmony export */   "isMutator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isMutator),
/* harmony export */   "isReplayMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isReplayMediator),
/* harmony export */   "isSameTypeOfAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isSameTypeOfAtom),
/* harmony export */   "isSameTypeOfMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isSameTypeOfMediator),
/* harmony export */   "isTerminator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isTerminator),
/* harmony export */   "isTriggerMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isTriggerMediator),
/* harmony export */   "isVacuo": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isVacuo),
/* harmony export */   "isVoid": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.isVoid),
/* harmony export */   "mapT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.mapT),
/* harmony export */   "mergeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.mergeT),
/* harmony export */   "mutationToData": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.mutationToData),
/* harmony export */   "mutationToDataS": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.mutationToDataS),
/* harmony export */   "mutationToMutation": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.mutationToMutation),
/* harmony export */   "nAryHyperComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryHyperComposeAtom),
/* harmony export */   "nAryHyperPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryHyperPipeAtom),
/* harmony export */   "nAryLiftComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryLiftComposeAtom),
/* harmony export */   "nAryLiftPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryLiftPipeAtom),
/* harmony export */   "nAryTweenComposeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryTweenComposeAtom),
/* harmony export */   "nAryTweenPipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nAryTweenPipeAtom),
/* harmony export */   "nilToVoidT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.nilToVoidT),
/* harmony export */   "objectCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.objectCaseT),
/* harmony export */   "objectCombineLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.objectCombineLatestT),
/* harmony export */   "objectCombineT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.objectCombineT),
/* harmony export */   "objectZipLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.objectZipLatestT),
/* harmony export */   "observe": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.observe),
/* harmony export */   "pairwiseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.pairwiseT),
/* harmony export */   "partitionT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.partitionT),
/* harmony export */   "pipeAtom": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.pipeAtom),
/* harmony export */   "pluckT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.pluckT),
/* harmony export */   "promiseSwitchT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.promiseSwitchT),
/* harmony export */   "replayWithLatest": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.replayWithLatest),
/* harmony export */   "replayWithoutLatest": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.replayWithoutLatest),
/* harmony export */   "skipT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.skipT),
/* harmony export */   "skipUntilT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.skipUntilT),
/* harmony export */   "skipWhileT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.skipWhileT),
/* harmony export */   "startWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.startWithT),
/* harmony export */   "staticArrayCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticArrayCaseT),
/* harmony export */   "staticDebounceTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticDebounceTimeT),
/* harmony export */   "staticDefaultToT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticDefaultToT),
/* harmony export */   "staticDistinctEverT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticDistinctEverT),
/* harmony export */   "staticDistinctPreviousT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticDistinctPreviousT),
/* harmony export */   "staticEffectT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticEffectT),
/* harmony export */   "staticEmptyStartWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticEmptyStartWithT),
/* harmony export */   "staticFilterT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticFilterT),
/* harmony export */   "staticIifT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticIifT),
/* harmony export */   "staticMapT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticMapT),
/* harmony export */   "staticObjectCaseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticObjectCaseT),
/* harmony export */   "staticPluckT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticPluckT),
/* harmony export */   "staticSkipT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticSkipT),
/* harmony export */   "staticStartWithT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticStartWithT),
/* harmony export */   "staticSwitchT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticSwitchT),
/* harmony export */   "staticTakeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticTakeT),
/* harmony export */   "staticThrottleTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.staticThrottleTimeT),
/* harmony export */   "switchT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.switchT),
/* harmony export */   "takeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.takeT),
/* harmony export */   "takeUntilT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.takeUntilT),
/* harmony export */   "takeWhileT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.takeWhileT),
/* harmony export */   "tapT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.tapT),
/* harmony export */   "tapValueT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.tapValueT),
/* harmony export */   "throttleTimeT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.throttleTimeT),
/* harmony export */   "truthyPairwiseT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.truthyPairwiseT),
/* harmony export */   "useGeneralDriver": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.useGeneralDriver),
/* harmony export */   "useGeneralTache": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.useGeneralTache),
/* harmony export */   "withDynamicHistoryT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withDynamicHistoryT),
/* harmony export */   "withHistoryT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withHistoryT),
/* harmony export */   "withLatestFromT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withLatestFromT),
/* harmony export */   "withMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withMediator),
/* harmony export */   "withReplayMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withReplayMediator),
/* harmony export */   "withStaticHistoryT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withStaticHistoryT),
/* harmony export */   "withTriggerMediator": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withTriggerMediator),
/* harmony export */   "withValueFlatted": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.withValueFlatted),
/* harmony export */   "zipLatestT": () => (/* reexport safe */ _atom_js__WEBPACK_IMPORTED_MODULE_3__.zipLatestT),
/* harmony export */   "semantic": () => (/* reexport safe */ _semantic_js__WEBPACK_IMPORTED_MODULE_4__.semantic)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functional.js */ "./src/es/functional.js");
/* harmony import */ var _internal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./internal.js */ "./src/es/internal.js");
/* harmony import */ var _external_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./external.js */ "./src/es/external.js");
/* harmony import */ var _atom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./atom.js */ "./src/es/atom.js");
/* harmony import */ var _semantic_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./semantic.js */ "./src/es/semantic.js");






/***/ }),

/***/ "./src/es/internal.js":
/*!****************************!*\
  !*** ./src/es/internal.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "allPass": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.allPass),
/* harmony export */   "and": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.and),
/* harmony export */   "anyPass": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.anyPass),
/* harmony export */   "asIs": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.asIs),
/* harmony export */   "asNull": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.asNull),
/* harmony export */   "asUndefined": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.asUndefined),
/* harmony export */   "assign": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.assign),
/* harmony export */   "assignTo": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.assignTo),
/* harmony export */   "between": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.between),
/* harmony export */   "complement": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.complement),
/* harmony export */   "concat": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.concat),
/* harmony export */   "debounce": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.debounce),
/* harmony export */   "deepCopy": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.deepCopy),
/* harmony export */   "deepCopyViaJSON": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.deepCopyViaJSON),
/* harmony export */   "defaultProps": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.defaultProps),
/* harmony export */   "emptifyObj": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.emptifyObj),
/* harmony export */   "entries": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.entries),
/* harmony export */   "equals": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.equals),
/* harmony export */   "every": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.every),
/* harmony export */   "filter": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.filter),
/* harmony export */   "filterFalsy": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.filterFalsy),
/* harmony export */   "filterTruthy": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.filterTruthy),
/* harmony export */   "flat": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.flat),
/* harmony export */   "forEach": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.forEach),
/* harmony export */   "get": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.get),
/* harmony export */   "getByPath": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.getByPath),
/* harmony export */   "hardDeepMerge": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.hardDeepMerge),
/* harmony export */   "hasOwnProperty": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.hasOwnProperty),
/* harmony export */   "humanize": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.humanize),
/* harmony export */   "ifElse": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.ifElse),
/* harmony export */   "iif": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.iif),
/* harmony export */   "iife": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.iife),
/* harmony export */   "includes": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.includes),
/* harmony export */   "indexOf": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.indexOf),
/* harmony export */   "intersection": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.intersection),
/* harmony export */   "isAllSpace": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isAllSpace),
/* harmony export */   "isArray": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isArray),
/* harmony export */   "isAsyncFn": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isAsyncFn),
/* harmony export */   "isAsyncGeneratorFunction": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isAsyncGeneratorFunction),
/* harmony export */   "isBoolean": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean),
/* harmony export */   "isDate": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isDate),
/* harmony export */   "isDefined": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isDefined),
/* harmony export */   "isDocument": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isDocument),
/* harmony export */   "isEmailAddress": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEmailAddress),
/* harmony export */   "isEmpty": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEmpty),
/* harmony export */   "isEmptyArr": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyArr),
/* harmony export */   "isEmptyObj": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyObj),
/* harmony export */   "isEmptyStr": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyStr),
/* harmony export */   "isError": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isError),
/* harmony export */   "isEven": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEven),
/* harmony export */   "isEventTarget": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isEventTarget),
/* harmony export */   "isFalse": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isFalse),
/* harmony export */   "isFalsy": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isFalsy),
/* harmony export */   "isFunction": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isFunction),
/* harmony export */   "isGeneralObject": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isGeneralObject),
/* harmony export */   "isGeneratorFunction": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isGeneratorFunction),
/* harmony export */   "isIterable": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isIterable),
/* harmony export */   "isMap": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isMap),
/* harmony export */   "isNil": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isNil),
/* harmony export */   "isNotNil": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isNotNil),
/* harmony export */   "isNull": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isNull),
/* harmony export */   "isNumber": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isNumber),
/* harmony export */   "isObject": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isObject),
/* harmony export */   "isObservable": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isObservable),
/* harmony export */   "isOdd": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isOdd),
/* harmony export */   "isOutDated": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isOutDated),
/* harmony export */   "isPhoneNum": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isPhoneNum),
/* harmony export */   "isPromise": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isPromise),
/* harmony export */   "isQQId": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isQQId),
/* harmony export */   "isRegExp": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isRegExp),
/* harmony export */   "isSet": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isSet),
/* harmony export */   "isStartWith": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isStartWith),
/* harmony export */   "isString": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isString),
/* harmony export */   "isSymbol": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isSymbol),
/* harmony export */   "isTelNum": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isTelNum),
/* harmony export */   "isTrue": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isTrue),
/* harmony export */   "isTruthy": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isTruthy),
/* harmony export */   "isUndefined": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined),
/* harmony export */   "isWeakMap": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isWeakMap),
/* harmony export */   "isWeakSet": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isWeakSet),
/* harmony export */   "isWindow": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.isWindow),
/* harmony export */   "join": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.join),
/* harmony export */   "keys": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.keys),
/* harmony export */   "looseEquals": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.looseEquals),
/* harmony export */   "map": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.map),
/* harmony export */   "maxOf": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.maxOf),
/* harmony export */   "maxTo": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.maxTo),
/* harmony export */   "minOf": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.minOf),
/* harmony export */   "minTo": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.minTo),
/* harmony export */   "noop": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.noop),
/* harmony export */   "not": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.not),
/* harmony export */   "once": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.once),
/* harmony export */   "or": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.or),
/* harmony export */   "packing": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.packing),
/* harmony export */   "pop": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.pop),
/* harmony export */   "prop": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.prop),
/* harmony export */   "propEq": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.propEq),
/* harmony export */   "push": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.push),
/* harmony export */   "randomString": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.randomString),
/* harmony export */   "reduce": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.reduce),
/* harmony export */   "reject": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.reject),
/* harmony export */   "replace": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.replace),
/* harmony export */   "shift": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.shift),
/* harmony export */   "shuffle": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.shuffle),
/* harmony export */   "slice": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.slice),
/* harmony export */   "smartDeepMerge": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.smartDeepMerge),
/* harmony export */   "some": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.some),
/* harmony export */   "split": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.split),
/* harmony export */   "strictEquals": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.strictEquals),
/* harmony export */   "throttle": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.throttle),
/* harmony export */   "throttleTime": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.throttleTime),
/* harmony export */   "toArray": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.toArray),
/* harmony export */   "toLowerCase": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.toLowerCase),
/* harmony export */   "toString": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.toString),
/* harmony export */   "toUpperCase": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.toUpperCase),
/* harmony export */   "trim": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.trim),
/* harmony export */   "trimLeft": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.trimLeft),
/* harmony export */   "trimRight": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.trimRight),
/* harmony export */   "truthyKeys": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.truthyKeys),
/* harmony export */   "truthyValues": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.truthyValues),
/* harmony export */   "union": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.union),
/* harmony export */   "unique": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.unique),
/* harmony export */   "unless": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.unless),
/* harmony export */   "unshift": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.unshift),
/* harmony export */   "values": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.values),
/* harmony export */   "when": () => (/* reexport safe */ _internal_index_js__WEBPACK_IMPORTED_MODULE_0__.when)
/* harmony export */ });
/* harmony import */ var _internal_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/index.js */ "./src/es/internal/index.js");


/***/ }),

/***/ "./src/es/internal/array.js":
/*!**********************************!*\
  !*** ./src/es/internal/array.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "toArray": () => (/* binding */ toArray),
/* harmony export */   "shuffle": () => (/* binding */ shuffle),
/* harmony export */   "includes": () => (/* binding */ includes),
/* harmony export */   "every": () => (/* binding */ every),
/* harmony export */   "map": () => (/* binding */ map),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "filter": () => (/* binding */ filter),
/* harmony export */   "reject": () => (/* binding */ reject),
/* harmony export */   "reduce": () => (/* binding */ reduce),
/* harmony export */   "some": () => (/* binding */ some),
/* harmony export */   "flat": () => (/* binding */ flat),
/* harmony export */   "slice": () => (/* binding */ slice),
/* harmony export */   "join": () => (/* binding */ join),
/* harmony export */   "push": () => (/* binding */ push),
/* harmony export */   "pop": () => (/* binding */ pop),
/* harmony export */   "unshift": () => (/* binding */ unshift),
/* harmony export */   "shift": () => (/* binding */ shift),
/* harmony export */   "unique": () => (/* binding */ unique),
/* harmony export */   "concat": () => (/* binding */ concat),
/* harmony export */   "union": () => (/* binding */ union),
/* harmony export */   "intersection": () => (/* binding */ intersection)
/* harmony export */ });
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _functional_combinators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functional/combinators.js */ "./src/es/functional/combinators.js");

 // TODO: enhance

const toArray = val => [...val]; // @see: https://github.com/mqyqingfeng/Blog/issues/51

const shuffle = a => {
  a = [].concat(a);

  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }

  return a;
};
const includes = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'includes');
const every = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'every');
const map = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'map');
const forEach = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'forEach');
const filter = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'filter');
const reject = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((f, arr) => filter((...args) => !f(...args), arr));
const reduce = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(3, 'reduce');
const some = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'some');
const flat = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'flat');
const slice = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(3, 'slice');
const join = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'join');
const push = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((item, arr) => {
  arr = [...arr];
  arr.push(item);
  return arr;
});
const pop = arr => {
  arr = [...arr];
  arr.pop();
  return arr;
};
const unshift = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((item, arr) => {
  arr = [...arr];
  arr.unshift(item);
  return arr;
});
const shift = arr => {
  arr = [...arr];
  arr.shift();
  return arr;
};
const unique = arr => [...new Set(arr)];
const concat = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'concat');
const union = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.compose)(unique, (0,_functional_combinators_js__WEBPACK_IMPORTED_MODULE_1__.flip)(concat))); // @see ramda, it is more efficient when the array length gap is large

const _longer = (arr1, arr2) => arr1.length > arr2.length ? arr1 : arr2;

const _shorter = (arr1, arr2) => arr1.length > arr2.length ? arr2 : arr1;

const intersection = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((arr1, arr2) => {
  const lookupArr = _longer(arr1, arr2);

  const filteredArr = _shorter(arr1, arr2);

  return unique(filter((0,_functional_combinators_js__WEBPACK_IMPORTED_MODULE_1__.flip)(includes)(lookupArr), filteredArr));
});

/***/ }),

/***/ "./src/es/internal/base.js":
/*!*********************************!*\
  !*** ./src/es/internal/base.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isDefined": () => (/* binding */ isDefined),
/* harmony export */   "isGeneralObject": () => (/* binding */ isGeneralObject),
/* harmony export */   "isBoolean": () => (/* binding */ isBoolean),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isNumber": () => (/* binding */ isNumber),
/* harmony export */   "isSymbol": () => (/* binding */ isSymbol),
/* harmony export */   "isUndefined": () => (/* binding */ isUndefined),
/* harmony export */   "isNull": () => (/* binding */ isNull),
/* harmony export */   "isFunction": () => (/* binding */ isFunction),
/* harmony export */   "isDate": () => (/* binding */ isDate),
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "isArray": () => (/* binding */ isArray),
/* harmony export */   "isMap": () => (/* binding */ isMap),
/* harmony export */   "isWeakMap": () => (/* binding */ isWeakMap),
/* harmony export */   "isSet": () => (/* binding */ isSet),
/* harmony export */   "isWeakSet": () => (/* binding */ isWeakSet),
/* harmony export */   "isRegExp": () => (/* binding */ isRegExp),
/* harmony export */   "isPromise": () => (/* binding */ isPromise),
/* harmony export */   "isAsyncFn": () => (/* binding */ isAsyncFn),
/* harmony export */   "isGeneratorFunction": () => (/* binding */ isGeneratorFunction),
/* harmony export */   "isAsyncGeneratorFunction": () => (/* binding */ isAsyncGeneratorFunction),
/* harmony export */   "isError": () => (/* binding */ isError),
/* harmony export */   "isEmptyStr": () => (/* binding */ isEmptyStr),
/* harmony export */   "isEmptyArr": () => (/* binding */ isEmptyArr),
/* harmony export */   "isEmptyObj": () => (/* binding */ isEmptyObj),
/* harmony export */   "isOutDated": () => (/* binding */ isOutDated),
/* harmony export */   "isWindow": () => (/* binding */ isWindow),
/* harmony export */   "isDocument": () => (/* binding */ isDocument),
/* harmony export */   "isEventTarget": () => (/* binding */ isEventTarget),
/* harmony export */   "isIterable": () => (/* binding */ isIterable),
/* harmony export */   "isObservable": () => (/* binding */ isObservable),
/* harmony export */   "isEmpty": () => (/* binding */ isEmpty),
/* harmony export */   "asIs": () => (/* binding */ asIs),
/* harmony export */   "asUndefined": () => (/* binding */ asUndefined),
/* harmony export */   "asNull": () => (/* binding */ asNull),
/* harmony export */   "noop": () => (/* binding */ noop)
/* harmony export */ });
const isDefined = variable => typeof variable !== 'undefined';
const isGeneralObject = tar => typeof tar === 'object'; // @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types

const isBoolean = boo => Object.prototype.toString.call(boo) === '[object Boolean]';
const isString = str => Object.prototype.toString.call(str) === '[object String]';
const isNumber = num => Object.prototype.toString.call(num) === '[object Number]';
const isSymbol = symbol => Object.prototype.toString.call(symbol) === '[object Symbol]';
const isUndefined = val => Object.prototype.toString.call(val) === '[object Undefined]';
const isNull = val => Object.prototype.toString.call(val) === '[object Null]';
const isFunction = fn => fn && Object.prototype.toString.call(fn) === '[object Function]';
const isDate = date => date && Object.prototype.toString.call(new Date(date)) === '[object Date]' && !!new Date(date).getTime();
const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';
const isMap = map => Object.prototype.toString.call(map) === '[object Map]';
const isWeakMap = weakMap => Object.prototype.toString.call(weakMap) === '[object WeakMap]';
const isSet = set => Object.prototype.toString.call(set) === '[object Set]';
const isWeakSet = weakSet => Object.prototype.toString.call(weakSet) === '[object WeakSet]';
const isRegExp = regex => Object.prototype.toString.call(regex) === '[object RegExp]';
const isPromise = obj => Object.prototype.toString.call(obj) === '[object Promise]';
const isAsyncFn = fn => Object.prototype.toString.call(fn) === '[object AsyncFunction]';
const isGeneratorFunction = fn => Object.prototype.toString.call(fn) === '[object GeneratorFunction]';
const isAsyncGeneratorFunction = fn => Object.prototype.toString.call(fn) === '[object AsyncGeneratorFunction]';
const isError = err => Object.prototype.toString.call(err) === '[object Error]';
const isEmptyStr = str => isString(str) && str.length === 0;
const isEmptyArr = arr => isArray(arr) && arr.length === 0;
const isEmptyObj = obj => isObject(obj) && Object.keys(obj).length === 0;
const isOutDated = date => isDate(date) && new Date(date).getTime() < new Date().getTime();
const isWindow = obj => Object.prototype.toString.call(obj) === '[object Window]';
const isDocument = obj => Object.prototype.toString.call(document) === '[object HTMLDocument]'; // refer: https://developer.mozilla.org/zh-CN/docs/Web/API/Event

const isEventTarget = obj => obj instanceof EventTarget;
const isIterable = tar => Object.prototype.toString.call(tar[Symbol.iterator]) === 'object Function';
const isObservable = obj => isObject(obj) && (obj.isObservable || isFunction(obj.subscribe)); // - `null` and `undefined` are considered empty values
// - `''` is the empty value for String
// - `[]` is the empty value for Array
// - `{}` is the empty value for Object

const isEmpty = val => isNull(val) || isUndefined(val) || isEmptyStr(val) || isEmptyArr(val) || isEmptyObj(val) || isObject(val) && val.isEmpty;
const asIs = v => v;
const asUndefined = v => undefined;
const asNull = v => null;
const noop = v => {}; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is

/***/ }),

/***/ "./src/es/internal/boolean.js":
/*!************************************!*\
  !*** ./src/es/internal/boolean.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "and": () => (/* binding */ and),
/* harmony export */   "or": () => (/* binding */ or),
/* harmony export */   "not": () => (/* binding */ not),
/* harmony export */   "complement": () => (/* binding */ complement),
/* harmony export */   "isTrue": () => (/* binding */ isTrue),
/* harmony export */   "isFalse": () => (/* binding */ isFalse),
/* harmony export */   "isTruthy": () => (/* binding */ isTruthy),
/* harmony export */   "isFalsy": () => (/* binding */ isFalsy),
/* harmony export */   "isNil": () => (/* binding */ isNil),
/* harmony export */   "isNotNil": () => (/* binding */ isNotNil),
/* harmony export */   "strictEquals": () => (/* binding */ strictEquals),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "looseEquals": () => (/* binding */ looseEquals),
/* harmony export */   "ifElse": () => (/* binding */ ifElse),
/* harmony export */   "when": () => (/* binding */ when),
/* harmony export */   "unless": () => (/* binding */ unless),
/* harmony export */   "iif": () => (/* binding */ iif)
/* harmony export */ });
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");

const and = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((x, y) => !!x && !!y);
const or = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((x, y) => !!x || !!y);
const not = x => !x;
const complement = fn => (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.compose)(not, fn);
const isTrue = v => v === true;
const isFalse = v => v === false; // @see https://developer.mozilla.org/en-US/docs/Glossary/Truthy

const isTruthy = v => !!v === true;
const isFalsy = v => !!v === false;
const isNil = v => v === null || v === undefined;
const isNotNil = complement(isNil);
const strictEquals = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((v1, v2) => v1 === v2);
const equals = strictEquals; // eslint-disable-next-line eqeqeq

const looseEquals = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((v1, v2) => v1 == v2);
const ifElse = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((pred, f, g, x) => pred(x) ? f(x) : g(x));
const when = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((pred, f, x) => pred(x) ? f(x) : x);
const unless = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((pred, f, x) => !pred(x) ? f(x) : x);
const iif = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((cond, x, y) => cond ? x : y);

/***/ }),

/***/ "./src/es/internal/date.js":
/*!*********************************!*\
  !*** ./src/es/internal/date.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "humanize": () => (/* binding */ humanize)
/* harmony export */ });
const UNITS_DICT = {
  year: '年',
  month: '月',
  week: '周',
  day: '天',
  hour: '小时',
  minute: '分钟',
  second: '秒',
  millisecond: '毫秒'
};
const UNITS_MILLI_DICT = {
  year: 31557600000,
  month: 2629800000,
  week: 604800000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1
};
const humanize = timestamp => {
  let res = '';
  const milliseconds = +new Date() - timestamp;

  for (const key in UNITS_MILLI_DICT) {
    if (milliseconds >= UNITS_MILLI_DICT[key]) {
      res = `${Math.floor(milliseconds / UNITS_MILLI_DICT[key])} ${UNITS_DICT[key]}前`;
      break;
    }
  }

  return res || '刚刚';
};

/***/ }),

/***/ "./src/es/internal/function.js":
/*!*************************************!*\
  !*** ./src/es/internal/function.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "iife": () => (/* binding */ iife),
/* harmony export */   "once": () => (/* binding */ once),
/* harmony export */   "debounce": () => (/* binding */ debounce),
/* harmony export */   "throttle": () => (/* binding */ throttle),
/* harmony export */   "throttleTime": () => (/* binding */ throttleTime),
/* harmony export */   "packing": () => (/* binding */ packing)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./object.js */ "./src/es/internal/object.js");
 // ! unnecessary
// // NOTE: call 接受不定长参数，无法进行一般柯里化
// export const call = (f, ...args) => f(...args)
// // apply :: (a -> b) -> a -> b
// ! name conflict with `apply` in functional module which has different signature
// export const apply = curry((f, args) => f(...args))

const iife = (fn, ...args) => fn(...args);
const once = fn => {
  let called, result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }

    return result;
  };
};
const debounce = (fn, ms) => {
  let timer;
  let waiting = [];
  return () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const res = await fn();
      waiting.forEach(fn => {
        fn(res);
      });
      waiting = [];
    }, ms);
    return new Promise(resolve => {
      waiting.push(resolve);
    });
  };
};
const throttle = fn => {
  let isCalling = false;
  let waiting = [];
  return () => {
    if (!isCalling) {
      isCalling = true;
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res);
        });
        waiting = [];
        isCalling = false;
      });
    }

    return new Promise(resolve => {
      waiting.push(resolve);
    });
  };
};
const throttleTime = (fn, ms) => {
  let isCalling = false;
  let waiting = [];
  return () => {
    if (!isCalling) {
      isCalling = true;
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res);
        });
        waiting = [];
      });
      setTimeout(() => {
        isCalling = false;
      }, ms);
    }

    return new Promise(resolve => {
      waiting.push(resolve);
    });
  };
};
const packing = (fn, range) => {
  let timer;
  let waiting = [];
  let data = {};
  return oData => {
    clearTimeout(timer);
    data = (0,_object_js__WEBPACK_IMPORTED_MODULE_0__.hardDeepMerge)(data, oData);
    timer = setTimeout(async () => {
      const res = await fn(data);
      waiting.forEach(waitFn => {
        waitFn(res);
      });
      waiting = [];
    }, range);
    return new Promise(resolve => {
      waiting.push(resolve);
    });
  };
};

/***/ }),

/***/ "./src/es/internal/hybrid.js":
/*!***********************************!*\
  !*** ./src/es/internal/hybrid.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filterTruthy": () => (/* binding */ filterTruthy),
/* harmony export */   "filterFalsy": () => (/* binding */ filterFalsy),
/* harmony export */   "allPass": () => (/* binding */ allPass),
/* harmony export */   "anyPass": () => (/* binding */ anyPass)
/* harmony export */ });
/* harmony import */ var _array_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./array.js */ "./src/es/internal/array.js");
/* harmony import */ var _boolean_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./boolean.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _functional_combinators_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../functional/combinators.js */ "./src/es/functional/combinators.js");




const filterTruthy = (0,_array_js__WEBPACK_IMPORTED_MODULE_0__.filter)(_boolean_js__WEBPACK_IMPORTED_MODULE_1__.isTruthy);
const filterFalsy = (0,_array_js__WEBPACK_IMPORTED_MODULE_0__.filter)(_boolean_js__WEBPACK_IMPORTED_MODULE_1__.isFalsy);
const allPass = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_2__.curry)((tests, tar) => (0,_array_js__WEBPACK_IMPORTED_MODULE_0__.every)((0,_functional_combinators_js__WEBPACK_IMPORTED_MODULE_3__.applyTo)(tar), tests));
const anyPass = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_2__.curry)((tests, tar) => (0,_array_js__WEBPACK_IMPORTED_MODULE_0__.some)((0,_functional_combinators_js__WEBPACK_IMPORTED_MODULE_3__.applyTo)(tar), tests));

/***/ }),

/***/ "./src/es/internal/index.js":
/*!**********************************!*\
  !*** ./src/es/internal/index.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "asIs": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.asIs),
/* harmony export */   "asNull": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.asNull),
/* harmony export */   "asUndefined": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.asUndefined),
/* harmony export */   "isArray": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isArray),
/* harmony export */   "isAsyncFn": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isAsyncFn),
/* harmony export */   "isAsyncGeneratorFunction": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isAsyncGeneratorFunction),
/* harmony export */   "isBoolean": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isBoolean),
/* harmony export */   "isDate": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isDate),
/* harmony export */   "isDefined": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isDefined),
/* harmony export */   "isDocument": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isDocument),
/* harmony export */   "isEmpty": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isEmpty),
/* harmony export */   "isEmptyArr": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyArr),
/* harmony export */   "isEmptyObj": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyObj),
/* harmony export */   "isEmptyStr": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isEmptyStr),
/* harmony export */   "isError": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isError),
/* harmony export */   "isEventTarget": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isEventTarget),
/* harmony export */   "isFunction": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isFunction),
/* harmony export */   "isGeneralObject": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isGeneralObject),
/* harmony export */   "isGeneratorFunction": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isGeneratorFunction),
/* harmony export */   "isIterable": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isIterable),
/* harmony export */   "isMap": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isMap),
/* harmony export */   "isNull": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isNull),
/* harmony export */   "isNumber": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isNumber),
/* harmony export */   "isObject": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isObject),
/* harmony export */   "isObservable": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isObservable),
/* harmony export */   "isOutDated": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isOutDated),
/* harmony export */   "isPromise": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isPromise),
/* harmony export */   "isRegExp": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isRegExp),
/* harmony export */   "isSet": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isSet),
/* harmony export */   "isString": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isString),
/* harmony export */   "isSymbol": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isSymbol),
/* harmony export */   "isUndefined": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isUndefined),
/* harmony export */   "isWeakMap": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isWeakMap),
/* harmony export */   "isWeakSet": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isWeakSet),
/* harmony export */   "isWindow": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.isWindow),
/* harmony export */   "noop": () => (/* reexport safe */ _base_js__WEBPACK_IMPORTED_MODULE_0__.noop),
/* harmony export */   "concat": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.concat),
/* harmony export */   "every": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.every),
/* harmony export */   "filter": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.filter),
/* harmony export */   "flat": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.flat),
/* harmony export */   "forEach": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.forEach),
/* harmony export */   "includes": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.includes),
/* harmony export */   "intersection": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.intersection),
/* harmony export */   "join": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.join),
/* harmony export */   "map": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.map),
/* harmony export */   "pop": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.pop),
/* harmony export */   "push": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.push),
/* harmony export */   "reduce": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.reduce),
/* harmony export */   "reject": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.reject),
/* harmony export */   "shift": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.shift),
/* harmony export */   "shuffle": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.shuffle),
/* harmony export */   "slice": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.slice),
/* harmony export */   "some": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.some),
/* harmony export */   "toArray": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.toArray),
/* harmony export */   "union": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.union),
/* harmony export */   "unique": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.unique),
/* harmony export */   "unshift": () => (/* reexport safe */ _array_js__WEBPACK_IMPORTED_MODULE_1__.unshift),
/* harmony export */   "and": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.and),
/* harmony export */   "complement": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.complement),
/* harmony export */   "equals": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.equals),
/* harmony export */   "ifElse": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.ifElse),
/* harmony export */   "iif": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.iif),
/* harmony export */   "isFalse": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isFalse),
/* harmony export */   "isFalsy": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isFalsy),
/* harmony export */   "isNil": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isNil),
/* harmony export */   "isNotNil": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isNotNil),
/* harmony export */   "isTrue": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isTrue),
/* harmony export */   "isTruthy": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.isTruthy),
/* harmony export */   "looseEquals": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.looseEquals),
/* harmony export */   "not": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.not),
/* harmony export */   "or": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.or),
/* harmony export */   "strictEquals": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.strictEquals),
/* harmony export */   "unless": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.unless),
/* harmony export */   "when": () => (/* reexport safe */ _boolean_js__WEBPACK_IMPORTED_MODULE_2__.when),
/* harmony export */   "humanize": () => (/* reexport safe */ _date_js__WEBPACK_IMPORTED_MODULE_3__.humanize),
/* harmony export */   "debounce": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.debounce),
/* harmony export */   "iife": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.iife),
/* harmony export */   "once": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.once),
/* harmony export */   "packing": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.packing),
/* harmony export */   "throttle": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.throttle),
/* harmony export */   "throttleTime": () => (/* reexport safe */ _function_js__WEBPACK_IMPORTED_MODULE_4__.throttleTime),
/* harmony export */   "between": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.between),
/* harmony export */   "isEven": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.isEven),
/* harmony export */   "isOdd": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.isOdd),
/* harmony export */   "maxOf": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.maxOf),
/* harmony export */   "maxTo": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.maxTo),
/* harmony export */   "minOf": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.minOf),
/* harmony export */   "minTo": () => (/* reexport safe */ _number_js__WEBPACK_IMPORTED_MODULE_5__.minTo),
/* harmony export */   "assign": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.assign),
/* harmony export */   "assignTo": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.assignTo),
/* harmony export */   "deepCopy": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.deepCopy),
/* harmony export */   "deepCopyViaJSON": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.deepCopyViaJSON),
/* harmony export */   "defaultProps": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.defaultProps),
/* harmony export */   "emptifyObj": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.emptifyObj),
/* harmony export */   "entries": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.entries),
/* harmony export */   "get": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.get),
/* harmony export */   "getByPath": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.getByPath),
/* harmony export */   "hardDeepMerge": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.hardDeepMerge),
/* harmony export */   "hasOwnProperty": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.hasOwnProperty),
/* harmony export */   "keys": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.keys),
/* harmony export */   "prop": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.prop),
/* harmony export */   "propEq": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.propEq),
/* harmony export */   "smartDeepMerge": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.smartDeepMerge),
/* harmony export */   "truthyKeys": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.truthyKeys),
/* harmony export */   "truthyValues": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.truthyValues),
/* harmony export */   "values": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_6__.values),
/* harmony export */   "indexOf": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.indexOf),
/* harmony export */   "isAllSpace": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.isAllSpace),
/* harmony export */   "isStartWith": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.isStartWith),
/* harmony export */   "randomString": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.randomString),
/* harmony export */   "replace": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.replace),
/* harmony export */   "split": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.split),
/* harmony export */   "toLowerCase": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.toLowerCase),
/* harmony export */   "toString": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.toString),
/* harmony export */   "toUpperCase": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.toUpperCase),
/* harmony export */   "trim": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.trim),
/* harmony export */   "trimLeft": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.trimLeft),
/* harmony export */   "trimRight": () => (/* reexport safe */ _string_js__WEBPACK_IMPORTED_MODULE_7__.trimRight),
/* harmony export */   "isEmailAddress": () => (/* reexport safe */ _regexp_js__WEBPACK_IMPORTED_MODULE_8__.isEmailAddress),
/* harmony export */   "isPhoneNum": () => (/* reexport safe */ _regexp_js__WEBPACK_IMPORTED_MODULE_8__.isPhoneNum),
/* harmony export */   "isQQId": () => (/* reexport safe */ _regexp_js__WEBPACK_IMPORTED_MODULE_8__.isQQId),
/* harmony export */   "isTelNum": () => (/* reexport safe */ _regexp_js__WEBPACK_IMPORTED_MODULE_8__.isTelNum),
/* harmony export */   "allPass": () => (/* reexport safe */ _hybrid_js__WEBPACK_IMPORTED_MODULE_9__.allPass),
/* harmony export */   "anyPass": () => (/* reexport safe */ _hybrid_js__WEBPACK_IMPORTED_MODULE_9__.anyPass),
/* harmony export */   "filterFalsy": () => (/* reexport safe */ _hybrid_js__WEBPACK_IMPORTED_MODULE_9__.filterFalsy),
/* harmony export */   "filterTruthy": () => (/* reexport safe */ _hybrid_js__WEBPACK_IMPORTED_MODULE_9__.filterTruthy)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./src/es/internal/base.js");
/* harmony import */ var _array_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./array.js */ "./src/es/internal/array.js");
/* harmony import */ var _boolean_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boolean.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _date_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./date.js */ "./src/es/internal/date.js");
/* harmony import */ var _function_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./function.js */ "./src/es/internal/function.js");
/* harmony import */ var _number_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./number.js */ "./src/es/internal/number.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./object.js */ "./src/es/internal/object.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./string.js */ "./src/es/internal/string.js");
/* harmony import */ var _regexp_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./regexp.js */ "./src/es/internal/regexp.js");
/* harmony import */ var _hybrid_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./hybrid.js */ "./src/es/internal/hybrid.js");
// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects












/***/ }),

/***/ "./src/es/internal/number.js":
/*!***********************************!*\
  !*** ./src/es/internal/number.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isEven": () => (/* binding */ isEven),
/* harmony export */   "isOdd": () => (/* binding */ isOdd),
/* harmony export */   "maxTo": () => (/* binding */ maxTo),
/* harmony export */   "minTo": () => (/* binding */ minTo),
/* harmony export */   "minOf": () => (/* binding */ minOf),
/* harmony export */   "maxOf": () => (/* binding */ maxOf),
/* harmony export */   "between": () => (/* binding */ between)
/* harmony export */ });
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");

const isEven = x => x % 2 === 0;
const isOdd = x => x % 2 !== 0;
const maxTo = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (max, x) => x > max ? max : x);
const minTo = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (min, x) => x < min ? min : x);
const minOf = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (x, y) => x < y ? x : y);
const maxOf = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (x, y) => x > y ? x : y);
const between = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(3, (a, b, x) => {
  const min = minOf(a, b);
  const max = maxOf(a, b);
  return x < min ? min : x > max ? max : x;
});

/***/ }),

/***/ "./src/es/internal/object.js":
/*!***********************************!*\
  !*** ./src/es/internal/object.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "prop": () => (/* binding */ prop),
/* harmony export */   "propEq": () => (/* binding */ propEq),
/* harmony export */   "entries": () => (/* binding */ entries),
/* harmony export */   "keys": () => (/* binding */ keys),
/* harmony export */   "values": () => (/* binding */ values),
/* harmony export */   "truthyKeys": () => (/* binding */ truthyKeys),
/* harmony export */   "truthyValues": () => (/* binding */ truthyValues),
/* harmony export */   "hasOwnProperty": () => (/* binding */ hasOwnProperty),
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "assignTo": () => (/* binding */ assignTo),
/* harmony export */   "defaultProps": () => (/* binding */ defaultProps),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "getByPath": () => (/* binding */ getByPath),
/* harmony export */   "emptifyObj": () => (/* binding */ emptifyObj),
/* harmony export */   "deepCopyViaJSON": () => (/* binding */ deepCopyViaJSON),
/* harmony export */   "deepCopy": () => (/* binding */ deepCopy),
/* harmony export */   "hardDeepMerge": () => (/* binding */ hardDeepMerge),
/* harmony export */   "smartDeepMerge": () => (/* binding */ smartDeepMerge)
/* harmony export */ });
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./base.js */ "./src/es/internal/base.js");
/* harmony import */ var _boolean_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boolean.js */ "./src/es/internal/boolean.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./string.js */ "./src/es/internal/string.js");
/* harmony import */ var _array_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./array.js */ "./src/es/internal/array.js");





const prop = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((key, obj) => obj[key]);
const propEq = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((prop, value, obj) => obj[prop] === value);
const entries = Object.entries;
const keys = Object.keys;
const values = Object.values;
const truthyKeys = obj => entries(obj).filter(([k, v]) => !!v).map(([k, v]) => k);
const truthyValues = obj => entries(obj).filter(([k, v]) => !!v).map(([k, v]) => v);
const hasOwnProperty = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((key, obj) => Object.prototype.hasOwnProperty.call(obj, key));
const assign = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (source, target) => target.assign(source));
const assignTo = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (target, source) => target.assign(source));
const defaultProps = assign;
/**
 * @deprecated use getByPath instead
 */
// @refer to: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
// NOTE: rawFn.length === 2
// export const get = curry((obj, path, defaultValue = undefined) => {

const get = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((obj, path) => {
  // getPathArray :: s -> [s]
  const getPathArray = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.compose)((0,_array_js__WEBPACK_IMPORTED_MODULE_1__.filter)(_boolean_js__WEBPACK_IMPORTED_MODULE_2__.isTruthy), (0,_string_js__WEBPACK_IMPORTED_MODULE_3__.split)(/[,[/\].]+?/), (0,_string_js__WEBPACK_IMPORTED_MODULE_3__.replace)(/['|"]/g, '')); // getRes :: [s] -> any

  const getRes = (0,_array_js__WEBPACK_IMPORTED_MODULE_1__.reduce)((res, path) => (0,_boolean_js__WEBPACK_IMPORTED_MODULE_2__.isNil)(res) ? res : res[path], obj);
  const result = getRes(getPathArray(path)); // return result === undefined || result === obj ? defaultValue : result

  return result;
});
/**
 * @param path String | Array
 * @param obj Object
 * @return Any
 */

const getByPath = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((path, obj) => {
  const getPathArray = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.compose)((0,_array_js__WEBPACK_IMPORTED_MODULE_1__.filter)(_boolean_js__WEBPACK_IMPORTED_MODULE_2__.isTruthy), (0,_string_js__WEBPACK_IMPORTED_MODULE_3__.split)(/[,./[\]\\]/g), (0,_string_js__WEBPACK_IMPORTED_MODULE_3__.replace)(/['|"]/g, ''));
  const getRes = (0,_array_js__WEBPACK_IMPORTED_MODULE_1__.reduce)((res, path) => (0,_boolean_js__WEBPACK_IMPORTED_MODULE_2__.isNil)(res) ? res : res[path], obj);
  const result = getRes(getPathArray(path));
  return result;
});
const emptifyObj = obj => {
  for (const key in obj) {
    if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj[key])) {
      emptifyObj(obj[key]);
    } else {
      delete obj[key];
    }
  }

  return obj;
};
const deepCopyViaJSON = obj => JSON.parse(JSON.stringify(obj)); // @refer to: https://github.com/davidmarkclements/rfdc/blob/master/index.js

const deepCopy = obj => {
  if (!(0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj)) {
    return obj;
  }

  const newObj = (0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(obj) ? [] : {};

  for (const key in obj) {
    if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(obj[key])) {
      newObj[key] = deepCopy(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }

  return newObj;
};
const hardDeepMerge = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((target, source) => {
  if (!(0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(target) || !(0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(source)) {
    return target;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(targetValue) && (0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(sourceValue)) {
      target[key] = deepCopy(sourceValue);
    } else if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(targetValue) && (0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(sourceValue)) {
      target[key] = hardDeepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
});
const smartDeepMerge = (target, source) => {
  if (!(0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(target) || !(0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(source)) {
    return target;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(targetValue) && (0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isArray)(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if ((0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(targetValue) && (0,_base_js__WEBPACK_IMPORTED_MODULE_4__.isObject)(sourceValue)) {
      target[key] = smartDeepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
}; // mapProps
// omit
// pick

/***/ }),

/***/ "./src/es/internal/regexp.js":
/*!***********************************!*\
  !*** ./src/es/internal/regexp.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isPhoneNum": () => (/* binding */ isPhoneNum),
/* harmony export */   "isTelNum": () => (/* binding */ isTelNum),
/* harmony export */   "isQQId": () => (/* binding */ isQQId),
/* harmony export */   "isEmailAddress": () => (/* binding */ isEmailAddress)
/* harmony export */ });
const isPhoneNum = v => /^1[3-9]\d{9}$/.test(v);
const isTelNum = v => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(v);
const isQQId = v => /^[1-9][0-9]{4,10}$/.test(v);
const isEmailAddress = v => /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(v);

/***/ }),

/***/ "./src/es/internal/string.js":
/*!***********************************!*\
  !*** ./src/es/internal/string.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "toString": () => (/* binding */ toString),
/* harmony export */   "toLowerCase": () => (/* binding */ toLowerCase),
/* harmony export */   "toUpperCase": () => (/* binding */ toUpperCase),
/* harmony export */   "trim": () => (/* binding */ trim),
/* harmony export */   "trimRight": () => (/* binding */ trimRight),
/* harmony export */   "trimLeft": () => (/* binding */ trimLeft),
/* harmony export */   "indexOf": () => (/* binding */ indexOf),
/* harmony export */   "split": () => (/* binding */ split),
/* harmony export */   "replace": () => (/* binding */ replace),
/* harmony export */   "isStartWith": () => (/* binding */ isStartWith),
/* harmony export */   "isAllSpace": () => (/* binding */ isAllSpace),
/* harmony export */   "randomString": () => (/* binding */ randomString)
/* harmony export */ });
/* harmony import */ var _functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functional/helpers.js */ "./src/es/functional/helpers.js");

const toString = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'toString');
const toLowerCase = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'toLowerCase');
const toUpperCase = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'toUpperCase');
const trim = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'trim');
const trimRight = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'trimRight');
const trimLeft = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(1, 'trimLeft');
const indexOf = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'indexOf');
const split = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(2, 'split');
const replace = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.invoker)(3, 'replace');
const isStartWith = (0,_functional_helpers_js__WEBPACK_IMPORTED_MODULE_0__.curry)((substr, str) => indexOf(substr, str) === 0);
const isAllSpace = str => !!trim(str);
const _randomPacket = {};
const randomString = (length, chars) => {
  let result = '';
  chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

  _randomPacket[length] = _randomPacket[length] || [];
  const packet = _randomPacket[length];

  if (packet.includes(result)) {
    return randomString();
  } else {
    packet.push(result);
    return result;
  }
};

/***/ }),

/***/ "./src/es/semantic.js":
/*!****************************!*\
  !*** ./src/es/semantic.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "semantic": () => (/* binding */ semantic)
/* harmony export */ });
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functional.js */ "./src/es/functional/helpers.js");
/* harmony import */ var _functional_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functional.js */ "./src/es/functional/combinators.js");

const semantic = {
  equiped: _functional_js__WEBPACK_IMPORTED_MODULE_0__.composeL,
  equip: _functional_js__WEBPACK_IMPORTED_MODULE_1__.applyTo
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _es_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./es/index.js */ "./src/es/index.js");

console.error(_es_index_js__WEBPACK_IMPORTED_MODULE_0__);
})();

/******/ })()
;
//# sourceMappingURL=index.js.map