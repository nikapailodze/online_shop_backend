const path = require('path');

function withMocks(modulePath, mocks) {
  const resolvedModulePath = require.resolve(modulePath);
  const baseDir = path.dirname(resolvedModulePath);
  const originals = new Map();

  for (const [request, exports] of Object.entries(mocks)) {
    const resolvedDependency = require.resolve(request, { paths: [baseDir] });
    originals.set(resolvedDependency, require.cache[resolvedDependency]);
    require.cache[resolvedDependency] = {
      id: resolvedDependency,
      filename: resolvedDependency,
      loaded: true,
      exports,
    };
  }

  delete require.cache[resolvedModulePath];
  const loaded = require(resolvedModulePath);

  return {
    loaded,
    restore() {
      delete require.cache[resolvedModulePath];
      for (const [resolvedDependency, original] of originals.entries()) {
        if (original) {
          require.cache[resolvedDependency] = original;
        } else {
          delete require.cache[resolvedDependency];
        }
      }
    },
  };
}

module.exports = { withMocks };
