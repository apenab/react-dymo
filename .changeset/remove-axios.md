---
"react-dymo-hooks": major
---

# Remove axios Dependency - Native Fetch API

Replaced axios with native Fetch API, eliminating an external dependency and reducing bundle size.

## Breaking Changes

- **API Response Type**: `dymoRequestBuilder` now returns `DymoResponse` instead of `AxiosResponse`
  - Changed properties: `response.data` remains the same
  - Added: `status`, `statusText`, `url` properties
- **Cancellation**: Replace `axios.CancelToken` with `AbortController` (standard Web API)
  - Use `signal` parameter instead of `cancelToken`
  - Use `isRequestCancelled()` instead of `axios.isCancel()`
- **Error Handling**: New `RequestCancelledError` class for cancelled requests

## New Features

- ✨ Zero external HTTP dependencies - uses native browser Fetch API
- 📦 **~40KB smaller bundle** - removed axios dependency
- 🌐 Standards-based AbortController for request cancellation
- 🎯 New exports: `isRequestCancelled()`, `RequestCancelledError`, `DymoResponse` type
- 🔧 Simplified request configuration with native `RequestInit`

## Migration Guide

### For TypeScript Users

```typescript
// Before (v2.x with axios)
import { CancelToken } from "axios";
const source = axios.CancelToken.source();

dymoRequestBuilder({
  method: "GET",
  wsAction: "status",
  cancelToken: source.token,
});

// After (v3.x with fetch)
const controller = new AbortController();

dymoRequestBuilder({
  method: "GET",
  wsAction: "status",
  signal: controller.signal,
});

// Cancel request
controller.abort();
```

### Checking for Cancellation

```typescript
// Before
import axios from "axios";
if (axios.isCancel(error)) { ... }

// After
import { isRequestCancelled } from "react-dymo-hooks";
if (isRequestCancelled(error)) { ... }
```

### Custom Request Options

```typescript
// Before (axios)
dymoRequestBuilder({
  method: "POST",
  wsAction: "printLabel",
  axiosOtherParams: {
    data: formData,
  },
});

// After (fetch)
dymoRequestBuilder({
  method: "POST",
  wsAction: "printLabel",
  fetchOptions: {
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  },
});
```

## Technical Changes

- Replaced `axios.get()` and `axios.request()` with native `fetch()`
- Implemented custom retry logic using `fetch()`
- AbortController for request cancellation (standard Web API)
- Custom `RequestCancelledError` for handling abort signals
- Updated all React hooks to use AbortController instead of CancelToken

## Non-Breaking Changes

- All React hooks maintain the same API
- Request discovery and retry logic unchanged
- Test coverage maintained (43 passing tests)
- All utility functions work identically

## Benefits

- **Smaller bundle**: ~40KB reduction by removing axios
- **Modern standards**: Uses native Fetch API and AbortController
- **Better tree-shaking**: No external HTTP library
- **Faster load times**: Less code to download and parse
- **Future-proof**: Built on web standards

## Compatibility

- Requires browsers with Fetch API support (all modern browsers)
- Node.js 18+ (native fetch support)
- Older browsers can use fetch polyfill if needed
