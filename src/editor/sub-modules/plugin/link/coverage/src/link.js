function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/link.js']) {
  _$jscoverage['/link.js'] = {};
  _$jscoverage['/link.js'].lineData = [];
  _$jscoverage['/link.js'].lineData[5] = 0;
  _$jscoverage['/link.js'].lineData[6] = 0;
  _$jscoverage['/link.js'].lineData[22] = 0;
  _$jscoverage['/link.js'].lineData[23] = 0;
  _$jscoverage['/link.js'].lineData[24] = 0;
  _$jscoverage['/link.js'].lineData[27] = 0;
  _$jscoverage['/link.js'].lineData[28] = 0;
  _$jscoverage['/link.js'].lineData[31] = 0;
  _$jscoverage['/link.js'].lineData[34] = 0;
  _$jscoverage['/link.js'].lineData[35] = 0;
  _$jscoverage['/link.js'].lineData[39] = 0;
  _$jscoverage['/link.js'].lineData[46] = 0;
  _$jscoverage['/link.js'].lineData[48] = 0;
  _$jscoverage['/link.js'].lineData[49] = 0;
  _$jscoverage['/link.js'].lineData[54] = 0;
  _$jscoverage['/link.js'].lineData[57] = 0;
  _$jscoverage['/link.js'].lineData[60] = 0;
  _$jscoverage['/link.js'].lineData[64] = 0;
  _$jscoverage['/link.js'].lineData[69] = 0;
  _$jscoverage['/link.js'].lineData[71] = 0;
  _$jscoverage['/link.js'].lineData[72] = 0;
  _$jscoverage['/link.js'].lineData[73] = 0;
  _$jscoverage['/link.js'].lineData[76] = 0;
  _$jscoverage['/link.js'].lineData[77] = 0;
  _$jscoverage['/link.js'].lineData[78] = 0;
  _$jscoverage['/link.js'].lineData[81] = 0;
  _$jscoverage['/link.js'].lineData[82] = 0;
  _$jscoverage['/link.js'].lineData[83] = 0;
  _$jscoverage['/link.js'].lineData[84] = 0;
  _$jscoverage['/link.js'].lineData[86] = 0;
  _$jscoverage['/link.js'].lineData[88] = 0;
  _$jscoverage['/link.js'].lineData[89] = 0;
  _$jscoverage['/link.js'].lineData[98] = 0;
}
if (! _$jscoverage['/link.js'].functionData) {
  _$jscoverage['/link.js'].functionData = [];
  _$jscoverage['/link.js'].functionData[0] = 0;
  _$jscoverage['/link.js'].functionData[1] = 0;
  _$jscoverage['/link.js'].functionData[2] = 0;
  _$jscoverage['/link.js'].functionData[3] = 0;
  _$jscoverage['/link.js'].functionData[4] = 0;
  _$jscoverage['/link.js'].functionData[5] = 0;
  _$jscoverage['/link.js'].functionData[6] = 0;
  _$jscoverage['/link.js'].functionData[7] = 0;
  _$jscoverage['/link.js'].functionData[8] = 0;
  _$jscoverage['/link.js'].functionData[9] = 0;
}
if (! _$jscoverage['/link.js'].branchData) {
  _$jscoverage['/link.js'].branchData = {};
  _$jscoverage['/link.js'].branchData['28'] = [];
  _$jscoverage['/link.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/link.js'].branchData['83'] = [];
  _$jscoverage['/link.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/link.js'].branchData['86'] = [];
  _$jscoverage['/link.js'].branchData['86'][1] = new BranchData();
}
_$jscoverage['/link.js'].branchData['86'][1].init(221, 79, 'a.attr(Utils._ke_saved_href) || a.attr("href")');
function visit3_86_1(result) {
  _$jscoverage['/link.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/link.js'].branchData['83'][1].init(103, 2, '!a');
function visit2_83_1(result) {
  _$jscoverage['/link.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/link.js'].branchData['28'][1].init(24, 12, 'config || {}');
function visit1_28_1(result) {
  _$jscoverage['/link.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/link.js'].lineData[5]++;
KISSY.add("editor/plugin/link", function(S, Editor, Bubble, Utils, DialogLoader) {
  _$jscoverage['/link.js'].functionData[0]++;
  _$jscoverage['/link.js'].lineData[6]++;
  var $ = S.all, tipHTML = '<a ' + 'href="" ' + ' target="_blank" ' + 'class="{prefixCls}editor-bubble-url">' + '\u5728\u65b0\u7a97\u53e3\u67e5\u770b' + '</a>  \u2013  ' + ' <span ' + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">' + '\u7f16\u8f91' + '</span>   |   ' + ' <span ' + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">' + '\u53bb\u9664' + '</span>';
  _$jscoverage['/link.js'].lineData[22]++;
  function checkLink(lastElement) {
    _$jscoverage['/link.js'].functionData[1]++;
    _$jscoverage['/link.js'].lineData[23]++;
    lastElement = $(lastElement);
    _$jscoverage['/link.js'].lineData[24]++;
    return lastElement.closest('a', undefined);
  }
  _$jscoverage['/link.js'].lineData[27]++;
  function LinkPlugin(config) {
    _$jscoverage['/link.js'].functionData[2]++;
    _$jscoverage['/link.js'].lineData[28]++;
    this.config = visit1_28_1(config || {});
  }
  _$jscoverage['/link.js'].lineData[31]++;
  S.augment(LinkPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/link.js'].functionData[3]++;
  _$jscoverage['/link.js'].lineData[34]++;
  var prefixCls = editor.get('prefixCls');
  _$jscoverage['/link.js'].lineData[35]++;
  editor.addButton("link", {
  tooltip: "\u63d2\u5165\u94fe\u63a5", 
  listeners: {
  click: function() {
  _$jscoverage['/link.js'].functionData[4]++;
  _$jscoverage['/link.js'].lineData[39]++;
  showLinkEditDialog();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
  _$jscoverage['/link.js'].lineData[46]++;
  var self = this;
  _$jscoverage['/link.js'].lineData[48]++;
  function showLinkEditDialog(selectedEl) {
    _$jscoverage['/link.js'].functionData[5]++;
    _$jscoverage['/link.js'].lineData[49]++;
    DialogLoader.useDialog(editor, "link", self.config, selectedEl);
  }
  _$jscoverage['/link.js'].lineData[54]++;
  editor.addBubble("link", checkLink, {
  listeners: {
  afterRenderUI: function() {
  _$jscoverage['/link.js'].functionData[6]++;
  _$jscoverage['/link.js'].lineData[57]++;
  var bubble = this, el = bubble.get("contentEl");
  _$jscoverage['/link.js'].lineData[60]++;
  el.html(S.substitute(tipHTML, {
  prefixCls: prefixCls}));
  _$jscoverage['/link.js'].lineData[64]++;
  var tipUrl = el.one("." + prefixCls + "editor-bubble-url"), tipChange = el.one("." + prefixCls + "editor-bubble-change"), tipRemove = el.one("." + prefixCls + "editor-bubble-remove");
  _$jscoverage['/link.js'].lineData[69]++;
  Editor.Utils.preventFocus(el);
  _$jscoverage['/link.js'].lineData[71]++;
  tipChange.on("click", function(ev) {
  _$jscoverage['/link.js'].functionData[7]++;
  _$jscoverage['/link.js'].lineData[72]++;
  showLinkEditDialog(bubble.get("editorSelectedEl"));
  _$jscoverage['/link.js'].lineData[73]++;
  ev.halt();
});
  _$jscoverage['/link.js'].lineData[76]++;
  tipRemove.on("click", function(ev) {
  _$jscoverage['/link.js'].functionData[8]++;
  _$jscoverage['/link.js'].lineData[77]++;
  Utils.removeLink(editor, bubble.get("editorSelectedEl"));
  _$jscoverage['/link.js'].lineData[78]++;
  ev.halt();
});
  _$jscoverage['/link.js'].lineData[81]++;
  bubble.on("show", function() {
  _$jscoverage['/link.js'].functionData[9]++;
  _$jscoverage['/link.js'].lineData[82]++;
  var a = bubble.get("editorSelectedEl");
  _$jscoverage['/link.js'].lineData[83]++;
  if (visit2_83_1(!a)) {
    _$jscoverage['/link.js'].lineData[84]++;
    return;
  }
  _$jscoverage['/link.js'].lineData[86]++;
  var href = visit3_86_1(a.attr(Utils._ke_saved_href) || a.attr("href"));
  _$jscoverage['/link.js'].lineData[88]++;
  tipUrl.html(href);
  _$jscoverage['/link.js'].lineData[89]++;
  tipUrl.attr("href", href);
});
}}});
}});
  _$jscoverage['/link.js'].lineData[98]++;
  return LinkPlugin;
}, {
  requires: ['editor', './bubble', './link/utils', './dialog-loader', './button']});
