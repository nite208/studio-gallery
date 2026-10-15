var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-1ygq8m/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// _lib/env.ts
var requiredEnvKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ADMIN_PASSWORD",
  "SESSION_SECRET"
];
function validateEnv(rawEnv) {
  for (const key of requiredEnvKeys) {
    const value = rawEnv[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
  const folderValue = rawEnv["CLOUDINARY_FOLDER"];
  const folder = typeof folderValue === "string" && folderValue.trim() !== "" ? folderValue.trim() : "studio-gallery";
  return {
    CLOUDINARY_CLOUD_NAME: rawEnv["CLOUDINARY_CLOUD_NAME"].trim(),
    CLOUDINARY_API_KEY: rawEnv["CLOUDINARY_API_KEY"].trim(),
    CLOUDINARY_API_SECRET: rawEnv["CLOUDINARY_API_SECRET"].trim(),
    CLOUDINARY_FOLDER: folder,
    ADMIN_PASSWORD: rawEnv["ADMIN_PASSWORD"].trim(),
    SESSION_SECRET: rawEnv["SESSION_SECRET"].trim()
  };
}
__name(validateEnv, "validateEnv");

// _lib/errors.ts
function createAppError(code, message, status) {
  return {
    code,
    message,
    status
  };
}
__name(createAppError, "createAppError");

// _lib/http.ts
function jsonResponse(data, status = 200, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(error, headers) {
  const body = {
    error: {
      code: error.code,
      message: error.message
    }
  };
  return jsonResponse(body, error.status, headers);
}
__name(errorResponse, "errorResponse");

// _lib/auth.ts
var SESSION_COOKIE_NAME = "admin_session";
var SESSION_DURATION_SECONDS = 12 * 60 * 60;
function bufferToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(bufferToBase64Url, "bufferToBase64Url");
function base64UrlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(base64UrlToBuffer, "base64UrlToBuffer");
async function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const aHash = await crypto.subtle.digest("SHA-256", encoder.encode(a));
  const bHash = await crypto.subtle.digest("SHA-256", encoder.encode(b));
  const aBuf = new Uint8Array(aHash);
  const bBuf = new Uint8Array(bHash);
  let mismatch = 0;
  for (let i = 0; i < aBuf.length; i++) {
    mismatch |= (aBuf[i] ?? 0) ^ (bBuf[i] ?? 0);
  }
  return mismatch === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
async function createSessionToken(secret, durationSeconds = SESSION_DURATION_SECONDS) {
  const encoder = new TextEncoder();
  const exp = Math.floor(Date.now() / 1e3) + durationSeconds;
  const payloadJson = JSON.stringify({ exp });
  const payloadPart = bufferToBase64Url(encoder.encode(payloadJson));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
  const signaturePart = bufferToBase64Url(new Uint8Array(signatureBuffer));
  return `${payloadPart}.${signaturePart}`;
}
__name(createSessionToken, "createSessionToken");
async function verifySessionToken(token, secret) {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    return false;
  }
  const payloadPart = token.slice(0, dotIndex);
  const signaturePart = token.slice(dotIndex + 1);
  if (payloadPart.length === 0 || signaturePart.length === 0) {
    return false;
  }
  const encoder = new TextEncoder();
  let signatureBytes;
  try {
    signatureBytes = base64UrlToBuffer(signaturePart);
  } catch {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const isValidSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(payloadPart)
  );
  if (!isValidSignature) {
    return false;
  }
  try {
    const payloadBytes = base64UrlToBuffer(payloadPart);
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes));
    if (typeof payload.exp !== "number") {
      return false;
    }
    const nowInSeconds = Math.floor(Date.now() / 1e3);
    return payload.exp > nowInSeconds;
  } catch {
    return false;
  }
}
__name(verifySessionToken, "verifySessionToken");
function createSessionCookie(token, isSecure) {
  const secureFlag = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secureFlag}`;
}
__name(createSessionCookie, "createSessionCookie");
function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
__name(clearSessionCookie, "clearSessionCookie");
function extractSessionCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === SESSION_COOKIE_NAME) {
      return valueParts.join("=");
    }
  }
  return null;
}
__name(extractSessionCookie, "extractSessionCookie");

// api/auth/login.ts
async function onRequestPost(context) {
  const env = validateEnv(context.env);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorResponse(createAppError("INVALID_REQUEST", "Invalid request body", 400));
  }
  if (typeof body.password !== "string") {
    return errorResponse(createAppError("INVALID_CREDENTIALS", "Invalid credentials", 401));
  }
  const isMatch = await timingSafeEqual(body.password, env.ADMIN_PASSWORD);
  if (!isMatch) {
    return errorResponse(createAppError("INVALID_CREDENTIALS", "Invalid credentials", 401));
  }
  const token = await createSessionToken(env.SESSION_SECRET);
  const url = new URL(context.request.url);
  const isSecure = url.protocol === "https:";
  const cookie = createSessionCookie(token, isSecure);
  return jsonResponse(
    { authenticated: true },
    200,
    {
      "Set-Cookie": cookie
    }
  );
}
__name(onRequestPost, "onRequestPost");

// api/auth/logout.ts
async function onRequestPost2(_context) {
  return jsonResponse(
    { authenticated: false },
    200,
    {
      "Set-Cookie": clearSessionCookie()
    }
  );
}
__name(onRequestPost2, "onRequestPost");

// api/auth/session.ts
async function onRequestGet(context) {
  const env = validateEnv(context.env);
  const cookieHeader = context.request.headers.get("Cookie");
  const token = extractSessionCookie(cookieHeader);
  if (!token) {
    return jsonResponse({ authenticated: false });
  }
  const isValid = await verifySessionToken(token, env.SESSION_SECRET);
  return jsonResponse({ authenticated: isValid });
}
__name(onRequestGet, "onRequestGet");

// _lib/cloudinary.ts
function generateRandomPublicId() {
  return crypto.randomUUID().replace(/-/g, "");
}
__name(generateRandomPublicId, "generateRandomPublicId");
async function buildUploadSignature(params, apiSecret) {
  const excluded = /* @__PURE__ */ new Set(["file", "cloud_name", "resource_type", "api_key", "signature"]);
  const serialized = Object.keys(params).filter((k) => !excluded.has(k)).sort().map((k) => `${k}=${params[k]}`).join("&");
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${serialized}${apiSecret}`)
  );
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(buildUploadSignature, "buildUploadSignature");
async function fetchAllPhotosInFolder(cloudName, apiKey, apiSecret, folder) {
  const photos = [];
  let nextCursor = void 0;
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  do {
    const searchBody = {
      expression: `asset_folder="${folder}" AND resource_type:image`,
      sort_by: [{ created_at: "desc" }],
      max_results: 100,
      ...nextCursor ? { next_cursor: nextCursor } : {}
    };
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(searchBody)
    });
    if (!response.ok) {
      throw new Error(`Cloudinary search failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data.resources) {
      for (const res of data.resources) {
        photos.push({
          publicId: res.public_id,
          width: res.width,
          height: res.height,
          createdAt: res.created_at
        });
      }
    }
    nextCursor = data.next_cursor;
  } while (nextCursor);
  return photos;
}
__name(fetchAllPhotosInFolder, "fetchAllPhotosInFolder");
async function getCloudinaryResource(cloudName, apiKey, apiSecret, publicId) {
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  const encodedId = encodeURIComponent(publicId);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodedId}`,
    { method: "GET", headers: { Authorization: auth } }
  );
  if (response.status === 404) {
    return { status: "not_found" };
  }
  if (!response.ok) {
    return {
      status: "error",
      message: `Cloudinary get resource failed with status ${response.status}`
    };
  }
  const data = await response.json();
  return { status: "found", resource: data };
}
__name(getCloudinaryResource, "getCloudinaryResource");
async function deleteCloudinaryPhoto(cloudName, apiKey, apiSecret, publicId) {
  const auth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId })
  });
  if (!response.ok) {
    throw new Error(`Cloudinary destroy failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.result === "ok";
}
__name(deleteCloudinaryPhoto, "deleteCloudinaryPhoto");

// api/photos/sign.ts
async function onRequestPost3(context) {
  const env = validateEnv(context.env);
  const cookieHeader = context.request.headers.get("Cookie");
  const token = extractSessionCookie(cookieHeader);
  if (!token) {
    return errorResponse(createAppError("UNAUTHORIZED", "Authentication required", 401));
  }
  const isAuthenticated = await verifySessionToken(token, env.SESSION_SECRET);
  if (!isAuthenticated) {
    return errorResponse(createAppError("UNAUTHORIZED", "Authentication required", 401));
  }
  const timestamp = Math.floor(Date.now() / 1e3);
  const assetFolder = env.CLOUDINARY_FOLDER;
  const publicId = generateRandomPublicId();
  const signature = await buildUploadSignature(
    {
      asset_folder: assetFolder,
      public_id: publicId,
      timestamp
    },
    env.CLOUDINARY_API_SECRET
  );
  return jsonResponse({
    signature,
    timestamp,
    asset_folder: assetFolder,
    public_id: publicId,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME
  });
}
__name(onRequestPost3, "onRequestPost");

// api/health.ts
async function onRequestGet2(_context) {
  return jsonResponse({ status: "ok" });
}
__name(onRequestGet2, "onRequestGet");

// api/photos/index.ts
async function onRequestGet3(context) {
  const env = validateEnv(context.env);
  const url = new URL(context.request.url);
  const cacheKey = new Request(new URL("/api/photos", url).toString(), {
    method: "GET"
  });
  const isFreshRequested = url.searchParams.get("fresh") === "1";
  let shouldBypassCache = false;
  if (isFreshRequested) {
    const cookieHeader = context.request.headers.get("Cookie");
    const token = extractSessionCookie(cookieHeader);
    if (token) {
      const isAuthenticated = await verifySessionToken(token, env.SESSION_SECRET);
      if (isAuthenticated) {
        shouldBypassCache = true;
      }
    }
  }
  const cache = typeof caches !== "undefined" && "default" in caches ? caches.default : void 0;
  if (!shouldBypassCache && cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }
  const photos = await fetchAllPhotosInFolder(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    env.CLOUDINARY_FOLDER
  );
  const response = jsonResponse(
    {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      photos
    },
    200,
    {
      "Cache-Control": "public, max-age=60"
    }
  );
  if (cache) {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}
__name(onRequestGet3, "onRequestGet");
async function onRequestDelete(context) {
  const env = validateEnv(context.env);
  const cookieHeader = context.request.headers.get("Cookie");
  const token = extractSessionCookie(cookieHeader);
  if (!token) {
    return errorResponse(createAppError("UNAUTHORIZED", "Authentication required", 401));
  }
  const isAuthenticated = await verifySessionToken(token, env.SESSION_SECRET);
  if (!isAuthenticated) {
    return errorResponse(createAppError("UNAUTHORIZED", "Authentication required", 401));
  }
  let body;
  try {
    body = await context.request.json();
  } catch {
    return errorResponse(createAppError("INVALID_REQUEST", "Invalid request body", 400));
  }
  if (typeof body.publicId !== "string" || body.publicId.trim() === "") {
    return errorResponse(createAppError("INVALID_REQUEST", "Missing publicId", 400));
  }
  const publicId = body.publicId.trim();
  const lookupResult = await getCloudinaryResource(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    publicId
  );
  if (lookupResult.status === "not_found") {
    return errorResponse(createAppError("NOT_FOUND", "Photo not found", 404));
  }
  if (lookupResult.status === "error") {
    return errorResponse(createAppError("UPSTREAM_ERROR", lookupResult.message, 502));
  }
  if (lookupResult.resource.asset_folder !== env.CLOUDINARY_FOLDER) {
    return errorResponse(
      createAppError("FORBIDDEN", "Access denied to asset in another folder", 403)
    );
  }
  await deleteCloudinaryPhoto(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    publicId
  );
  const cache = typeof caches !== "undefined" && "default" in caches ? caches.default : void 0;
  if (cache) {
    const cacheKey = new Request(new URL("/api/photos", context.request.url).toString(), {
      method: "GET"
    });
    context.waitUntil(cache.delete(cacheKey));
  }
  return jsonResponse({ success: true });
}
__name(onRequestDelete, "onRequestDelete");

// ../.wrangler/tmp/pages-WZOuVL/functionsRoutes-0.3577361339858861.mjs
var routes = [
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth/session",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/photos/sign",
    mountPath: "/api/photos",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/photos",
    mountPath: "/api/photos",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/photos",
    mountPath: "/api/photos",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-1ygq8m/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-1ygq8m/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.36011811658551784.mjs.map
