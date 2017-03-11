# Ajax

## Usage

```js
var request = ajax({
  method: 'post',
  url: '/api/users',
  type: 'json',
  headers: {
    'content-type': 'application/json',
    'x-custom-header': 'custom'
  },
  data: {
    user: 'john'
  },
  success: function(response) {
    console.log('success callback');
  },
  error: function(response) {
    console.log('error callback');
  },
  complete: function(response) {
    console.log('always executed callback');
  }
}).then(function (response) {   // Promise that returns if the request was successful
  console.log('success promise');
}).catch(function (response) {  // Promise that returns if the request was not successful
  console.log('error promise');
}).then(function (response) {   // You can call again the successful promise
  console.log('success promise');
}).catch(function (response) {  // .. or the error promise
  console.log('error promise');
}).all(function (response) {    // The promise wil always be executed
  console.log('always executed promise');
});
```

## Additional info

The ajax is fully customizable: you can define the default headers, type, method, url and many others.
```js
// just set your defaults before using ajax:
ajax.type = 'json';
ajax.method = 'post';
```
If you don't link the name of the callback functions or the name of the promises, then you can change them:
```js
ajax.success = 'successCallback';
ajax.error = 'errorCallback';
ajax.complete = 'completeCallback';
ajax.then = 'then';
ajax.catch = 'fail';
ajax.all = 'always';
```
