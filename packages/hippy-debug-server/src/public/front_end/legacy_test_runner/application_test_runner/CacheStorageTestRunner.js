// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.ApplicationTestRunner = self.ApplicationTestRunner || {};

ApplicationTestRunner.dumpCacheTree = async function(pathFilter) {
  UI.panels.resources._sidebar.cacheStorageListTreeElement.expand();
  const promise = TestRunner.addSnifferPromise(SDK.ServiceWorkerCacheModel.prototype, '_updateCacheNames');
  UI.panels.resources._sidebar.cacheStorageListTreeElement.refreshCaches();
  await promise;
  await ApplicationTestRunner.dumpCacheTreeNoRefresh(pathFilter);
};

ApplicationTestRunner.dumpCacheTreeNoRefresh = async function(pathFilter) {
  function _dumpDataGrid(dataGrid) {
    for (const node of dataGrid.rootNode().children) {
      const children = Array.from(node.element().children).filter(function(element) {
        return !element.classList.contains('responseTime-column');
      });

      const entries = Array.from(children, td => td.textContent).filter(text => text);
      TestRunner.addResult(' '.repeat(8) + entries.join(', '));
    }
  }
  UI.panels.resources._sidebar.cacheStorageListTreeElement.expand();

  if (!pathFilter) {
    TestRunner.addResult('Dumping CacheStorage tree:');
  } else {
    TestRunner.addResult('Dumping CacheStorage tree with URL path filter string "' + pathFilter + '"');
  }

  const cachesTreeElement = UI.panels.resources._sidebar.cacheStorageListTreeElement;

  if (!cachesTreeElement.childCount()) {
    TestRunner.addResult('    (empty)');
    return;
  }

  for (let i = 0; i < cachesTreeElement.childCount(); ++i) {
    const cacheTreeElement = cachesTreeElement.childAt(i);
    TestRunner.addResult('    cache: ' + cacheTreeElement.title);
    let view = cacheTreeElement.view;

    if (!view) {
      cacheTreeElement.onselect(false);
    }
    view = cacheTreeElement.view;
    await view._updateData(true);
    if (cacheTreeElement.view._entriesForTest.length === 0) {
      TestRunner.addResult('        (cache empty)');
      continue;
    }

    if (!pathFilter) {
      _dumpDataGrid(view._dataGrid);
      TestRunner.addResult('        totalCount: ' + String(view._returnCount));
      continue;
    }

    cacheTreeElement.view._entryPathFilter = pathFilter;
    await view._updateData(true);
    if (cacheTreeElement.view._entriesForTest.length === 0) {
      TestRunner.addResult('        (no matching entries)');
      continue;
    }

    _dumpDataGrid(cacheTreeElement.view._dataGrid);
    TestRunner.addResult('        totalCount: ' + String(view._returnCount));
  }
};

ApplicationTestRunner.dumpCachedEntryContent = async function(cacheName, requestUrl, withHeader) {
  UI.panels.resources._sidebar.cacheStorageListTreeElement.expand();
  const promise = TestRunner.addSnifferPromise(SDK.ServiceWorkerCacheModel.prototype, '_updateCacheNames');
  UI.panels.resources._sidebar.cacheStorageListTreeElement.refreshCaches();
  await promise;
  await ApplicationTestRunner.dumpCachedEntryContentNoRefresh(cacheName, requestUrl, withHeader);
};

ApplicationTestRunner.dumpCachedEntryContentNoRefresh = async function(cacheName, requestUrl, withHeader) {
  UI.panels.resources._sidebar.cacheStorageListTreeElement.expand();

  TestRunner.addResult('Dumping ' + cacheName + '\'s entry with request URL: ' + requestUrl);

  const cachesTreeElement = UI.panels.resources._sidebar.cacheStorageListTreeElement;

  for (let i = 0; i < cachesTreeElement.childCount(); ++i) {
    const cacheTreeElement = cachesTreeElement.childAt(i);
    if (cacheTreeElement.title.split(' ')[0] !== cacheName) {
      continue;
    }

    let view = cacheTreeElement.view;
    if (!view) {
      cacheTreeElement.onselect(false);
    }
    view = cacheTreeElement.view;
    await view._updateData(true);

    const promiseDumpContent = new Promise(resolve => {
      view._model.loadCacheData(view._cache, 0, 50, '', async function(entries, totalCount) {
        for (const entry of entries) {
          if (entry.requestURL !== requestUrl) {
            continue;
          }

          const request = view._createRequest(entry);
          if (request.requestHeaders().length) {
            TestRunner.addResult('    the original request has headers; query with headers? ' + withHeader);
            if (!withHeader) {
              request.setRequestHeaders([]);
            }
          }
          const contentObject = await view._requestContent(request);
          const content = contentObject.content;
          TestRunner.addResult(' '.repeat(8) + (content ? content : '(nothing to preview)'));
        }
        resolve();
      });
    });
    await promiseDumpContent;
  }
};

ApplicationTestRunner.deleteCacheFromInspector = async function(cacheName, optionalEntry) {
  UI.panels.resources._sidebar.cacheStorageListTreeElement.expand();

  if (optionalEntry) {
    TestRunner.addResult('Deleting CacheStorage entry ' + optionalEntry + ' in cache ' + cacheName);
  } else {
    TestRunner.addResult('Deleting CacheStorage cache ' + cacheName);
  }

  const cachesTreeElement = UI.panels.resources._sidebar.cacheStorageListTreeElement;
  let promise = TestRunner.addSnifferPromise(SDK.ServiceWorkerCacheModel.prototype, '_updateCacheNames');
  UI.panels.resources._sidebar.cacheStorageListTreeElement.refreshCaches();
  await promise;

  if (!cachesTreeElement.childCount()) {
    throw 'Error: Could not find CacheStorage cache ' + cacheName;
  }


  for (let i = 0; i < cachesTreeElement.childCount(); i++) {
    const cacheTreeElement = cachesTreeElement.childAt(i);
    const title = cacheTreeElement.title;
    const elementCacheName = title.substring(0, title.lastIndexOf(' - '));

    if (elementCacheName !== cacheName) {
      continue;
    }

    if (!optionalEntry) {
      promise = TestRunner.addSnifferPromise(SDK.ServiceWorkerCacheModel.prototype, '_cacheRemoved');
      cacheTreeElement.clearCache();
      await promise;
      return;
    }

    promise = TestRunner.addSnifferPromise(Resources.ServiceWorkerCacheView.prototype, '_updateDataCallback');
    let view = cacheTreeElement.view;

    if (!view) {
      cacheTreeElement.onselect(false);
    } else {
      view._updateData(true);
    }

    view = cacheTreeElement.view;
    await promise;
    const entry = view._entriesForTest.find(entry => entry.requestURL === optionalEntry);

    if (!entry) {
      throw 'Error: Could not find cache entry to delete: ' + optionalEntry;
    }

    await view._model.deleteCacheEntry(view._cache, entry.requestURL);
    return;
  }

  throw 'Error: Could not find CacheStorage cache ' + cacheName;
};

ApplicationTestRunner.waitForCacheRefresh = function(callback) {
  TestRunner.addSniffer(SDK.ServiceWorkerCacheModel.prototype, '_updateCacheNames', callback, false);
};

ApplicationTestRunner.createCache = function(cacheName) {
  return TestRunner.callFunctionInPageAsync('createCache', [cacheName]);
};

ApplicationTestRunner.addCacheEntry = function(cacheName, requestUrl, responseText) {
  return TestRunner.callFunctionInPageAsync('addCacheEntryImpl', [cacheName, requestUrl, responseText, 'text/plain']);
};

ApplicationTestRunner.addCacheEntryWithBlobType = function(cacheName, requestUrl, blobType) {
  return TestRunner.callFunctionInPageAsync('addCacheEntryImpl', [cacheName, requestUrl, 'OK', blobType]);
};

ApplicationTestRunner.addCacheEntryWithVarsResponse = function(cacheName, requestUrl) {
  return TestRunner.callFunctionInPageAsync('addCacheEntryWithVarsResponse', [cacheName, requestUrl]);
};

ApplicationTestRunner.addCacheEntryWithNoCorsRequest = function(cacheName, requestUrl) {
  return TestRunner.callFunctionInPageAsync('addCacheEntryWithNoCorsRequest', [cacheName, requestUrl]);
};

ApplicationTestRunner.deleteCache = function(cacheName) {
  return TestRunner.callFunctionInPageAsync('deleteCache', [cacheName]);
};

ApplicationTestRunner.deleteCacheEntry = function(cacheName, requestUrl) {
  return TestRunner.callFunctionInPageAsync('deleteCacheEntry', [cacheName, requestUrl]);
};

ApplicationTestRunner.clearAllCaches = function() {
  return TestRunner.callFunctionInPageAsync('clearAllCaches');
};

TestRunner.deprecatedInitAsync(`
  function onCacheStorageError(e) {
    console.error('CacheStorage error: ' + e);
  }

  function createCache(cacheName) {
    return caches.open(cacheName).catch(onCacheStorageError);
  }

  function addCacheEntryImpl(cacheName, requestUrl, responseText, blobType) {
    return caches.open(cacheName).then(function(cache) {
      let request = new Request(requestUrl);
      let myBlob = new Blob(['Y'], { 'type': blobType });

      let init = {
        'status': 200,
        'statusText': responseText
      };

      let response = new Response(myBlob, init);
      return cache.put(request, response);
    }).catch(onCacheStorageError);
  }

  function addCacheEntryWithVarsResponse(cacheName, requestUrl) {
    return caches.open(cacheName).then(function(cache) {
      let request = new Request(requestUrl, {
        headers: { 'Accept': '*/*' }
      });
      let myBlob = new Blob(['Z'], { "type": 'text/plain' });

      let init = {
        'headers': { 'Vary': 'Accept' },
      };

      let response = new Response(myBlob, init);
      return cache.put(request, response);
    }).catch(onCacheStorageError);
  }

  function addCacheEntryWithNoCorsRequest(cacheName, requestUrl) {
    return caches.open(cacheName).then(async function(cache) {
      let request = new Request(requestUrl, {mode: 'no-cors'});
      return cache.put(request, await fetch(request));
    }).catch(onCacheStorageError);
  }

  function deleteCache(cacheName) {
    return caches.delete(cacheName).then(function(success) {
      if (!success)
        onCacheStorageError('Could not find cache ' + cacheName);
    }).catch(onCacheStorageError);
  }

  function deleteCacheEntry(cacheName, requestUrl) {
    return caches.open(cacheName).then(cache => cache.delete(new Request(requestUrl))).catch(onCacheStorageError);
  }

  function clearAllCaches() {
    return caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(onCacheStorageError.bind(this, undefined));
  }
`);
