"use strict";
var utils = require("./utils");
var BLANK_REPLACE_STR = " ";
var Translator = (function () {
  function Translator(option) {
    this.index = 10000;
    this.placeholder = option.placeholder;
    this.prefixChar = option.prefix;
    this.ignore = option.ignore;
    this.blank = option.blank;
    this.after = option.after;
    this.global = option.global;
    this.nonce = option.nonce;
  }
  Translator.prototype.scan = function (sourceCode, type) {
    var rows = new Set(),
      returnValue = '';
    // sourceCode = sourceCode.replace(/\/\*[\s\S]+?\*\/|\/\/[^\r\n"']+/g, "");
    // //console.log('sourceCode--', sourceCode);
    // rows = sourceCode.split(/\n+/);
    // rows.forEach(function (str, i) {
      const pattern = new RegExp(
      '(\\/\\*([^*]|[\\r\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)',
      'g'
      );
      sourceCode = sourceCode.replace(pattern, '');
      returnValue += sourceCode.replace(/[^\x00-\xff]+/g, function(words) {
        console.log(words);
        let k = utils.generate('', words);
        if(type == 'hash') {
          let words = `$t_${k}`;
          rows.add(words);
          return words;
          
        } else {
          rows.add(words);
          return words;
        }
      });
    //});
    return [returnValue, [...rows]];
  };
  Translator.prototype.scanIni = function (obj, i = 0) {
    let results = [];
    if (typeof obj === 'string' && utils.isChinese(obj)) {
      results.push({
        index: i++,
        str: obj.trim()
      })
    } else if (Array.isArray(obj) || typeof obj === 'object') {
      for (let key in obj) {
        if (typeof key === 'string' && utils.isChinese(key)) {
          results.push({
            index: i++,
            str: key.trim()
          })
        }
        results = results.concat(this.scanIni(obj[key], i))
      }
    }
    return results
  };
  Translator.prototype.scanPhp = function (obj, i = 0) {
    let results = [];
    if (typeof obj === 'string' && utils.isChinese(obj)) {
      results.push({
        index: i++,
        str: obj.trim()
      })
    } else if (Array.isArray(obj) || typeof obj === 'object') {
      for (let key in obj) {
        if (['CommentBlock', 'CommentLine', 'raw'].includes(key)) {
          continue
        }
        results = results.concat(this.scanPhp(obj[key], i))
      }
    }
    return results
  };
  Translator.prototype.scanHtml = function (obj, i = 0) {
    let results = [];
    if (typeof obj === 'string' && utils.isChinese(obj)) {
      results.push({
        index: i++,
        str: obj.trim()
      })
    } else if (typeof obj === 'object') {
      for (let key in obj) {
        results = results.concat(this.scanHtml(obj[key], i))
      }
    }
    return results
  };
  Translator.prototype._register = function (str, type) {
    var result;
    if (result = this.ignore.exec(str)) {
      return result[1] || str;
    }
    var key = str.trim();
    //新增
    if (this.ref[key] === undefined) {
      this.ref[key] = "";
    }
    //替换
    if (type === "Literal") {
      return (this.ref[key] || str).replace(this.blank, " ");
    }
    //索引
    else {
      if (this.printfs[key]) {
        return this.printfs[key];
      } else {
        this.index++;
        this.printfs[key] = this.index;
        return this.index;
      }
    }
  };
  Translator.prototype._concat = function (exp) {
    var names = [];
    var value = "";
    var left = exp.left;
    var right = exp.right;
    if (utils.isConcat(left)) {
      var subReturnValue = this._concat(left);
      value += subReturnValue.value;
      names = names.concat(subReturnValue.names);
    } else {
      if (utils.isLiteral(left)) {
        if (utils.isHtml(left.value)) {
          this._htmlParse(left);
          value += this.placeholder;
          names.push(left);
        } else {
          value += String(left.value).trim();
        }
      } else {
        value += this.placeholder;
        this._traverse(left);
        names.push(left);
      }
    }
    if (utils.isLiteral(right)) {
      if (utils.isHtml(right.value)) {
        this._htmlParse(right);
        value += this.placeholder;
        names.push(right);
      } else {
        value += String(right.value).trim();
      }
    } else {
      value += this.placeholder;
      this._traverse(right);
      names.push(right);
    }
    var returnValue = {
      value: value,
      names: names
    };
    return returnValue;
  };
  Translator.prototype._htmlParse = function (exp) {
    var rCmt = /<!\-\-.*?\-\->/g;
    var rTab = /\s{2,}|\t+|\n+/g;
    var rStr = /[^'"<>]*[\u4E00-\u9FA5][^'"<>]*/g;
    var returnValue = exp.value;
    returnValue = returnValue.replace(rCmt, "");
    returnValue = returnValue.replace(rTab, " ");
    returnValue = returnValue.replace(rStr, function (str) {
      if (!/^http/.test(str)) {
        return this._register(String(str).trim(), "Literal");
      }
      return str;
    }.bind(this));
    exp.value = returnValue;
    delete exp.raw;
  };
  Translator.prototype._traverse = function (exp) {
    if (utils.isObject(exp)) {
      if (utils.isConcat(exp)) {
        var returnValue = this._concat(exp);
        if (utils.isChinese(returnValue.value)) {
          if (returnValue.names.length) {
            exp.type = "CallExpression";
            exp.callee = {
              "type": "Identifier",
              "name": this.prefix
            };
            exp.arguments = [{
                "type": "Literal",
                "value": this._register(returnValue.value, "Binary")
              },
              {
                "type": "ArrayExpression",
                "elements": returnValue.names
              },
              {
                "type": "Literal",
                "value": this.placeholder
              },
              {
                "type": "Literal",
                "value": BLANK_REPLACE_STR
              }
            ];
          } else {
            exp.type = "Literal";
            exp.value = this._register(returnValue.value, "Literal");
          }
          delete exp.operator;
          delete exp.left;
          delete exp.right;
        }
      } else if (utils.isLiteral(exp)) {
        if (utils.isChinese(exp.value)) {
          if ((utils.isHtml(exp.value))) {
            this._htmlParse(exp);
          } else {
            exp.value = this._register(exp.value, "Literal");
          }
          delete exp.raw;
        }
      } else {
        Object.keys(exp).forEach(function (item) {
          this._traverse(exp[item]);
        }.bind(this));
      }
    } else if (utils.isArray(exp)) {
      exp.forEach(function (item) {
        this._traverse(item);
      }.bind(this));
    }
  };
  return Translator;
}());
exports.Translator = Translator;
