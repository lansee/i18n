"use strict";
if (!String.prototype.codePointAt) {
  (function () {
    var codePointAt = function (position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      var index = position ? Number(position) : 0;
      if (index != index) {
        index = 0;
      }
      if (index < 0 || index >= size) {
        return undefined;
      }
      var first = string.charCodeAt(index);
      var second;
      if (first >= 0xD800 && first <= 0xDBFF &&
        size > index + 1) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) {
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    };
    if (Object.defineProperty) {
      Object.defineProperty(String.prototype, "codePointAt", {
        "value": codePointAt,
        "configurable": true,
        "writable": true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  }());
}
var chineseRange = [
  [0x4e00, 0x9fff],
  [0x3400, 0x4dbf],
  [0x20000, 0x2a6df],
  [0x2a700, 0x2b73f],
  [0x2b740, 0x2b81f],
  [0x2b820, 0x2ceaf],
  [0xf900, 0xfaff],
  [0x3300, 0x33ff],
  [0xfe30, 0xfe4f],
  [0xf900, 0xfaff],
  [0x2f800, 0x2fa1f],
];
exports.isChinese = function (str) {
  if (str) {
    var charCode;
    var range;
    for (var i = 0; i < str.length; i++) {
      charCode = str.codePointAt(i);
      for (var j = 0; j < chineseRange.length; j++) {
        range = chineseRange[j];
        if (charCode >= range[0] && charCode <= range[1]) {
          return true;
        }
      }
    }
  }
};
exports.isObject = function (data) {
  return Object.prototype.toString.call(data) === "[object Object]";
};
exports.isConcat = function (data) {
  return data.type === "BinaryExpression" && data.operator === "+";
};
exports.isLiteral = function (data) {
  return data.type === "Literal";
};
exports.isProperty = function (data) {
  return data.type === "Property";
};
exports.isHtml = function (str) {
  return /[<>'"]/.test(str);
};
exports.isArray = function (data) {
  return Array.isArray(data);
};
var crypto = require("crypto");
exports.generate = function (prefix, rd) {
  return prefix + crypto.createHash("md5").update(rd).digest("hex").substring(9, 17);
};
