'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sameDay = sameDay;
exports.compareVersions = compareVersions;
/**
 * Created by Danny on 7/19/16.
 */
function sameDay(day1, day2) {
  return day1.getUTCFullYear() == day2.getFullYear() && day1.getUTCMonth() == day2.getUTCMonth() && day1.getUTCDate() == day2.getUTCDate();
}
function compareVersions(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
      zeroExtend = true,
      v1parts = v1.split('.'),
      v2parts = v2.split('.');

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) {
      v1parts.push("0");
    }while (v2parts.length < v1parts.length) {
      v2parts.push("0");
    }
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}
//# sourceMappingURL=Utils.js.map
