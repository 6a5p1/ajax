(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["ajax"], factory);
    } else if(typeof module === "object" && module.exports) {
        module.exports = factory(require("ajax"));
    } else {
        root.myModule = factory(root.ajax);
    }
}(this, function() {

    'use strict';

    function ajax(o) {
        o = o || {};
        var url = o.url || ajax.url;
        var method = o.method || ajax.method;
        var type = o.type || ajax.type;
        var headers = getHeaders(ajax.headers, o.headers || {});
        var withCredentials = o.hasOwnProperty('withCredentials');

        if (o.data && method.toLowerCase() == 'get') {
            url += (url.indexOf('?') == -1 ? '?' : '&') + jsonToQueryString(o.data);
        }

        var promiseCallbacks = {};
        promiseCallbacks[ajax.then] = o[ajax.success] && [o[ajax.success]] || [];
        promiseCallbacks[ajax.catch] = o[ajax.error] && [o[ajax.error]] || [];
        promiseCallbacks[ajax.all] = o[ajax.complete] && [o[ajax.complete]] || [];

        var promises = getPromises(promiseCallbacks);

        initRequest(method, url, type, o.data, headers, withCredentials, promiseCallbacks);

        return promises;
    }

    function initRequest(method, url, type, data, headers, withCredentials, promises) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.withCredentials = withCredentials;
        Object.keys(headers).forEach(function(key) {
            if (headers[key]) xhr.setRequestHeader(key, headers[key]);
        });
        xhr.addEventListener('readystatechange', ready(promises, xhr, type), false);
        xhr.send(jsonToQueryString(data));
    }

    function getPromises(a) {
        var obj = {};
        [ajax.then, ajax.catch, ajax.all].forEach(function(m) {
            obj[m] = function(callback) {
                a[m] = a[m] || [];
                a[m].push(callback);
                return getPromises(a);
            };
        });
        return obj;
    }

    function getHeaders(globalHeaders, localHeaders) {
        var key, HEADERS = {
            'Content-Type': ajax.contentType
        };
        for (key in globalHeaders) {
            HEADERS[key] = globalHeaders[key];
        }
        for (key in localHeaders) {
            HEADERS[key] = localHeaders[key];
        }
        return HEADERS;
    }

    function ready(promiseMethods, xhr, type) {
        return function handleReady() {
            if (xhr.readyState === xhr.DONE) {
                xhr.removeEventListener('readystatechange', handleReady, false);
                var r = getResponse(type, xhr);
                var toCallback = [r.response, xhr];
                if (xhr.status >= 200 && xhr.status < 300 && r.successfull) {
                    promiseMethods[ajax.then].forEach(function(promise) {
                        promise.apply(promiseMethods, toCallback);
                    });
                } else {
                    promiseMethods[ajax.catch].forEach(function(promise) {
                        promise.apply(promiseMethods, toCallback);
                    });
                }
                promiseMethods[ajax.all].forEach(function(promise) {
                    promise.apply(promiseMethods, toCallback);
                });
            }
        };
    }

    function getResponse(type, xhr) {
        var response, cool = true;
        if (type == 'json') {
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                response = xhr.responseText;
                cool = false;
            }
        }
        return {
            response: response,
            successfull: cool
        };
    }

    function jsonToQueryString(json) {
        return typeof json == 'object' && json && Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
        }).join('&') || json;
    }

    ajax.headers = {};
    ajax.type = 'json';
    ajax.method = 'get';
    ajax.url = '';
    ajax.success = 'success';
    ajax.error = 'error';
    ajax.complete = 'complete';
    ajax.then = 'then';
    ajax.catch = 'catch';
    ajax.all = 'all';
    ajax.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';

    return ajax;
}));