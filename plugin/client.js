window.__ModuleLoader__.load({
	id: "@local/dsh-inline-diff",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/highlight.js/lib/core.js
var require_core = __commonJS({
  "node_modules/highlight.js/lib/core.js"(exports, module2) {
    function deepFreeze(obj) {
      if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = function() {
          throw new Error("map is read-only");
        };
      } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = function() {
          throw new Error("set is read-only");
        };
      }
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((name) => {
        const prop = obj[name];
        const type = typeof prop;
        if ((type === "object" || type === "function") && !Object.isFrozen(prop)) {
          deepFreeze(prop);
        }
      });
      return obj;
    }
    var Response = class {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        if (mode.data === void 0) mode.data = {};
        this.data = mode.data;
        this.isMatchIgnored = false;
      }
      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    };
    function escapeHTML(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
    function inherit$1(original, ...objects) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return (
        /** @type {T} */
        result
      );
    }
    var SPAN_CLOSE = "</span>";
    var emitsWrappingTags = (node) => {
      return !!node.scope;
    };
    var scopeToCSSClass = (name, { prefix }) => {
      if (name.startsWith("language:")) {
        return name.replace("language:", "language-");
      }
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`)
        ].join(" ");
      }
      return `${prefix}${name}`;
    };
    var HTMLRenderer = class {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }
      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }
      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;
        const className = scopeToCSSClass(
          node.scope,
          { prefix: this.classPrefix }
        );
        this.span(className);
      }
      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;
        this.buffer += SPAN_CLOSE;
      }
      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }
      // helpers
      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    };
    var newNode = (opts = {}) => {
      const result = { children: [] };
      Object.assign(result, opts);
      return result;
    };
    var TokenTree = class _TokenTree {
      constructor() {
        this.rootNode = newNode();
        this.stack = [this.rootNode];
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }
      /** @param {string} scope */
      openNode(scope) {
        const node = newNode({ scope });
        this.add(node);
        this.stack.push(node);
      }
      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        return void 0;
      }
      closeAllNodes() {
        while (this.closeNode()) ;
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        return this.constructor._walk(builder, this.rootNode);
      }
      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }
      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;
        if (node.children.every((el) => typeof el === "string")) {
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            _TokenTree._collapse(child);
          });
        }
      }
    };
    var TokenTreeEmitter = class extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }
      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") {
          return;
        }
        this.add(text);
      }
      /** @param {string} scope */
      startScope(scope) {
        this.openNode(scope);
      }
      endScope() {
        this.closeNode();
      }
      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      __addSublanguage(emitter, name) {
        const node = emitter.root;
        if (name) node.scope = `language:${name}`;
        this.add(node);
      }
      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }
      finalize() {
        this.closeAllNodes();
        return true;
      }
    };
    function source3(re) {
      if (!re) return null;
      if (typeof re === "string") return re;
      return re.source;
    }
    function lookahead3(re) {
      return concat3("(?=", re, ")");
    }
    function anyNumberOfTimes(re) {
      return concat3("(?:", re, ")*");
    }
    function optional(re) {
      return concat3("(?:", re, ")?");
    }
    function concat3(...args) {
      const joined = args.map((x) => source3(x)).join("");
      return joined;
    }
    function stripOptionsFromArgs3(args) {
      const opts = args[args.length - 1];
      if (typeof opts === "object" && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }
    function either3(...args) {
      const opts = stripOptionsFromArgs3(args);
      const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source3(x)).join("|") + ")";
      return joined;
    }
    function countMatchGroups(re) {
      return new RegExp(re.toString() + "|").exec("").length - 1;
    }
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }
    var BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;
      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source3(regex);
        let out = "";
        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === "\\" && match[1]) {
            out += "\\" + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === "(") {
              numCaptures++;
            }
          }
        }
        return out;
      }).map((re) => `(${re})`).join(joinWith);
    }
    var MATCH_NOTHING_RE = /\b\B/;
    var IDENT_RE3 = "[a-zA-Z]\\w*";
    var UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
    var NUMBER_RE = "\\b\\d+(\\.\\d+)?";
    var C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
    var BINARY_NUMBER_RE = "\\b(0b[01]+)";
    var RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
    var SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat3(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/
        );
      }
      return inherit$1({
        scope: "meta",
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };
    var BACKSLASH_ESCAPE = {
      begin: "\\\\[\\s\\S]",
      relevance: 0
    };
    var APOS_STRING_MODE = {
      scope: "string",
      begin: "'",
      end: "'",
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var QUOTE_STRING_MODE = {
      scope: "string",
      begin: '"',
      end: '"',
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    var COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: "comment",
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: "doctag",
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either3(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
        // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/,
        // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/
        // allow capitalized words at beginning of sentences
      );
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---
          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827
          begin: concat3(
            /[ ]+/,
            // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            "(",
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            "){3}"
          )
          // look for 3 words in a row
        }
      );
      return mode;
    };
    var C_LINE_COMMENT_MODE = COMMENT("//", "$");
    var C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
    var HASH_COMMENT_MODE = COMMENT("#", "$");
    var NUMBER_MODE = {
      scope: "number",
      begin: NUMBER_RE,
      relevance: 0
    };
    var C_NUMBER_MODE = {
      scope: "number",
      begin: C_NUMBER_RE,
      relevance: 0
    };
    var BINARY_NUMBER_MODE = {
      scope: "number",
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    var REGEXP_MODE = {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [
        BACKSLASH_ESCAPE,
        {
          begin: /\[/,
          end: /\]/,
          relevance: 0,
          contains: [BACKSLASH_ESCAPE]
        }
      ]
    };
    var TITLE_MODE = {
      scope: "title",
      begin: IDENT_RE3,
      relevance: 0
    };
    var UNDERSCORE_TITLE_MODE = {
      scope: "title",
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(
        mode,
        {
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
            resp.data._beginMatch = m[1];
          },
          /** @type {ModeCallback} */
          "on:end": (m, resp) => {
            if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
          }
        }
      );
    };
    var MODES4 = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      APOS_STRING_MODE,
      BACKSLASH_ESCAPE,
      BINARY_NUMBER_MODE,
      BINARY_NUMBER_RE,
      COMMENT,
      C_BLOCK_COMMENT_MODE,
      C_LINE_COMMENT_MODE,
      C_NUMBER_MODE,
      C_NUMBER_RE,
      END_SAME_AS_BEGIN,
      HASH_COMMENT_MODE,
      IDENT_RE: IDENT_RE3,
      MATCH_NOTHING_RE,
      METHOD_GUARD,
      NUMBER_MODE,
      NUMBER_RE,
      PHRASAL_WORDS_MODE,
      QUOTE_STRING_MODE,
      REGEXP_MODE,
      RE_STARTERS_RE,
      SHEBANG,
      TITLE_MODE,
      UNDERSCORE_IDENT_RE,
      UNDERSCORE_TITLE_MODE
    });
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }
    function scopeClassName(mode, _parent) {
      if (mode.className !== void 0) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;
      mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;
      if (mode.relevance === void 0) mode.relevance = 0;
    }
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;
      mode.illegal = either3(...mode.illegal);
    }
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");
      mode.begin = mode.match;
      delete mode.match;
    }
    function compileRelevance(mode, _parent) {
      if (mode.relevance === void 0) mode.relevance = 1;
    }
    var beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");
      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => {
        delete mode[key];
      });
      mode.keywords = originalMode.keywords;
      mode.begin = concat3(originalMode.beforeMatch, lookahead3(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;
      delete originalMode.beforeMatch;
    };
    var COMMON_KEYWORDS = [
      "of",
      "and",
      "for",
      "in",
      "not",
      "or",
      "if",
      "then",
      "parent",
      // common variable name
      "list",
      // common variable name
      "value"
      // common variable name
    ];
    var DEFAULT_KEYWORD_SCOPE = "keyword";
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      const compiledKeywords = /* @__PURE__ */ Object.create(null);
      if (typeof rawKeywords === "string") {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName2) {
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
          );
        });
      }
      return compiledKeywords;
      function compileList(scopeName2, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map((x) => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split("|");
          compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }
    function scoreForKeyword(keyword, providedScore) {
      if (providedScore) {
        return Number(providedScore);
      }
      return commonKeyword(keyword) ? 0 : 1;
    }
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }
    var seenDeprecations = {};
    var error = (message) => {
      console.error(message);
    };
    var warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };
    var deprecated = (version2, message) => {
      if (seenDeprecations[`${version2}/${message}`]) return;
      console.log(`Deprecated as of ${version2}. ${message}`);
      seenDeprecations[`${version2}/${message}`] = true;
    };
    var MultiClassError = new Error();
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      const emit2 = {};
      const positions = {};
      for (let i = 1; i <= regexes.length; i++) {
        positions[i + offset] = scopeNames[i];
        emit2[i + offset] = true;
        offset += countMatchGroups(regexes[i - 1]);
      }
      mode[key] = positions;
      mode[key]._emit = emit2;
      mode[key]._multi = true;
    }
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;
      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;
      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }
    function MultiClass(mode) {
      scopeSugar(mode);
      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }
      beginMultiClass(mode);
      endMultiClass(mode);
    }
    function compileLanguage(language) {
      function langRe(value, global) {
        return new RegExp(
          source3(value),
          "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (global ? "g" : "")
        );
      }
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }
        compile() {
          if (this.regexes.length === 0) {
            this.exec = () => null;
          }
          const terminators = this.regexes.map((el) => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
          this.lastIndex = 0;
        }
        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) {
            return null;
          }
          const i = match.findIndex((el, i2) => i2 > 0 && el !== void 0);
          const matchData = this.matchIndexes[i];
          match.splice(0, i);
          return Object.assign(match, matchData);
        }
      }
      class ResumableMultiRegex {
        constructor() {
          this.rules = [];
          this.multiRegexes = [];
          this.count = 0;
          this.lastIndex = 0;
          this.regexIndex = 0;
        }
        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];
          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }
        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }
        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ;
            else {
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }
          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              this.considerAll();
            }
          }
          return result;
        }
      }
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();
        mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }
        return mm;
      }
      function compileMode(mode, parent) {
        const cmode = (
          /** @type CompiledMode */
          mode
        );
        if (mode.isCompiled) return cmode;
        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach((ext) => ext(mode, parent));
        language.compilerExtensions.forEach((ext) => ext(mode, parent));
        mode.__beforeBegin = null;
        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach((ext) => ext(mode, parent));
        mode.isCompiled = true;
        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;
        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }
        cmode.keywordPatternRe = langRe(keywordPattern, true);
        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source3(cmode.end) || "";
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(
          /** @type {RegExp | string} */
          mode.illegal
        );
        if (!mode.contains) mode.contains = [];
        mode.contains = [].concat(...mode.contains.map(function(c2) {
          return expandOrCloneMode(c2 === "self" ? mode : c2);
        }));
        mode.contains.forEach(function(c2) {
          compileMode(
            /** @type Mode */
            c2,
            cmode
          );
        });
        if (mode.starts) {
          compileMode(mode.starts, parent);
        }
        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }
      if (!language.compilerExtensions) language.compilerExtensions = [];
      if (language.contains && language.contains.includes("self")) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }
      language.classNameAliases = inherit$1(language.classNameAliases || {});
      return compileMode(
        /** @type Mode */
        language
      );
    }
    function dependencyOnParent(mode) {
      if (!mode) return false;
      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }
      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }
      return mode;
    }
    var version = "11.11.1";
    var HTMLInjectionError = class extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    };
    var escape2 = escapeHTML;
    var inherit = inherit$1;
    var NO_MATCH = /* @__PURE__ */ Symbol("nomatch");
    var MAX_KEYWORD_HITS = 7;
    var HLJS = function(hljs) {
      const languages = /* @__PURE__ */ Object.create(null);
      const aliases = /* @__PURE__ */ Object.create(null);
      const plugins = [];
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: "hljs-",
        cssSelector: "pre code",
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }
      function blockLanguage(block) {
        let classes = block.className + " ";
        classes += block.parentNode ? block.parentNode.className : "";
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : "no-highlight";
        }
        return classes.split(/\s+/).find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }
      function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }
        if (ignoreIllegals === void 0) {
          ignoreIllegals = true;
        }
        const context = {
          code,
          language: languageName
        };
        fire("before:highlight", context);
        const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
        result.code = context.code;
        fire("after:highlight", result);
        return result;
      }
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = /* @__PURE__ */ Object.create(null);
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }
        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }
          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";
          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";
              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substring(lastIndex);
          emitter.addText(buf);
        }
        function processSubLanguage() {
          if (modeBuffer === "") return;
          let result2 = null;
          if (typeof top.subLanguage === "string") {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result2 = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */
            result2._top;
          } else {
            result2 = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }
          if (top.relevance > 0) {
            relevance += result2.relevance;
          }
          emitter.__addSublanguage(result2._emitter, result2.language);
        }
        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = "";
        }
        function emitKeyword(keyword, scope) {
          if (keyword === "") return;
          emitter.startScope(scope);
          emitter.addText(keyword);
          emitter.endScope();
        }
        function emitMultiClass(scope, match) {
          let i = 1;
          const max = match.length - 1;
          while (i <= max) {
            if (!scope._emit[i]) {
              i++;
              continue;
            }
            const klass = language.classNameAliases[scope[i]] || scope[i];
            const text = match[i];
            if (klass) {
              emitKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i++;
          }
        }
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            if (mode.beginScope._wrap) {
              emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);
          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }
            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            modeBuffer += lexeme[0];
            return 1;
          } else {
            resumeScanAtSamePosition = true;
            return 0;
          }
        }
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;
          const resp = new Response(newMode);
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }
          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substring(match.index);
          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) {
            return NO_MATCH;
          }
          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }
        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list.unshift(current.scope);
            }
          }
          list.forEach((item) => emitter.openNode(item));
        }
        let lastMatch = {};
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];
          modeBuffer += textBeforeMatch;
          if (lexeme == null) {
            processBuffer();
            return 0;
          }
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;
          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || "<unnamed>") + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }
          if (match.type === "illegal" && lexeme === "") {
            modeBuffer += "\n";
            return 1;
          }
          if (iterations > 1e5 && iterations > match.index * 3) {
            const err = new Error("potential infinite loop, way more iterations than matches");
            throw err;
          }
          modeBuffer += lexeme;
          return lexeme.length;
        }
        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }
        const md = compileLanguage(language);
        let result = "";
        let top = continuation || md;
        const continuations = {};
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = "";
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;
        try {
          if (!language.__emitTokens) {
            top.matcher.considerAll();
            for (; ; ) {
              iterations++;
              if (resumeScanAtSamePosition) {
                resumeScanAtSamePosition = false;
              } else {
                top.matcher.considerAll();
              }
              top.matcher.lastIndex = index;
              const match = top.matcher.exec(codeToHighlight);
              if (!match) break;
              const beforeMatch = codeToHighlight.substring(index, match.index);
              const processedCount = processLexeme(beforeMatch, match);
              index = match.index + processedCount;
            }
            processLexeme(codeToHighlight.substring(index));
          } else {
            language.__emitTokens(codeToHighlight, emitter);
          }
          emitter.finalize();
          result = emitter.toHTML();
          return {
            language: languageName,
            value: result,
            relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes("Illegal")) {
            return {
              language: languageName,
              value: escape2(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape2(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }
      function justTextHighlightResult(code) {
        const result = {
          value: escape2(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);
        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
          (name) => _highlight(name, code, false)
        );
        results.unshift(plaintext);
        const sorted = results.sort((a, b) => {
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }
          return 0;
        });
        const [best, secondBest] = sorted;
        const result = best;
        result.secondBest = secondBest;
        return result;
      }
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang && aliases[currentLang] || resultLang;
        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }
      function highlightElement(element) {
        let node = null;
        const language = blockLanguage(element);
        if (shouldNotHighlight(language)) return;
        fire(
          "before:highlightElement",
          { el: element, language }
        );
        if (element.dataset.highlighted) {
          console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
          return;
        }
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
            console.warn("The element with unescaped HTML:");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }
        node = element;
        const text = node.textContent;
        const result = language ? highlight2(text, { language, ignoreIllegals: true }) : highlightAuto(text);
        element.innerHTML = result.value;
        element.dataset.highlighted = "yes";
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }
        fire("after:highlightElement", { el: element, result, text });
      }
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }
      let wantsHighlight = false;
      function highlightAll() {
        function boot() {
          highlightAll();
        }
        if (document.readyState === "loading") {
          if (!wantsHighlight) {
            window.addEventListener("DOMContentLoaded", boot, false);
          }
          wantsHighlight = true;
          return;
        }
        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          if (!SAFE_MODE) {
            throw error$1;
          } else {
            error(error$1);
          }
          lang = PLAINTEXT_LANGUAGE;
        }
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);
        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }
      function listLanguages() {
        return Object.keys(languages);
      }
      function getLanguage(name) {
        name = (name || "").toLowerCase();
        return languages[name] || languages[aliases[name]];
      }
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === "string") {
          aliasList = [aliasList];
        }
        aliasList.forEach((alias) => {
          aliases[alias.toLowerCase()] = languageName;
        });
      }
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }
      function upgradePluginAPI(plugin) {
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }
      function removePlugin(plugin) {
        const index = plugins.indexOf(plugin);
        if (index !== -1) {
          plugins.splice(index, 1);
        }
      }
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");
        return highlightElement(el);
      }
      Object.assign(hljs, {
        highlight: highlight2,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin,
        removePlugin
      });
      hljs.debugMode = function() {
        SAFE_MODE = false;
      };
      hljs.safeMode = function() {
        SAFE_MODE = true;
      };
      hljs.versionString = version;
      hljs.regex = {
        concat: concat3,
        lookahead: lookahead3,
        either: either3,
        optional,
        anyNumberOfTimes
      };
      for (const key in MODES4) {
        if (typeof MODES4[key] === "object") {
          deepFreeze(MODES4[key]);
        }
      }
      Object.assign(hljs, MODES4);
      return hljs;
    };
    var highlight = HLJS({});
    highlight.newInstance = () => HLJS({});
    module2.exports = highlight;
    highlight.HighlightJS = highlight;
    highlight.default = highlight;
  }
});

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/enhanced-shell.jsx
var import_react2 = require("react");

// src/client/diff.js
var CONTEXT_LINES = 3;
var ALIGN_MAX_SIDE_LINES = 4e3;
var ALIGN_MAX_CELLS = 25e5;
var INLINE_ROW_CAP = 42;
var FULL_VIEW_ROW_CAP = 4e3;
function contentLines(text) {
  if (typeof text !== "string" || text === "") return [];
  const body = text.endsWith("\n") ? text.slice(0, -1) : text;
  return body.split("\n").map((line) => line.endsWith("\r") ? line.slice(0, -1) : line);
}
function ctxRow(text, oldNo, newNo) {
  return { kind: "ctx", text, oldNo, newNo };
}
function delRow(text, oldNo) {
  return { kind: "del", text, oldNo, newNo: null };
}
function addRow(text, newNo) {
  return { kind: "add", text, oldNo: null, newNo };
}
function coarseAlign(oldLines, newLines) {
  const rows = [];
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++;
  let oldEnd = oldLines.length;
  let newEnd = newLines.length;
  while (oldEnd > prefix && newEnd > prefix && oldLines[oldEnd - 1] === newLines[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  for (let i = 0; i < prefix; i++) rows.push(ctxRow(oldLines[i], i + 1, i + 1));
  for (let i = prefix; i < oldEnd; i++) rows.push(delRow(oldLines[i], i + 1));
  for (let j = prefix; j < newEnd; j++) rows.push(addRow(newLines[j], j + 1));
  let oldNo = oldEnd + 1;
  let newNo = newEnd + 1;
  while (oldNo <= oldLines.length && newNo <= newLines.length) {
    rows.push(ctxRow(oldLines[oldNo - 1], oldNo, newNo));
    oldNo++;
    newNo++;
  }
  return { rows, coarse: true };
}
function alignLines(oldLines, newLines) {
  const m = oldLines.length;
  const n = newLines.length;
  if (m === 0) return { rows: newLines.map((text, j2) => addRow(text, j2 + 1)), coarse: false };
  if (n === 0) return { rows: oldLines.map((text, i2) => delRow(text, i2 + 1)), coarse: false };
  if (m > ALIGN_MAX_SIDE_LINES || n > ALIGN_MAX_SIDE_LINES || m * n > ALIGN_MAX_CELLS) {
    return coarseAlign(oldLines, newLines);
  }
  const w = n + 1;
  const dp = new Uint32Array((m + 1) * w);
  for (let i2 = m - 1; i2 >= 0; i2--) {
    const row = i2 * w;
    const below = row + w;
    const line = oldLines[i2];
    for (let j2 = n - 1; j2 >= 0; j2--) {
      dp[row + j2] = line === newLines[j2] ? dp[below + j2 + 1] + 1 : Math.max(dp[below + j2], dp[row + j2 + 1]);
    }
  }
  const rows = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      rows.push(ctxRow(oldLines[i], i + 1, j + 1));
      i++;
      j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      rows.push(delRow(oldLines[i], i + 1));
      i++;
    } else {
      rows.push(addRow(newLines[j], j + 1));
      j++;
    }
  }
  while (i < m) {
    rows.push(delRow(oldLines[i], i + 1));
    i++;
  }
  while (j < n) {
    rows.push(addRow(newLines[j], j + 1));
    j++;
  }
  return { rows, coarse: false };
}
function locateOnce(needle, fileLines) {
  if (!Array.isArray(needle) || needle.length === 0) return -1;
  if (!Array.isArray(fileLines) || fileLines.length < needle.length) return -1;
  let found = -1;
  const last = fileLines.length - needle.length;
  outer: for (let i = 0; i <= last; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (fileLines[i + j] !== needle[j]) continue outer;
    }
    if (found !== -1) return -1;
    found = i;
  }
  return found;
}
function groupHunks(rows) {
  const keep = new Uint8Array(rows.length);
  let hasChange = false;
  for (let i2 = 0; i2 < rows.length; i2++) {
    if (rows[i2].kind === "ctx") continue;
    hasChange = true;
    for (let d2 = Math.max(0, i2 - CONTEXT_LINES); d2 <= Math.min(rows.length - 1, i2 + CONTEXT_LINES); d2++) keep[d2] = 1;
  }
  if (!hasChange) return [];
  const hunks = [];
  let oldCur = 0;
  let newCur = 0;
  let gap = null;
  let i = 0;
  while (i < rows.length) {
    if (keep[i] === 0) {
      const oldStart = oldCur + 1;
      const newStart = newCur + 1;
      const start = i;
      while (i < rows.length && keep[i] === 0) {
        const row = rows[i];
        if (row.oldNo !== null && row.oldNo !== void 0) oldCur = row.oldNo;
        if (row.newNo !== null && row.newNo !== void 0) newCur = row.newNo;
        i++;
      }
      const count = i - start;
      const oldCount = oldCur - (oldStart - 1);
      const newCount = newCur - (newStart - 1);
      if (hunks.length > 0 && i < rows.length && count > 0 && oldCount > 0) {
        gap = {
          count,
          oldCount,
          newCount,
          oldStart,
          oldEnd: oldCur,
          newStart,
          newEnd: newCur,
          // Mapping shift of the unchanged band, which is what the annotation
          // promises: old Lx now reads as new Ly.
          shift: newStart - oldStart
        };
      }
      continue;
    }
    const startOld = oldCur + 1;
    const startNew = newCur + 1;
    const seg = [];
    while (i < rows.length && keep[i] !== 0) {
      const row = rows[i];
      if (row.oldNo !== null && row.oldNo !== void 0) oldCur = row.oldNo;
      if (row.newNo !== null && row.newNo !== void 0) newCur = row.newNo;
      seg.push(row);
      i++;
    }
    const hunk = makeHunk(seg, startOld, startNew, gap);
    hunks.push(hunk);
    gap = null;
  }
  return hunks;
}
function makeHunk(rows, boundaryOld, boundaryNew, gapBefore) {
  let oldStart = null;
  let oldEnd = null;
  let newStart = null;
  let newEnd = null;
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.kind === "del") {
      removed++;
      if (oldStart === null) oldStart = row.oldNo;
      oldEnd = row.oldNo;
    } else if (row.kind === "add") {
      added++;
      if (newStart === null) newStart = row.newNo;
      newEnd = row.newNo;
    } else {
      if (oldStart === null) oldStart = row.oldNo;
      oldEnd = row.oldNo;
      if (newStart === null) newStart = row.newNo;
      newEnd = row.newNo;
    }
  }
  const oldCount = rows.filter((row) => row.kind !== "add").length;
  const newCount = rows.filter((row) => row.kind !== "del").length;
  if (oldStart === null) {
    oldStart = boundaryOld;
    oldEnd = boundaryOld - 1;
  }
  if (newStart === null) {
    newStart = boundaryNew;
    newEnd = boundaryNew - 1;
  }
  return {
    index: 0,
    rows,
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldCount,
    newCount,
    added,
    removed,
    gapBefore: gapBefore ?? null,
    hasNumbers: true
  };
}
var INTRA_MAX_CHARS = 4e3;
var INTRA_MAX_CELLS = 16e4;
var INTRA_MAX_TOTAL_CELLS = 2e6;
function lineTokens(text) {
  if (typeof text !== "string" || text === "") return [];
  const tokens = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[A-Za-z0-9_$]+|\s+|./gu);
  return tokens === null ? [] : tokens;
}
function pushSegment(segments, text, changed) {
  if (text === "") return;
  const last = segments[segments.length - 1];
  if (last !== void 0 && last.changed === changed) last.text += text;
  else segments.push({ text, changed });
}
function segmentsFromFlags(tokens, flags) {
  const segments = [];
  for (let i = 0; i < tokens.length; i++) pushSegment(segments, tokens[i], flags[i] === 1);
  return segments;
}
function isGapToken(token) {
  if (typeof token !== "string" || token === "") return false;
  return !/[\p{L}\p{N}_$]/u.test(token);
}
function calmGapRuns(tokens, flags) {
  let i = 0;
  while (i < tokens.length) {
    if (flags[i] !== 1 || !isGapToken(tokens[i])) {
      i++;
      continue;
    }
    const start = i;
    while (i < tokens.length && flags[i] === 1 && isGapToken(tokens[i])) i++;
    const touchesChangedContent = start > 0 && flags[start - 1] === 1 || i < tokens.length && flags[i] === 1;
    if (!touchesChangedContent) {
      for (let k = start; k < i; k++) flags[k] = 0;
    }
  }
  return flags;
}
function absorbGapTokens(tokens, flags) {
  let i = 0;
  while (i < tokens.length) {
    if (flags[i] === 1 || !isGapToken(tokens[i])) {
      i++;
      continue;
    }
    const start = i;
    while (i < tokens.length && flags[i] === 0 && isGapToken(tokens[i])) i++;
    const boundedByChanged = start > 0 && flags[start - 1] === 1 && i < tokens.length && flags[i] === 1;
    if (boundedByChanged) {
      for (let k = start; k < i; k++) flags[k] = 1;
    }
  }
  return flags;
}
function lineSegments(oldText, newText, budget = null) {
  if (typeof oldText !== "string" || typeof newText !== "string") return null;
  if (oldText === newText) return null;
  if (oldText.length > INTRA_MAX_CHARS || newText.length > INTRA_MAX_CHARS) return null;
  const a = lineTokens(oldText);
  const b = lineTokens(newText);
  if (a.length === 0 || b.length === 0) return null;
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  let aEnd = a.length;
  let bEnd = b.length;
  while (aEnd > prefix && bEnd > prefix && a[aEnd - 1] === b[bEnd - 1]) {
    aEnd--;
    bEnd--;
  }
  const am = aEnd - prefix;
  const bn = bEnd - prefix;
  if (am === 0 && bn === 0) return null;
  const cells = am * bn;
  if (cells > INTRA_MAX_CELLS) return null;
  if (budget !== null) {
    if (cells > budget.remaining) return null;
    budget.remaining -= cells;
  }
  const oldFlags = new Uint8Array(a.length);
  const newFlags = new Uint8Array(b.length);
  for (let i = 0; i < prefix; i++) {
    oldFlags[i] = 0;
    newFlags[i] = 0;
  }
  for (let i = aEnd; i < a.length; i++) oldFlags[i] = 0;
  for (let i = bEnd; i < b.length; i++) newFlags[i] = 0;
  if (am > 0 && bn > 0) {
    const w = bn + 1;
    const dp = new Uint32Array((am + 1) * w);
    for (let i2 = am - 1; i2 >= 0; i2--) {
      const row = i2 * w;
      const below = row + w;
      const token = a[prefix + i2];
      for (let j2 = bn - 1; j2 >= 0; j2--) {
        dp[row + j2] = token === b[prefix + j2] ? dp[below + j2 + 1] + 1 : Math.max(dp[below + j2], dp[row + j2 + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < am && j < bn) {
      if (a[prefix + i] === b[prefix + j]) {
        i++;
        j++;
      } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
        oldFlags[prefix + i] = 1;
        i++;
      } else {
        newFlags[prefix + j] = 1;
        j++;
      }
    }
    while (i < am) {
      oldFlags[prefix + i] = 1;
      i++;
    }
    while (j < bn) {
      newFlags[prefix + j] = 1;
      j++;
    }
  } else if (am > 0) {
    for (let i = prefix; i < aEnd; i++) oldFlags[i] = 1;
  } else {
    for (let j = prefix; j < bEnd; j++) newFlags[j] = 1;
  }
  return {
    old: segmentsFromFlags(a, absorbGapTokens(a, calmGapRuns(a, oldFlags))),
    new: segmentsFromFlags(b, absorbGapTokens(b, calmGapRuns(b, newFlags)))
  };
}
function annotateIntraLine(rows) {
  let i = 0;
  const budget = { remaining: INTRA_MAX_TOTAL_CELLS };
  while (i < rows.length) {
    if (rows[i].kind === "ctx") {
      i++;
      continue;
    }
    const dels = [];
    const adds = [];
    while (i < rows.length && rows[i].kind !== "ctx") {
      if (rows[i].kind === "del") dels.push(rows[i]);
      else adds.push(rows[i]);
      i++;
    }
    const count = Math.min(dels.length, adds.length);
    if (count === 0) continue;
    for (let k = 0; k < count; k++) {
      if (budget.remaining <= 0) break;
      const segments = lineSegments(dels[k].text, adds[k].text, budget);
      if (segments === null) continue;
      dels[k].segments = segments.old;
      adds[k].segments = segments.new;
    }
  }
  return rows;
}
var MOVE_MIN_LINES = 2;
var MOVE_SINGLE_MIN_WIDTH = 12;
var MOVE_MAX_LINES = 120;
function displayWidth(text) {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    width += code >= 11904 && code <= 40959 || code >= 63744 && code <= 64255 || code >= 65280 && code <= 65519 ? 2 : 1;
  }
  return width;
}
function trimBlankEdges(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return { core: lines.slice(start, end), offset: start };
}
function runIsSignificant(lines) {
  if (lines.length >= MOVE_MIN_LINES && lines.some((text) => text.trim() !== "")) return true;
  if (lines.length === 1 && displayWidth(lines[0].trim()) >= MOVE_SINGLE_MIN_WIDTH) return true;
  return false;
}
function detectMoves(hunks) {
  const deleted = [];
  const added = [];
  for (const hunk of hunks) {
    let i = 0;
    const rows = hunk.rows;
    while (i < rows.length) {
      const kind = rows[i].kind;
      if (kind === "ctx") {
        i++;
        continue;
      }
      const start = i;
      while (i < rows.length && rows[i].kind === kind) i++;
      const run = rows.slice(start, i);
      const lines = run.map((row) => row.text);
      const trimmed = trimBlankEdges(lines);
      const record = {
        hunk,
        start,
        coreOffset: trimmed.offset,
        core: trimmed.core,
        oldNo: run[0].oldNo ?? null,
        newNo: run[0].newNo ?? null
      };
      if (trimmed.core.length === 0) continue;
      if (kind === "del") deleted.push(record);
      else added.push(record);
    }
  }
  if (deleted.length === 0 || added.length === 0) return 0;
  const candidates = [];
  for (const d2 of deleted) {
    if (!runIsSignificant(d2.core) || d2.core.length > MOVE_MAX_LINES) continue;
    for (const a of added) {
      if (d2.core.length !== a.core.length || !runIsSignificant(a.core)) continue;
      let equal = true;
      for (let k = 0; k < d2.core.length; k++) {
        if (d2.core[k] !== a.core[k]) {
          equal = false;
          break;
        }
      }
      if (!equal) continue;
      const distance = d2.oldNo !== null && a.newNo !== null ? Math.abs(a.newNo - d2.oldNo) : 0;
      candidates.push({ d: d2, a, length: d2.core.length, distance });
    }
  }
  if (candidates.length === 0) return 0;
  candidates.sort((x, y) => y.length - x.length || x.distance - y.distance);
  const usedDel = /* @__PURE__ */ new Set();
  const usedAdd = /* @__PURE__ */ new Set();
  let pairs = 0;
  for (const candidate of candidates) {
    const dKey = candidate.d.hunk.index + ":" + candidate.d.start;
    const aKey = candidate.a.hunk.index + ":" + candidate.a.start;
    if (usedDel.has(dKey) || usedAdd.has(aKey)) continue;
    usedDel.add(dKey);
    usedAdd.add(aKey);
    const delRow2 = candidate.d.hunk.rows[candidate.d.start + candidate.d.coreOffset];
    const addRow2 = candidate.a.hunk.rows[candidate.a.start + candidate.a.coreOffset];
    const length = candidate.length;
    if (addRow2.newNo !== null) delRow2.move = { kind: "to", line: addRow2.newNo, endLine: addRow2.newNo + length - 1 };
    if (delRow2.oldNo !== null) addRow2.move = { kind: "from", line: delRow2.oldNo, endLine: delRow2.oldNo + length - 1 };
    pairs++;
  }
  return pairs;
}
function hunkTotals(hunks) {
  let added = 0;
  let removed = 0;
  for (const hunk of hunks) {
    added += hunk.added;
    removed += hunk.removed;
  }
  return { added, removed };
}
function gutterSides(hunk) {
  const rows = hunk === null || hunk === void 0 ? null : hunk.rows;
  if (!Array.isArray(rows)) return { old: false, new: false };
  let hasOld = false;
  let hasNew = false;
  for (const row of rows) {
    if (!hasOld && row.oldNo !== null && row.oldNo !== void 0) hasOld = true;
    if (!hasNew && row.newNo !== null && row.newNo !== void 0) hasNew = true;
    if (hasOld && hasNew) break;
  }
  return { old: hasOld, new: hasNew };
}
function diffText(beforeText, afterText) {
  const oldLines = contentLines(beforeText ?? "");
  const newLines = contentLines(afterText ?? "");
  const { rows, coarse } = alignLines(oldLines, newLines);
  annotateIntraLine(rows);
  const hunks = groupHunks(rows);
  hunks.forEach((hunk, index) => {
    hunk.index = index + 1;
  });
  if (!coarse) detectMoves(hunks);
  const totals = hunkTotals(hunks);
  return {
    rows,
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    coarse,
    hasNumbers: true,
    beforeText: beforeText ?? "",
    afterText: afterText ?? "",
    beforeLineCount: oldLines.length,
    afterLineCount: newLines.length
  };
}
function fragmentDiff(oldText, newText) {
  const oldLines = contentLines(oldText ?? "");
  const newLines = contentLines(newText ?? "");
  const { rows } = alignLines(oldLines, newLines);
  annotateIntraLine(rows);
  const hunks = groupHunks(rows);
  hunks.forEach((hunk, index) => {
    hunk.index = index + 1;
  });
  const totals = hunkTotals(hunks);
  return {
    rows: [],
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    hasNumbers: false,
    fragment: true,
    beforeText: oldText ?? "",
    afterText: newText ?? ""
  };
}
function stripNumbers(hunks) {
  for (const hunk of hunks) {
    hunk.hasNumbers = false;
    hunk.oldStart = null;
    hunk.oldEnd = null;
    hunk.newStart = null;
    hunk.newEnd = null;
    for (const row of hunk.rows) {
      row.oldNo = null;
      row.newNo = null;
    }
  }
}
function computeGaps(hunks) {
  for (let i = 0; i < hunks.length; i++) {
    const current = hunks[i];
    if (i === 0) {
      current.gapBefore = null;
      continue;
    }
    const previous = hunks[i - 1];
    if (!current.hasNumbers || !previous.hasNumbers) {
      current.gapBefore = null;
      continue;
    }
    const oldStart = previous.oldEnd + 1;
    const newStart = previous.newEnd + 1;
    const count = current.oldStart - oldStart;
    if (count > 0) {
      current.gapBefore = {
        count,
        oldCount: count,
        newCount: count,
        oldStart,
        oldEnd: current.oldStart - 1,
        newStart,
        newEnd: current.newStart - 1,
        shift: newStart - oldStart
      };
    } else {
      current.gapBefore = null;
    }
  }
}
function attachLineNumbers(hunks, fileLines) {
  let shift = 0;
  for (const hunk of hunks) {
    const newSide = hunk.rows.filter((row) => row.kind !== "del").map((row) => row.text);
    const oldSide = hunk.rows.filter((row) => row.kind !== "add");
    let baseNew = null;
    if (newSide.length > 0) {
      const at = locateOnce(newSide, fileLines);
      if (at >= 0) baseNew = at + 1;
    } else if (oldSide.length > 0) {
      const probe = oldSide.slice(0, Math.min(CONTEXT_LINES, oldSide.length)).map((row) => row.text);
      const at = locateOnce(probe, fileLines);
      if (at >= 0) baseNew = at + 1 + shift;
    }
    if (baseNew !== null) {
      const baseOld = baseNew - shift;
      let oldNo = baseOld;
      let newNo = baseNew;
      for (const row of hunk.rows) {
        if (row.kind === "ctx") {
          row.oldNo = oldNo++;
          row.newNo = newNo++;
        } else if (row.kind === "del") {
          row.oldNo = oldNo++;
          row.newNo = null;
        } else {
          row.oldNo = null;
          row.newNo = newNo++;
        }
      }
      hunk.oldStart = hunk.rows.find((row) => row.oldNo !== null)?.oldNo ?? baseOld;
      hunk.newStart = hunk.rows.find((row) => row.newNo !== null)?.newNo ?? baseNew;
      hunk.oldEnd = [...hunk.rows].reverse().find((row) => row.oldNo !== null)?.oldNo ?? hunk.oldStart - 1;
      hunk.newEnd = [...hunk.rows].reverse().find((row) => row.newNo !== null)?.newNo ?? hunk.newStart - 1;
      hunk.hasNumbers = true;
    }
    shift += hunk.newCount - hunk.oldCount;
  }
  computeGaps(hunks);
}
function narrowDiffs(diffs) {
  if (!Array.isArray(diffs) || diffs.length === 0) return null;
  const out = [];
  for (const hunk of diffs) {
    if (hunk === null || typeof hunk !== "object") return null;
    const path = hunk.path;
    const oldText = hunk.oldText;
    const newText = hunk.newText;
    if (typeof path !== "string" || oldText !== null && typeof oldText !== "string" || typeof newText !== "string") return null;
    out.push({ path, oldText, newText });
  }
  return out;
}
function diffFromMeta(diffs, fileLines) {
  const hunks = [];
  let added = 0;
  let removed = 0;
  for (let i = 0; i < diffs.length; i++) {
    const diff2 = diffs[i];
    const oldLines = contentLines(diff2.oldText ?? "");
    const newLines = contentLines(diff2.newText);
    const { rows } = alignLines(oldLines, newLines);
    annotateIntraLine(rows);
    const hunk = makeHunk(rows, 1, 1, null);
    hunk.index = i + 1;
    added += hunk.added;
    removed += hunk.removed;
    hunks.push(hunk);
  }
  stripNumbers(hunks);
  if (Array.isArray(fileLines)) attachLineNumbers(hunks, fileLines);
  return {
    rows: [],
    hunks,
    added,
    removed,
    oldLineCount: null,
    newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
    hasNumbers: hunks.length > 0 && hunks.every((hunk) => hunk.hasNumbers),
    source: Array.isArray(fileLines) ? "located" : "meta",
    beforeText: null,
    afterText: null
  };
}
function joinPath(cwd, path) {
  if (typeof path !== "string" || path === "") return "";
  if (/^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\") || path.startsWith("/")) return path;
  if (typeof cwd !== "string" || cwd === "") return path;
  const separator = cwd.includes("\\") ? "\\" : "/";
  return `${cwd.replace(/[\\/]+$/, "")}${separator}${path.replace(/^[\\/]+/, "")}`;
}
function displayPath(path, cwd, home) {
  if (typeof path !== "string" || path === "") return "";
  let text = path;
  if (typeof cwd === "string" && cwd !== "") {
    const root = cwd.replace(/[\\/]+$/, "");
    if (text === root) text = ".";
    else if (text.startsWith(root + "/") || text.startsWith(root + "\\")) text = text.slice(root.length + 1);
  }
  if (typeof home === "string" && home !== "" && !/^[A-Za-z]:/.test(home)) {
    const root = home.replace(/\/+$/, "");
    if (text === root) text = "~";
    else if (text.startsWith(root + "/")) text = "~" + text.slice(root.length);
  }
  return text;
}

// src/client/model.js
var MUTATION_TOOLS = ["edit", "write", "str_replace_editor"];
function parseArgs(raw) {
  if (typeof raw !== "string" || raw === "") return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function stringArg(args, key) {
  if (args === null) return void 0;
  const value = args[key];
  return typeof value === "string" ? value : void 0;
}
function deriveCall(block) {
  const settled = block !== null && typeof block === "object" && "kind" in block;
  const call2 = settled ? block.call : block;
  const phase = settled ? "result" : call2?.phase === "preparing" ? "preparing" : "start";
  return {
    settled,
    phase,
    name: typeof call2?.name === "string" ? call2.name : "",
    argsRaw: typeof call2?.argsRaw === "string" ? call2.argsRaw : null,
    args: parseArgs(call2?.argsRaw),
    meta: settled ? block.meta : void 0,
    callId: settled ? block.callId : call2?.callId,
    parentCallId: settled ? block.parentCallId : call2?.parentCallId,
    isError: settled && block.isError === true,
    error: settled ? block.error : void 0,
    content: settled && Array.isArray(block.content) ? block.content : [],
    raw: block
  };
}
function resolveToolName(call2, fallback) {
  if (call2.name !== "") return call2.name;
  return typeof fallback === "string" ? fallback : "";
}
function errorMessage(call2) {
  if (call2.isError !== true) return "";
  const parts = [];
  for (const part of call2.content) {
    if (part?.type === "text" && typeof part.text === "string") parts.push(part.text);
  }
  const info = call2.error;
  if (parts.length === 0 && info !== null && typeof info === "object") {
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  const text = parts.join("\n").trim();
  if (text === "") return "";
  const newline = text.indexOf("\n");
  return newline === -1 ? text : text.slice(0, newline);
}
function titleKeyOf(toolName) {
  if (toolName === "write") return "title.write";
  if (toolName === "str_replace_editor") return "title.strReplace";
  return "title.edit";
}
function operationKey(operation) {
  if (operation === "create") return "op.create";
  if (operation === "overwrite") return "op.overwrite";
  return "op.update";
}
function resolveOperation(snapshot, call2, toolName) {
  if (snapshot !== null && snapshot !== void 0) {
    if (snapshot.operation === "create" || snapshot.before === null) return "create";
    return "update";
  }
  const metaOperation = call2.meta !== null && typeof call2.meta === "object" ? call2.meta.operation : void 0;
  if (metaOperation === "create") return "create";
  if (metaOperation === "update") return "update";
  if (toolName === "str_replace_editor" && stringArg(call2.args, "command") === "create") return "create";
  const diffs = call2.meta !== null && typeof call2.meta === "object" && Array.isArray(call2.meta.diffs) ? call2.meta.diffs : [];
  if (diffs.length > 0 && diffs.every((diff2) => diff2 !== null && typeof diff2 === "object" && diff2.oldText === null)) return "create";
  return "update";
}
function exceedsAlignBudget(beforeText, afterText) {
  const oldCount = contentLines(beforeText).length;
  const newCount = contentLines(afterText).length;
  return oldCount > ALIGN_MAX_SIDE_LINES || newCount > ALIGN_MAX_SIDE_LINES || oldCount * newCount > ALIGN_MAX_CELLS;
}
function buildCardModel({ block, toolName, cwd, home, snapshot, fileText, loading }) {
  const call2 = deriveCall(block);
  const resolvedToolName = resolveToolName(call2, toolName);
  const argsPath = stringArg(call2.args, "file_path") ?? stringArg(call2.args, "path");
  const metaPath = call2.meta !== null && typeof call2.meta === "object" && typeof call2.meta.path === "string" ? call2.meta.path : null;
  const absolutePath = metaPath !== null && metaPath !== "" ? metaPath : joinPath(cwd, argsPath ?? "");
  const shownPath = displayPath(metaPath !== null && metaPath !== "" ? metaPath : argsPath ?? "", cwd, home);
  const base = {
    toolName: resolvedToolName,
    titleKey: titleKeyOf(resolvedToolName),
    callId: call2.callId,
    filePath: shownPath,
    absolutePath: absolutePath !== "" ? absolutePath : null,
    operation: "update",
    status: "running",
    source: null,
    diff: null,
    notice: null,
    errorMessage: "",
    loading: loading === true,
    parentCallId: call2.parentCallId
  };
  if (call2.phase === "preparing") {
    return { ...base, status: "preparing" };
  }
  if (call2.settled && call2.isError) {
    return { ...base, status: "error", errorMessage: errorMessage(call2) };
  }
  if (call2.settled) {
    if (snapshot !== null && snapshot !== void 0 && typeof snapshot.after === "string") {
      const before = typeof snapshot.before === "string" ? snapshot.before : null;
      const after = snapshot.after;
      const operation = resolveOperation(snapshot, call2, resolvedToolName);
      if (before !== null && before === after) {
        return { ...base, status: "nochange", operation, source: "snapshot", diff: diffText(before, after) };
      }
      if (before !== null && exceedsAlignBudget(before, after)) {
        const oldCount = contentLines(before).length;
        const newCount = contentLines(after).length;
        const diffs2 = narrowDiffs(call2.meta?.diffs);
        if (diffs2 !== null) {
          const located = diffFromMeta(diffs2, contentLines(after));
          located.oldLineCount = oldCount;
          located.newLineCount = newCount;
          return {
            ...base,
            status: "ok",
            operation,
            source: "located",
            notice: { kind: "huge", old: oldCount, new: newCount },
            diff: located
          };
        }
        const coarse = diffText(before, after);
        return {
          ...base,
          status: "ok",
          operation,
          source: "snapshot",
          notice: coarse.coarse ? { kind: "coarse", old: oldCount, new: newCount } : { kind: "huge", old: oldCount, new: newCount },
          diff: coarse
        };
      }
      return {
        ...base,
        status: "ok",
        operation,
        source: "snapshot",
        diff: diffText(before ?? "", after)
      };
    }
    const diffs = narrowDiffs(call2.meta?.diffs);
    if (diffs !== null) {
      const lines = typeof fileText === "string" ? contentLines(fileText) : null;
      const located = diffFromMeta(diffs, lines);
      const hasNumbers = located.hasNumbers === true;
      const snapshotlessTool = resolvedToolName === "str_replace_editor";
      return {
        ...base,
        status: "ok",
        operation: resolveOperation(null, call2, resolvedToolName),
        source: lines === null || !hasNumbers ? "meta" : "located",
        notice: lines === null ? loading === true ? null : { kind: "lines" } : snapshotlessTool ? { kind: hasNumbers ? "tool" : "toolLocate" } : hasNumbers ? { kind: "history" } : { kind: "locate" },
        diff: located
      };
    }
    if (resolvedToolName === "write") {
      const content = stringArg(call2.args, "content");
      const metaOperation = call2.meta !== null && typeof call2.meta === "object" ? call2.meta.operation : void 0;
      if (typeof content === "string" && metaOperation !== "update") {
        const created = diffText("", content);
        return { ...base, status: "ok", operation: "create", source: "args", diff: created };
      }
      return { ...base, status: "nochange", operation: metaOperation === "create" ? "create" : "update", source: null };
    }
    return { ...base, status: "empty" };
  }
  const args = call2.args;
  if (resolvedToolName === "write") {
    const content = stringArg(args, "content");
    if (typeof content === "string") {
      const preview = diffText("", content);
      return { ...base, status: "running", operation: "create", source: "preview", diff: preview };
    }
  } else if (resolvedToolName === "edit") {
    const oldString = stringArg(args, "old_string");
    const newString = stringArg(args, "new_string");
    if (typeof oldString === "string" && typeof newString === "string") {
      const preview = fragmentDiff(oldString, newString);
      return { ...base, status: "running", operation: "update", source: "preview", diff: preview };
    }
  } else if (resolvedToolName === "str_replace_editor") {
    const oldString = stringArg(args, "old_str");
    const newString = stringArg(args, "new_str");
    const fileTextArg = stringArg(args, "file_text");
    if (typeof fileTextArg === "string") {
      return { ...base, status: "running", operation: "create", source: "preview", diff: diffText("", fileTextArg) };
    }
    if (typeof oldString === "string" && typeof newString === "string") {
      return { ...base, status: "running", operation: "update", source: "preview", diff: fragmentDiff(oldString, newString) };
    }
  }
  return { ...base, status: "running" };
}

// src/client/enhanced-tools.jsx
var import_react = require("react");

// src/client/settings.js
var STORAGE_KEY = "dsh-inline-diff.settings.v4";
var LEGACY_KEY = "dsh-inline-diff.settings.v3";
var OLDER_KEY = "dsh-inline-diff.settings.v2";
var RETIRED_KEY = "dsh-inline-diff.settings.v1";
var DEFAULTS = {
  /** 'enhanced' = inline diff cards; 'native' = DSH file-mutation rows. */
  fileCards: "enhanced",
  /** 'enhanced' = flat expanded Bash/PowerShell rows; 'native' = DSH rows. */
  shellRows: "native",
  /** 'enhanced' = other tool calls (generic/details/search/web) expand IN/OUT by default; 'native' = DSH disclosure rows. */
  toolCalls: "native",
  /** 'enhanced' = DSH verbose transcript (flat, unfolded); 'native' = don't touch it. */
  transcript: "native",
  /** Per-card-type shell tone: 'auto' (theme + host appearance), 'light', 'dark'. */
  fileShellTone: "auto",
  shellShellTone: "auto",
  toolShellTone: "auto",
  /** Per-card-type inner tone: 'auto' (official light/dark), 'light', 'dark', 'same' (= shell). */
  fileInnerTone: "auto",
  shellInnerTone: "auto",
  toolInnerTone: "auto",
  /** Syntax highlighting for diff code (detection/palette live in languages.js). */
  syntaxHighlight: true,
  /** Language badge style: 'short' code, 'full' name, or 'hidden'. */
  languageBadge: "short",
  /** Undetected language: 'show' a neutral "unknown" badge, or 'hidden'. */
  unknownLanguage: "show",
  /** 'on' = highlight color + font emphasis (bold keywords, italic comments); 'off' = color only. */
  syntaxEmphasis: "on"
};
var LANGUAGE_BADGE_VALUES = ["short", "full", "hidden"];
var UNKNOWN_LANGUAGE_VALUES = ["show", "hidden"];
var SYNTAX_EMPHASIS_VALUES = ["on", "off"];
var SHELL_TONE_VALUES = ["auto", "light", "dark"];
var INNER_TONE_VALUES = ["auto", "light", "dark", "same"];
var listeners = /* @__PURE__ */ new Set();
var previousTranscript;
var transcriptForm;
var configFormsRef;
var state = load();
persist();
function normalizeMode(value) {
  if (value === "enhanced" || value === "native") return value;
  if (typeof value === "string" && value !== "") return "enhanced";
  return void 0;
}
function normalizeEnum(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}
function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function normalizeShellTone(value) {
  return normalizeEnum(value, SHELL_TONE_VALUES, "auto");
}
function normalizeInnerTone(value) {
  return normalizeEnum(value, INNER_TONE_VALUES, "auto");
}
function startAppearanceTracking() {
  try {
    const doc = globalThis.document;
    const root = doc?.documentElement;
    const body = doc?.body ?? null;
    if (root === void 0 || root === null || typeof MutationObserver !== "function") return () => {
    };
    const styleOf = (node) => node === null ? "" : String(globalThis.getComputedStyle?.(node)?.colorScheme || "");
    const apply2 = () => {
      const tokens = [String(root.style.colorScheme || ""), styleOf(root), styleOf(body)].filter((part) => part !== "").join(" ").toLowerCase();
      let mode;
      if (tokens.includes("dark")) mode = "dark";
      else if (tokens.includes("light")) mode = "light";
      else if (body !== null && body.hasAttribute("data-ds-dark-theme")) mode = "dark";
      else mode = globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches === true ? "dark" : "light";
      if (root.dataset.dshInlineDiffAppearance !== mode) root.dataset.dshInlineDiffAppearance = mode;
      if (body !== null && body.dataset.dshInlineDiffAppearance !== mode) body.dataset.dshInlineDiffAppearance = mode;
    };
    apply2();
    const observer = new MutationObserver(apply2);
    observer.observe(root, { attributes: true, attributeFilter: ["style", "class"] });
    if (body !== null) {
      observer.observe(body, { attributes: true, attributeFilter: ["style", "class", "data-ds-dark-theme"] });
    }
    const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    if (media !== null && media !== void 0 && typeof media.addEventListener === "function") media.addEventListener("change", apply2);
    return () => {
      observer.disconnect();
      if (media !== null && media !== void 0 && typeof media.removeEventListener === "function") media.removeEventListener("change", apply2);
    };
  } catch {
    return () => {
    };
  }
}
function load() {
  try {
    const storage = globalThis.localStorage;
    if (storage === void 0 || storage === null) return { ...DEFAULTS };
    let raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== "string" || raw === "") raw = storage.getItem(LEGACY_KEY);
    if (typeof raw !== "string" || raw === "") raw = storage.getItem(OLDER_KEY);
    if (typeof raw !== "string" || raw === "") return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ...DEFAULTS };
    const next = { ...DEFAULTS };
    const fileCards = normalizeMode(parsed.fileCards);
    const shellRows = normalizeMode(parsed.shellRows);
    const toolCalls = normalizeMode(parsed.toolCalls);
    const transcript = normalizeMode(parsed.transcript);
    if (fileCards !== void 0) next.fileCards = fileCards;
    if (shellRows !== void 0) next.shellRows = shellRows;
    if (toolCalls !== void 0) next.toolCalls = toolCalls;
    if (transcript !== void 0) next.transcript = transcript;
    if (parsed.fileShellTone !== void 0) next.fileShellTone = normalizeShellTone(parsed.fileShellTone);
    if (parsed.shellShellTone !== void 0) next.shellShellTone = normalizeShellTone(parsed.shellShellTone);
    if (parsed.toolShellTone !== void 0) next.toolShellTone = normalizeShellTone(parsed.toolShellTone);
    if (parsed.fileInnerTone !== void 0) next.fileInnerTone = normalizeInnerTone(parsed.fileInnerTone);
    if (parsed.shellInnerTone !== void 0) next.shellInnerTone = normalizeInnerTone(parsed.shellInnerTone);
    if (parsed.toolInnerTone !== void 0) next.toolInnerTone = normalizeInnerTone(parsed.toolInnerTone);
    next.syntaxHighlight = normalizeBoolean(parsed.syntaxHighlight, DEFAULTS.syntaxHighlight);
    next.languageBadge = normalizeEnum(parsed.languageBadge, LANGUAGE_BADGE_VALUES, DEFAULTS.languageBadge);
    next.unknownLanguage = normalizeEnum(parsed.unknownLanguage, UNKNOWN_LANGUAGE_VALUES, DEFAULTS.unknownLanguage);
    next.syntaxEmphasis = normalizeEnum(parsed.syntaxEmphasis, SYNTAX_EMPHASIS_VALUES, DEFAULTS.syntaxEmphasis);
    if (typeof parsed.previousTranscript === "string" && parsed.previousTranscript !== "") {
      previousTranscript = parsed.previousTranscript;
    }
    return next;
  } catch {
    return { ...DEFAULTS };
  }
}
function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      ...previousTranscript === void 0 ? {} : { previousTranscript }
    }));
    globalThis.localStorage?.removeItem(LEGACY_KEY);
    globalThis.localStorage?.removeItem(OLDER_KEY);
    globalThis.localStorage?.removeItem(RETIRED_KEY);
  } catch {
  }
}
function emit() {
  for (const listener of listeners) listener();
}
function getSettings() {
  return state;
}
function subscribeSettings(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function updateSettings(patch) {
  state = { ...state, ...patch };
  persist();
  emit();
}
async function resetSettings() {
  const wasEnhanced = state.transcript === "enhanced";
  state = { ...DEFAULTS };
  previousTranscript = void 0;
  persist();
  emit();
  try {
    if (state.transcript === "enhanced") await adoptTranscriptPreference();
    else if (wasEnhanced) await setTranscriptPreference("native");
  } catch {
  }
}
function initSettings(configForms) {
  configFormsRef = configForms;
  void adoptTranscriptPreference();
}
function chatForm() {
  if (configFormsRef === void 0) throw new Error("configForms is not available");
  if (transcriptForm === void 0) transcriptForm = configFormsRef.get("ui-chat");
  return transcriptForm;
}
function currentTranscriptMode() {
  try {
    return chatForm().getSnapshot().value?.transcriptView;
  } catch {
    return void 0;
  }
}
async function setTranscriptPreference(mode) {
  const form = chatForm();
  if (mode === "enhanced") {
    const current2 = form.getSnapshot().value?.transcriptView;
    if (typeof current2 === "string" && current2 !== "verbose" && current2 !== "normal" && current2 !== "expanded") {
      previousTranscript = current2;
    } else if (typeof current2 !== "string") {
      previousTranscript = "standard";
    }
    updateSettings({ transcript: "enhanced" });
    await form.set("transcriptView", "verbose");
    return;
  }
  updateSettings({ transcript: "native" });
  const current = form.getSnapshot().value?.transcriptView;
  if (current === "verbose") {
    await form.set("transcriptView", previousTranscript ?? "standard");
  }
}
async function adoptTranscriptPreference() {
  if (state.transcript !== "enhanced") return;
  try {
    if (configFormsRef === void 0) return;
    const form = chatForm();
    const current = form.getSnapshot().value?.transcriptView;
    if (current !== "verbose") {
      if (typeof current === "string" && current !== "normal" && current !== "expanded") previousTranscript = current;
      await form.set("transcriptView", "verbose");
      persist();
    }
  } catch {
  }
}

// src/client/tool-status.js
var INPUT_FAILURE_CODES = Object.freeze([
  "INVALID_ARGS",
  "UNKNOWN_TOOL",
  "ABORTED_BEFORE_DISPATCH"
]);
var INTERRUPTED_CODE = "interrupted";
function runningStates() {
  return { input: "running", output: "running" };
}
function asObject(value) {
  return value !== null && typeof value === "object" ? value : null;
}
function errorCodeOf(call2) {
  let error;
  try {
    error = call2.error;
  } catch {
    return "";
  }
  if (error === null || typeof error !== "object") return "";
  let code;
  try {
    code = error.code;
  } catch {
    return "";
  }
  if (typeof code !== "string") return "";
  const trimmed = code.trim();
  return trimmed === "" ? "" : trimmed;
}
function isInterrupted(call2) {
  return errorCodeOf(call2).toLowerCase() === INTERRUPTED_CODE;
}
function failedByArguments(call2) {
  let raw;
  try {
    raw = call2.argsRaw;
  } catch {
    return false;
  }
  if (typeof raw !== "string" || raw === "") return false;
  return parseArgs(raw) === null;
}
function failureSide(call2) {
  try {
    const target = asObject(call2);
    if (target === null || target.isError !== true) return "output";
    const code = errorCodeOf(target);
    if (code !== "") {
      return INPUT_FAILURE_CODES.includes(code.toUpperCase()) ? "input" : "output";
    }
    return failedByArguments(target) ? "input" : "output";
  } catch {
    return "output";
  }
}
function failingStates(call2) {
  if (isInterrupted(call2)) return { input: "ok", output: "stopped" };
  if (failureSide(call2) === "input") return { input: "error", output: "skipped" };
  return { input: "ok", output: "error" };
}
function sectionStates(call2) {
  try {
    const target = asObject(call2);
    if (target === null) return runningStates();
    if (target.settled !== true) {
      return {
        input: target.phase === "preparing" ? "preparing" : "running",
        output: "running"
      };
    }
    if (target.isError !== true) return { input: "ok", output: "ok" };
    return failingStates(target);
  } catch {
    return runningStates();
  }
}
function shellSectionStates(call2, exitFailed) {
  try {
    const target = asObject(call2);
    if (target === null) return runningStates();
    if (target.settled !== true) {
      return {
        input: target.phase === "preparing" ? "preparing" : "running",
        output: "running"
      };
    }
    if (target.isError !== true) {
      return exitFailed === true ? { input: "ok", output: "error" } : { input: "ok", output: "ok" };
    }
    return failingStates(target);
  } catch {
    return runningStates();
  }
}

// src/client/enhanced-tools.jsx
var import_jsx_runtime = require("react/jsx-runtime");
function toolLabel(name, t) {
  if (typeof name !== "string" || name === "") return "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name.replace(/[_-]+/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
function wireName(name, t) {
  if (typeof name !== "string" || name === "") return "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name;
}
function clampSummary(text) {
  const first = typeof text === "string" ? text.split("\n")[0].trim() : "";
  return first.length > 120 ? first.slice(0, 120) + "…" : first;
}
function searchSummary(call2) {
  const args = call2.args;
  if (args === null || typeof args !== "object") return "";
  if (call2.name === "grep" || call2.name === "glob") {
    const pattern = typeof args.pattern === "string" ? args.pattern : "";
    const path = typeof args.path === "string" ? args.path : "";
    const include = call2.name === "grep" && typeof args.include === "string" ? args.include : "";
    return clampSummary([pattern, path, include].filter((part) => part.trim() !== "").join("  ·  "));
  }
  if (call2.name === "web_search") {
    const queries = Array.isArray(args.queries) ? args.queries.filter((query) => typeof query === "string" && query.trim() !== "") : [];
    return clampSummary(queries.join("  ·  "));
  }
  if (call2.name === "web_fetch") {
    return clampSummary(typeof args.url === "string" ? args.url : "");
  }
  return "";
}
function summaryOf(args, call2) {
  if (args === null || typeof args !== "object") return "";
  const specific = call2 === void 0 ? "" : searchSummary(call2);
  if (specific !== "") return specific;
  const keys = ["description", "command", "file_path", "path", "url", "query", "queries", "prompt", "objective", "skill", "title", "name", "tool"];
  for (const key of keys) {
    const value = args[key];
    if (Array.isArray(value)) {
      const joined = value.filter((item) => typeof item === "string" && item.trim() !== "").join("  ·  ");
      if (joined !== "") return clampSummary(joined);
      continue;
    }
    if (typeof value !== "string" || value.trim() === "") continue;
    return clampSummary(value);
  }
  return "";
}
function badgeOf(call2, t) {
  if (!call2.settled) return "";
  const meta = call2.meta;
  if (meta === null || typeof meta !== "object") return "";
  if (call2.name === "grep" && typeof meta.total === "number" && Number.isFinite(meta.total)) {
    return t("search.matches", { n: meta.total }) + (meta.truncated === true ? "+" : "");
  }
  if (call2.name === "glob" && Array.isArray(meta.paths)) {
    return t("search.files", { n: meta.paths.length });
  }
  if (call2.name === "web_search" && Array.isArray(meta.sources)) {
    return t("web.sources", { n: meta.sources.length });
  }
  if (call2.name === "web_fetch" && typeof meta.statusCode === "number" && Number.isFinite(meta.statusCode)) {
    return t("web.status", { code: meta.statusCode });
  }
  return "";
}
function inputText(call2) {
  if (call2.args !== null && call2.args !== void 0) {
    try {
      return JSON.stringify(call2.args, null, 2);
    } catch {
      return call2.argsRaw ?? "";
    }
  }
  return call2.argsRaw ?? "";
}
function outputText(call2) {
  const parts = [];
  for (const part of call2.content) {
    if (part === null || typeof part !== "object") continue;
    if (part.type === "text" && typeof part.text === "string") parts.push(part.text);
    else if (part.type === "image") parts.push("[image]");
    else parts.push(JSON.stringify(part, null, 2));
  }
  if (parts.length === 0 && call2.error !== null && call2.error !== void 0) {
    const info = call2.error;
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  return parts.join("\n");
}
function kindOf(toolName) {
  if (SHELL_KEYS.has(toolName)) return "command";
  if (toolName === "grep" || toolName === "glob") return "search";
  if (toolName === "web_search" || toolName === "web_fetch") return "web";
  return "tool";
}
function genericModel(block, toolName, t) {
  const call2 = deriveCall(block);
  const stopped = call2.settled && call2.error !== null && call2.error !== void 0 && call2.error.code === "interrupted";
  const state2 = !call2.settled ? call2.phase === "preparing" ? "preparing" : "running" : stopped ? "stopped" : call2.isError ? "error" : "ok";
  const sections = sectionStates(call2);
  const resolvedName = call2.name !== "" ? call2.name : toolName;
  return {
    title: toolLabel(resolvedName, t),
    displayName: wireName(resolvedName, t),
    summary: summaryOf(call2.args, call2),
    badge: badgeOf(call2, t),
    kind: kindOf(resolvedName),
    input: inputText(call2),
    output: call2.settled ? outputText(call2) : "",
    state: state2,
    inputState: sections.input,
    outputState: sections.output,
    // "Input accepted, output pending": show an OUT placeholder so its own
    // brand-colored, pulsing bar is visible while the tool runs.
    waitingForOutput: call2.settled !== true && call2.phase !== "preparing"
  };
}
function statusKey(state2) {
  if (state2 === "preparing") return "state.preparing";
  if (state2 === "running") return "state.running";
  if (state2 === "error") return "state.error";
  if (state2 === "stopped") return "state.stopped";
  return null;
}
function EnhancedExpandedTool({ block, toolName, t, inspect }) {
  const tone = useDisplaySettings();
  const model = (0, import_react.useMemo)(() => genericModel(block, toolName, t), [block, toolName, t]);
  const [open, setOpen] = (0, import_react.useState)(true);
  const stateLabel = statusKey(model.state);
  const hasBody = model.input !== "" || model.output !== "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-tool enhanced-generic", "data-variant": "tool", "data-kind": model.kind, "data-state": model.state, "data-tool": toolName, "data-shell-tone": tone.toolShellTone, "data-inner-tone": tone.toolInnerTone, "data-body": hasBody && open ? "true" : "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-kind", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { kind: model.kind }) }),
      hasBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "enhanced-toggle",
          "aria-expanded": open,
          "aria-label": open ? t("collapse") : t("expand"),
          onClick: () => setOpen((value) => !value),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "11", height: "11", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6 3.5 10.5 8 6 12.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) })
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-toggle-placeholder", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-dot", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-tag", children: t("tool.fallbackTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-name", children: model.displayName }),
      model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-summary", title: model.summary, children: model.summary }) : null,
      model.badge !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-badge", children: model.badge }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "enhanced-actions", children: [
        stateLabel !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-state", children: t(stateLabel) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectButton, { inspect, t })
      ] })
    ] }),
    open && hasBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-io", children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", "data-section": "in", "data-state": model.inputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", "data-error": model.inputState === "error" ? "" : void 0, children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", "data-error": model.outputState === "error" ? "" : void 0, children: model.output }) })
      ] }) : model.waitingForOutput ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("pre", { className: "enhanced-code", "data-placeholder": "true", children: [
          t("state.running"),
          "…"
        ] }) })
      ] }) : null
    ] }) : null
  ] });
}
var ENHANCED_DETAILS_KEYS = [
  "create_goal",
  "get_goal",
  "update_goal",
  "schedule_create",
  "schedule_list",
  "schedule_view",
  "schedule_edit",
  "schedule_delete",
  "schedule_update",
  "cordis_inspect_list",
  "cordis_inspect_query",
  "cordis_inspect_self",
  "workflow",
  "ralph",
  "session_event_read",
  "session_event_search",
  "session_event_trace",
  "session_search",
  "session_trace",
  "list_subagent_models",
  "subagent",
  "list_agents",
  "send_message",
  "interrupt_agent",
  "spawn_teammate",
  "wait_agent",
  "job_list",
  "job_output",
  "job_kill",
  "terminal_open",
  "terminal_read",
  "terminal_list",
  "terminal_signal",
  "terminal_close",
  "lsp",
  "team_task_create",
  "team_task_get",
  "team_task_update",
  "team_task_list"
];
var ENHANCED_SEARCH_WEB_KEYS = ["grep", "glob", "web_search", "web_fetch"];
var SHELL_KEYS = /* @__PURE__ */ new Set(["bash", "pwsh", "win_bash"]);
function useDisplaySettings() {
  return (0, import_react.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
var ENHANCED_GENERIC_KEYS = [
  "browser_navigate",
  "browser_click",
  "browser_type",
  "browser_press",
  "browser_scroll",
  "browser_snapshot",
  "browser_screenshot",
  "browser_console",
  "browser_network",
  "browser_tabs",
  "browser_close",
  "working_directory",
  "load_workspace_dependencies",
  "plugin_manager",
  "skill",
  "exit_plan_mode",
  "subagent_fork",
  "squads_list",
  "squads_read",
  "squads_create",
  "squads_update",
  "squads_delete",
  "squad_member_add",
  "squad_member_update",
  "squad_member_remove",
  "squads_run_member",
  "squads_run_squad",
  "task_board_list",
  "task_board_get",
  "task_board_create",
  "task_board_update",
  "task_board_manage",
  "task_board_run",
  "task_board_schedule",
  "task_board_set_parent",
  "task_board_github_list",
  "task_board_github_get",
  "task_board_github_refresh",
  "task_board_github_repositories",
  "task_board_github_setup",
  "task_board_github_comment",
  "task_board_github_create_pr",
  "task_board_github_link_pr",
  "task_board_github_close_issue"
];
function KindIcon({ kind }) {
  if (kind === "command") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m3.5 5 3.2 3-3.2 3M8.5 11h4", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" }) });
  }
  if (kind === "search") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "7", cy: "7", r: "4.2", stroke: "currentColor", strokeWidth: "1.3" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m10.2 10.2 3.1 3.1", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
    ] });
  }
  if (kind === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "8", cy: "8", r: "5.8", stroke: "currentColor", strokeWidth: "1.2" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.4 8h11.2M8 2.2c1.7 1.7 2.5 3.6 2.5 5.8S9.7 12.1 8 13.8C6.3 12.1 5.5 10.2 5.5 8S6.3 3.9 8 2.2Z", stroke: "currentColor", strokeWidth: "1.1" })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 1.8l1.5 4.2L13.7 7.5l-4.2 1.5L8 13.2 6.5 9 2.3 7.5 6.5 6 8 1.8Z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round" }) });
}
function InspectButton({ inspect, t }) {
  if (typeof inspect !== "function") return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "enhanced-inspect",
      title: t("inspectTrajectory"),
      "aria-label": t("inspectTrajectory"),
      onClick: (event) => {
        event.stopPropagation();
        inspect();
      },
      onKeyDown: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "11", height: "11", fill: "none", "aria-hidden": "true", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 2.2h4.6v4.6M13.8 2.2 8.1 7.9", stroke: "currentColor", strokeWidth: "1.35", strokeLinecap: "round", strokeLinejoin: "round" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.6 9.3v3.6a.9.9 0 0 1-.9.9H3.1a.9.9 0 0 1-.9-.9V5.3a.9.9 0 0 1 .9-.9h3.6", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-inspect-label", children: t("inspectShort") })
      ]
    }
  );
}

// src/client/enhanced-shell.jsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function resultText(call2) {
  const parts = [];
  for (const part of call2.content) {
    if (part !== null && typeof part === "object") {
      if (part.type === "text" && typeof part.text === "string") parts.push(part.text);
      else if (part.type !== void 0) parts.push(JSON.stringify(part, null, 2));
    }
  }
  if (parts.length === 0 && call2.error !== null && call2.error !== void 0) {
    const info = call2.error;
    const reason = typeof info.reason === "string" ? info.reason : typeof info.code === "string" ? info.code : typeof info.name === "string" ? info.name : "";
    if (reason !== "") parts.push(reason);
  }
  return parts.join("\n");
}
function parseExit(text) {
  const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text);
  if (signal !== null) return { output: text.slice(0, signal.index), label: signal[1], failed: true };
  const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text);
  if (exit !== null) {
    const code = exit[1] === "null" ? null : Number(exit[1]);
    return { output: text.slice(0, exit.index), label: code === null ? "null" : `exit ${code}`, failed: code !== 0 };
  }
  return { output: text, label: void 0, failed: false };
}
function firstLine(text) {
  if (typeof text !== "string") return "";
  const newline = text.indexOf("\n");
  return (newline === -1 ? text : text.slice(0, newline)).trim();
}
function shellModel(block, toolName) {
  const call2 = deriveCall(block);
  const args = call2.args ?? parseArgs(call2.argsRaw) ?? null;
  const command = args !== null && typeof args.command === "string" ? args.command : "";
  const description = args !== null && typeof args.description === "string" ? args.description : "";
  const background = args !== null && args.run_in_background === true;
  const title = call2.name === "pwsh" || toolName === "pwsh" ? "PowerShell" : "Bash";
  const summary = description.trim() !== "" ? firstLine(description) : firstLine(command);
  const input = command !== "" ? command : typeof call2.argsRaw === "string" ? call2.argsRaw.trim() : "";
  const text = call2.settled ? resultText(call2) : "";
  const exit = call2.settled && text !== "" ? parseExit(text) : { output: text, label: void 0, failed: false };
  const sections = shellSectionStates(call2, exit.failed === true);
  const stopped = call2.settled && call2.error !== null && call2.error !== void 0 && call2.error.code === "interrupted";
  const state2 = !call2.settled ? call2.phase === "preparing" ? "preparing" : "running" : stopped ? "stopped" : call2.isError || exit.failed ? "error" : "ok";
  return {
    title,
    summary,
    command,
    input,
    description,
    output: call2.settled ? exit.output : "",
    exitLabel: call2.settled && !call2.isError ? exit.label : void 0,
    state: state2,
    inputState: sections.input,
    outputState: sections.output,
    // "Input accepted, output pending": the OUT section shows a placeholder so
    // its own (brand colored, pulsing) bar is visible while the process runs.
    waitingForOutput: call2.settled !== true && call2.phase !== "preparing",
    background,
    expanded: command !== "" || exit.output !== ""
  };
}
function useCardSettings() {
  return (0, import_react2.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props;
  const tone = useCardSettings();
  const model = (0, import_react2.useMemo)(() => shellModel(block, toolName), [block, toolName]);
  const hasIO = model.input !== "" || model.output !== "" || model.waitingForOutput;
  const stateLabel = model.state === "error" ? t("state.error") : model.state === "stopped" ? t("state.stopped") : model.state === "running" ? t("state.running") : model.state === "preparing" ? t("state.preparing") : "";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-tool enhanced-command", "data-variant": "command", "data-state": model.state, "data-tool": toolName, "data-shell-tone": tone.shellShellTone, "data-inner-tone": tone.shellInnerTone, "data-body": hasIO ? "true" : "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-kind", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindIcon, { kind: "command" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-dot", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-name", children: model.title }),
      model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-summary", title: model.command, children: model.summary }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "enhanced-actions", children: [
        model.exitLabel !== void 0 && model.exitLabel !== "exit 0" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-exit", children: model.exitLabel }) : null,
        stateLabel !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-state", children: stateLabel }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InspectButton, { inspect, t })
      ] })
    ] }),
    hasIO ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-io", children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", "data-section": "in", "data-state": model.inputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { className: "enhanced-code", "data-error": model.inputState === "error" ? "" : void 0, children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { className: "enhanced-code", "data-error": model.outputState === "error" ? "" : void 0, children: model.output }) })
      ] }) : model.waitingForOutput ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.out") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("pre", { className: "enhanced-code", "data-placeholder": "true", children: [
          t("state.running"),
          "…"
        ] }) })
      ] }) : null
    ] }) : null
  ] });
}

// src/client/components.jsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");

// src/client/api.js
var API_PREFIX = "/dsh-inline-diff/api";
var TIMEOUT_MS = 1e4;
async function call(action, payload2) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_PREFIX}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload2 ?? {}),
      signal: controller.signal
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data !== null && typeof data === "object" ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
async function fetchSnapshot(sessionId, callId) {
  if (typeof sessionId !== "string" || sessionId === "" || callId === void 0 || callId === null) return null;
  const data = await call("snapshot", { sessionId, callId: String(callId) });
  if (data === null || data.ok !== true) return null;
  const snapshot = data.snapshot;
  if (snapshot === null || typeof snapshot !== "object") return null;
  if (typeof snapshot.after !== "string") return null;
  return {
    path: typeof snapshot.path === "string" ? snapshot.path : "",
    before: typeof snapshot.before === "string" ? snapshot.before : null,
    after: snapshot.after,
    operation: typeof snapshot.operation === "string" ? snapshot.operation : snapshot.before === null ? "create" : "update"
  };
}
async function fetchFileText(cwd, path) {
  if (typeof cwd !== "string" || cwd === "" || typeof path !== "string" || path === "") return null;
  const data = await call("read", { cwd, path });
  if (data === null || data.ok !== true) return null;
  if (data.kind === "text" && typeof data.text === "string") return { kind: "text", text: data.text, size: data.size };
  if (data.kind === "binary") return { kind: "binary", size: data.size };
  if (data.kind === "oversized") return { kind: "oversized", size: data.size };
  return null;
}
var FILE_CACHE_LIMIT = 24;
var FILE_CACHE_TTL = 15e3;
var fileCache = /* @__PURE__ */ new Map();
async function cachedFileText(cwd, path) {
  const key = `${cwd ?? ""}\0${path ?? ""}`;
  const now = Date.now();
  const hit = fileCache.get(key);
  if (hit !== void 0 && now - hit.at < FILE_CACHE_TTL) {
    fileCache.delete(key);
    fileCache.set(key, hit);
    return hit.value;
  }
  const value = await fetchFileText(cwd, path);
  fileCache.set(key, { value, at: now });
  if (fileCache.size > FILE_CACHE_LIMIT) {
    const oldest = fileCache.keys().next().value;
    if (oldest !== void 0) fileCache.delete(oldest);
  }
  return value;
}
var snapshotCache = /* @__PURE__ */ new Map();
async function cachedSnapshot(sessionId, callId) {
  const key = `${sessionId ?? ""}\0${callId ?? ""}`;
  if (snapshotCache.has(key)) return snapshotCache.get(key) ?? null;
  let snapshot = await fetchSnapshot(sessionId, callId);
  if (snapshot === null) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    snapshot = await fetchSnapshot(sessionId, callId);
  }
  snapshotCache.set(key, snapshot);
  if (snapshotCache.size > 160) {
    const oldest = snapshotCache.keys().next().value;
    if (oldest !== void 0) snapshotCache.delete(oldest);
  }
  return snapshot;
}

// node_modules/highlight.js/es/core.js
var import_core = __toESM(require_core(), 1);
var core_default = import_core.default;

// node_modules/highlight.js/es/languages/asciidoc.js
function asciidoc(hljs) {
  const regex = hljs.regex;
  const HORIZONTAL_RULE = {
    begin: "^'{3,}[ \\t]*$",
    relevance: 10
  };
  const ESCAPED_FORMATTING = [
    // escaped constrained formatting marks (i.e., \* \_ or \`)
    { begin: /\\[*_`]/ },
    // escaped unconstrained formatting marks (i.e., \\** \\__ or \\``)
    // must ignore until the next formatting marks
    // this rule might not be 100% compliant with Asciidoctor 2.0 but we are entering undefined behavior territory...
    { begin: /\\\\\*{2}[^\n]*?\*{2}/ },
    { begin: /\\\\_{2}[^\n]*_{2}/ },
    { begin: /\\\\`{2}[^\n]*`{2}/ },
    // guard: constrained formatting mark may not be preceded by ":", ";" or
    // "}". match these so the constrained rule doesn't see them
    { begin: /[:;}][*_`](?![*_`])/ }
  ];
  const STRONG = [
    // inline unconstrained strong (single line)
    {
      className: "strong",
      begin: /\*{2}([^\n]+?)\*{2}/
    },
    // inline unconstrained strong (multi-line)
    {
      className: "strong",
      begin: regex.concat(
        /\*\*/,
        /((\*(?!\*)|\\[^\n]|[^*\n\\])+\n)+/,
        /(\*(?!\*)|\\[^\n]|[^*\n\\])*/,
        /\*\*/
      ),
      relevance: 0
    },
    // inline constrained strong (single line)
    {
      className: "strong",
      // must not precede or follow a word character
      begin: /\B\*(\S|\S[^\n]*?\S)\*(?!\w)/
    },
    // inline constrained strong (multi-line)
    {
      className: "strong",
      // must not precede or follow a word character
      begin: /\*[^\s]([^\n]+\n)+([^\n]+)\*/
    }
  ];
  const EMPHASIS = [
    // inline unconstrained emphasis (single line)
    {
      className: "emphasis",
      begin: /_{2}([^\n]+?)_{2}/
    },
    // inline unconstrained emphasis (multi-line)
    {
      className: "emphasis",
      begin: regex.concat(
        /__/,
        /((_(?!_)|\\[^\n]|[^_\n\\])+\n)+/,
        /(_(?!_)|\\[^\n]|[^_\n\\])*/,
        /__/
      ),
      relevance: 0
    },
    // inline constrained emphasis (single line)
    {
      className: "emphasis",
      // must not precede or follow a word character
      begin: /\b_(\S|\S[^\n]*?\S)_(?!\w)/
    },
    // inline constrained emphasis (multi-line)
    {
      className: "emphasis",
      // must not precede or follow a word character
      begin: /_[^\s]([^\n]+\n)+([^\n]+)_/
    },
    // inline constrained emphasis using single quote (legacy)
    {
      className: "emphasis",
      // must not follow a word character or be followed by a single quote or space
      begin: "\\B'(?!['\\s])",
      end: "(\\n{2}|')",
      // allow escaped single quote followed by word char
      contains: [
        {
          begin: "\\\\'\\w",
          relevance: 0
        }
      ],
      relevance: 0
    }
  ];
  const ADMONITION = {
    className: "symbol",
    begin: "^(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\\s+",
    relevance: 10
  };
  const BULLET_LIST = {
    className: "bullet",
    begin: "^(\\*+|-+|\\.+|[^\\n]+?::)\\s+"
  };
  return {
    name: "AsciiDoc",
    aliases: ["adoc"],
    contains: [
      // block comment
      hljs.COMMENT(
        "^/{4,}\\n",
        "\\n/{4,}$",
        // can also be done as...
        // '^/{4,}$',
        // '^/{4,}$',
        { relevance: 10 }
      ),
      // line comment
      hljs.COMMENT(
        "^//",
        "$",
        { relevance: 0 }
      ),
      // title
      {
        className: "title",
        begin: "^\\.\\w.*$"
      },
      // example, admonition & sidebar blocks
      {
        begin: "^[=\\*]{4,}\\n",
        end: "\\n^[=\\*]{4,}$",
        relevance: 10
      },
      // headings
      {
        className: "section",
        relevance: 10,
        variants: [
          { begin: "^(={1,6})[ 	].+?([ 	]\\1)?$" },
          { begin: "^[^\\[\\]\\n]+?\\n[=\\-~\\^\\+]{2,}$" }
        ]
      },
      // document attributes
      {
        className: "meta",
        begin: "^:.+?:",
        end: "\\s",
        excludeEnd: true,
        relevance: 10
      },
      // block attributes
      {
        className: "meta",
        begin: "^\\[.+?\\]$",
        relevance: 0
      },
      // quoteblocks
      {
        className: "quote",
        begin: "^_{4,}\\n",
        end: "\\n_{4,}$",
        relevance: 10
      },
      // listing and literal blocks
      {
        className: "code",
        begin: "^[\\-\\.]{4,}\\n",
        end: "\\n[\\-\\.]{4,}$",
        relevance: 10
      },
      // passthrough blocks
      {
        begin: "^\\+{4,}\\n",
        end: "\\n\\+{4,}$",
        contains: [
          {
            begin: "<",
            end: ">",
            subLanguage: "xml",
            relevance: 0
          }
        ],
        relevance: 10
      },
      BULLET_LIST,
      ADMONITION,
      ...ESCAPED_FORMATTING,
      ...STRONG,
      ...EMPHASIS,
      // inline smart quotes
      {
        className: "string",
        variants: [
          { begin: "``.+?''" },
          { begin: "`.+?'" }
        ]
      },
      // inline unconstrained emphasis
      {
        className: "code",
        begin: /`{2}/,
        end: /(\n{2}|`{2})/
      },
      // inline code snippets (TODO should get same treatment as strong and emphasis)
      {
        className: "code",
        begin: "(`.+?`|\\+.+?\\+)",
        relevance: 0
      },
      // indented literal block
      {
        className: "code",
        begin: "^[ \\t]",
        end: "$",
        relevance: 0
      },
      HORIZONTAL_RULE,
      // images and links
      {
        begin: "(link:)?(http|https|ftp|file|irc|image:?):\\S+?\\[[^[]*?\\]",
        returnBegin: true,
        contains: [
          {
            begin: "(link|image:?):",
            relevance: 0
          },
          {
            className: "link",
            begin: "\\w",
            end: "[^\\[]+",
            relevance: 0
          },
          {
            className: "string",
            begin: "\\[",
            end: "\\]",
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          }
        ],
        relevance: 10
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/bash.js
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [VAR]
      }
      // default values
    ]
  };
  Object.assign(VAR, {
    className: "variable",
    variants: [
      { begin: regex.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`
      ) },
      BRACED_VAR
    ]
  });
  const SUBST = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const COMMENT = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: "string",
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  };
  const KEYWORDS3 = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ];
  const LITERALS3 = [
    "true",
    "false"
  ];
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];
  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];
  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];
  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS3,
      literal: LITERALS3,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG,
      // to catch known shells and boost relevancy
      hljs.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}

// node_modules/highlight.js/es/languages/c.js
function c(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const TYPES3 = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const TITLE_MODE = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const C_KEYWORDS = [
    "asm",
    "auto",
    "break",
    "case",
    "continue",
    "default",
    "do",
    "else",
    "enum",
    "extern",
    "for",
    "fortran",
    "goto",
    "if",
    "inline",
    "register",
    "restrict",
    "return",
    "sizeof",
    "typeof",
    "typeof_unqual",
    "struct",
    "switch",
    "typedef",
    "union",
    "volatile",
    "while",
    "_Alignas",
    "_Alignof",
    "_Atomic",
    "_Generic",
    "_Noreturn",
    "_Static_assert",
    "_Thread_local",
    // aliases
    "alignas",
    "alignof",
    "noreturn",
    "static_assert",
    "thread_local",
    // not a C keyword but is, for all intents and purposes, treated exactly like one.
    "_Pragma"
  ];
  const C_TYPES = [
    "float",
    "double",
    "signed",
    "unsigned",
    "int",
    "short",
    "long",
    "char",
    "void",
    "_Bool",
    "_BitInt",
    "_Complex",
    "_Imaginary",
    "_Decimal32",
    "_Decimal64",
    "_Decimal96",
    "_Decimal128",
    "_Decimal64x",
    "_Decimal128x",
    "_Float16",
    "_Float32",
    "_Float64",
    "_Float128",
    "_Float32x",
    "_Float64x",
    "_Float128x",
    // modifiers
    "const",
    "static",
    "constexpr",
    // aliases
    "complex",
    "bool",
    "imaginary"
  ];
  const KEYWORDS3 = {
    keyword: C_KEYWORDS,
    type: C_TYPES,
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  };
  const EXPRESSION_CONTAINS = [
    PREPROCESSOR,
    TYPES3,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: KEYWORDS3,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS3,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: KEYWORDS3,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: KEYWORDS3,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [hljs.inherit(TITLE_MODE, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS3,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          TYPES3,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              TYPES3
            ]
          }
        ]
      },
      TYPES3,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: KEYWORDS3,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: true,
    illegal: "</",
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        {
          begin: hljs.IDENT_RE + "::",
          keywords: KEYWORDS3
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            hljs.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: KEYWORDS3
    }
  };
}

// node_modules/highlight.js/es/languages/clojure.js
function clojure(hljs) {
  const SYMBOLSTART = "a-zA-Z_\\-!.?+*=<>&'";
  const SYMBOL_RE = "[#]?[" + SYMBOLSTART + "][" + SYMBOLSTART + "0-9/;:$#]*";
  const globals = "def defonce defprotocol defstruct defmulti defmethod defn- defn defmacro deftype defrecord";
  const keywords2 = {
    $pattern: SYMBOL_RE,
    built_in: (
      // Clojure keywords
      globals + " cond apply if-not if-let if not not= =|0 <|0 >|0 <=|0 >=|0 ==|0 +|0 /|0 *|0 -|0 rem quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last drop-while while intern condp case reduced cycle split-at split-with repeat replicate iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter monitor-exit macroexpand macroexpand-1 for dosync and or when when-not when-let comp juxt partial sequence memoize constantly complement identity assert peek pop doto proxy first rest cons cast coll last butlast sigs reify second ffirst fnext nfirst nnext meta with-meta ns in-ns create-ns import refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize"
    )
  };
  const SYMBOL = {
    begin: SYMBOL_RE,
    relevance: 0
  };
  const NUMBER = {
    scope: "number",
    relevance: 0,
    variants: [
      { match: /[-+]?0[xX][0-9a-fA-F]+N?/ },
      // hexadecimal                 // 0x2a
      { match: /[-+]?0[0-7]+N?/ },
      // octal                       // 052
      { match: /[-+]?[1-9][0-9]?[rR][0-9a-zA-Z]+N?/ },
      // variable radix from 2 to 36 // 2r101010, 8r52, 36r16
      { match: /[-+]?[0-9]+\/[0-9]+N?/ },
      // ratio                       // 1/2
      { match: /[-+]?[0-9]+((\.[0-9]*([eE][+-]?[0-9]+)?M?)|([eE][+-]?[0-9]+M?|M))/ },
      // float        // 0.42 4.2E-1M 42E1 42M
      { match: /[-+]?([1-9][0-9]*|0)N?/ }
      // int (don't match leading 0) // 42 42N
    ]
  };
  const CHARACTER = {
    scope: "character",
    variants: [
      { match: /\\o[0-3]?[0-7]{1,2}/ },
      // Unicode Octal 0 - 377
      { match: /\\u[0-9a-fA-F]{4}/ },
      // Unicode Hex 0000 - FFFF
      { match: /\\(newline|space|tab|formfeed|backspace|return)/ },
      // special characters
      {
        match: /\\\S/,
        relevance: 0
      }
      // any non-whitespace char
    ]
  };
  const REGEX = {
    scope: "regex",
    begin: /#"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null });
  const COMMA = {
    scope: "punctuation",
    match: /,/,
    relevance: 0
  };
  const COMMENT = hljs.COMMENT(
    ";",
    "$",
    { relevance: 0 }
  );
  const LITERAL = {
    className: "literal",
    begin: /\b(true|false|nil)\b/
  };
  const COLLECTION = {
    begin: "\\[|(#::?" + SYMBOL_RE + ")?\\{",
    end: "[\\]\\}]",
    relevance: 0
  };
  const KEY = {
    className: "symbol",
    begin: "[:]{1,2}" + SYMBOL_RE
  };
  const LIST = {
    begin: "\\(",
    end: "\\)"
  };
  const BODY = {
    endsWithParent: true,
    relevance: 0
  };
  const NAME = {
    keywords: keywords2,
    className: "name",
    begin: SYMBOL_RE,
    relevance: 0,
    starts: BODY
  };
  const DEFAULT_CONTAINS = [
    COMMA,
    LIST,
    CHARACTER,
    REGEX,
    STRING,
    COMMENT,
    KEY,
    COLLECTION,
    NUMBER,
    LITERAL,
    SYMBOL
  ];
  const GLOBAL = {
    beginKeywords: globals,
    keywords: {
      $pattern: SYMBOL_RE,
      keyword: globals
    },
    end: '(\\[|#|\\d|"|:|\\{|\\)|\\(|$)',
    contains: [
      {
        className: "title",
        begin: SYMBOL_RE,
        relevance: 0,
        excludeEnd: true,
        // we can only have a single title
        endsParent: true
      }
    ].concat(DEFAULT_CONTAINS)
  };
  LIST.contains = [
    GLOBAL,
    NAME,
    BODY
  ];
  BODY.contains = DEFAULT_CONTAINS;
  COLLECTION.contains = DEFAULT_CONTAINS;
  return {
    name: "Clojure",
    aliases: [
      "clj",
      "edn"
    ],
    illegal: /\S/,
    contains: [
      COMMA,
      LIST,
      CHARACTER,
      REGEX,
      STRING,
      COMMENT,
      KEY,
      COLLECTION,
      NUMBER,
      LITERAL
    ]
  };
}

// node_modules/highlight.js/es/languages/cmake.js
function cmake(hljs) {
  return {
    name: "CMake",
    aliases: ["cmake.in"],
    case_insensitive: true,
    keywords: { keyword: (
      // scripting commands
      "break cmake_host_system_information cmake_minimum_required cmake_parse_arguments cmake_policy configure_file continue elseif else endforeach endfunction endif endmacro endwhile execute_process file find_file find_library find_package find_path find_program foreach function get_cmake_property get_directory_property get_filename_component get_property if include include_guard list macro mark_as_advanced math message option return separate_arguments set_directory_properties set_property set site_name string unset variable_watch while add_compile_definitions add_compile_options add_custom_command add_custom_target add_definitions add_dependencies add_executable add_library add_link_options add_subdirectory add_test aux_source_directory build_command create_test_sourcelist define_property enable_language enable_testing export fltk_wrap_ui get_source_file_property get_target_property get_test_property include_directories include_external_msproject include_regular_expression install link_directories link_libraries load_cache project qt_wrap_cpp qt_wrap_ui remove_definitions set_source_files_properties set_target_properties set_tests_properties source_group target_compile_definitions target_compile_features target_compile_options target_include_directories target_link_directories target_link_libraries target_link_options target_sources try_compile try_run ctest_build ctest_configure ctest_coverage ctest_empty_binary_directory ctest_memcheck ctest_read_custom_files ctest_run_script ctest_sleep ctest_start ctest_submit ctest_test ctest_update ctest_upload build_name exec_program export_library_dependencies install_files install_programs install_targets load_command make_directory output_required_files remove subdir_depends subdirs use_mangled_mesa utility_source variable_requires write_file qt5_use_modules qt5_use_package qt5_wrap_cpp on off true false and or not command policy target test exists is_newer_than is_directory is_symlink is_absolute matches less greater equal less_equal greater_equal strless strgreater strequal strless_equal strgreater_equal version_less version_greater version_equal version_less_equal version_greater_equal in_list defined"
    ) },
    contains: [
      {
        className: "variable",
        begin: /\$\{/,
        end: /\}/
      },
      hljs.COMMENT(/#\[\[/, /]]/),
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/cpp.js
function cpp(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(?!struct)(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const CPP_PRIMITIVE_TYPES = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const TITLE_MODE = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const RESERVED_KEYWORDS = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ];
  const RESERVED_TYPES = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ];
  const TYPE_HINTS = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ];
  const FUNCTION_HINTS = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ];
  const LITERALS3 = [
    "NULL",
    "false",
    "nullopt",
    "nullptr",
    "true"
  ];
  const BUILT_IN = ["_Pragma"];
  const CPP_KEYWORDS = {
    type: RESERVED_TYPES,
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS3,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };
  const FUNCTION_DISPATCH = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS
    },
    begin: regex.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  };
  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    PREPROCESSOR,
    CPP_PRIMITIVE_TYPES,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    className: "function",
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [TITLE_MODE],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: true,
        contains: [
          STRINGS,
          NUMBERS
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          CPP_PRIMITIVE_TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: CPP_KEYWORDS,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: CPP_KEYWORDS,
          contains: [
            "self",
            CPP_PRIMITIVE_TYPES
          ]
        },
        {
          begin: hljs.IDENT_RE + "::",
          keywords: CPP_KEYWORDS
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}

// node_modules/highlight.js/es/languages/csharp.js
function csharp(hljs) {
  const BUILT_IN_KEYWORDS = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ];
  const FUNCTION_MODIFIERS = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ];
  const LITERAL_KEYWORDS = [
    "default",
    "false",
    "null",
    "true"
  ];
  const NORMAL_KEYWORDS = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "scoped",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ];
  const CONTEXTUAL_KEYWORDS = [
    "add",
    "alias",
    "and",
    "ascending",
    "args",
    "async",
    "await",
    "by",
    "descending",
    "dynamic",
    "equals",
    "file",
    "from",
    "get",
    "global",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "record",
    "remove",
    "required",
    "scoped",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ];
  const KEYWORDS3 = {
    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
    built_in: BUILT_IN_KEYWORDS,
    literal: LITERAL_KEYWORDS
  };
  const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" });
  const NUMBERS = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  };
  const RAW_STRING = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  };
  const VERBATIM_STRING = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  };
  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS3
  };
  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  const INTERPOLATED_STRING = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      hljs.BACKSLASH_ESCAPE,
      SUBST_NO_LF
    ]
  };
  const INTERPOLATED_VERBATIM_STRING = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST
    ]
  };
  const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST_NO_LF
    ]
  });
  SUBST.contains = [
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.C_BLOCK_COMMENT_MODE
  ];
  SUBST_NO_LF.contains = [
    INTERPOLATED_VERBATIM_STRING_NO_LF,
    INTERPOLATED_STRING,
    VERBATIM_STRING_NO_LF,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const STRING = { variants: [
    RAW_STRING,
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ] };
  const GENERIC_MODIFIER = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      TITLE_MODE
    ]
  };
  const TYPE_IDENT_RE = hljs.IDENT_RE + "(<" + hljs.IDENT_RE + "(\\s*,\\s*" + hljs.IDENT_RE + ")*>)?(\\[\\])?";
  const AT_IDENTIFIER = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + hljs.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: KEYWORDS3,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        "///",
        "$",
        {
          returnBegin: true,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: true,
        end: "\\]",
        excludeEnd: true,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + TYPE_IDENT_RE + "\\s+)+" + hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: true,
        end: /\s*[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS3,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: FUNCTION_MODIFIERS.join(" "),
            relevance: 0
          },
          {
            begin: hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: true,
            contains: [
              hljs.TITLE_MODE,
              GENERIC_MODIFIER
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              STRING,
              NUMBERS,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      AT_IDENTIFIER
    ]
  };
}

// node_modules/highlight.js/es/languages/css.js
var MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS
];
var MEDIA_FEATURES = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function css(hljs) {
  const regex = hljs.regex;
  const modes = MODES(hljs);
  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
  const AT_MODIFIERS = "and or not only";
  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/;
  const IDENT_RE3 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const STRINGS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ];
  return {
    name: "CSS",
    case_insensitive: true,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag"
    },
    contains: [
      modes.BLOCK_COMMENT,
      VENDOR_PREFIX,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + IDENT_RE3,
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + PSEUDO_CLASSES.join("|") + ")" },
          { begin: ":(:)?(" + PSEUDO_ELEMENTS.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          modes.BLOCK_COMMENT,
          modes.HEXCOLOR,
          modes.IMPORTANT,
          modes.CSS_NUMBER_MODE,
          ...STRINGS,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would tigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0,
            // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...STRINGS,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: true,
                excludeEnd: true
              }
            ]
          },
          modes.FUNCTION_DISPATCH
        ]
      },
      {
        begin: regex.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: AT_PROPERTY_RE
          },
          {
            begin: /\s/,
            endsWithParent: true,
            excludeEnd: true,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: AT_MODIFIERS,
              attribute: MEDIA_FEATURES.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...STRINGS,
              modes.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS.join("|") + ")\\b"
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/crystal.js
function crystal(hljs) {
  const INT_SUFFIX = "(_?[ui](8|16|32|64|128))?";
  const FLOAT_SUFFIX = "(_?f(32|64))?";
  const CRYSTAL_IDENT_RE = "[a-zA-Z_]\\w*[!?=]?";
  const CRYSTAL_METHOD_RE = "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|[=!]~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~|]|//|//=|&[-+*]=?|&\\*\\*|\\[\\][=?]?";
  const CRYSTAL_PATH_RE = "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?";
  const CRYSTAL_KEYWORDS = {
    $pattern: CRYSTAL_IDENT_RE,
    keyword: "abstract alias annotation as as? asm begin break case class def do else elsif end ensure enum extend for fun if include instance_sizeof is_a? lib macro module next nil? of out pointerof private protected rescue responds_to? return require select self sizeof struct super then type typeof union uninitialized unless until verbatim when while with yield __DIR__ __END_LINE__ __FILE__ __LINE__",
    literal: "false nil true"
  };
  const SUBST = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: CRYSTAL_KEYWORDS
  };
  const VARIABLE = {
    // negative-look forward attemps to prevent false matches like:
    // @ident@ or $ident$ that might indicate this is not ruby at all
    className: "variable",
    begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
  };
  const EXPANSION = {
    className: "template-variable",
    variants: [
      {
        begin: "\\{\\{",
        end: "\\}\\}"
      },
      {
        begin: "\\{%",
        end: "%\\}"
      }
    ],
    keywords: CRYSTAL_KEYWORDS
  };
  function recursiveParen(begin, end) {
    const contains = [
      {
        begin,
        end
      }
    ];
    contains[0].contains = contains;
    return contains;
  }
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: "%[Qwi]?\\(",
        end: "\\)",
        contains: recursiveParen("\\(", "\\)")
      },
      {
        begin: "%[Qwi]?\\[",
        end: "\\]",
        contains: recursiveParen("\\[", "\\]")
      },
      {
        begin: "%[Qwi]?\\{",
        end: /\}/,
        contains: recursiveParen(/\{/, /\}/)
      },
      {
        begin: "%[Qwi]?<",
        end: ">",
        contains: recursiveParen("<", ">")
      },
      {
        begin: "%[Qwi]?\\|",
        end: "\\|"
      },
      {
        begin: /<<-\w+$/,
        end: /^\s*\w+$/
      }
    ],
    relevance: 0
  };
  const Q_STRING = {
    className: "string",
    variants: [
      {
        begin: "%q\\(",
        end: "\\)",
        contains: recursiveParen("\\(", "\\)")
      },
      {
        begin: "%q\\[",
        end: "\\]",
        contains: recursiveParen("\\[", "\\]")
      },
      {
        begin: "%q\\{",
        end: /\}/,
        contains: recursiveParen(/\{/, /\}/)
      },
      {
        begin: "%q<",
        end: ">",
        contains: recursiveParen("<", ">")
      },
      {
        begin: "%q\\|",
        end: "\\|"
      },
      {
        begin: /<<-'\w+'$/,
        end: /^\s*\w+$/
      }
    ],
    relevance: 0
  };
  const REGEXP = {
    begin: "(?!%\\})(" + hljs.RE_STARTERS_RE + "|\\n|\\b(case|if|select|unless|until|when|while)\\b)\\s*",
    keywords: "case if select unless until when while",
    contains: [
      {
        className: "regexp",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST
        ],
        variants: [
          {
            begin: "//[a-z]*",
            relevance: 0
          },
          {
            begin: "/(?!\\/)",
            end: "/[a-z]*"
          }
        ]
      }
    ],
    relevance: 0
  };
  const REGEXP2 = {
    className: "regexp",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: "%r\\(",
        end: "\\)",
        contains: recursiveParen("\\(", "\\)")
      },
      {
        begin: "%r\\[",
        end: "\\]",
        contains: recursiveParen("\\[", "\\]")
      },
      {
        begin: "%r\\{",
        end: /\}/,
        contains: recursiveParen(/\{/, /\}/)
      },
      {
        begin: "%r<",
        end: ">",
        contains: recursiveParen("<", ">")
      },
      {
        begin: "%r\\|",
        end: "\\|"
      }
    ],
    relevance: 0
  };
  const ATTRIBUTE = {
    className: "meta",
    begin: "@\\[",
    end: "\\]",
    contains: [hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" })]
  };
  const CRYSTAL_DEFAULT_CONTAINS = [
    EXPANSION,
    STRING,
    Q_STRING,
    REGEXP2,
    REGEXP,
    ATTRIBUTE,
    VARIABLE,
    hljs.HASH_COMMENT_MODE,
    {
      className: "class",
      beginKeywords: "class module struct",
      end: "$|;",
      illegal: /=/,
      contains: [
        hljs.HASH_COMMENT_MODE,
        hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE }),
        {
          // relevance booster for inheritance
          begin: "<"
        }
      ]
    },
    {
      className: "class",
      beginKeywords: "lib enum union",
      end: "$|;",
      illegal: /=/,
      contains: [
        hljs.HASH_COMMENT_MODE,
        hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE })
      ]
    },
    {
      beginKeywords: "annotation",
      end: "$|;",
      illegal: /=/,
      contains: [
        hljs.HASH_COMMENT_MODE,
        hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE })
      ],
      relevance: 2
    },
    {
      className: "function",
      beginKeywords: "def",
      end: /\B\b/,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {
          begin: CRYSTAL_METHOD_RE,
          endsParent: true
        })
      ]
    },
    {
      className: "function",
      beginKeywords: "fun macro",
      end: /\B\b/,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {
          begin: CRYSTAL_METHOD_RE,
          endsParent: true
        })
      ],
      relevance: 2
    },
    {
      className: "symbol",
      begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":",
      contains: [
        STRING,
        { begin: CRYSTAL_METHOD_RE }
      ],
      relevance: 0
    },
    {
      className: "number",
      variants: [
        { begin: "\\b0b([01_]+)" + INT_SUFFIX },
        { begin: "\\b0o([0-7_]+)" + INT_SUFFIX },
        { begin: "\\b0x([A-Fa-f0-9_]+)" + INT_SUFFIX },
        { begin: "\\b([1-9][0-9_]*[0-9]|[0-9])(\\.[0-9][0-9_]*)?([eE]_?[-+]?[0-9_]*)?" + FLOAT_SUFFIX + "(?!_)" },
        { begin: "\\b([1-9][0-9_]*|0)" + INT_SUFFIX }
      ],
      relevance: 0
    }
  ];
  SUBST.contains = CRYSTAL_DEFAULT_CONTAINS;
  EXPANSION.contains = CRYSTAL_DEFAULT_CONTAINS.slice(1);
  return {
    name: "Crystal",
    aliases: ["cr"],
    keywords: CRYSTAL_KEYWORDS,
    contains: CRYSTAL_DEFAULT_CONTAINS
  };
}

// node_modules/highlight.js/es/languages/d.js
function d(hljs) {
  const D_KEYWORDS = {
    $pattern: hljs.UNDERSCORE_IDENT_RE,
    keyword: "abstract alias align asm assert auto body break byte case cast catch class const continue debug default delete deprecated do else enum export extern final finally for foreach foreach_reverse|10 goto if immutable import in inout int interface invariant is lazy macro mixin module new nothrow out override package pragma private protected public pure ref return scope shared static struct super switch synchronized template this throw try typedef typeid typeof union unittest version void volatile while with __FILE__ __LINE__ __gshared|10 __thread __traits __DATE__ __EOF__ __TIME__ __TIMESTAMP__ __VENDOR__ __VERSION__",
    built_in: "bool cdouble cent cfloat char creal dchar delegate double dstring float function idouble ifloat ireal long real short string ubyte ucent uint ulong ushort wchar wstring",
    literal: "false null true"
  };
  const decimal_integer_re = "(0|[1-9][\\d_]*)";
  const decimal_integer_nosus_re = "(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d)";
  const binary_integer_re = "0[bB][01_]+";
  const hexadecimal_digits_re = "([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)";
  const hexadecimal_integer_re = "0[xX]" + hexadecimal_digits_re;
  const decimal_exponent_re = "([eE][+-]?" + decimal_integer_nosus_re + ")";
  const decimal_float_re = "(" + decimal_integer_nosus_re + "(\\.\\d*|" + decimal_exponent_re + ")|\\d+\\." + decimal_integer_nosus_re + "|\\." + decimal_integer_re + decimal_exponent_re + "?)";
  const hexadecimal_float_re = "(0[xX](" + hexadecimal_digits_re + "\\." + hexadecimal_digits_re + "|\\.?" + hexadecimal_digits_re + ")[pP][+-]?" + decimal_integer_nosus_re + ")";
  const integer_re = "(" + decimal_integer_re + "|" + binary_integer_re + "|" + hexadecimal_integer_re + ")";
  const float_re = "(" + hexadecimal_float_re + "|" + decimal_float_re + ")";
  const escape_sequence_re = `\\\\(['"\\?\\\\abfnrtv]|u[\\dA-Fa-f]{4}|[0-7]{1,3}|x[\\dA-Fa-f]{2}|U[\\dA-Fa-f]{8})|&[a-zA-Z\\d]{2,};`;
  const D_INTEGER_MODE = {
    className: "number",
    begin: "\\b" + integer_re + "(L|u|U|Lu|LU|uL|UL)?",
    relevance: 0
  };
  const D_FLOAT_MODE = {
    className: "number",
    begin: "\\b(" + float_re + "([fF]|L|i|[fF]i|Li)?|" + integer_re + "(i|[fF]i|Li))",
    relevance: 0
  };
  const D_CHARACTER_MODE = {
    className: "string",
    begin: "'(" + escape_sequence_re + "|.)",
    end: "'",
    illegal: "."
  };
  const D_ESCAPE_SEQUENCE = {
    begin: escape_sequence_re,
    relevance: 0
  };
  const D_STRING_MODE = {
    className: "string",
    begin: '"',
    contains: [D_ESCAPE_SEQUENCE],
    end: '"[cwd]?'
  };
  const D_WYSIWYG_DELIMITED_STRING_MODE = {
    className: "string",
    begin: '[rq]"',
    end: '"[cwd]?',
    relevance: 5
  };
  const D_ALTERNATE_WYSIWYG_STRING_MODE = {
    className: "string",
    begin: "`",
    end: "`[cwd]?"
  };
  const D_HEX_STRING_MODE = {
    className: "string",
    begin: 'x"[\\da-fA-F\\s\\n\\r]*"[cwd]?',
    relevance: 10
  };
  const D_TOKEN_STRING_MODE = {
    className: "string",
    begin: 'q"\\{',
    end: '\\}"'
  };
  const D_HASHBANG_MODE = {
    className: "meta",
    begin: "^#!",
    end: "$",
    relevance: 5
  };
  const D_SPECIAL_TOKEN_SEQUENCE_MODE = {
    className: "meta",
    begin: "#(line)",
    end: "$",
    relevance: 5
  };
  const D_ATTRIBUTE_MODE = {
    className: "keyword",
    begin: "@[a-zA-Z_][a-zA-Z_\\d]*"
  };
  const D_NESTING_COMMENT_MODE = hljs.COMMENT(
    "\\/\\+",
    "\\+\\/",
    {
      contains: ["self"],
      relevance: 10
    }
  );
  return {
    name: "D",
    keywords: D_KEYWORDS,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      D_NESTING_COMMENT_MODE,
      D_HEX_STRING_MODE,
      D_STRING_MODE,
      D_WYSIWYG_DELIMITED_STRING_MODE,
      D_ALTERNATE_WYSIWYG_STRING_MODE,
      D_TOKEN_STRING_MODE,
      D_FLOAT_MODE,
      D_INTEGER_MODE,
      D_CHARACTER_MODE,
      D_HASHBANG_MODE,
      D_SPECIAL_TOKEN_SEQUENCE_MODE,
      D_ATTRIBUTE_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/dart.js
function dart(hljs) {
  const SUBST = {
    className: "subst",
    variants: [{ begin: "\\$[A-Za-z0-9_]+" }]
  };
  const BRACED_SUBST = {
    className: "subst",
    variants: [
      {
        begin: /\$\{/,
        end: /\}/
      }
    ],
    keywords: "true false null this is new super"
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      { match: /\b[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?\b/ },
      { match: /\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*\b/ }
    ]
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: "r'''",
        end: "'''"
      },
      {
        begin: 'r"""',
        end: '"""'
      },
      {
        begin: "r'",
        end: "'",
        illegal: "\\n"
      },
      {
        begin: 'r"',
        end: '"',
        illegal: "\\n"
      },
      {
        begin: "'''",
        end: "'''",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"""',
        end: '"""',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: "'",
        end: "'",
        illegal: "\\n",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      }
    ]
  };
  BRACED_SUBST.contains = [
    NUMBER,
    STRING
  ];
  const BUILT_IN_TYPES = [
    // dart:core
    "Comparable",
    "DateTime",
    "Duration",
    "Function",
    "Iterable",
    "Iterator",
    "List",
    "Map",
    "Match",
    "Object",
    "Pattern",
    "RegExp",
    "Set",
    "Stopwatch",
    "String",
    "StringBuffer",
    "StringSink",
    "Symbol",
    "Type",
    "Uri",
    "bool",
    "double",
    "int",
    "num",
    // dart:html
    "Element",
    "ElementList"
  ];
  const NULLABLE_BUILT_IN_TYPES = BUILT_IN_TYPES.map((e) => `${e}?`);
  const BASIC_KEYWORDS = [
    "abstract",
    "as",
    "assert",
    "async",
    "await",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "covariant",
    "default",
    "deferred",
    "do",
    "dynamic",
    "else",
    "enum",
    "export",
    "extends",
    "extension",
    "external",
    "factory",
    "false",
    "final",
    "finally",
    "for",
    "Function",
    "get",
    "hide",
    "if",
    "implements",
    "import",
    "in",
    "interface",
    "is",
    "late",
    "library",
    "mixin",
    "new",
    "null",
    "on",
    "operator",
    "part",
    "required",
    "rethrow",
    "return",
    "sealed",
    "set",
    "show",
    "static",
    "super",
    "switch",
    "sync",
    "this",
    "throw",
    "true",
    "try",
    "typedef",
    "var",
    "void",
    "when",
    "while",
    "with",
    "yield"
  ];
  const KEYWORDS3 = {
    keyword: BASIC_KEYWORDS,
    built_in: BUILT_IN_TYPES.concat(NULLABLE_BUILT_IN_TYPES).concat([
      // dart:core
      "Never",
      "Null",
      "dynamic",
      "print",
      // dart:html
      "document",
      "querySelector",
      "querySelectorAll",
      "window"
    ]),
    $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
  };
  return {
    name: "Dart",
    keywords: KEYWORDS3,
    contains: [
      STRING,
      hljs.COMMENT(
        /\/\*\*(?!\/)/,
        /\*\//,
        {
          subLanguage: "markdown",
          relevance: 0
        }
      ),
      hljs.COMMENT(
        /\/{3,} ?/,
        /$/,
        { contains: [
          {
            subLanguage: "markdown",
            begin: ".",
            end: "$",
            relevance: 0
          }
        ] }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "class",
        beginKeywords: "class interface",
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: "extends implements" },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      NUMBER,
      {
        className: "meta",
        begin: "@[A-Za-z]+"
      },
      {
        begin: "=>"
        // No markup, just a relevance booster
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/diff.js
function diff(hljs) {
  const regex = hljs.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: regex.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: regex.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: "addition",
        begin: /^\+/,
        end: /$/
      },
      {
        className: "deletion",
        begin: /^-/,
        end: /$/
      },
      {
        className: "addition",
        begin: /^!/,
        end: /$/
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/dockerfile.js
function dockerfile(hljs) {
  const KEYWORDS3 = [
    "from",
    "maintainer",
    "expose",
    "env",
    "arg",
    "user",
    "onbuild",
    "stopsignal"
  ];
  return {
    name: "Dockerfile",
    aliases: ["docker"],
    case_insensitive: true,
    keywords: KEYWORDS3,
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      {
        beginKeywords: "run cmd entrypoint volume add copy workdir label healthcheck shell",
        starts: {
          end: /[^\\]$/,
          subLanguage: "bash"
        }
      }
    ],
    illegal: "</"
  };
}

// node_modules/highlight.js/es/languages/dos.js
function dos(hljs) {
  const COMMENT = hljs.COMMENT(
    /^\s*@?rem\b/,
    /$/,
    { relevance: 10 }
  );
  const LABEL = {
    className: "symbol",
    begin: "^\\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\\s+label)",
    relevance: 0
  };
  const KEYWORDS3 = [
    "if",
    "else",
    "goto",
    "for",
    "in",
    "do",
    "call",
    "exit",
    "not",
    "exist",
    "errorlevel",
    "defined",
    "equ",
    "neq",
    "lss",
    "leq",
    "gtr",
    "geq"
  ];
  const BUILT_INS3 = [
    "prn",
    "nul",
    "lpt3",
    "lpt2",
    "lpt1",
    "con",
    "com4",
    "com3",
    "com2",
    "com1",
    "aux",
    "shift",
    "cd",
    "dir",
    "echo",
    "setlocal",
    "endlocal",
    "set",
    "pause",
    "copy",
    "append",
    "assoc",
    "at",
    "attrib",
    "break",
    "cacls",
    "cd",
    "chcp",
    "chdir",
    "chkdsk",
    "chkntfs",
    "cls",
    "cmd",
    "color",
    "comp",
    "compact",
    "convert",
    "date",
    "dir",
    "diskcomp",
    "diskcopy",
    "doskey",
    "erase",
    "fs",
    "find",
    "findstr",
    "format",
    "ftype",
    "graftabl",
    "help",
    "keyb",
    "label",
    "md",
    "mkdir",
    "mode",
    "more",
    "move",
    "path",
    "pause",
    "print",
    "popd",
    "pushd",
    "promt",
    "rd",
    "recover",
    "rem",
    "rename",
    "replace",
    "restore",
    "rmdir",
    "shift",
    "sort",
    "start",
    "subst",
    "time",
    "title",
    "tree",
    "type",
    "ver",
    "verify",
    "vol",
    // winutils
    "ping",
    "net",
    "ipconfig",
    "taskkill",
    "xcopy",
    "ren",
    "del"
  ];
  return {
    name: "Batch file (DOS)",
    aliases: [
      "bat",
      "cmd"
    ],
    case_insensitive: true,
    illegal: /\/\*/,
    keywords: {
      keyword: KEYWORDS3,
      built_in: BUILT_INS3
    },
    contains: [
      {
        className: "variable",
        begin: /%%[^ ]|%[^ ]+?%|![^ ]+?!/
      },
      {
        className: "function",
        begin: LABEL.begin,
        end: "goto:eof",
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          COMMENT
        ]
      },
      {
        className: "number",
        begin: "\\b\\d+",
        relevance: 0
      },
      COMMENT
    ]
  };
}

// node_modules/highlight.js/es/languages/elixir.js
function elixir(hljs) {
  const regex = hljs.regex;
  const ELIXIR_IDENT_RE = "[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?";
  const ELIXIR_METHOD_RE = "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";
  const KEYWORDS3 = [
    "after",
    "alias",
    "and",
    "case",
    "catch",
    "cond",
    "defstruct",
    "defguard",
    "do",
    "else",
    "end",
    "fn",
    "for",
    "if",
    "import",
    "in",
    "not",
    "or",
    "quote",
    "raise",
    "receive",
    "require",
    "reraise",
    "rescue",
    "try",
    "unless",
    "unquote",
    "unquote_splicing",
    "use",
    "when",
    "with|0"
  ];
  const LITERALS3 = [
    "false",
    "nil",
    "true"
  ];
  const KWS = {
    $pattern: ELIXIR_IDENT_RE,
    keyword: KEYWORDS3,
    literal: LITERALS3
  };
  const SUBST = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: KWS
  };
  const NUMBER = {
    className: "number",
    begin: "(\\b0o[0-7_]+)|(\\b0b[01_]+)|(\\b0x[0-9a-fA-F_]+)|(-?\\b[0-9][0-9_]*(\\.[0-9_]+([eE][-+]?[0-9]+)?)?)",
    relevance: 0
  };
  const ESCAPES_RE = /\\[\s\S]/;
  const BACKSLASH_ESCAPE = {
    match: ESCAPES_RE,
    scope: "char.escape",
    relevance: 0
  };
  const SIGIL_DELIMITERS = `[/|([{<"']`;
  const SIGIL_DELIMITER_MODES = [
    {
      begin: /"/,
      end: /"/
    },
    {
      begin: /'/,
      end: /'/
    },
    {
      begin: /\//,
      end: /\//
    },
    {
      begin: /\|/,
      end: /\|/
    },
    {
      begin: /\(/,
      end: /\)/
    },
    {
      begin: /\[/,
      end: /\]/
    },
    {
      begin: /\{/,
      end: /\}/
    },
    {
      begin: /</,
      end: />/
    }
  ];
  const escapeSigilEnd = (end) => {
    return {
      scope: "char.escape",
      begin: regex.concat(/\\/, end),
      relevance: 0
    };
  };
  const LOWERCASE_SIGIL = {
    className: "string",
    begin: "~[a-z](?=" + SIGIL_DELIMITERS + ")",
    contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
      x,
      { contains: [
        escapeSigilEnd(x.end),
        BACKSLASH_ESCAPE,
        SUBST
      ] }
    ))
  };
  const UPCASE_SIGIL = {
    className: "string",
    begin: "~[A-Z](?=" + SIGIL_DELIMITERS + ")",
    contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
      x,
      { contains: [escapeSigilEnd(x.end)] }
    ))
  };
  const REGEX_SIGIL = {
    className: "regex",
    variants: [
      {
        begin: "~r(?=" + SIGIL_DELIMITERS + ")",
        contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
          x,
          {
            end: regex.concat(x.end, /[uismxfU]{0,7}/),
            contains: [
              escapeSigilEnd(x.end),
              BACKSLASH_ESCAPE,
              SUBST
            ]
          }
        ))
      },
      {
        begin: "~R(?=" + SIGIL_DELIMITERS + ")",
        contains: SIGIL_DELIMITER_MODES.map(
          (x) => hljs.inherit(
            x,
            {
              end: regex.concat(x.end, /[uismxfU]{0,7}/),
              contains: [escapeSigilEnd(x.end)]
            }
          )
        )
      }
    ]
  };
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /"""/,
        end: /"""/
      },
      {
        begin: /'''/,
        end: /'''/
      },
      {
        begin: /~S"""/,
        end: /"""/,
        contains: []
        // override default
      },
      {
        begin: /~S"/,
        end: /"/,
        contains: []
        // override default
      },
      {
        begin: /~S'''/,
        end: /'''/,
        contains: []
        // override default
      },
      {
        begin: /~S'/,
        end: /'/,
        contains: []
        // override default
      },
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      }
    ]
  };
  const FUNCTION = {
    className: "function",
    beginKeywords: "def defp defmacro defmacrop",
    end: /\B\b/,
    // the mode is ended by the title
    contains: [
      hljs.inherit(hljs.TITLE_MODE, {
        begin: ELIXIR_IDENT_RE,
        endsParent: true
      })
    ]
  };
  const CLASS = hljs.inherit(FUNCTION, {
    className: "class",
    beginKeywords: "defimpl defmodule defprotocol defrecord",
    end: /\bdo\b|$|;/
  });
  const ELIXIR_DEFAULT_CONTAINS = [
    STRING,
    REGEX_SIGIL,
    UPCASE_SIGIL,
    LOWERCASE_SIGIL,
    hljs.HASH_COMMENT_MODE,
    CLASS,
    FUNCTION,
    { begin: "::" },
    {
      className: "symbol",
      begin: ":(?![\\s:])",
      contains: [
        STRING,
        { begin: ELIXIR_METHOD_RE }
      ],
      relevance: 0
    },
    {
      className: "symbol",
      begin: ELIXIR_IDENT_RE + ":(?!:)",
      relevance: 0
    },
    {
      // Usage of a module, struct, etc.
      className: "title.class",
      begin: /(\b[A-Z][a-zA-Z0-9_]+)/,
      relevance: 0
    },
    NUMBER,
    {
      className: "variable",
      begin: "(\\$\\W)|((\\$|@@?)(\\w+))"
    }
    // -> has been removed, capnproto always uses this grammar construct
  ];
  SUBST.contains = ELIXIR_DEFAULT_CONTAINS;
  return {
    name: "Elixir",
    aliases: [
      "ex",
      "exs"
    ],
    keywords: KWS,
    contains: ELIXIR_DEFAULT_CONTAINS
  };
}

// node_modules/highlight.js/es/languages/erlang.js
function erlang(hljs) {
  const BASIC_ATOM_RE = "[a-z'][a-zA-Z0-9_']*";
  const FUNCTION_NAME_RE = "(" + BASIC_ATOM_RE + ":" + BASIC_ATOM_RE + "|" + BASIC_ATOM_RE + ")";
  const ERLANG_RESERVED = {
    keyword: "after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun if let not of orelse|10 query receive rem try when xor maybe else",
    literal: "false true"
  };
  const COMMENT = hljs.COMMENT("%", "$");
  const NUMBER = {
    className: "number",
    begin: "\\b(\\d+(_\\d+)*#[a-fA-F0-9]+(_[a-fA-F0-9]+)*|\\d+(_\\d+)*(\\.\\d+(_\\d+)*)?([eE][-+]?\\d+)?)",
    relevance: 0
  };
  const NAMED_FUN = { begin: "fun\\s+" + BASIC_ATOM_RE + "/\\d+" };
  const FUNCTION_CALL = {
    begin: FUNCTION_NAME_RE + "\\(",
    end: "\\)",
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        begin: FUNCTION_NAME_RE,
        relevance: 0
      },
      {
        begin: "\\(",
        end: "\\)",
        endsWithParent: true,
        returnEnd: true,
        relevance: 0
        // "contains" defined later
      }
    ]
  };
  const TUPLE = {
    begin: /\{/,
    end: /\}/,
    relevance: 0
    // "contains" defined later
  };
  const VAR1 = {
    begin: "\\b_([A-Z][A-Za-z0-9_]*)?",
    relevance: 0
  };
  const VAR2 = {
    begin: "[A-Z][a-zA-Z0-9_]*",
    relevance: 0
  };
  const RECORD_ACCESS = {
    begin: "#" + hljs.UNDERSCORE_IDENT_RE,
    relevance: 0,
    returnBegin: true,
    contains: [
      {
        begin: "#" + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      },
      {
        begin: /\{/,
        end: /\}/,
        relevance: 0
        // "contains" defined later
      }
    ]
  };
  const CHAR_LITERAL = {
    scope: "string",
    match: /\$(\\([^0-9]|[0-9]{1,3}|)|.)/
  };
  const TRIPLE_QUOTE = {
    scope: "string",
    match: /"""("*)(?!")[\s\S]*?"""\1/
  };
  const SIGIL = {
    scope: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      { match: /~\w?"""("*)(?!")[\s\S]*?"""\1/ },
      { begin: /~\w?\(/, end: /\)/ },
      { begin: /~\w?\[/, end: /\]/ },
      { begin: /~\w?{/, end: /}/ },
      { begin: /~\w?</, end: />/ },
      { begin: /~\w?\//, end: /\// },
      { begin: /~\w?\|/, end: /\|/ },
      { begin: /~\w?'/, end: /'/ },
      { begin: /~\w?"/, end: /"/ },
      { begin: /~\w?`/, end: /`/ },
      { begin: /~\w?#/, end: /#/ }
    ]
  };
  const BLOCK_STATEMENTS = {
    beginKeywords: "fun receive if try case maybe",
    end: "end",
    keywords: ERLANG_RESERVED
  };
  BLOCK_STATEMENTS.contains = [
    COMMENT,
    NAMED_FUN,
    hljs.inherit(hljs.APOS_STRING_MODE, { className: "" }),
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    SIGIL,
    TRIPLE_QUOTE,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1,
    VAR2,
    RECORD_ACCESS,
    CHAR_LITERAL
  ];
  const BASIC_MODES = [
    COMMENT,
    NAMED_FUN,
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    SIGIL,
    TRIPLE_QUOTE,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1,
    VAR2,
    RECORD_ACCESS,
    CHAR_LITERAL
  ];
  FUNCTION_CALL.contains[1].contains = BASIC_MODES;
  TUPLE.contains = BASIC_MODES;
  RECORD_ACCESS.contains[1].contains = BASIC_MODES;
  const DIRECTIVES = [
    "-module",
    "-record",
    "-undef",
    "-export",
    "-ifdef",
    "-ifndef",
    "-author",
    "-copyright",
    "-doc",
    "-moduledoc",
    "-vsn",
    "-import",
    "-include",
    "-include_lib",
    "-compile",
    "-define",
    "-else",
    "-endif",
    "-file",
    "-behaviour",
    "-behavior",
    "-spec",
    "-on_load",
    "-nifs"
  ];
  const PARAMS = {
    className: "params",
    begin: "\\(",
    end: "\\)",
    contains: BASIC_MODES
  };
  return {
    name: "Erlang",
    aliases: ["erl"],
    keywords: ERLANG_RESERVED,
    illegal: "(</|\\*=|\\+=|-=|/\\*|\\*/|\\(\\*|\\*\\))",
    contains: [
      {
        className: "function",
        begin: "^" + BASIC_ATOM_RE + "\\s*\\(",
        end: "->",
        returnBegin: true,
        illegal: "\\(|#|//|/\\*|\\\\|:|;",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: BASIC_ATOM_RE })
        ],
        starts: {
          end: ";|\\.",
          keywords: ERLANG_RESERVED,
          contains: BASIC_MODES
        }
      },
      COMMENT,
      {
        begin: "^-",
        end: "\\.",
        relevance: 0,
        excludeEnd: true,
        returnBegin: true,
        keywords: {
          $pattern: "-" + hljs.IDENT_RE,
          keyword: DIRECTIVES.map((x) => `${x}|1.5`).join(" ")
        },
        contains: [
          PARAMS,
          SIGIL,
          TRIPLE_QUOTE,
          hljs.QUOTE_STRING_MODE
        ]
      },
      NUMBER,
      SIGIL,
      TRIPLE_QUOTE,
      hljs.QUOTE_STRING_MODE,
      RECORD_ACCESS,
      VAR1,
      VAR2,
      TUPLE,
      CHAR_LITERAL,
      { begin: /\.$/ }
      // relevance booster
    ]
  };
}

// node_modules/highlight.js/es/languages/fortran.js
function fortran(hljs) {
  const regex = hljs.regex;
  const PARAMS = {
    className: "params",
    begin: "\\(",
    end: "\\)"
  };
  const COMMENT = { variants: [
    hljs.COMMENT("!", "$", { relevance: 0 }),
    // allow FORTRAN 77 style comments
    hljs.COMMENT("^C[ ]", "$", { relevance: 0 }),
    hljs.COMMENT("^C$", "$", { relevance: 0 })
  ] };
  const OPTIONAL_NUMBER_SUFFIX = /(_[a-z_\d]+)?/;
  const OPTIONAL_NUMBER_EXP = /([de][+-]?\d+)?/;
  const NUMBER = {
    className: "number",
    variants: [
      { begin: regex.concat(/\b\d+/, /\.(\d*)/, OPTIONAL_NUMBER_EXP, OPTIONAL_NUMBER_SUFFIX) },
      { begin: regex.concat(/\b\d+/, OPTIONAL_NUMBER_EXP, OPTIONAL_NUMBER_SUFFIX) },
      { begin: regex.concat(/\.\d+/, OPTIONAL_NUMBER_EXP, OPTIONAL_NUMBER_SUFFIX) }
    ],
    relevance: 0
  };
  const FUNCTION_DEF = {
    className: "function",
    beginKeywords: "subroutine function program",
    illegal: "[${=\\n]",
    contains: [
      hljs.UNDERSCORE_TITLE_MODE,
      PARAMS
    ]
  };
  const STRING = {
    className: "string",
    relevance: 0,
    variants: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  const KEYWORDS3 = [
    "kind",
    "do",
    "concurrent",
    "local",
    "shared",
    "while",
    "private",
    "call",
    "intrinsic",
    "where",
    "elsewhere",
    "type",
    "endtype",
    "endmodule",
    "endselect",
    "endinterface",
    "end",
    "enddo",
    "endif",
    "if",
    "forall",
    "endforall",
    "only",
    "contains",
    "default",
    "return",
    "stop",
    "then",
    "block",
    "endblock",
    "endassociate",
    "public",
    "subroutine|10",
    "function",
    "program",
    ".and.",
    ".or.",
    ".not.",
    ".le.",
    ".eq.",
    ".ge.",
    ".gt.",
    ".lt.",
    "goto",
    "save",
    "else",
    "use",
    "module",
    "select",
    "case",
    "access",
    "blank",
    "direct",
    "exist",
    "file",
    "fmt",
    "form",
    "formatted",
    "iostat",
    "name",
    "named",
    "nextrec",
    "number",
    "opened",
    "rec",
    "recl",
    "sequential",
    "status",
    "unformatted",
    "unit",
    "continue",
    "format",
    "pause",
    "cycle",
    "exit",
    "c_null_char",
    "c_alert",
    "c_backspace",
    "c_form_feed",
    "flush",
    "wait",
    "decimal",
    "round",
    "iomsg",
    "synchronous",
    "nopass",
    "non_overridable",
    "pass",
    "protected",
    "volatile",
    "abstract",
    "extends",
    "import",
    "non_intrinsic",
    "value",
    "deferred",
    "generic",
    "final",
    "enumerator",
    "class",
    "associate",
    "bind",
    "enum",
    "c_int",
    "c_short",
    "c_long",
    "c_long_long",
    "c_signed_char",
    "c_size_t",
    "c_int8_t",
    "c_int16_t",
    "c_int32_t",
    "c_int64_t",
    "c_int_least8_t",
    "c_int_least16_t",
    "c_int_least32_t",
    "c_int_least64_t",
    "c_int_fast8_t",
    "c_int_fast16_t",
    "c_int_fast32_t",
    "c_int_fast64_t",
    "c_intmax_t",
    "C_intptr_t",
    "c_float",
    "c_double",
    "c_long_double",
    "c_float_complex",
    "c_double_complex",
    "c_long_double_complex",
    "c_bool",
    "c_char",
    "c_null_ptr",
    "c_null_funptr",
    "c_new_line",
    "c_carriage_return",
    "c_horizontal_tab",
    "c_vertical_tab",
    "iso_c_binding",
    "c_loc",
    "c_funloc",
    "c_associated",
    "c_f_pointer",
    "c_ptr",
    "c_funptr",
    "iso_fortran_env",
    "character_storage_size",
    "error_unit",
    "file_storage_size",
    "input_unit",
    "iostat_end",
    "iostat_eor",
    "numeric_storage_size",
    "output_unit",
    "c_f_procpointer",
    "ieee_arithmetic",
    "ieee_support_underflow_control",
    "ieee_get_underflow_mode",
    "ieee_set_underflow_mode",
    "newunit",
    "contiguous",
    "recursive",
    "pad",
    "position",
    "action",
    "delim",
    "readwrite",
    "eor",
    "advance",
    "nml",
    "interface",
    "procedure",
    "namelist",
    "include",
    "sequence",
    "elemental",
    "pure",
    "impure",
    "integer",
    "real",
    "character",
    "complex",
    "logical",
    "codimension",
    "dimension",
    "allocatable|10",
    "parameter",
    "external",
    "implicit|10",
    "none",
    "double",
    "precision",
    "assign",
    "intent",
    "optional",
    "pointer",
    "target",
    "in",
    "out",
    "common",
    "equivalence",
    "data"
  ];
  const LITERALS3 = [
    ".False.",
    ".True."
  ];
  const BUILT_INS3 = [
    "alog",
    "alog10",
    "amax0",
    "amax1",
    "amin0",
    "amin1",
    "amod",
    "cabs",
    "ccos",
    "cexp",
    "clog",
    "csin",
    "csqrt",
    "dabs",
    "dacos",
    "dasin",
    "datan",
    "datan2",
    "dcos",
    "dcosh",
    "ddim",
    "dexp",
    "dint",
    "dlog",
    "dlog10",
    "dmax1",
    "dmin1",
    "dmod",
    "dnint",
    "dsign",
    "dsin",
    "dsinh",
    "dsqrt",
    "dtan",
    "dtanh",
    "float",
    "iabs",
    "idim",
    "idint",
    "idnint",
    "ifix",
    "isign",
    "max0",
    "max1",
    "min0",
    "min1",
    "sngl",
    "algama",
    "cdabs",
    "cdcos",
    "cdexp",
    "cdlog",
    "cdsin",
    "cdsqrt",
    "cqabs",
    "cqcos",
    "cqexp",
    "cqlog",
    "cqsin",
    "cqsqrt",
    "dcmplx",
    "dconjg",
    "derf",
    "derfc",
    "dfloat",
    "dgamma",
    "dimag",
    "dlgama",
    "iqint",
    "qabs",
    "qacos",
    "qasin",
    "qatan",
    "qatan2",
    "qcmplx",
    "qconjg",
    "qcos",
    "qcosh",
    "qdim",
    "qerf",
    "qerfc",
    "qexp",
    "qgamma",
    "qimag",
    "qlgama",
    "qlog",
    "qlog10",
    "qmax1",
    "qmin1",
    "qmod",
    "qnint",
    "qsign",
    "qsin",
    "qsinh",
    "qsqrt",
    "qtan",
    "qtanh",
    "abs",
    "acos",
    "aimag",
    "aint",
    "anint",
    "asin",
    "atan",
    "atan2",
    "char",
    "cmplx",
    "conjg",
    "cos",
    "cosh",
    "exp",
    "ichar",
    "index",
    "int",
    "log",
    "log10",
    "max",
    "min",
    "nint",
    "sign",
    "sin",
    "sinh",
    "sqrt",
    "tan",
    "tanh",
    "print",
    "write",
    "dim",
    "lge",
    "lgt",
    "lle",
    "llt",
    "mod",
    "nullify",
    "allocate",
    "deallocate",
    "adjustl",
    "adjustr",
    "all",
    "allocated",
    "any",
    "associated",
    "bit_size",
    "btest",
    "ceiling",
    "count",
    "cshift",
    "date_and_time",
    "digits",
    "dot_product",
    "eoshift",
    "epsilon",
    "exponent",
    "floor",
    "fraction",
    "huge",
    "iand",
    "ibclr",
    "ibits",
    "ibset",
    "ieor",
    "ior",
    "ishft",
    "ishftc",
    "lbound",
    "len_trim",
    "matmul",
    "maxexponent",
    "maxloc",
    "maxval",
    "merge",
    "minexponent",
    "minloc",
    "minval",
    "modulo",
    "mvbits",
    "nearest",
    "pack",
    "present",
    "product",
    "radix",
    "random_number",
    "random_seed",
    "range",
    "repeat",
    "reshape",
    "rrspacing",
    "scale",
    "scan",
    "selected_int_kind",
    "selected_real_kind",
    "set_exponent",
    "shape",
    "size",
    "spacing",
    "spread",
    "sum",
    "system_clock",
    "tiny",
    "transpose",
    "trim",
    "ubound",
    "unpack",
    "verify",
    "achar",
    "iachar",
    "transfer",
    "dble",
    "entry",
    "dprod",
    "cpu_time",
    "command_argument_count",
    "get_command",
    "get_command_argument",
    "get_environment_variable",
    "is_iostat_end",
    "ieee_arithmetic",
    "ieee_support_underflow_control",
    "ieee_get_underflow_mode",
    "ieee_set_underflow_mode",
    "is_iostat_eor",
    "move_alloc",
    "new_line",
    "selected_char_kind",
    "same_type_as",
    "extends_type_of",
    "acosh",
    "asinh",
    "atanh",
    "bessel_j0",
    "bessel_j1",
    "bessel_jn",
    "bessel_y0",
    "bessel_y1",
    "bessel_yn",
    "erf",
    "erfc",
    "erfc_scaled",
    "gamma",
    "log_gamma",
    "hypot",
    "norm2",
    "atomic_define",
    "atomic_ref",
    "execute_command_line",
    "leadz",
    "trailz",
    "storage_size",
    "merge_bits",
    "bge",
    "bgt",
    "ble",
    "blt",
    "dshiftl",
    "dshiftr",
    "findloc",
    "iall",
    "iany",
    "iparity",
    "image_index",
    "lcobound",
    "ucobound",
    "maskl",
    "maskr",
    "num_images",
    "parity",
    "popcnt",
    "poppar",
    "shifta",
    "shiftl",
    "shiftr",
    "this_image",
    "sync",
    "change",
    "team",
    "co_broadcast",
    "co_max",
    "co_min",
    "co_sum",
    "co_reduce"
  ];
  return {
    name: "Fortran",
    case_insensitive: true,
    aliases: [
      "f90",
      "f95"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9_]+\b|\.[a-z][a-z0-9_]+\./,
      keyword: KEYWORDS3,
      literal: LITERALS3,
      built_in: BUILT_INS3
    },
    illegal: /\/\*/,
    contains: [
      STRING,
      FUNCTION_DEF,
      // allow `C = value` for assignments so they aren't misdetected
      // as Fortran 77 style comments
      {
        begin: /^C\s*=(?!=)/,
        relevance: 0
      },
      COMMENT,
      NUMBER
    ]
  };
}

// node_modules/highlight.js/es/languages/fsharp.js
function escape(value) {
  return new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "m");
}
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;
  return re.source;
}
function lookahead(re) {
  return concat("(?=", re, ")");
}
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];
  if (typeof opts === "object" && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}
function either(...args) {
  const opts = stripOptionsFromArgs(args);
  const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
  return joined;
}
function fsharp(hljs) {
  const KEYWORDS3 = [
    "abstract",
    "and",
    "as",
    "assert",
    "base",
    "begin",
    "class",
    "default",
    "delegate",
    "do",
    "done",
    "downcast",
    "downto",
    "elif",
    "else",
    "end",
    "exception",
    "extern",
    // "false", // literal
    "finally",
    "fixed",
    "for",
    "fun",
    "function",
    "global",
    "if",
    "in",
    "inherit",
    "inline",
    "interface",
    "internal",
    "lazy",
    "let",
    "match",
    "member",
    "module",
    "mutable",
    "namespace",
    "new",
    // "not", // built_in
    // "null", // literal
    "of",
    "open",
    "or",
    "override",
    "private",
    "public",
    "rec",
    "return",
    "static",
    "struct",
    "then",
    "to",
    // "true", // literal
    "try",
    "type",
    "upcast",
    "use",
    "val",
    "void",
    "when",
    "while",
    "with",
    "yield"
  ];
  const BANG_KEYWORD_MODE = {
    // monad builder keywords (matches before non-bang keywords)
    scope: "keyword",
    match: /\b(yield|return|let|do|match|use)!/
  };
  const PREPROCESSOR_KEYWORDS = [
    "if",
    "else",
    "endif",
    "line",
    "nowarn",
    "light",
    "r",
    "i",
    "I",
    "load",
    "time",
    "help",
    "quit"
  ];
  const LITERALS3 = [
    "true",
    "false",
    "null",
    "Some",
    "None",
    "Ok",
    "Error",
    "infinity",
    "infinityf",
    "nan",
    "nanf"
  ];
  const SPECIAL_IDENTIFIERS = [
    "__LINE__",
    "__SOURCE_DIRECTORY__",
    "__SOURCE_FILE__"
  ];
  const KNOWN_TYPES = [
    // basic types
    "bool",
    "byte",
    "sbyte",
    "int8",
    "int16",
    "int32",
    "uint8",
    "uint16",
    "uint32",
    "int",
    "uint",
    "int64",
    "uint64",
    "nativeint",
    "unativeint",
    "decimal",
    "float",
    "double",
    "float32",
    "single",
    "char",
    "string",
    "unit",
    "bigint",
    // other native types or lowercase aliases
    "option",
    "voption",
    "list",
    "array",
    "seq",
    "byref",
    "exn",
    "inref",
    "nativeptr",
    "obj",
    "outref",
    "voidptr",
    // other important FSharp types
    "Result"
  ];
  const BUILTINS = [
    // Somewhat arbitrary list of builtin functions and values.
    // Most of them are declared in Microsoft.FSharp.Core
    // I tried to stay relevant by adding only the most idiomatic
    // and most used symbols that are not already declared as types.
    "not",
    "ref",
    "raise",
    "reraise",
    "dict",
    "readOnlyDict",
    "set",
    "get",
    "enum",
    "sizeof",
    "typeof",
    "typedefof",
    "nameof",
    "nullArg",
    "invalidArg",
    "invalidOp",
    "id",
    "fst",
    "snd",
    "ignore",
    "lock",
    "using",
    "box",
    "unbox",
    "tryUnbox",
    "printf",
    "printfn",
    "sprintf",
    "eprintf",
    "eprintfn",
    "fprintf",
    "fprintfn",
    "failwith",
    "failwithf"
  ];
  const ALL_KEYWORDS = {
    keyword: KEYWORDS3,
    literal: LITERALS3,
    built_in: BUILTINS,
    "variable.constant": SPECIAL_IDENTIFIERS
  };
  const ML_COMMENT = hljs.COMMENT(/\(\*(?!\))/, /\*\)/, {
    contains: ["self"]
  });
  const COMMENT = {
    variants: [
      ML_COMMENT,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const IDENTIFIER_RE = /[a-zA-Z_](\w|')*/;
  const QUOTED_IDENTIFIER = {
    scope: "variable",
    begin: /``/,
    end: /``/
  };
  const BEGIN_GENERIC_TYPE_SYMBOL_RE = /\B('|\^)/;
  const GENERIC_TYPE_SYMBOL = {
    scope: "symbol",
    variants: [
      // the type name is a quoted identifier:
      { match: concat(BEGIN_GENERIC_TYPE_SYMBOL_RE, /``.*?``/) },
      // the type name is a normal identifier (we don't use IDENTIFIER_RE because there cannot be another apostrophe here):
      { match: concat(BEGIN_GENERIC_TYPE_SYMBOL_RE, hljs.UNDERSCORE_IDENT_RE) }
    ],
    relevance: 0
  };
  const makeOperatorMode = function({ includeEqual }) {
    let allOperatorChars;
    if (includeEqual)
      allOperatorChars = "!%&*+-/<=>@^|~?";
    else
      allOperatorChars = "!%&*+-/<>@^|~?";
    const OPERATOR_CHARS = Array.from(allOperatorChars);
    const OPERATOR_CHAR_RE = concat("[", ...OPERATOR_CHARS.map(escape), "]");
    const OPERATOR_CHAR_OR_DOT_RE = either(OPERATOR_CHAR_RE, /\./);
    const OPERATOR_FIRST_CHAR_OF_MULTIPLE_RE = concat(OPERATOR_CHAR_OR_DOT_RE, lookahead(OPERATOR_CHAR_OR_DOT_RE));
    const SYMBOLIC_OPERATOR_RE = either(
      concat(OPERATOR_FIRST_CHAR_OF_MULTIPLE_RE, OPERATOR_CHAR_OR_DOT_RE, "*"),
      // Matches at least 2 chars operators
      concat(OPERATOR_CHAR_RE, "+")
      // Matches at least one char operators
    );
    return {
      scope: "operator",
      match: either(
        // symbolic operators:
        SYMBOLIC_OPERATOR_RE,
        // other symbolic keywords:
        // Type casting and conversion operators:
        /:\?>/,
        /:\?/,
        /:>/,
        /:=/,
        // Reference cell assignment
        /::?/,
        // : or ::
        /\$/
      ),
      // A single $ can be used as an operator
      relevance: 0
    };
  };
  const OPERATOR = makeOperatorMode({ includeEqual: true });
  const OPERATOR_WITHOUT_EQUAL = makeOperatorMode({ includeEqual: false });
  const makeTypeAnnotationMode = function(prefix, prefixScope) {
    return {
      begin: concat(
        // a type annotation is a
        prefix,
        // should be a colon or the 'of' keyword
        lookahead(
          // that has to be followed by
          concat(
            /\s*/,
            // optional space
            either(
              // then either of:
              /\w/,
              // word
              /'/,
              // generic type name
              /\^/,
              // generic type name
              /#/,
              // flexible type name
              /``/,
              // quoted type name
              /\(/,
              // parens type expression
              /{\|/
              // anonymous type annotation
            )
          )
        )
      ),
      beginScope: prefixScope,
      // BUG: because ending with \n is necessary for some cases, multi-line type annotations are not properly supported.
      // Examples where \n is required at the end:
      // - abstract member definitions in classes: abstract Property : int * string
      // - return type annotations: let f f' = f' () : returnTypeAnnotation
      // - record fields definitions: { A : int \n B : string }
      end: lookahead(
        either(
          /\n/,
          /=/
        )
      ),
      relevance: 0,
      // we need the known types, and we need the type constraint keywords and literals. e.g.: when 'a : null
      keywords: hljs.inherit(ALL_KEYWORDS, { type: KNOWN_TYPES }),
      contains: [
        COMMENT,
        GENERIC_TYPE_SYMBOL,
        hljs.inherit(QUOTED_IDENTIFIER, { scope: null }),
        // match to avoid strange patterns inside that may break the parsing
        OPERATOR_WITHOUT_EQUAL
      ]
    };
  };
  const TYPE_ANNOTATION = makeTypeAnnotationMode(/:/, "operator");
  const DISCRIMINATED_UNION_TYPE_ANNOTATION = makeTypeAnnotationMode(/\bof\b/, "keyword");
  const TYPE_DECLARATION = {
    begin: [
      /(^|\s+)/,
      // prevents matching the following: `match s.stype with`
      /type/,
      /\s+/,
      IDENTIFIER_RE
    ],
    beginScope: {
      2: "keyword",
      4: "title.class"
    },
    end: lookahead(/\(|=|$/),
    keywords: ALL_KEYWORDS,
    // match keywords in type constraints. e.g.: when 'a : null
    contains: [
      COMMENT,
      hljs.inherit(QUOTED_IDENTIFIER, { scope: null }),
      // match to avoid strange patterns inside that may break the parsing
      GENERIC_TYPE_SYMBOL,
      {
        // For visual consistency, highlight type brackets as operators.
        scope: "operator",
        match: /<|>/
      },
      TYPE_ANNOTATION
      // generic types can have constraints, which are type annotations. e.g. type MyType<'T when 'T : delegate<obj * string>> =
    ]
  };
  const COMPUTATION_EXPRESSION = {
    // computation expressions:
    scope: "computation-expression",
    // BUG: might conflict with record deconstruction. e.g. let f { Name = name } = name // will highlight f
    match: /\b[_a-z]\w*(?=\s*\{)/
  };
  const PREPROCESSOR = {
    // preprocessor directives and fsi commands:
    begin: [
      /^\s*/,
      concat(/#/, either(...PREPROCESSOR_KEYWORDS)),
      /\b/
    ],
    beginScope: { 2: "meta" },
    end: lookahead(/\s|$/)
  };
  const NUMBER = {
    variants: [
      hljs.BINARY_NUMBER_MODE,
      hljs.C_NUMBER_MODE
    ]
  };
  const QUOTED_STRING = {
    scope: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE
    ]
  };
  const VERBATIM_STRING = {
    scope: "string",
    begin: /@"/,
    end: /"/,
    contains: [
      {
        match: /""/
        // escaped "
      },
      hljs.BACKSLASH_ESCAPE
    ]
  };
  const TRIPLE_QUOTED_STRING = {
    scope: "string",
    begin: /"""/,
    end: /"""/,
    relevance: 2
  };
  const SUBST = {
    scope: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: ALL_KEYWORDS
  };
  const INTERPOLATED_STRING = {
    scope: "string",
    begin: /\$"/,
    end: /"/,
    contains: [
      {
        match: /\{\{/
        // escaped {
      },
      {
        match: /\}\}/
        // escaped }
      },
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const INTERPOLATED_VERBATIM_STRING = {
    scope: "string",
    begin: /(\$@|@\$)"/,
    end: /"/,
    contains: [
      {
        match: /\{\{/
        // escaped {
      },
      {
        match: /\}\}/
        // escaped }
      },
      {
        match: /""/
      },
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const INTERPOLATED_TRIPLE_QUOTED_STRING = {
    scope: "string",
    begin: /\$"""/,
    end: /"""/,
    contains: [
      {
        match: /\{\{/
        // escaped {
      },
      {
        match: /\}\}/
        // escaped }
      },
      SUBST
    ],
    relevance: 2
  };
  const CHAR_LITERAL = {
    scope: "string",
    match: concat(
      /'/,
      either(
        /[^\\']/,
        // either a single non escaped char...
        /\\(?:.|\d{3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}|U[a-fA-F\d]{8})/
        // ...or an escape sequence
      ),
      /'/
    )
  };
  SUBST.contains = [
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    QUOTED_STRING,
    CHAR_LITERAL,
    BANG_KEYWORD_MODE,
    COMMENT,
    QUOTED_IDENTIFIER,
    TYPE_ANNOTATION,
    COMPUTATION_EXPRESSION,
    PREPROCESSOR,
    NUMBER,
    GENERIC_TYPE_SYMBOL,
    OPERATOR
  ];
  const STRING = {
    variants: [
      INTERPOLATED_TRIPLE_QUOTED_STRING,
      INTERPOLATED_VERBATIM_STRING,
      INTERPOLATED_STRING,
      TRIPLE_QUOTED_STRING,
      VERBATIM_STRING,
      QUOTED_STRING,
      CHAR_LITERAL
    ]
  };
  return {
    name: "F#",
    aliases: [
      "fs",
      "f#"
    ],
    keywords: ALL_KEYWORDS,
    illegal: /\/\*/,
    classNameAliases: {
      "computation-expression": "keyword"
    },
    contains: [
      BANG_KEYWORD_MODE,
      STRING,
      COMMENT,
      QUOTED_IDENTIFIER,
      TYPE_DECLARATION,
      {
        // e.g. [<Attributes("")>] or [<``module``: MyCustomAttributeThatWorksOnModules>]
        // or [<Sealed; NoEquality; NoComparison; CompiledName("FSharpAsync`1")>]
        scope: "meta",
        begin: /\[</,
        end: />\]/,
        relevance: 2,
        contains: [
          QUOTED_IDENTIFIER,
          // can contain any constant value
          TRIPLE_QUOTED_STRING,
          VERBATIM_STRING,
          QUOTED_STRING,
          CHAR_LITERAL,
          NUMBER
        ]
      },
      DISCRIMINATED_UNION_TYPE_ANNOTATION,
      TYPE_ANNOTATION,
      COMPUTATION_EXPRESSION,
      PREPROCESSOR,
      NUMBER,
      GENERIC_TYPE_SYMBOL,
      OPERATOR
    ]
  };
}

// node_modules/highlight.js/es/languages/go.js
function go(hljs) {
  const LITERALS3 = [
    "true",
    "false",
    "iota",
    "nil"
  ];
  const BUILT_INS3 = [
    "append",
    "cap",
    "close",
    "complex",
    "copy",
    "imag",
    "len",
    "make",
    "new",
    "panic",
    "print",
    "println",
    "real",
    "recover",
    "delete"
  ];
  const TYPES3 = [
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int8",
    "int16",
    "int32",
    "int64",
    "string",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "int",
    "uint",
    "uintptr",
    "rune"
  ];
  const KWS = [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var"
  ];
  const KEYWORDS3 = {
    keyword: KWS,
    type: TYPES3,
    literal: LITERALS3,
    built_in: BUILT_INS3
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: KEYWORDS3,
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS3,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/graphql.js
function graphql(hljs) {
  const regex = hljs.regex;
  const GQL_NAME = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: ["gql"],
    case_insensitive: true,
    disableAutodetect: false,
    keywords: {
      keyword: [
        "query",
        "mutation",
        "subscription",
        "type",
        "input",
        "schema",
        "directive",
        "interface",
        "union",
        "scalar",
        "fragment",
        "enum",
        "on"
      ],
      literal: [
        "true",
        "false",
        "null"
      ]
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      {
        scope: "punctuation",
        match: /[.]{3}/,
        relevance: 0
      },
      {
        scope: "punctuation",
        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
        relevance: 0
      },
      {
        scope: "variable",
        begin: /\$/,
        end: /\W/,
        excludeEnd: true,
        relevance: 0
      },
      {
        scope: "meta",
        match: /@\w+/,
        excludeEnd: true
      },
      {
        scope: "symbol",
        begin: regex.concat(GQL_NAME, regex.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}

// node_modules/highlight.js/es/languages/groovy.js
function variants(variants2, obj = {}) {
  obj.variants = variants2;
  return obj;
}
function groovy(hljs) {
  const regex = hljs.regex;
  const IDENT_RE3 = "[A-Za-z0-9_$]+";
  const COMMENT = variants([
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    hljs.COMMENT(
      "/\\*\\*",
      "\\*/",
      {
        relevance: 0,
        contains: [
          {
            // eat up @'s in emails to prevent them to be recognized as doctags
            begin: /\w+@/,
            relevance: 0
          },
          {
            className: "doctag",
            begin: "@[A-Za-z]+"
          }
        ]
      }
    )
  ]);
  const REGEXP = {
    className: "regexp",
    begin: /~?\/[^\/\n]+\//,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const NUMBER = variants([
    hljs.BINARY_NUMBER_MODE,
    hljs.C_NUMBER_MODE
  ]);
  const STRING = variants(
    [
      {
        begin: /"""/,
        end: /"""/
      },
      {
        begin: /'''/,
        end: /'''/
      },
      {
        begin: "\\$/",
        end: "/\\$",
        relevance: 10
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ],
    { className: "string" }
  );
  const CLASS_DEFINITION = {
    match: [
      /(class|interface|trait|enum|record|extends|implements)/,
      /\s+/,
      hljs.UNDERSCORE_IDENT_RE
    ],
    scope: {
      1: "keyword",
      3: "title.class"
    }
  };
  const TYPES3 = [
    "byte",
    "short",
    "char",
    "int",
    "long",
    "boolean",
    "float",
    "double",
    "void"
  ];
  const KEYWORDS3 = [
    // groovy specific keywords
    "def",
    "as",
    "in",
    "assert",
    "trait",
    // common keywords with Java
    "abstract",
    "static",
    "volatile",
    "transient",
    "public",
    "private",
    "protected",
    "synchronized",
    "final",
    "class",
    "interface",
    "enum",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "default",
    "continue",
    "throw",
    "throws",
    "try",
    "catch",
    "finally",
    "implements",
    "extends",
    "new",
    "import",
    "package",
    "return",
    "instanceof",
    "var"
  ];
  return {
    name: "Groovy",
    keywords: {
      "variable.language": "this super",
      literal: "true false null",
      type: TYPES3,
      keyword: KEYWORDS3
    },
    contains: [
      hljs.SHEBANG({
        binary: "groovy",
        relevance: 10
      }),
      COMMENT,
      STRING,
      REGEXP,
      NUMBER,
      CLASS_DEFINITION,
      {
        className: "meta",
        begin: "@[A-Za-z]+",
        relevance: 0
      },
      {
        // highlight map keys and named parameters as attrs
        className: "attr",
        begin: IDENT_RE3 + "[ 	]*:",
        relevance: 0
      },
      {
        // catch middle element of the ternary operator
        // to avoid highlight it as a label, named parameter, or map key
        begin: /\?/,
        end: /:/,
        relevance: 0,
        contains: [
          COMMENT,
          STRING,
          REGEXP,
          NUMBER,
          "self"
        ]
      },
      {
        // highlight labeled statements
        className: "symbol",
        begin: "^[ 	]*" + regex.lookahead(IDENT_RE3 + ":"),
        excludeBegin: true,
        end: IDENT_RE3 + ":",
        relevance: 0
      }
    ],
    illegal: /#|<\//
  };
}

// node_modules/highlight.js/es/languages/haskell.js
function haskell(hljs) {
  const decimalDigits3 = "([0-9]_*)+";
  const hexDigits3 = "([0-9a-fA-F]_*)+";
  const binaryDigits = "([01]_*)+";
  const octalDigits = "([0-7]_*)+";
  const ascSymbol = "[!#$%&*+.\\/<=>?@\\\\^~-]";
  const uniSymbol = "(\\p{S}|\\p{P})";
  const special = "[(),;\\[\\]`|{}]";
  const symbol = `(${ascSymbol}|(?!(${special}|[_:"']))${uniSymbol})`;
  const COMMENT = { variants: [
    // Double dash forms a valid comment only if it's not part of legal lexeme.
    // See: Haskell 98 report: https://www.haskell.org/onlinereport/lexemes.html
    //
    // The commented code does the job, but we can't use negative lookbehind,
    // due to poor support by Safari browser.
    // > hljs.COMMENT(`(?<!${symbol})--+(?!${symbol})`, '$'),
    // So instead, we'll add a no-markup rule before the COMMENT rule in the rules list
    // to match the problematic infix operators that contain double dash.
    hljs.COMMENT("--+", "$"),
    hljs.COMMENT(
      /\{-/,
      /-\}/,
      { contains: ["self"] }
    )
  ] };
  const PRAGMA = {
    className: "meta",
    begin: /\{-#/,
    end: /#-\}/
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: "^#",
    end: "$"
  };
  const CONSTRUCTOR = {
    className: "type",
    begin: "\\b[A-Z][\\w']*",
    // TODO: other constructors (build-in, infix).
    relevance: 0
  };
  const LIST = {
    begin: "\\(",
    end: "\\)",
    illegal: '"',
    contains: [
      PRAGMA,
      PREPROCESSOR,
      {
        className: "type",
        begin: "\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?"
      },
      hljs.inherit(hljs.TITLE_MODE, { begin: "[_a-z][\\w']*" }),
      COMMENT
    ]
  };
  const RECORD = {
    begin: /\{/,
    end: /\}/,
    contains: LIST.contains
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits3})(\\.(${decimalDigits3}))?([eE][+-]?(${decimalDigits3}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0[xX]_*(${hexDigits3})(\\.(${hexDigits3}))?([pP][+-]?(${decimalDigits3}))?\\b` },
      // octal-literal
      { match: `\\b0[oO](${octalDigits})\\b` },
      // binary-literal
      { match: `\\b0[bB](${binaryDigits})\\b` }
    ]
  };
  return {
    name: "Haskell",
    aliases: ["hs"],
    keywords: "let in if then else case of where do module import hiding qualified type data newtype deriving class instance as default infix infixl infixr foreign export ccall stdcall cplusplus jvm dotnet safe unsafe family forall mdo proc rec",
    unicodeRegex: true,
    contains: [
      // Top-level constructions.
      {
        beginKeywords: "module",
        end: "where",
        keywords: "module where",
        contains: [
          LIST,
          COMMENT
        ],
        illegal: "\\W\\.|;"
      },
      {
        begin: "\\bimport\\b",
        end: "$",
        keywords: "import qualified as hiding",
        contains: [
          LIST,
          COMMENT
        ],
        illegal: "\\W\\.|;"
      },
      {
        className: "class",
        begin: "^(\\s*)?(class|instance)\\b",
        end: "where",
        keywords: "class family instance where",
        contains: [
          CONSTRUCTOR,
          LIST,
          COMMENT
        ]
      },
      {
        className: "class",
        begin: "\\b(data|(new)?type)\\b",
        end: "$",
        keywords: "data family type newtype deriving",
        contains: [
          PRAGMA,
          CONSTRUCTOR,
          LIST,
          RECORD,
          COMMENT
        ]
      },
      {
        beginKeywords: "default",
        end: "$",
        contains: [
          CONSTRUCTOR,
          LIST,
          COMMENT
        ]
      },
      {
        beginKeywords: "infix infixl infixr",
        end: "$",
        contains: [
          hljs.C_NUMBER_MODE,
          COMMENT
        ]
      },
      {
        begin: "\\bforeign\\b",
        end: "$",
        keywords: "foreign import export ccall stdcall cplusplus jvm dotnet safe unsafe",
        contains: [
          CONSTRUCTOR,
          hljs.QUOTE_STRING_MODE,
          COMMENT
        ]
      },
      {
        className: "meta",
        begin: "#!\\/usr\\/bin\\/env runhaskell",
        end: "$"
      },
      // "Whitespaces".
      PRAGMA,
      PREPROCESSOR,
      // Literals and names.
      // Single characters.
      {
        scope: "string",
        begin: /'(?=\\?.')/,
        end: /'/,
        contains: [
          {
            scope: "char.escape",
            match: /\\./
          }
        ]
      },
      hljs.QUOTE_STRING_MODE,
      NUMBER,
      CONSTRUCTOR,
      hljs.inherit(hljs.TITLE_MODE, { begin: "^[_a-z][\\w']*" }),
      // No markup, prevents infix operators from being recognized as comments.
      { begin: `(?!-)${symbol}--+|--+(?!-)${symbol}` },
      COMMENT,
      {
        // No markup, relevance booster
        begin: "->|<-"
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/ini.js
function ini(hljs) {
  const regex = hljs.regex;
  const NUMBERS = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: hljs.NUMBER_RE }
    ]
  };
  const COMMENTS = hljs.COMMENT();
  COMMENTS.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const VARIABLES = {
    className: "variable",
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  };
  const LITERALS3 = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  };
  const STRINGS = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  };
  const ARRAY = {
    begin: /\[/,
    end: /\]/,
    contains: [
      COMMENTS,
      LITERALS3,
      VARIABLES,
      STRINGS,
      NUMBERS,
      "self"
    ],
    relevance: 0
  };
  const BARE_KEY = /[A-Za-z0-9_-]+/;
  const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
  const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
  const ANY_KEY = regex.either(
    BARE_KEY,
    QUOTED_KEY_DOUBLE_QUOTE,
    QUOTED_KEY_SINGLE_QUOTE
  );
  const DOTTED_KEY = regex.concat(
    ANY_KEY,
    "(\\s*\\.\\s*",
    ANY_KEY,
    ")*",
    regex.lookahead(/\s*=\s*[^#\s]/)
  );
  return {
    name: "TOML, also INI",
    aliases: ["toml"],
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      COMMENTS,
      {
        className: "section",
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: DOTTED_KEY,
        className: "attr",
        starts: {
          end: /$/,
          contains: [
            COMMENTS,
            ARRAY,
            LITERALS3,
            VARIABLES,
            STRINGS,
            NUMBERS
          ]
        }
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/java.js
var decimalDigits = "[0-9](_*[0-9])*";
var frac = `\\.(${decimalDigits})`;
var hexDigits = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function recurRegex(re, substitution, depth) {
  if (depth === -1) return "";
  return re.replace(substitution, (_) => {
    return recurRegex(re, substitution, depth - 1);
  });
}
function java(hljs) {
  const regex = hljs.regex;
  const JAVA_IDENT_RE = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*";
  const GENERIC_IDENT_RE = JAVA_IDENT_RE + recurRegex("(?:<" + JAVA_IDENT_RE + "~~~(?:\\s*,\\s*" + JAVA_IDENT_RE + "~~~)*>)?", /~~~/g, 2);
  const MAIN_KEYWORDS = [
    "synchronized",
    "abstract",
    "private",
    "var",
    "static",
    "if",
    "const ",
    "for",
    "while",
    "strictfp",
    "finally",
    "protected",
    "import",
    "native",
    "final",
    "void",
    "enum",
    "else",
    "break",
    "transient",
    "catch",
    "instanceof",
    "volatile",
    "case",
    "assert",
    "package",
    "default",
    "public",
    "try",
    "switch",
    "continue",
    "throws",
    "protected",
    "public",
    "private",
    "module",
    "requires",
    "exports",
    "do",
    "sealed",
    "yield",
    "permits",
    "goto",
    "when"
  ];
  const BUILT_INS3 = [
    "super",
    "this"
  ];
  const LITERALS3 = [
    "false",
    "true",
    "null"
  ];
  const TYPES3 = [
    "char",
    "boolean",
    "long",
    "float",
    "int",
    "byte",
    "short",
    "double"
  ];
  const KEYWORDS3 = {
    keyword: MAIN_KEYWORDS,
    literal: LITERALS3,
    type: TYPES3,
    built_in: BUILT_INS3
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + JAVA_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  };
  const PARAMS = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    relevance: 0,
    contains: [hljs.C_BLOCK_COMMENT_MODE],
    endsParent: true
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: KEYWORDS3,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        begin: [
          regex.concat(/(?!else)/, JAVA_IDENT_RE),
          /\s+/,
          JAVA_IDENT_RE,
          /\s+/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          5: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          PARAMS,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new throw return else",
        relevance: 0
      },
      {
        begin: [
          "(?:" + GENERIC_IDENT_RE + "\\s+)",
          hljs.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: KEYWORDS3,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              ANNOTATION,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              NUMERIC,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      NUMERIC,
      ANNOTATION
    ]
  };
}

// node_modules/highlight.js/es/languages/javascript.js
var IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
var KEYWORDS = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
var LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
var TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
var ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
var BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
var BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
];
var BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);
function javascript(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1 = IDENT_RE;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };
  const decimalDigits3 = "[0-9](_?[0-9])*";
  const frac3 = `\\.(${decimalDigits3})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac3})|\\.)?|(${frac3}))[eE][+-]?(${decimalDigits3})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac3})\\b|\\.)?|(${frac3})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import"
      ].map((x) => `${x}\\s*\\(`)),
      IDENT_RE$1,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/json.js
function json(hljs) {
  const ATTRIBUTE = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS3 = [
    "true",
    "false",
    "null"
  ];
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS3.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: LITERALS3
    },
    contains: [
      ATTRIBUTE,
      PUNCTUATION,
      hljs.QUOTE_STRING_MODE,
      LITERALS_MODE,
      hljs.C_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}

// node_modules/highlight.js/es/languages/julia.js
function julia(hljs) {
  const VARIABLE_NAME_RE = "[A-Za-z_\\u00A1-\\uFFFF][A-Za-z_0-9\\u00A1-\\uFFFF]*";
  const KEYWORD_LIST = [
    "baremodule",
    "begin",
    "break",
    "catch",
    "ccall",
    "const",
    "continue",
    "do",
    "else",
    "elseif",
    "end",
    "export",
    "false",
    "finally",
    "for",
    "function",
    "global",
    "if",
    "import",
    "in",
    "isa",
    "let",
    "local",
    "macro",
    "module",
    "quote",
    "return",
    "true",
    "try",
    "using",
    "where",
    "while"
  ];
  const LITERAL_LIST = [
    "ARGS",
    "C_NULL",
    "DEPOT_PATH",
    "ENDIAN_BOM",
    "ENV",
    "Inf",
    "Inf16",
    "Inf32",
    "Inf64",
    "InsertionSort",
    "LOAD_PATH",
    "MergeSort",
    "NaN",
    "NaN16",
    "NaN32",
    "NaN64",
    "PROGRAM_FILE",
    "QuickSort",
    "RoundDown",
    "RoundFromZero",
    "RoundNearest",
    "RoundNearestTiesAway",
    "RoundNearestTiesUp",
    "RoundToZero",
    "RoundUp",
    "VERSION|0",
    "devnull",
    "false",
    "im",
    "missing",
    "nothing",
    "pi",
    "stderr",
    "stdin",
    "stdout",
    "true",
    "undef",
    "π",
    "ℯ"
  ];
  const BUILT_IN_LIST = [
    "AbstractArray",
    "AbstractChannel",
    "AbstractChar",
    "AbstractDict",
    "AbstractDisplay",
    "AbstractFloat",
    "AbstractIrrational",
    "AbstractMatrix",
    "AbstractRange",
    "AbstractSet",
    "AbstractString",
    "AbstractUnitRange",
    "AbstractVecOrMat",
    "AbstractVector",
    "Any",
    "ArgumentError",
    "Array",
    "AssertionError",
    "BigFloat",
    "BigInt",
    "BitArray",
    "BitMatrix",
    "BitSet",
    "BitVector",
    "Bool",
    "BoundsError",
    "CapturedException",
    "CartesianIndex",
    "CartesianIndices",
    "Cchar",
    "Cdouble",
    "Cfloat",
    "Channel",
    "Char",
    "Cint",
    "Cintmax_t",
    "Clong",
    "Clonglong",
    "Cmd",
    "Colon",
    "Complex",
    "ComplexF16",
    "ComplexF32",
    "ComplexF64",
    "CompositeException",
    "Condition",
    "Cptrdiff_t",
    "Cshort",
    "Csize_t",
    "Cssize_t",
    "Cstring",
    "Cuchar",
    "Cuint",
    "Cuintmax_t",
    "Culong",
    "Culonglong",
    "Cushort",
    "Cvoid",
    "Cwchar_t",
    "Cwstring",
    "DataType",
    "DenseArray",
    "DenseMatrix",
    "DenseVecOrMat",
    "DenseVector",
    "Dict",
    "DimensionMismatch",
    "Dims",
    "DivideError",
    "DomainError",
    "EOFError",
    "Enum",
    "ErrorException",
    "Exception",
    "ExponentialBackOff",
    "Expr",
    "Float16",
    "Float32",
    "Float64",
    "Function",
    "GlobalRef",
    "HTML",
    "IO",
    "IOBuffer",
    "IOContext",
    "IOStream",
    "IdDict",
    "IndexCartesian",
    "IndexLinear",
    "IndexStyle",
    "InexactError",
    "InitError",
    "Int",
    "Int128",
    "Int16",
    "Int32",
    "Int64",
    "Int8",
    "Integer",
    "InterruptException",
    "InvalidStateException",
    "Irrational",
    "KeyError",
    "LinRange",
    "LineNumberNode",
    "LinearIndices",
    "LoadError",
    "MIME",
    "Matrix",
    "Method",
    "MethodError",
    "Missing",
    "MissingException",
    "Module",
    "NTuple",
    "NamedTuple",
    "Nothing",
    "Number",
    "OrdinalRange",
    "OutOfMemoryError",
    "OverflowError",
    "Pair",
    "PartialQuickSort",
    "PermutedDimsArray",
    "Pipe",
    "ProcessFailedException",
    "Ptr",
    "QuoteNode",
    "Rational",
    "RawFD",
    "ReadOnlyMemoryError",
    "Real",
    "ReentrantLock",
    "Ref",
    "Regex",
    "RegexMatch",
    "RoundingMode",
    "SegmentationFault",
    "Set",
    "Signed",
    "Some",
    "StackOverflowError",
    "StepRange",
    "StepRangeLen",
    "StridedArray",
    "StridedMatrix",
    "StridedVecOrMat",
    "StridedVector",
    "String",
    "StringIndexError",
    "SubArray",
    "SubString",
    "SubstitutionString",
    "Symbol",
    "SystemError",
    "Task",
    "TaskFailedException",
    "Text",
    "TextDisplay",
    "Timer",
    "Tuple",
    "Type",
    "TypeError",
    "TypeVar",
    "UInt",
    "UInt128",
    "UInt16",
    "UInt32",
    "UInt64",
    "UInt8",
    "UndefInitializer",
    "UndefKeywordError",
    "UndefRefError",
    "UndefVarError",
    "Union",
    "UnionAll",
    "UnitRange",
    "Unsigned",
    "Val",
    "Vararg",
    "VecElement",
    "VecOrMat",
    "Vector",
    "VersionNumber",
    "WeakKeyDict",
    "WeakRef"
  ];
  const KEYWORDS3 = {
    $pattern: VARIABLE_NAME_RE,
    keyword: KEYWORD_LIST,
    literal: LITERAL_LIST,
    built_in: BUILT_IN_LIST
  };
  const DEFAULT = {
    keywords: KEYWORDS3,
    illegal: /<\//
  };
  const NUMBER = {
    className: "number",
    // supported numeric literals:
    //  * binary literal (e.g. 0x10)
    //  * octal literal (e.g. 0o76543210)
    //  * hexadecimal literal (e.g. 0xfedcba876543210)
    //  * hexadecimal floating point literal (e.g. 0x1p0, 0x1.2p2)
    //  * decimal literal (e.g. 9876543210, 100_000_000)
    //  * floating pointe literal (e.g. 1.2, 1.2f, .2, 1., 1.2e10, 1.2e-10)
    begin: /(\b0x[\d_]*(\.[\d_]*)?|0x\.\d[\d_]*)p[-+]?\d+|\b0[box][a-fA-F0-9][a-fA-F0-9_]*|(\b\d[\d_]*(\.[\d_]*)?|\.\d[\d_]*)([eEfF][-+]?\d+)?/,
    relevance: 0
  };
  const CHAR = {
    className: "string",
    begin: /'(.|\\[xXuU][a-zA-Z0-9]+)'/
  };
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    keywords: KEYWORDS3
  };
  const INTERPOLATED_VARIABLE = {
    className: "variable",
    begin: "\\$" + VARIABLE_NAME_RE
  };
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      INTERPOLATION,
      INTERPOLATED_VARIABLE
    ],
    variants: [
      {
        begin: /\w*"""/,
        end: /"""\w*/,
        relevance: 10
      },
      {
        begin: /\w*"/,
        end: /"\w*/
      }
    ]
  };
  const COMMAND = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      INTERPOLATION,
      INTERPOLATED_VARIABLE
    ],
    begin: "`",
    end: "`"
  };
  const MACROCALL = {
    className: "meta",
    begin: "@" + VARIABLE_NAME_RE
  };
  const COMMENT = {
    className: "comment",
    variants: [
      {
        begin: "#=",
        end: "=#",
        relevance: 10
      },
      {
        begin: "#",
        end: "$"
      }
    ]
  };
  DEFAULT.name = "Julia";
  DEFAULT.contains = [
    NUMBER,
    CHAR,
    STRING,
    COMMAND,
    MACROCALL,
    COMMENT,
    hljs.HASH_COMMENT_MODE,
    {
      className: "keyword",
      begin: "\\b(((abstract|primitive)\\s+)type|(mutable\\s+)?struct)\\b"
    },
    { begin: /<:/ }
    // relevance booster
  ];
  INTERPOLATION.contains = DEFAULT.contains;
  return DEFAULT;
}

// node_modules/highlight.js/es/languages/kotlin.js
var decimalDigits2 = "[0-9](_*[0-9])*";
var frac2 = `\\.(${decimalDigits2})`;
var hexDigits2 = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC2 = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits2})((${frac2})|\\.)?|(${frac2}))[eE][+-]?(${decimalDigits2})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits2})((${frac2})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac2})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits2})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits2})\\.?|(${hexDigits2})?\\.(${hexDigits2}))[pP][+-]?(${decimalDigits2})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits2})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function kotlin(hljs) {
  const KEYWORDS3 = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  };
  const KEYWORDS_WITH_LABEL = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  };
  const LABEL = {
    className: "symbol",
    begin: hljs.UNDERSCORE_IDENT_RE + "@"
  };
  const SUBST = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [hljs.C_NUMBER_MODE]
  };
  const VARIABLE = {
    className: "variable",
    begin: "\\$" + hljs.UNDERSCORE_IDENT_RE
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          VARIABLE,
          SUBST
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VARIABLE,
          SUBST
        ]
      }
    ]
  };
  SUBST.contains.push(STRING);
  const ANNOTATION_USE_SITE = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + hljs.UNDERSCORE_IDENT_RE + ")?"
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + hljs.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          hljs.inherit(STRING, { className: "string" }),
          "self"
        ]
      }
    ]
  };
  const KOTLIN_NUMBER_MODE = NUMERIC2;
  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [hljs.C_BLOCK_COMMENT_MODE] }
  );
  const KOTLIN_PAREN_TYPE = { variants: [
    {
      className: "type",
      begin: hljs.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] };
  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
  KOTLIN_PAREN_TYPE2.variants[1].contains = [KOTLIN_PAREN_TYPE];
  KOTLIN_PAREN_TYPE.variants[1].contains = [KOTLIN_PAREN_TYPE2];
  return {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: KEYWORDS3,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      KOTLIN_NESTED_COMMENT,
      KEYWORDS_WITH_LABEL,
      LABEL,
      ANNOTATION_USE_SITE,
      ANNOTATION,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS3,
        relevance: 5,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: true,
            relevance: 0,
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: true,
                contains: [
                  KOTLIN_PAREN_TYPE,
                  hljs.C_LINE_COMMENT_MODE,
                  KOTLIN_NESTED_COMMENT
                ],
                relevance: 0
              },
              hljs.C_LINE_COMMENT_MODE,
              KOTLIN_NESTED_COMMENT,
              ANNOTATION_USE_SITE,
              ANNOTATION,
              STRING,
              hljs.C_NUMBER_MODE
            ]
          },
          KOTLIN_NESTED_COMMENT
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          hljs.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: "class interface trait",
        end: /[:\{(]|$/,
        excludeEnd: true,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: true,
            returnEnd: true
          },
          ANNOTATION_USE_SITE,
          ANNOTATION
        ]
      },
      STRING,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: "\n"
      },
      KOTLIN_NUMBER_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/latex.js
function latex(hljs) {
  const regex = hljs.regex;
  const KNOWN_CONTROL_WORDS = regex.either(...[
    "(?:NeedsTeXFormat|RequirePackage|GetIdInfo)",
    "Provides(?:Expl)?(?:Package|Class|File)",
    "(?:DeclareOption|ProcessOptions)",
    "(?:documentclass|usepackage|input|include)",
    "makeat(?:letter|other)",
    "ExplSyntax(?:On|Off)",
    "(?:new|renew|provide)?command",
    "(?:re)newenvironment",
    "(?:New|Renew|Provide|Declare)(?:Expandable)?DocumentCommand",
    "(?:New|Renew|Provide|Declare)DocumentEnvironment",
    "(?:(?:e|g|x)?def|let)",
    "(?:begin|end)",
    "(?:part|chapter|(?:sub){0,2}section|(?:sub)?paragraph)",
    "caption",
    "(?:label|(?:eq|page|name)?ref|(?:paren|foot|super)?cite)",
    "(?:alpha|beta|[Gg]amma|[Dd]elta|(?:var)?epsilon|zeta|eta|[Tt]heta|vartheta)",
    "(?:iota|(?:var)?kappa|[Ll]ambda|mu|nu|[Xx]i|[Pp]i|varpi|(?:var)rho)",
    "(?:[Ss]igma|varsigma|tau|[Uu]psilon|[Pp]hi|varphi|chi|[Pp]si|[Oo]mega)",
    "(?:frac|sum|prod|lim|infty|times|sqrt|leq|geq|left|right|middle|[bB]igg?)",
    "(?:[lr]angle|q?quad|[lcvdi]?dots|d?dot|hat|tilde|bar)"
  ].map((word) => word + "(?![a-zA-Z@:_])"));
  const L3_REGEX = new RegExp([
    // A function \module_function_name:signature or \__module_function_name:signature,
    // where both module and function_name need at least two characters and
    // function_name may contain single underscores.
    "(?:__)?[a-zA-Z]{2,}_[a-zA-Z](?:_?[a-zA-Z])+:[a-zA-Z]*",
    // A variable \scope_module_and_name_type or \scope__module_ane_name_type,
    // where scope is one of l, g or c, type needs at least two characters
    // and module_and_name may contain single underscores.
    "[lgc]__?[a-zA-Z](?:_?[a-zA-Z])*_[a-zA-Z]{2,}",
    // A quark \q_the_name or \q__the_name or
    // scan mark \s_the_name or \s__vthe_name,
    // where variable_name needs at least two characters and
    // may contain single underscores.
    "[qs]__?[a-zA-Z](?:_?[a-zA-Z])+",
    // Other LaTeX3 macro names that are not covered by the three rules above.
    "use(?:_i)?:[a-zA-Z]*",
    "(?:else|fi|or):",
    "(?:if|cs|exp):w",
    "(?:hbox|vbox):n",
    "::[a-zA-Z]_unbraced",
    "::[a-zA-Z:]"
  ].map((pattern) => pattern + "(?![a-zA-Z:_])").join("|"));
  const L2_VARIANTS = [
    { begin: /[a-zA-Z@]+/ },
    // control word
    { begin: /[^a-zA-Z@]?/ }
    // control symbol
  ];
  const DOUBLE_CARET_VARIANTS = [
    { begin: /\^{6}[0-9a-f]{6}/ },
    { begin: /\^{5}[0-9a-f]{5}/ },
    { begin: /\^{4}[0-9a-f]{4}/ },
    { begin: /\^{3}[0-9a-f]{3}/ },
    { begin: /\^{2}[0-9a-f]{2}/ },
    { begin: /\^{2}[\u0000-\u007f]/ }
  ];
  const CONTROL_SEQUENCE = {
    className: "keyword",
    begin: /\\/,
    relevance: 0,
    contains: [
      {
        endsParent: true,
        begin: KNOWN_CONTROL_WORDS
      },
      {
        endsParent: true,
        begin: L3_REGEX
      },
      {
        endsParent: true,
        variants: DOUBLE_CARET_VARIANTS
      },
      {
        endsParent: true,
        relevance: 0,
        variants: L2_VARIANTS
      }
    ]
  };
  const MACRO_PARAM = {
    className: "params",
    relevance: 0,
    begin: /#+\d?/
  };
  const DOUBLE_CARET_CHAR = {
    // relevance: 1
    variants: DOUBLE_CARET_VARIANTS
  };
  const SPECIAL_CATCODE = {
    className: "built_in",
    relevance: 0,
    begin: /[$&^_]/
  };
  const MAGIC_COMMENT = {
    className: "meta",
    begin: /% ?!(T[eE]X|tex|BIB|bib)/,
    end: "$",
    relevance: 10
  };
  const COMMENT = hljs.COMMENT(
    "%",
    "$",
    { relevance: 0 }
  );
  const EVERYTHING_BUT_VERBATIM = [
    CONTROL_SEQUENCE,
    MACRO_PARAM,
    DOUBLE_CARET_CHAR,
    SPECIAL_CATCODE,
    MAGIC_COMMENT,
    COMMENT
  ];
  const BRACE_GROUP_NO_VERBATIM = {
    begin: /\{/,
    end: /\}/,
    relevance: 0,
    contains: [
      "self",
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
  const ARGUMENT_BRACES = hljs.inherit(
    BRACE_GROUP_NO_VERBATIM,
    {
      relevance: 0,
      endsParent: true,
      contains: [
        BRACE_GROUP_NO_VERBATIM,
        ...EVERYTHING_BUT_VERBATIM
      ]
    }
  );
  const ARGUMENT_BRACKETS = {
    begin: /\[/,
    end: /\]/,
    endsParent: true,
    relevance: 0,
    contains: [
      BRACE_GROUP_NO_VERBATIM,
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
  const SPACE_GOBBLER = {
    begin: /\s+/,
    relevance: 0
  };
  const ARGUMENT_M = [ARGUMENT_BRACES];
  const ARGUMENT_O = [ARGUMENT_BRACKETS];
  const ARGUMENT_AND_THEN = function(arg, starts_mode) {
    return {
      contains: [SPACE_GOBBLER],
      starts: {
        relevance: 0,
        contains: arg,
        starts: starts_mode
      }
    };
  };
  const CSNAME = function(csname, starts_mode) {
    return {
      begin: "\\\\" + csname + "(?![a-zA-Z@:_])",
      keywords: {
        $pattern: /\\[a-zA-Z]+/,
        keyword: "\\" + csname
      },
      relevance: 0,
      contains: [SPACE_GOBBLER],
      starts: starts_mode
    };
  };
  const BEGIN_ENV = function(envname, starts_mode) {
    return hljs.inherit(
      {
        begin: "\\\\begin(?=[ 	]*(\\r?\\n[ 	]*)?\\{" + envname + "\\})",
        keywords: {
          $pattern: /\\[a-zA-Z]+/,
          keyword: "\\begin"
        },
        relevance: 0
      },
      ARGUMENT_AND_THEN(ARGUMENT_M, starts_mode)
    );
  };
  const VERBATIM_DELIMITED_EQUAL = (innerName = "string") => {
    return hljs.END_SAME_AS_BEGIN({
      className: innerName,
      begin: /(.|\r?\n)/,
      end: /(.|\r?\n)/,
      excludeBegin: true,
      excludeEnd: true,
      endsParent: true
    });
  };
  const VERBATIM_DELIMITED_ENV = function(envname) {
    return {
      className: "string",
      end: "(?=\\\\end\\{" + envname + "\\})"
    };
  };
  const VERBATIM_DELIMITED_BRACES = (innerName = "string") => {
    return {
      relevance: 0,
      begin: /\{/,
      starts: {
        endsParent: true,
        contains: [
          {
            className: innerName,
            end: /(?=\})/,
            endsParent: true,
            contains: [
              {
                begin: /\{/,
                end: /\}/,
                relevance: 0,
                contains: ["self"]
              }
            ]
          }
        ]
      }
    };
  };
  const VERBATIM = [
    ...[
      "verb",
      "lstinline"
    ].map((csname) => CSNAME(csname, { contains: [VERBATIM_DELIMITED_EQUAL()] })),
    CSNAME("mint", ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [VERBATIM_DELIMITED_EQUAL()] })),
    CSNAME("mintinline", ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [
      VERBATIM_DELIMITED_BRACES(),
      VERBATIM_DELIMITED_EQUAL()
    ] })),
    CSNAME("url", { contains: [
      VERBATIM_DELIMITED_BRACES("link"),
      VERBATIM_DELIMITED_BRACES("link")
    ] }),
    CSNAME("hyperref", { contains: [VERBATIM_DELIMITED_BRACES("link")] }),
    CSNAME("href", ARGUMENT_AND_THEN(ARGUMENT_O, { contains: [VERBATIM_DELIMITED_BRACES("link")] })),
    ...[].concat(...[
      "",
      "\\*"
    ].map((suffix) => [
      BEGIN_ENV("verbatim" + suffix, VERBATIM_DELIMITED_ENV("verbatim" + suffix)),
      BEGIN_ENV("filecontents" + suffix, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV("filecontents" + suffix))),
      ...[
        "",
        "B",
        "L"
      ].map(
        (prefix) => BEGIN_ENV(prefix + "Verbatim" + suffix, ARGUMENT_AND_THEN(ARGUMENT_O, VERBATIM_DELIMITED_ENV(prefix + "Verbatim" + suffix)))
      )
    ])),
    BEGIN_ENV("minted", ARGUMENT_AND_THEN(ARGUMENT_O, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV("minted"))))
  ];
  return {
    name: "LaTeX",
    aliases: ["tex"],
    contains: [
      ...VERBATIM,
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
}

// node_modules/highlight.js/es/languages/less.js
var MODES2 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS2 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS2 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS2 = [
  ...HTML_TAGS2,
  ...SVG_TAGS2
];
var MEDIA_FEATURES2 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES2 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS2 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES2 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
var PSEUDO_SELECTORS = PSEUDO_CLASSES2.concat(PSEUDO_ELEMENTS2).sort().reverse();
function less(hljs) {
  const modes = MODES2(hljs);
  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE3 = "[\\w-]+";
  const INTERP_IDENT_RE = "(" + IDENT_RE3 + "|@\\{" + IDENT_RE3 + "\\})";
  const RULES = [];
  const VALUE_MODES = [];
  const STRING_MODE = function(c2) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + c2 + ".*?" + c2
    };
  };
  const IDENT_MODE = function(name, begin, relevance) {
    return {
      className: name,
      begin,
      relevance
    };
  };
  const AT_KEYWORDS = {
    $pattern: /[a-z-]+/,
    keyword: AT_MODIFIERS,
    attribute: MEDIA_FEATURES2.join(" ")
  };
  const PARENS_MODE = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: VALUE_MODES,
    keywords: AT_KEYWORDS,
    relevance: 0
  };
  VALUE_MODES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING_MODE("'"),
    STRING_MODE('"'),
    modes.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: true
      }
    },
    modes.HEXCOLOR,
    PARENS_MODE,
    IDENT_MODE("variable", "@@?" + IDENT_RE3, 10),
    IDENT_MODE("variable", "@\\{" + IDENT_RE3 + "\\}"),
    IDENT_MODE("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: IDENT_RE3 + "\\s*:",
      end: ":",
      returnBegin: true,
      excludeEnd: true
    },
    modes.IMPORTANT,
    { beginKeywords: "and not" },
    modes.FUNCTION_DISPATCH
  );
  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
    begin: /\{/,
    end: /\}/,
    contains: RULES
  });
  const MIXIN_GUARD_MODE = {
    beginKeywords: "when",
    endsWithParent: true,
    contains: [{ beginKeywords: "and not" }].concat(VALUE_MODES)
    // using this form to override VALUE’s 'function' match
  };
  const RULE_MODE = {
    begin: INTERP_IDENT_RE + "\\s*:",
    returnBegin: true,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES2.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: true,
          illegal: "[<=$]",
          relevance: 0,
          contains: VALUE_MODES
        }
      }
    ]
  };
  const AT_RULE_MODE = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: AT_KEYWORDS,
      returnEnd: true,
      contains: VALUE_MODES,
      relevance: 0
    }
  };
  const VAR_RULE_MODE = {
    className: "variable",
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: "@" + IDENT_RE3 + "\\s*:",
        relevance: 15
      },
      { begin: "@" + IDENT_RE3 }
    ],
    starts: {
      end: "[;}]",
      returnEnd: true,
      contains: VALUE_WITH_RULESETS
    }
  };
  const SELECTOR_MODE = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: "[\\.#:&\\[>]",
        end: "[;{}]"
        // mixin calls end with ';'
      },
      {
        begin: INTERP_IDENT_RE,
        end: /\{/
      }
    ],
    returnBegin: true,
    returnEnd: true,
    illegal: `[<='$"]`,
    relevance: 0,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      MIXIN_GUARD_MODE,
      IDENT_MODE("keyword", "all\\b"),
      IDENT_MODE("variable", "@\\{" + IDENT_RE3 + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + TAGS2.join("|") + ")\\b",
        className: "selector-tag"
      },
      modes.CSS_NUMBER_MODE,
      IDENT_MODE("selector-tag", INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-id", "#" + INTERP_IDENT_RE),
      IDENT_MODE("selector-class", "\\." + INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-tag", "&", 0),
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES2.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS2.join("|") + ")"
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: VALUE_WITH_RULESETS
      },
      // argument list of parametric mixins
      { begin: "!important" },
      // eat !important after mixin call or it will be colored as tag
      modes.FUNCTION_DISPATCH
    ]
  };
  const PSEUDO_SELECTOR_MODE = {
    begin: IDENT_RE3 + `:(:)?(${PSEUDO_SELECTORS$1.join("|")})`,
    returnBegin: true,
    contains: [SELECTOR_MODE]
  };
  RULES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    AT_RULE_MODE,
    VAR_RULE_MODE,
    PSEUDO_SELECTOR_MODE,
    RULE_MODE,
    SELECTOR_MODE,
    MIXIN_GUARD_MODE,
    modes.FUNCTION_DISPATCH
  );
  return {
    name: "Less",
    case_insensitive: true,
    illegal: `[=>'/<($"]`,
    contains: RULES
  };
}

// node_modules/highlight.js/es/languages/lua.js
function lua(hljs) {
  const OPENING_LONG_BRACKET = "\\[=*\\[";
  const CLOSING_LONG_BRACKET = "\\]=*\\]";
  const LONG_BRACKETS = {
    begin: OPENING_LONG_BRACKET,
    end: CLOSING_LONG_BRACKET,
    contains: ["self"]
  };
  const COMMENTS = [
    hljs.COMMENT("--(?!" + OPENING_LONG_BRACKET + ")", "$"),
    hljs.COMMENT(
      "--" + OPENING_LONG_BRACKET,
      CLOSING_LONG_BRACKET,
      {
        contains: [LONG_BRACKETS],
        relevance: 10
      }
    )
  ];
  return {
    name: "Lua",
    aliases: ["pluto"],
    keywords: {
      $pattern: hljs.UNDERSCORE_IDENT_RE,
      literal: "true false nil",
      keyword: "and break do else elseif end for goto if in local not or repeat return then until while",
      built_in: (
        // Metatags and globals:
        "_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len __gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring module next pairs pcall print rawequal rawget rawset require select setfenv setmetatable tonumber tostring type unpack xpcall arg self coroutine resume yield status wrap create running debug getupvalue debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv io lines write close flush open output type read stderr stdin input stdout popen tmpfile math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower table setn insert getn foreachi maxn foreach concat sort remove"
      )
    },
    contains: COMMENTS.concat([
      {
        className: "function",
        beginKeywords: "function",
        end: "\\)",
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          {
            className: "params",
            begin: "\\(",
            endsWithParent: true,
            contains: COMMENTS
          }
        ].concat(COMMENTS)
      },
      hljs.C_NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: OPENING_LONG_BRACKET,
        end: CLOSING_LONG_BRACKET,
        contains: [LONG_BRACKETS],
        relevance: 5
      }
    ])
  };
}

// node_modules/highlight.js/es/languages/makefile.js
function makefile(hljs) {
  const VARIABLE = {
    className: "variable",
    variants: [
      {
        begin: "\\$\\(" + hljs.UNDERSCORE_IDENT_RE + "\\)",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VARIABLE
    ]
  };
  const FUNC = {
    className: "variable",
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
    contains: [
      VARIABLE,
      QUOTE_STRING
      // Added QUOTE_STRING as they can be a part of functions
    ]
  };
  const ASSIGNMENT = { begin: "^" + hljs.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" };
  const META = {
    className: "meta",
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: ".PHONY"
    }
  };
  const TARGET = {
    className: "section",
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [VARIABLE]
  };
  return {
    name: "Makefile",
    aliases: [
      "mk",
      "mak",
      "make"
    ],
    keywords: {
      $pattern: /[\w-]+/,
      keyword: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath"
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      VARIABLE,
      QUOTE_STRING,
      FUNC,
      ASSIGNMENT,
      META,
      TARGET
    ]
  };
}

// node_modules/highlight.js/es/languages/markdown.js
function markdown(hljs) {
  const regex = hljs.regex;
  const INLINE_HTML = {
    begin: /<\/?[A-Za-z_]/,
    end: ">",
    subLanguage: "xml",
    relevance: 0
  };
  const HORIZONTAL_RULE = {
    begin: "^[-\\*]{3,}",
    end: "$"
  };
  const CODE = {
    className: "code",
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
      { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
      // needed to allow markdown as a sublanguage to work
      {
        begin: "```",
        end: "```+[ ]*$"
      },
      {
        begin: "~~~",
        end: "~~~+[ ]*$"
      },
      { begin: "`.+?`" },
      {
        begin: "(?=^( {4}|\\t))",
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: "^( {4}|\\t)",
            end: "(\\n)$"
          }
        ],
        relevance: 0
      }
    ]
  };
  const LIST = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const LINK_REFERENCE = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: true,
    contains: [
      {
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: true
      }
    ]
  };
  const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
  const LINK = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: true,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/
      },
      {
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: true,
        returnEnd: true
      },
      {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: true,
        excludeEnd: true
      }
    ]
  };
  const BOLD = {
    className: "strong",
    contains: [],
    // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  };
  const ITALIC = {
    className: "emphasis",
    contains: [],
    // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  };
  const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
  const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
  BOLD.contains.push(ITALIC_WITHOUT_BOLD);
  ITALIC.contains.push(BOLD_WITHOUT_ITALIC);
  let CONTAINABLE = [
    INLINE_HTML,
    LINK
  ];
  [
    BOLD,
    ITALIC,
    BOLD_WITHOUT_ITALIC,
    ITALIC_WITHOUT_BOLD
  ].forEach((m) => {
    m.contains = m.contains.concat(CONTAINABLE);
  });
  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);
  const HEADER = {
    className: "section",
    variants: [
      {
        begin: "^#{1,6}",
        end: "$",
        contains: CONTAINABLE
      },
      {
        begin: "(?=^.+?\\n[=-]{2,}$)",
        contains: [
          { begin: "^[=-]*$" },
          {
            begin: "^",
            end: "\\n",
            contains: CONTAINABLE
          }
        ]
      }
    ]
  };
  const BLOCKQUOTE = {
    className: "quote",
    begin: "^>\\s+",
    contains: CONTAINABLE,
    end: "$"
  };
  const ENTITY = {
    //https://spec.commonmark.org/0.31.2/#entity-references
    scope: "literal",
    match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
  };
  return {
    name: "Markdown",
    aliases: [
      "md",
      "mkdown",
      "mkd"
    ],
    contains: [
      HEADER,
      INLINE_HTML,
      LIST,
      BOLD,
      ITALIC,
      BLOCKQUOTE,
      CODE,
      HORIZONTAL_RULE,
      LINK,
      LINK_REFERENCE,
      ENTITY
    ]
  };
}

// node_modules/highlight.js/es/languages/nginx.js
function nginx(hljs) {
  const regex = hljs.regex;
  const VAR = {
    className: "variable",
    variants: [
      { begin: /\$\d+/ },
      { begin: /\$\{\w+\}/ },
      { begin: regex.concat(/[$@]/, hljs.UNDERSCORE_IDENT_RE) }
    ]
  };
  const LITERALS3 = [
    "on",
    "off",
    "yes",
    "no",
    "true",
    "false",
    "none",
    "blocked",
    "debug",
    "info",
    "notice",
    "warn",
    "error",
    "crit",
    "select",
    "break",
    "last",
    "permanent",
    "redirect",
    "kqueue",
    "rtsig",
    "epoll",
    "poll",
    "/dev/poll"
  ];
  const DEFAULT = {
    endsWithParent: true,
    keywords: {
      $pattern: /[a-z_]{2,}|\/dev\/poll/,
      literal: LITERALS3
    },
    relevance: 0,
    illegal: "=>",
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        className: "string",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VAR
        ],
        variants: [
          {
            begin: /"/,
            end: /"/
          },
          {
            begin: /'/,
            end: /'/
          }
        ]
      },
      // this swallows entire URLs to avoid detecting numbers within
      {
        begin: "([a-z]+):/",
        end: "\\s",
        endsWithParent: true,
        excludeEnd: true,
        contains: [VAR]
      },
      {
        className: "regexp",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VAR
        ],
        variants: [
          {
            begin: "\\s\\^",
            end: "\\s|\\{|;",
            returnEnd: true
          },
          // regexp locations (~, ~*)
          {
            begin: "~\\*?\\s+",
            end: "\\s|\\{|;",
            returnEnd: true
          },
          // *.example.com
          { begin: "\\*(\\.[a-z\\-]+)+" },
          // sub.example.*
          { begin: "([a-z\\-]+\\.)+\\*" }
        ]
      },
      // IP
      {
        className: "number",
        begin: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"
      },
      // units
      {
        className: "number",
        begin: "\\b\\d+[kKmMgGdshdwy]?\\b",
        relevance: 0
      },
      VAR
    ]
  };
  return {
    name: "Nginx config",
    aliases: ["nginxconf"],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        beginKeywords: "upstream location",
        end: /;|\{/,
        contains: DEFAULT.contains,
        keywords: { section: "upstream location" }
      },
      {
        className: "section",
        begin: regex.concat(hljs.UNDERSCORE_IDENT_RE + regex.lookahead(/\s+\{/)),
        relevance: 0
      },
      {
        begin: regex.lookahead(hljs.UNDERSCORE_IDENT_RE + "\\s"),
        end: ";|\\{",
        contains: [
          {
            className: "attribute",
            begin: hljs.UNDERSCORE_IDENT_RE,
            starts: DEFAULT
          }
        ],
        relevance: 0
      }
    ],
    illegal: "[^\\s\\}\\{]"
  };
}

// node_modules/highlight.js/es/languages/nim.js
function nim(hljs) {
  const TYPES3 = [
    "int",
    "int8",
    "int16",
    "int32",
    "int64",
    "uint",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "float",
    "float32",
    "float64",
    "bool",
    "char",
    "string",
    "cstring",
    "pointer",
    "expr",
    "stmt",
    "void",
    "auto",
    "any",
    "range",
    "array",
    "openarray",
    "varargs",
    "seq",
    "set",
    "clong",
    "culong",
    "cchar",
    "cschar",
    "cshort",
    "cint",
    "csize",
    "clonglong",
    "cfloat",
    "cdouble",
    "clongdouble",
    "cuchar",
    "cushort",
    "cuint",
    "culonglong",
    "cstringarray",
    "semistatic"
  ];
  const KEYWORDS3 = [
    "addr",
    "and",
    "as",
    "asm",
    "bind",
    "block",
    "break",
    "case",
    "cast",
    "concept",
    "const",
    "continue",
    "converter",
    "defer",
    "discard",
    "distinct",
    "div",
    "do",
    "elif",
    "else",
    "end",
    "enum",
    "except",
    "export",
    "finally",
    "for",
    "from",
    "func",
    "generic",
    "guarded",
    "if",
    "import",
    "in",
    "include",
    "interface",
    "is",
    "isnot",
    "iterator",
    "let",
    "macro",
    "method",
    "mixin",
    "mod",
    "nil",
    "not",
    "notin",
    "object",
    "of",
    "or",
    "out",
    "proc",
    "ptr",
    "raise",
    "ref",
    "return",
    "shared",
    "shl",
    "shr",
    "static",
    "template",
    "try",
    "tuple",
    "type",
    "using",
    "var",
    "when",
    "while",
    "with",
    "without",
    "xor",
    "yield"
  ];
  const BUILT_INS3 = [
    "stdin",
    "stdout",
    "stderr",
    "result"
  ];
  const LITERALS3 = [
    "true",
    "false"
  ];
  return {
    name: "Nim",
    keywords: {
      keyword: KEYWORDS3,
      literal: LITERALS3,
      type: TYPES3,
      built_in: BUILT_INS3
    },
    contains: [
      {
        className: "meta",
        // Actually pragma
        begin: /\{\./,
        end: /\.\}/,
        relevance: 10
      },
      {
        className: "string",
        begin: /[a-zA-Z]\w*"/,
        end: /"/,
        contains: [{ begin: /""/ }]
      },
      {
        className: "string",
        begin: /([a-zA-Z]\w*)?"""/,
        end: /"""/
      },
      hljs.QUOTE_STRING_MODE,
      {
        className: "type",
        begin: /\b[A-Z]\w+\b/,
        relevance: 0
      },
      {
        className: "number",
        relevance: 0,
        variants: [
          { begin: /\b(0[xX][0-9a-fA-F][_0-9a-fA-F]*)('?[iIuU](8|16|32|64))?/ },
          { begin: /\b(0o[0-7][_0-7]*)('?[iIuUfF](8|16|32|64))?/ },
          { begin: /\b(0(b|B)[01][_01]*)('?[iIuUfF](8|16|32|64))?/ },
          { begin: /\b(\d[_\d]*)('?[iIuUfF](8|16|32|64))?/ }
        ]
      },
      hljs.HASH_COMMENT_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/objectivec.js
function objectivec(hljs) {
  const API_CLASS = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  };
  const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
  const TYPES3 = [
    "int",
    "float",
    "char",
    "unsigned",
    "signed",
    "short",
    "long",
    "double",
    "wchar_t",
    "unichar",
    "void",
    "bool",
    "BOOL",
    "id|0",
    "_Bool"
  ];
  const KWS = [
    "while",
    "export",
    "sizeof",
    "typedef",
    "const",
    "struct",
    "for",
    "union",
    "volatile",
    "static",
    "mutable",
    "if",
    "do",
    "return",
    "goto",
    "enum",
    "else",
    "break",
    "extern",
    "asm",
    "case",
    "default",
    "register",
    "explicit",
    "typename",
    "switch",
    "continue",
    "inline",
    "readonly",
    "assign",
    "readwrite",
    "self",
    "@synchronized",
    "id",
    "typeof",
    "nonatomic",
    "IBOutlet",
    "IBAction",
    "strong",
    "weak",
    "copy",
    "in",
    "out",
    "inout",
    "bycopy",
    "byref",
    "oneway",
    "__strong",
    "__weak",
    "__block",
    "__autoreleasing",
    "@private",
    "@protected",
    "@public",
    "@try",
    "@property",
    "@end",
    "@throw",
    "@catch",
    "@finally",
    "@autoreleasepool",
    "@synthesize",
    "@dynamic",
    "@selector",
    "@optional",
    "@required",
    "@encode",
    "@package",
    "@import",
    "@defs",
    "@compatibility_alias",
    "__bridge",
    "__bridge_transfer",
    "__bridge_retained",
    "__bridge_retain",
    "__covariant",
    "__contravariant",
    "__kindof",
    "_Nonnull",
    "_Nullable",
    "_Null_unspecified",
    "__FUNCTION__",
    "__PRETTY_FUNCTION__",
    "__attribute__",
    "getter",
    "setter",
    "retain",
    "unsafe_unretained",
    "nonnull",
    "nullable",
    "null_unspecified",
    "null_resettable",
    "class",
    "instancetype",
    "NS_DESIGNATED_INITIALIZER",
    "NS_UNAVAILABLE",
    "NS_REQUIRES_SUPER",
    "NS_RETURNS_INNER_POINTER",
    "NS_INLINE",
    "NS_AVAILABLE",
    "NS_DEPRECATED",
    "NS_ENUM",
    "NS_OPTIONS",
    "NS_SWIFT_UNAVAILABLE",
    "NS_ASSUME_NONNULL_BEGIN",
    "NS_ASSUME_NONNULL_END",
    "NS_REFINED_FOR_SWIFT",
    "NS_SWIFT_NAME",
    "NS_SWIFT_NOTHROW",
    "NS_DURING",
    "NS_HANDLER",
    "NS_ENDHANDLER",
    "NS_VALUERETURN",
    "NS_VOIDRETURN"
  ];
  const LITERALS3 = [
    "false",
    "true",
    "FALSE",
    "TRUE",
    "nil",
    "YES",
    "NO",
    "NULL"
  ];
  const BUILT_INS3 = [
    "dispatch_once_t",
    "dispatch_queue_t",
    "dispatch_sync",
    "dispatch_async",
    "dispatch_once"
  ];
  const KEYWORDS3 = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: IDENTIFIER_RE,
    keyword: KWS,
    literal: LITERALS3,
    built_in: BUILT_INS3,
    type: TYPES3
  };
  const CLASS_KEYWORDS = {
    $pattern: IDENTIFIER_RE,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: KEYWORDS3,
    illegal: "</",
    contains: [
      API_CLASS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [hljs.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + CLASS_KEYWORDS.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: true,
        keywords: CLASS_KEYWORDS,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/ocaml.js
function ocaml(hljs) {
  return {
    name: "OCaml",
    aliases: ["ml"],
    keywords: {
      $pattern: "[a-z_]\\w*!?",
      keyword: "and as assert asr begin class constraint do done downto else end exception external for fun function functor if in include inherit! inherit initializer land lazy let lor lsl lsr lxor match method!|10 method mod module mutable new object of open! open or private rec sig struct then to try type val! val virtual when while with parser value",
      built_in: (
        /* built-in types */
        "array bool bytes char exn|5 float int int32 int64 list lazy_t|5 nativeint|5 string unit in_channel out_channel ref"
      ),
      literal: "true false"
    },
    illegal: /\/\/|>>/,
    contains: [
      {
        className: "literal",
        begin: "\\[(\\|\\|)?\\]|\\(\\)",
        relevance: 0
      },
      hljs.COMMENT(
        "\\(\\*",
        "\\*\\)",
        { contains: ["self"] }
      ),
      {
        /* type variable */
        className: "symbol",
        begin: "'[A-Za-z_](?!')[\\w']*"
        /* the grammar is ambiguous on how 'a'b should be interpreted but not the compiler */
      },
      {
        /* polymorphic variant */
        className: "type",
        begin: "`[A-Z][\\w']*"
      },
      {
        /* module or constructor */
        className: "type",
        begin: "\\b[A-Z][\\w']*",
        relevance: 0
      },
      {
        /* don't color identifiers, but safely catch all identifiers with ' */
        begin: "[a-z_]\\w*'[\\w']*",
        relevance: 0
      },
      hljs.inherit(hljs.APOS_STRING_MODE, {
        className: "string",
        relevance: 0
      }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null }),
      {
        className: "number",
        begin: "\\b(0[xX][a-fA-F0-9_]+[Lln]?|0[oO][0-7_]+[Lln]?|0[bB][01_]+[Lln]?|[0-9][0-9_]*([Lln]|(\\.[0-9_]*)?([eE][-+]?[0-9_]+)?)?)",
        relevance: 0
      },
      {
        begin: /->/
        // relevance booster
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/perl.js
function perl(hljs) {
  const regex = hljs.regex;
  const KEYWORDS3 = [
    "abs",
    "accept",
    "alarm",
    "and",
    "atan2",
    "bind",
    "binmode",
    "bless",
    "break",
    "caller",
    "chdir",
    "chmod",
    "chomp",
    "chop",
    "chown",
    "chr",
    "chroot",
    "class",
    "close",
    "closedir",
    "connect",
    "continue",
    "cos",
    "crypt",
    "dbmclose",
    "dbmopen",
    "defined",
    "delete",
    "die",
    "do",
    "dump",
    "each",
    "else",
    "elsif",
    "endgrent",
    "endhostent",
    "endnetent",
    "endprotoent",
    "endpwent",
    "endservent",
    "eof",
    "eval",
    "exec",
    "exists",
    "exit",
    "exp",
    "fcntl",
    "field",
    "fileno",
    "flock",
    "for",
    "foreach",
    "fork",
    "format",
    "formline",
    "getc",
    "getgrent",
    "getgrgid",
    "getgrnam",
    "gethostbyaddr",
    "gethostbyname",
    "gethostent",
    "getlogin",
    "getnetbyaddr",
    "getnetbyname",
    "getnetent",
    "getpeername",
    "getpgrp",
    "getpriority",
    "getprotobyname",
    "getprotobynumber",
    "getprotoent",
    "getpwent",
    "getpwnam",
    "getpwuid",
    "getservbyname",
    "getservbyport",
    "getservent",
    "getsockname",
    "getsockopt",
    "given",
    "glob",
    "gmtime",
    "goto",
    "grep",
    "gt",
    "hex",
    "if",
    "index",
    "int",
    "ioctl",
    "join",
    "keys",
    "kill",
    "last",
    "lc",
    "lcfirst",
    "length",
    "link",
    "listen",
    "local",
    "localtime",
    "log",
    "lstat",
    "lt",
    "ma",
    "map",
    "method",
    "mkdir",
    "msgctl",
    "msgget",
    "msgrcv",
    "msgsnd",
    "my",
    "ne",
    "next",
    "no",
    "not",
    "oct",
    "open",
    "opendir",
    "or",
    "ord",
    "our",
    "pack",
    "package",
    "pipe",
    "pop",
    "pos",
    "print",
    "printf",
    "prototype",
    "push",
    "q|0",
    "qq",
    "quotemeta",
    "qw",
    "qx",
    "rand",
    "read",
    "readdir",
    "readline",
    "readlink",
    "readpipe",
    "recv",
    "redo",
    "ref",
    "rename",
    "require",
    "reset",
    "return",
    "reverse",
    "rewinddir",
    "rindex",
    "rmdir",
    "say",
    "scalar",
    "seek",
    "seekdir",
    "select",
    "semctl",
    "semget",
    "semop",
    "send",
    "setgrent",
    "sethostent",
    "setnetent",
    "setpgrp",
    "setpriority",
    "setprotoent",
    "setpwent",
    "setservent",
    "setsockopt",
    "shift",
    "shmctl",
    "shmget",
    "shmread",
    "shmwrite",
    "shutdown",
    "sin",
    "sleep",
    "socket",
    "socketpair",
    "sort",
    "splice",
    "split",
    "sprintf",
    "sqrt",
    "srand",
    "stat",
    "state",
    "study",
    "sub",
    "substr",
    "symlink",
    "syscall",
    "sysopen",
    "sysread",
    "sysseek",
    "system",
    "syswrite",
    "tell",
    "telldir",
    "tie",
    "tied",
    "time",
    "times",
    "tr",
    "truncate",
    "uc",
    "ucfirst",
    "umask",
    "undef",
    "unless",
    "unlink",
    "unpack",
    "unshift",
    "untie",
    "until",
    "use",
    "utime",
    "values",
    "vec",
    "wait",
    "waitpid",
    "wantarray",
    "warn",
    "when",
    "while",
    "write",
    "x|0",
    "xor",
    "y|0"
  ];
  const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/;
  const PERL_KEYWORDS = {
    $pattern: /[\w.]+/,
    keyword: KEYWORDS3.join(" ")
  };
  const SUBST = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: PERL_KEYWORDS
  };
  const METHOD = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  };
  const ATTR = {
    scope: "attr",
    match: /\s+:\s*\w+(\s*\(.*?\))?/
  };
  const VAR = {
    scope: "variable",
    variants: [
      { begin: /\$\d/ },
      {
        begin: regex.concat(
          /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
          // negative look-ahead tries to avoid matching patterns that are not
          // Perl at all like $ident$, @ident@, etc.
          `(?![A-Za-z])(?![@$%])`
        )
      },
      {
        // Only $= is a special Perl variable and one can't declare @= or %=.
        begin: /[$%@](?!")[^\s\w{=]|\$=/,
        relevance: 0
      }
    ],
    contains: [ATTR]
  };
  const NUMBER = {
    className: "number",
    variants: [
      // decimal numbers:
      // include the case where a number starts with a dot (eg. .9), and
      // the leading 0? avoids mixing the first and second match on 0.x cases
      { match: /0?\.[0-9][0-9_]+\b/ },
      // include the special versioned number (eg. v5.38)
      { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
      // non-decimal numbers:
      { match: /\b0[0-7][0-7_]*\b/ },
      { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { match: /\b0b[0-1][0-1_]*\b/ }
    ],
    relevance: 0
  };
  const STRING_CONTAINS = [
    hljs.BACKSLASH_ESCAPE,
    SUBST,
    VAR
  ];
  const REGEX_DELIMS = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ];
  const PAIRED_DOUBLE_RE = (prefix, open, close = "\\1") => {
    const middle = close === "\\1" ? close : regex.concat(close, open);
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      middle,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  const PAIRED_RE = (prefix, open, close) => {
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  const PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    hljs.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: true }
    ),
    METHOD,
    {
      className: "string",
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: "q[qwxr]?\\s*\\(",
          end: "\\)",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\[",
          end: "\\]",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\{",
          end: "\\}",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\|",
          end: "\\|",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*<",
          end: ">",
          relevance: 5
        },
        {
          begin: "qw\\s+q",
          end: "q",
          relevance: 5
        },
        {
          begin: "'",
          end: "'",
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: "`",
          end: "`",
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: "-?\\w+\\s*=>",
          relevance: 0
        }
      ]
    },
    NUMBER,
    {
      // regexp container
      begin: "(\\/\\/|" + hljs.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
      keywords: "split return print reverse grep",
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        {
          className: "regexp",
          variants: [
            // allow matching common delimiters
            { begin: PAIRED_DOUBLE_RE("s|tr|y", regex.either(...REGEX_DELIMS, { capture: true })) },
            // and then paired delmis
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: "regexp",
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: PAIRED_RE("m|qr", regex.either(...REGEX_DELIMS, { capture: true }), /\1/) },
            // allow common paired delmins
            { begin: PAIRED_RE("m|qr", /\(/, /\)/) },
            { begin: PAIRED_RE("m|qr", /\[/, /\]/) },
            { begin: PAIRED_RE("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: "function",
      beginKeywords: "sub method",
      end: "(\\s*\\(.*?\\))?[;{]",
      excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE, ATTR]
    },
    {
      className: "class",
      beginKeywords: "class",
      end: "[;{]",
      excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE, ATTR, NUMBER]
    },
    {
      begin: "-\\w\\b",
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: "mojolicious",
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;
  return {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}

// node_modules/highlight.js/es/languages/php.js
function php(hljs) {
  const regex = hljs.regex;
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE3 = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC
  );
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC
  );
  const UPCASE_NAME_RE = regex.concat(
    /[A-Z]+/,
    NOT_PERL_ETC
  );
  const VARIABLE = {
    scope: "variable",
    match: "\\$+" + IDENT_RE3
  };
  const PREPROCESSOR = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  };
  const SUBST = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST)
  });
  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    "on:begin": (m, resp) => {
      resp.data._beginMatch = m[1] || m[2];
    },
    "on:end": (m, resp) => {
      if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
    }
  };
  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  });
  const WHITESPACE = "[ 	\n]";
  const STRING = {
    scope: "string",
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: "number",
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` },
      // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` },
      // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS3 = [
    "false",
    "null",
    "true"
  ];
  const KWS = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ];
  const BUILT_INS3 = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ];
  const dualCase = (items) => {
    const result = [];
    items.forEach((item) => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };
  const KEYWORDS3 = {
    keyword: KWS,
    literal: dualCase(LITERALS3),
    built_in: BUILT_INS3
  };
  const normalizeKeywords = (items) => {
    return items.map((item) => {
      return item.replace(/\|\d+$/, "");
    });
  };
  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS3).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] };
  const CONSTANT_REFERENCE = regex.concat(IDENT_RE3, "\\b(?!\\()");
  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] };
  const NAMED_ARGUMENT = {
    scope: "attr",
    match: regex.concat(IDENT_RE3, regex.lookahead(":"), regex.lookahead(/(?!::)/))
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL
    ]
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS3).join("\\b|"), "\\b)"),
      IDENT_RE3,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [PARAMS_MODE]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);
  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL
  ];
  const ATTRIBUTES4 = {
    begin: regex.concat(
      /#\[\s*\\?/,
      regex.either(
        PASCAL_CASE_CLASS_NAME_RE,
        UPCASE_NAME_RE
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS3,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS3,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...ATTRIBUTE_CONTAINS
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: "meta",
        variants: [
          { match: PASCAL_CASE_CLASS_NAME_RE },
          { match: UPCASE_NAME_RE }
        ]
      }
    ]
  };
  return {
    case_insensitive: false,
    keywords: KEYWORDS3,
    contains: [
      ATTRIBUTES4,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT("//", "$"),
      hljs.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: hljs.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: true
            }
          ]
        }
      },
      PREPROCESSOR,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE3
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      CONSTRUCTOR_CALL,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: true,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS3,
            contains: [
              "self",
              ATTRIBUTES4,
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: "extends implements" },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      STRING,
      NUMBER
    ]
  };
}

// node_modules/highlight.js/es/languages/powershell.js
function powershell(hljs) {
  const TYPES3 = [
    "string",
    "char",
    "byte",
    "int",
    "long",
    "bool",
    "decimal",
    "single",
    "double",
    "DateTime",
    "xml",
    "array",
    "hashtable",
    "void"
  ];
  const VALID_VERBS = "Add|Clear|Close|Copy|Enter|Exit|Find|Format|Get|Hide|Join|Lock|Move|New|Open|Optimize|Pop|Push|Redo|Remove|Rename|Reset|Resize|Search|Select|Set|Show|Skip|Split|Step|Switch|Undo|Unlock|Watch|Backup|Checkpoint|Compare|Compress|Convert|ConvertFrom|ConvertTo|Dismount|Edit|Expand|Export|Group|Import|Initialize|Limit|Merge|Mount|Out|Publish|Restore|Save|Sync|Unpublish|Update|Approve|Assert|Build|Complete|Confirm|Deny|Deploy|Disable|Enable|Install|Invoke|Register|Request|Restart|Resume|Start|Stop|Submit|Suspend|Uninstall|Unregister|Wait|Debug|Measure|Ping|Repair|Resolve|Test|Trace|Connect|Disconnect|Read|Receive|Send|Write|Block|Grant|Protect|Revoke|Unblock|Unprotect|Use|ForEach|Sort|Tee|Where";
  const COMPARISON_OPERATORS = "-and|-as|-band|-bnot|-bor|-bxor|-casesensitive|-ccontains|-ceq|-cge|-cgt|-cle|-clike|-clt|-cmatch|-cne|-cnotcontains|-cnotlike|-cnotmatch|-contains|-creplace|-csplit|-eq|-exact|-f|-file|-ge|-gt|-icontains|-ieq|-ige|-igt|-ile|-ilike|-ilt|-imatch|-in|-ine|-inotcontains|-inotlike|-inotmatch|-ireplace|-is|-isnot|-isplit|-join|-le|-like|-lt|-match|-ne|-not|-notcontains|-notin|-notlike|-notmatch|-or|-regex|-replace|-shl|-shr|-split|-wildcard|-xor";
  const KEYWORDS3 = {
    $pattern: /-?[A-z\.\-]+\b/,
    keyword: "if else foreach return do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catch hidden static parameter",
    // "echo" relevance has been set to 0 to avoid auto-detect conflicts with shell transcripts
    built_in: "ac asnp cat cd CFS chdir clc clear clhy cli clp cls clv cnsn compare copy cp cpi cpp curl cvpa dbp del diff dir dnsn ebp echo|0 epal epcsv epsn erase etsn exsn fc fhx fl ft fw gal gbp gc gcb gci gcm gcs gdr gerr ghy gi gin gjb gl gm gmo gp gps gpv group gsn gsnp gsv gtz gu gv gwmi h history icm iex ihy ii ipal ipcsv ipmo ipsn irm ise iwmi iwr kill lp ls man md measure mi mount move mp mv nal ndr ni nmo npssc nsn nv ogv oh popd ps pushd pwd r rbp rcjb rcsn rd rdr ren ri rjb rm rmdir rmo rni rnp rp rsn rsnp rujb rv rvpa rwmi sajb sal saps sasv sbp sc scb select set shcm si sl sleep sls sort sp spjb spps spsv start stz sujb sv swmi tee trcm type wget where wjb write"
    // TODO: 'validate[A-Z]+' can't work in keywords
  };
  const TITLE_NAME_RE = /\w[\w\d]*((-)[\w\d]+)*/;
  const BACKTICK_ESCAPE = {
    begin: "`[\\s\\S]",
    relevance: 0
  };
  const VAR = {
    className: "variable",
    variants: [
      { begin: /\$\B/ },
      {
        className: "keyword",
        begin: /\$this/
      },
      { begin: /\$[\w\d][\w\d_:]*/ }
    ]
  };
  const LITERAL = {
    className: "literal",
    begin: /\$(null|true|false)\b/
  };
  const QUOTE_STRING = {
    className: "string",
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /@"/,
        end: /^"@/
      }
    ],
    contains: [
      BACKTICK_ESCAPE,
      VAR,
      {
        className: "variable",
        begin: /\$[A-z]/,
        end: /[^A-z]/
      }
    ]
  };
  const APOS_STRING = {
    className: "string",
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /@'/,
        end: /^'@/
      }
    ]
  };
  const PS_HELPTAGS = {
    className: "doctag",
    variants: [
      /* no paramater help tags */
      { begin: /\.(synopsis|description|example|inputs|outputs|notes|link|component|role|functionality)/ },
      /* one parameter help tags */
      { begin: /\.(parameter|forwardhelptargetname|forwardhelpcategory|remotehelprunspace|externalhelp)\s+\S+/ }
    ]
  };
  const PS_COMMENT = hljs.inherit(
    hljs.COMMENT(null, null),
    {
      variants: [
        /* single-line comment */
        {
          begin: /#/,
          end: /$/
        },
        /* multi-line comment */
        {
          begin: /<#/,
          end: /#>/
        }
      ],
      contains: [PS_HELPTAGS]
    }
  );
  const CMDLETS = {
    className: "built_in",
    variants: [{ begin: "(".concat(VALID_VERBS, ")+(-)[\\w\\d]+") }]
  };
  const PS_CLASS = {
    className: "class",
    beginKeywords: "class enum",
    end: /\s*[{]/,
    excludeEnd: true,
    relevance: 0,
    contains: [hljs.TITLE_MODE]
  };
  const PS_FUNCTION = {
    className: "function",
    begin: /function\s+/,
    end: /\s*\{|$/,
    excludeEnd: true,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        begin: "function",
        relevance: 0,
        className: "keyword"
      },
      {
        className: "title",
        begin: TITLE_NAME_RE,
        relevance: 0
      },
      {
        begin: /\(/,
        end: /\)/,
        className: "params",
        relevance: 0,
        contains: [VAR]
      }
      // CMDLETS
    ]
  };
  const PS_USING = {
    begin: /using\s/,
    end: /$/,
    returnBegin: true,
    contains: [
      QUOTE_STRING,
      APOS_STRING,
      {
        className: "keyword",
        begin: /(using|assembly|command|module|namespace|type)/
      }
    ]
  };
  const PS_ARGUMENTS = { variants: [
    // PS literals are pretty verbose so it's a good idea to accent them a bit.
    {
      className: "operator",
      begin: "(".concat(COMPARISON_OPERATORS, ")\\b")
    },
    {
      className: "literal",
      begin: /(-){1,2}[\w\d-]+/,
      relevance: 0
    }
  ] };
  const HASH_SIGNS = {
    className: "selector-tag",
    begin: /@\B/,
    relevance: 0
  };
  const PS_METHODS = {
    className: "function",
    begin: /\[.*\]\s*[\w]+[ ]??\(/,
    end: /$/,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        begin: "(".concat(
          KEYWORDS3.keyword.toString().replace(
            /\s/g,
            "|"
          ),
          ")\\b"
        ),
        endsParent: true,
        relevance: 0
      },
      hljs.inherit(hljs.TITLE_MODE, { endsParent: true })
    ]
  };
  const GENTLEMANS_SET = [
    // STATIC_MEMBER,
    PS_METHODS,
    PS_COMMENT,
    BACKTICK_ESCAPE,
    hljs.NUMBER_MODE,
    QUOTE_STRING,
    APOS_STRING,
    // PS_NEW_OBJECT_TYPE,
    CMDLETS,
    VAR,
    LITERAL,
    HASH_SIGNS
  ];
  const PS_TYPE = {
    begin: /\[/,
    end: /\]/,
    excludeBegin: true,
    excludeEnd: true,
    relevance: 0,
    contains: [].concat(
      "self",
      GENTLEMANS_SET,
      {
        begin: "(" + TYPES3.join("|") + ")",
        className: "built_in",
        relevance: 0
      },
      {
        className: "type",
        begin: /[\.\w\d]+/,
        relevance: 0
      }
    )
  };
  PS_METHODS.contains.unshift(PS_TYPE);
  return {
    name: "PowerShell",
    aliases: [
      "pwsh",
      "ps",
      "ps1"
    ],
    case_insensitive: true,
    keywords: KEYWORDS3,
    contains: GENTLEMANS_SET.concat(
      PS_CLASS,
      PS_FUNCTION,
      PS_USING,
      PS_ARGUMENTS,
      PS_TYPE
    )
  };
}

// node_modules/highlight.js/es/languages/protobuf.js
function protobuf(hljs) {
  const KEYWORDS3 = [
    "package",
    "import",
    "option",
    "optional",
    "required",
    "repeated",
    "group",
    "oneof"
  ];
  const TYPES3 = [
    "double",
    "float",
    "int32",
    "int64",
    "uint32",
    "uint64",
    "sint32",
    "sint64",
    "fixed32",
    "fixed64",
    "sfixed32",
    "sfixed64",
    "bool",
    "string",
    "bytes"
  ];
  const CLASS_DEFINITION = {
    match: [
      /(message|enum|service)\s+/,
      hljs.IDENT_RE
    ],
    scope: {
      1: "keyword",
      2: "title.class"
    }
  };
  return {
    name: "Protocol Buffers",
    aliases: ["proto"],
    keywords: {
      keyword: KEYWORDS3,
      type: TYPES3,
      literal: [
        "true",
        "false"
      ]
    },
    contains: [
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      CLASS_DEFINITION,
      {
        className: "function",
        beginKeywords: "rpc",
        end: /[{;]/,
        excludeEnd: true,
        keywords: "rpc returns"
      },
      {
        // match enum items (relevance)
        // BLAH = ...;
        begin: /^\s*[A-Z_]+(?=\s*=[^\n]+;$)/
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/python.js
function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE3 = /[\p{XID_Start}_]\p{XID_Continue}*/u;
  const RESERVED_WORDS = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ];
  const BUILT_INS3 = [
    "__import__",
    "abs",
    "all",
    "any",
    "ascii",
    "bin",
    "bool",
    "breakpoint",
    "bytearray",
    "bytes",
    "callable",
    "chr",
    "classmethod",
    "compile",
    "complex",
    "delattr",
    "dict",
    "dir",
    "divmod",
    "enumerate",
    "eval",
    "exec",
    "filter",
    "float",
    "format",
    "frozenset",
    "getattr",
    "globals",
    "hasattr",
    "hash",
    "help",
    "hex",
    "id",
    "input",
    "int",
    "isinstance",
    "issubclass",
    "iter",
    "len",
    "list",
    "locals",
    "map",
    "max",
    "memoryview",
    "min",
    "next",
    "object",
    "oct",
    "open",
    "ord",
    "pow",
    "print",
    "property",
    "range",
    "repr",
    "reversed",
    "round",
    "set",
    "setattr",
    "slice",
    "sorted",
    "staticmethod",
    "str",
    "sum",
    "super",
    "tuple",
    "type",
    "vars",
    "zip"
  ];
  const LITERALS3 = [
    "__debug__",
    "Ellipsis",
    "False",
    "None",
    "NotImplemented",
    "True"
  ];
  const TYPES3 = [
    "Any",
    "Callable",
    "Coroutine",
    "Dict",
    "List",
    "Literal",
    "Generic",
    "Optional",
    "Sequence",
    "Set",
    "Tuple",
    "Type",
    "Union"
  ];
  const KEYWORDS3 = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS3,
    literal: LITERALS3,
    type: TYPES3
  };
  const PROMPT = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  };
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS3,
    illegal: /#/
  };
  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };
  const STRING = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  const digitpart = "[0-9](_?[0-9])*";
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  const lookahead3 = `\\b|${RESERVED_WORDS.join("|")}`;
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead3})`
      },
      {
        begin: `(${pointfloat})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead3})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead3})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead3})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead3})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead3})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS3,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true
      }
    ]
  };
  const PARAMS = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: true
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS3,
        contains: [
          "self",
          PROMPT,
          NUMBER,
          STRING,
          hljs.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  SUBST.contains = [
    STRING,
    NUMBER,
    PROMPT
  ];
  return {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: true,
    keywords: KEYWORDS3,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      STRING,
      COMMENT_TYPE,
      hljs.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          IDENT_RE3
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [PARAMS]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE3,
              /\s*/,
              /\(\s*/,
              IDENT_RE3,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE3
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          NUMBER,
          PARAMS,
          STRING
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/r.js
function r(hljs) {
  const regex = hljs.regex;
  const IDENT_RE3 = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
  const NUMBER_TYPES_RE = regex.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  );
  const OPERATORS_RE = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/;
  const PUNCTUATION_RE = regex.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );
  return {
    name: "R",
    keywords: {
      $pattern: IDENT_RE3,
      keyword: "function if in break next repeat else for while",
      literal: "NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 NA_complex_|10",
      built_in: (
        // Builtin constants
        "LETTERS letters month.abb month.name pi T F abs acos acosh all any anyNA Arg as.call as.character as.complex as.double as.environment as.integer as.logical as.null.default as.numeric as.raw asin asinh atan atanh attr attributes baseenv browser c call ceiling class Conj cos cosh cospi cummax cummin cumprod cumsum digamma dim dimnames emptyenv exp expression floor forceAndCall gamma gc.time globalenv Im interactive invisible is.array is.atomic is.call is.character is.complex is.double is.environment is.expression is.finite is.function is.infinite is.integer is.language is.list is.logical is.matrix is.na is.name is.nan is.null is.numeric is.object is.pairlist is.raw is.recursive is.single is.symbol lazyLoadDBfetch length lgamma list log max min missing Mod names nargs nzchar oldClass on.exit pos.to.env proc.time prod quote range Re rep retracemem return round seq_along seq_len seq.int sign signif sin sinh sinpi sqrt standardGeneric substitute sum switch tan tanh tanpi tracemem trigamma trunc unclass untracemem UseMethod xtfrm"
      )
    },
    contains: [
      // Roxygen comments
      hljs.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: "doctag",
            match: /@examples/,
            starts: {
              end: regex.lookahead(regex.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: true
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: "doctag",
            begin: "@param",
            end: /$/,
            contains: [
              {
                scope: "variable",
                variants: [
                  { match: IDENT_RE3 },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: true
              }
            ]
          },
          {
            scope: "doctag",
            match: /@[a-zA-Z]+/
          },
          {
            scope: "keyword",
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),
      hljs.HASH_COMMENT_MODE,
      {
        scope: "string",
        contains: [hljs.BACKSLASH_ESCAPE],
        variants: [
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ]
      },
      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              OPERATORS_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              /%[^%]*%/,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "punctuation",
              2: "number"
            },
            match: [
              PUNCTUATION_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: { 2: "number" },
            match: [
              /[^a-zA-Z0-9._]|^/,
              // not part of an identifier, or start of document
              NUMBER_TYPES_RE
            ]
          }
        ]
      },
      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: "operator" },
        match: [
          IDENT_RE3,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },
      {
        scope: "operator",
        relevance: 0,
        variants: [
          { match: OPERATORS_RE },
          { match: /%[^%]*%/ }
        ]
      },
      {
        scope: "punctuation",
        relevance: 0,
        match: PUNCTUATION_RE
      },
      {
        // Escaped identifier
        begin: "`",
        end: "`",
        contains: [{ begin: /\\./ }]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/ruby.js
function ruby(hljs) {
  const regex = hljs.regex;
  const RUBY_METHOD_RE = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)";
  const CLASS_NAME_RE = regex.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  );
  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
  const PSEUDO_KWS = [
    "include",
    "extend",
    "prepend",
    "public",
    "private",
    "protected",
    "raise",
    "throw"
  ];
  const RUBY_KEYWORDS = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...PSEUDO_KWS
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  };
  const YARDOCTAG = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  };
  const IRB_OBJECT = {
    begin: "#<",
    end: ">"
  };
  const COMMENT_MODES = [
    hljs.COMMENT(
      "#",
      "$",
      { contains: [YARDOCTAG] }
    ),
    hljs.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [YARDOCTAG],
        relevance: 10
      }
    ),
    hljs.COMMENT("^__END__", hljs.MATCH_NOTHING_RE)
  ];
  const SUBST = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: RUBY_KEYWORDS
  };
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: regex.concat(
          /<<[-~]?'?/,
          regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          hljs.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ]
          })
        ]
      }
    ]
  };
  const decimal = "[1-9](_?[0-9])*|0";
  const digits = "[0-9](_?[0-9])*";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  };
  const PARAMS = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: true,
        endsParent: true,
        keywords: RUBY_KEYWORDS
      }
    ]
  };
  const INCLUDE_EXTEND = {
    match: [
      /(include|extend)\s+/,
      CLASS_NAME_WITH_NAMESPACE_RE
    ],
    scope: {
      2: "title.class"
    },
    keywords: RUBY_KEYWORDS
  };
  const CLASS_DEFINITION = {
    variants: [
      {
        match: [
          /class\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE,
          /\s+<\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      },
      {
        match: [
          /\b(class|module)\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      }
    ],
    scope: {
      2: "title.class",
      4: "title.class.inherited"
    },
    keywords: RUBY_KEYWORDS
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  const METHOD_DEFINITION = {
    match: [
      /def/,
      /\s+/,
      RUBY_METHOD_RE
    ],
    scope: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  const OBJECT_CREATION = {
    relevance: 0,
    match: [
      CLASS_NAME_WITH_NAMESPACE_RE,
      /\.new[. (]/
    ],
    scope: {
      1: "title.class"
    }
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: CLASS_NAME_RE,
    scope: "title.class"
  };
  const RUBY_DEFAULT_CONTAINS = [
    STRING,
    CLASS_DEFINITION,
    INCLUDE_EXTEND,
    OBJECT_CREATION,
    UPPER_CASE_CONSTANT,
    CLASS_REFERENCE,
    METHOD_DEFINITION,
    {
      // swallow namespace qualifiers before symbols
      begin: hljs.IDENT_RE + "::"
    },
    {
      className: "symbol",
      begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        STRING,
        { begin: RUBY_METHOD_RE }
      ],
      relevance: 0
    },
    NUMBER,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
    },
    {
      className: "params",
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: RUBY_KEYWORDS
    },
    {
      // regexp container
      begin: "(" + hljs.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(IRB_OBJECT, COMMENT_MODES),
      relevance: 0
    }
  ].concat(IRB_OBJECT, COMMENT_MODES);
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;
  const SIMPLE_PROMPT = "[>?]>";
  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";
  const IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + "|" + RVM_PROMPT + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: RUBY_KEYWORDS,
        contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];
  COMMENT_MODES.unshift(IRB_OBJECT);
  return {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: [hljs.SHEBANG({ binary: "ruby" })].concat(IRB_DEFAULT).concat(COMMENT_MODES).concat(RUBY_DEFAULT_CONTAINS)
  };
}

// node_modules/highlight.js/es/languages/rust.js
function rust(hljs) {
  const regex = hljs.regex;
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE3 = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  const FUNCTION_INVOKE = {
    className: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      IDENT_RE3,
      regex.lookahead(/\s*\(/)
    )
  };
  const NUMBER_SUFFIX = "([ui](8|16|32|64|128|size)|f(32|64))?";
  const KEYWORDS3 = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ];
  const LITERALS3 = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ];
  const TYPES3 = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: hljs.IDENT_RE + "!?",
      type: TYPES3,
      keyword: KEYWORDS3,
      literal: LITERALS3,
      built_in: BUILTINS
    },
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: "symbol",
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        className: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0o([0-7_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + NUMBER_SUFFIX },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          UNDERSCORE_IDENT_RE,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES3
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      FUNCTION_INVOKE
    ]
  };
}

// node_modules/highlight.js/es/languages/scala.js
function scala(hljs) {
  const regex = hljs.regex;
  const ANNOTATION = {
    className: "meta",
    begin: "@[A-Za-z]+"
  };
  const SUBST = {
    className: "subst",
    variants: [
      { begin: "\\$[A-Za-z0-9_]+" },
      {
        begin: /\$\{/,
        end: /\}/
      }
    ]
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""'
      },
      {
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '[a-z]+"',
        end: '"',
        illegal: "\\n",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST
        ]
      },
      {
        className: "string",
        begin: '[a-z]+"""',
        end: '"""',
        contains: [SUBST],
        relevance: 10
      }
    ]
  };
  const TYPE = {
    className: "type",
    begin: "\\b[A-Z][A-Za-z0-9_]*",
    relevance: 0
  };
  const NAME = {
    className: "title",
    begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
    relevance: 0
  };
  const CLASS = {
    className: "class",
    beginKeywords: "class object trait type",
    end: /[:={\[\n;]/,
    excludeEnd: true,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        beginKeywords: "extends with",
        relevance: 10
      },
      {
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0,
        contains: [
          TYPE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0,
        contains: [
          TYPE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      NAME
    ]
  };
  const METHOD = {
    className: "function",
    beginKeywords: "def",
    end: regex.lookahead(/[:={\[(\n;]/),
    contains: [NAME]
  };
  const EXTENSION = {
    begin: [
      /^\s*/,
      // Is first token on the line
      "extension",
      /\s+(?=[[(])/
      // followed by at least one space and `[` or `(`
    ],
    beginScope: { 2: "keyword" }
  };
  const END = {
    begin: [
      /^\s*/,
      // Is first token on the line
      /end/,
      /\s+/,
      /(extension\b)?/
      // `extension` is the only marker that follows an `end` that cannot be captured by another rule.
    ],
    beginScope: {
      2: "keyword",
      4: "keyword"
    }
  };
  const INLINE_MODES = [
    { match: /\.inline\b/ },
    {
      begin: /\binline(?=\s)/,
      keywords: "inline"
    }
  ];
  const USING_PARAM_CLAUSE = {
    begin: [
      /\(\s*/,
      // Opening `(` of a parameter or argument list
      /using/,
      /\s+(?!\))/
      // Spaces not followed by `)`
    ],
    beginScope: { 2: "keyword" }
  };
  const DIRECTIVE_VALUE = {
    className: "string",
    begin: /\S+/
  };
  const USING_DIRECTIVE = {
    begin: [
      "//>",
      /\s+/,
      /using/,
      /\s+/,
      /\S+/
    ],
    beginScope: {
      1: "comment",
      3: "keyword",
      5: "type"
    },
    end: /$/,
    contains: [
      DIRECTIVE_VALUE
    ]
  };
  return {
    name: "Scala",
    keywords: {
      literal: "true false null",
      keyword: "type yield lazy override def with val var sealed abstract private trait object if then forSome for while do throw finally protected extends import final return else break new catch super class case package default try this match continue throws implicit export enum given transparent"
    },
    contains: [
      USING_DIRECTIVE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      TYPE,
      METHOD,
      CLASS,
      hljs.C_NUMBER_MODE,
      EXTENSION,
      END,
      ...INLINE_MODES,
      USING_PARAM_CLAUSE,
      ANNOTATION
    ]
  };
}

// node_modules/highlight.js/es/languages/scss.js
var MODES3 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS3 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS3 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS3 = [
  ...HTML_TAGS3,
  ...SVG_TAGS3
];
var MEDIA_FEATURES3 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES3 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS3 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES3 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function scss(hljs) {
  const modes = MODES3(hljs);
  const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS3;
  const PSEUDO_CLASSES$1 = PSEUDO_CLASSES3;
  const AT_IDENTIFIER = "@[a-z-]+";
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE3 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const VARIABLE = {
    className: "variable",
    begin: "(\\$" + IDENT_RE3 + ")\\b",
    relevance: 0
  };
  return {
    name: "SCSS",
    case_insensitive: true,
    illegal: "[=/|']",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: "#[A-Za-z0-9_-]+",
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\.[A-Za-z0-9_-]+",
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS3.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES$1.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS$1.join("|") + ")"
      },
      VARIABLE,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [modes.CSS_NUMBER_MODE]
      },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES3.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          modes.BLOCK_COMMENT,
          VARIABLE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.IMPORTANT,
          modes.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: "@(page|font-face)",
        keywords: {
          $pattern: AT_IDENTIFIER,
          keyword: "@page @font-face"
        }
      },
      {
        begin: "@",
        end: "[{;]",
        returnBegin: true,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES3.join(" ")
        },
        contains: [
          {
            begin: AT_IDENTIFIER,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE
        ]
      },
      modes.FUNCTION_DISPATCH
    ]
  };
}

// node_modules/highlight.js/es/languages/sql.js
function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT("--", "$");
  const STRING = {
    scope: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ match: /''/ }]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [{ match: /""/ }]
  };
  const LITERALS3 = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ];
  const MULTI_WORD_TYPES = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ];
  const TYPES3 = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ];
  const NON_RESERVED_WORDS = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ];
  const RESERVED_WORDS = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ];
  const RESERVED_FUNCTIONS = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ];
  const POSSIBLE_WITHOUT_PARENS = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ];
  const COMBOS = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ];
  const FUNCTIONS = RESERVED_FUNCTIONS;
  const KEYWORDS3 = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });
  const VARIABLE = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  };
  const OPERATOR = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  };
  const FUNCTION_CALL = {
    match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };
  function kws_to_regex(list) {
    return regex.concat(
      /\b/,
      regex.either(...list.map((kw) => {
        return kw.replace(/\s+/, "\\s+");
      })),
      /\b/
    );
  }
  const MULTI_WORD_KEYWORDS = {
    scope: "keyword",
    match: kws_to_regex(COMBOS),
    relevance: 0
  };
  function reduceRelevancy(list, {
    exceptions,
    when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list.map((item) => {
      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
        return item;
      } else if (qualifyFn(item)) {
        return `${item}|0`;
      } else {
        return item;
      }
    });
  }
  return {
    name: "SQL",
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: reduceRelevancy(KEYWORDS3, { when: (x) => x.length < 3 }),
      literal: LITERALS3,
      type: TYPES3,
      built_in: POSSIBLE_WITHOUT_PARENS
    },
    contains: [
      {
        scope: "type",
        match: kws_to_regex(MULTI_WORD_TYPES)
      },
      MULTI_WORD_KEYWORDS,
      FUNCTION_CALL,
      VARIABLE,
      STRING,
      QUOTED_IDENTIFIER,
      hljs.C_NUMBER_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      OPERATOR
    ]
  };
}

// node_modules/highlight.js/es/languages/swift.js
function source2(re) {
  if (!re) return null;
  if (typeof re === "string") return re;
  return re.source;
}
function lookahead2(re) {
  return concat2("(?=", re, ")");
}
function concat2(...args) {
  const joined = args.map((x) => source2(x)).join("");
  return joined;
}
function stripOptionsFromArgs2(args) {
  const opts = args[args.length - 1];
  if (typeof opts === "object" && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}
function either2(...args) {
  const opts = stripOptionsFromArgs2(args);
  const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source2(x)).join("|") + ")";
  return joined;
}
var keywordWrapper = (keyword) => concat2(
  /\b/,
  keyword,
  /\w$/.test(keyword) ? /\b/ : /\B/
);
var dotKeywords = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(keywordWrapper);
var optionalDotKeywords = [
  "init",
  "self"
].map(keywordWrapper);
var keywordTypes = [
  "Any",
  "Self"
];
var keywords = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "any",
  // contextual
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "borrowing",
  // contextual
  "break",
  "case",
  "catch",
  "class",
  "consume",
  // contextual
  "consuming",
  // contextual
  "continue",
  "convenience",
  // contextual
  "copy",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "distributed",
  "do",
  "dynamic",
  // contextual
  "each",
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "macro",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "package",
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
];
var literals = [
  "false",
  "nil",
  "true"
];
var precedencegroupKeywords = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
];
var numberSignKeywords = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warning"
];
var builtIns = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
];
var operatorHead = either2(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
);
var operatorCharacter = either2(
  operatorHead,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
);
var operator = concat2(operatorHead, operatorCharacter, "*");
var identifierHead = either2(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
);
var identifierCharacter = either2(
  identifierHead,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
);
var identifier = concat2(identifierHead, identifierCharacter, "*");
var typeIdentifier = concat2(/[A-Z]/, identifierCharacter, "*");
var keywordAttributes = [
  "attached",
  "autoclosure",
  concat2(/convention\(/, either2("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "freestanding",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  concat2(/objc\(/, identifier, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "Sendable",
  "testable",
  "UIApplicationMain",
  "unchecked",
  "unknown",
  "usableFromInline",
  "warn_unqualified_access"
];
var availabilityKeywords = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function swift(hljs) {
  const WHITESPACE = {
    match: /\s+/,
    relevance: 0
  };
  const BLOCK_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  );
  const COMMENTS = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT
  ];
  const DOT_KEYWORD = {
    match: [
      /\./,
      either2(...dotKeywords, ...optionalDotKeywords)
    ],
    className: { 2: "keyword" }
  };
  const KEYWORD_GUARD = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: concat2(/\./, either2(...keywords)),
    relevance: 0
  };
  const PLAIN_KEYWORDS = keywords.filter((kw) => typeof kw === "string").concat(["_|0"]);
  const REGEX_KEYWORDS = keywords.filter((kw) => typeof kw !== "string").concat(keywordTypes).map(keywordWrapper);
  const KEYWORD = { variants: [
    {
      className: "keyword",
      match: either2(...REGEX_KEYWORDS, ...optionalDotKeywords)
    }
  ] };
  const KEYWORDS3 = {
    $pattern: either2(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: PLAIN_KEYWORDS.concat(numberSignKeywords),
    literal: literals
  };
  const KEYWORD_MODES = [
    DOT_KEYWORD,
    KEYWORD_GUARD,
    KEYWORD
  ];
  const BUILT_IN_GUARD = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: concat2(/\./, either2(...builtIns)),
    relevance: 0
  };
  const BUILT_IN = {
    className: "built_in",
    match: concat2(/\b/, either2(...builtIns), /(?=\()/)
  };
  const BUILT_INS3 = [
    BUILT_IN_GUARD,
    BUILT_IN
  ];
  const OPERATOR_GUARD = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  };
  const OPERATOR = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: operator },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${operatorCharacter})+`
      }
    ]
  };
  const OPERATORS = [
    OPERATOR_GUARD,
    OPERATOR
  ];
  const decimalDigits3 = "([0-9]_*)+";
  const hexDigits3 = "([0-9a-fA-F]_*)+";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits3})(\\.(${decimalDigits3}))?([eE][+-]?(${decimalDigits3}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${hexDigits3})(\\.(${hexDigits3}))?([pP][+-]?(${decimalDigits3}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  };
  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
    className: "subst",
    variants: [
      { match: concat2(/\\/, rawDelimiter, /[0\\tnr"']/) },
      { match: concat2(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  });
  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
    className: "subst",
    match: concat2(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
  });
  const INTERPOLATION = (rawDelimiter = "") => ({
    className: "subst",
    label: "interpol",
    begin: concat2(/\\/, rawDelimiter, /\(/),
    end: /\)/
  });
  const MULTILINE_STRING = (rawDelimiter = "") => ({
    begin: concat2(rawDelimiter, /"""/),
    end: concat2(/"""/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      ESCAPED_NEWLINE(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
    begin: concat2(rawDelimiter, /"/),
    end: concat2(/"/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const STRING = {
    className: "string",
    variants: [
      MULTILINE_STRING(),
      MULTILINE_STRING("#"),
      MULTILINE_STRING("##"),
      MULTILINE_STRING("###"),
      SINGLE_LINE_STRING(),
      SINGLE_LINE_STRING("#"),
      SINGLE_LINE_STRING("##"),
      SINGLE_LINE_STRING("###")
    ]
  };
  const REGEXP_CONTENTS = [
    hljs.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  const BARE_REGEXP_LITERAL = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: REGEXP_CONTENTS
  };
  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
    const begin = concat2(rawDelimiter, /\//);
    const end = concat2(/\//, rawDelimiter);
    return {
      begin,
      end,
      contains: [
        ...REGEXP_CONTENTS,
        {
          scope: "comment",
          begin: `#(?!.*${end})`,
          end: /$/
        }
      ]
    };
  };
  const REGEXP = {
    scope: "regexp",
    variants: [
      EXTENDED_REGEXP_LITERAL("###"),
      EXTENDED_REGEXP_LITERAL("##"),
      EXTENDED_REGEXP_LITERAL("#"),
      BARE_REGEXP_LITERAL
    ]
  };
  const QUOTED_IDENTIFIER = { match: concat2(/`/, identifier, /`/) };
  const IMPLICIT_PARAMETER = {
    className: "variable",
    match: /\$\d+/
  };
  const PROPERTY_WRAPPER_PROJECTION = {
    className: "variable",
    match: `\\$${identifierCharacter}+`
  };
  const IDENTIFIERS = [
    QUOTED_IDENTIFIER,
    IMPLICIT_PARAMETER,
    PROPERTY_WRAPPER_PROJECTION
  ];
  const AVAILABLE_ATTRIBUTE = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: availabilityKeywords,
        contains: [
          ...OPERATORS,
          NUMBER,
          STRING
        ]
      }
    ] }
  };
  const KEYWORD_ATTRIBUTE = {
    scope: "keyword",
    match: concat2(/@/, either2(...keywordAttributes), lookahead2(either2(/\(/, /\s+/)))
  };
  const USER_DEFINED_ATTRIBUTE = {
    scope: "meta",
    match: concat2(/@/, identifier)
  };
  const ATTRIBUTES4 = [
    AVAILABLE_ATTRIBUTE,
    KEYWORD_ATTRIBUTE,
    USER_DEFINED_ATTRIBUTE
  ];
  const TYPE = {
    match: lookahead2(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: concat2(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, "+")
      },
      {
        // Type identifier
        className: "type",
        match: typeIdentifier,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: concat2(/\s+&\s+/, lookahead2(typeIdentifier)),
        relevance: 0
      }
    ]
  };
  const GENERIC_ARGUMENTS = {
    begin: /</,
    end: />/,
    keywords: KEYWORDS3,
    contains: [
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...ATTRIBUTES4,
      OPERATOR_GUARD,
      TYPE
    ]
  };
  TYPE.contains.push(GENERIC_ARGUMENTS);
  const TUPLE_ELEMENT_NAME = {
    match: concat2(identifier, /\s*:/),
    keywords: "_|0",
    relevance: 0
  };
  const TUPLE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: KEYWORDS3,
    contains: [
      "self",
      TUPLE_ELEMENT_NAME,
      ...COMMENTS,
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES4,
      TYPE
    ]
  };
  const GENERIC_PARAMETERS = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...COMMENTS,
      TYPE
    ]
  };
  const FUNCTION_PARAMETER_NAME = {
    begin: either2(
      lookahead2(concat2(identifier, /\s*:/)),
      lookahead2(concat2(identifier, /\s+/, identifier, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: identifier
      }
    ]
  };
  const FUNCTION_PARAMETERS = {
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    contains: [
      FUNCTION_PARAMETER_NAME,
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...ATTRIBUTES4,
      TYPE,
      TUPLE
    ],
    endsParent: true,
    illegal: /["']/
  };
  const FUNCTION_OR_MACRO = {
    match: [
      /(func|macro)/,
      /\s+/,
      either2(QUOTED_IDENTIFIER.match, identifier, operator)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: [
      /\[/,
      /%/
    ]
  };
  const INIT_SUBSCRIPT = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: /\[|%/
  };
  const OPERATOR_DECLARATION = {
    match: [
      /operator/,
      /\s+/,
      operator
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  };
  const PRECEDENCEGROUP = {
    begin: [
      /precedencegroup/,
      /\s+/,
      typeIdentifier
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [TYPE],
    keywords: [
      ...precedencegroupKeywords,
      ...literals
    ],
    end: /}/
  };
  const CLASS_FUNC_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  };
  const CLASS_VAR_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  };
  const TYPE_DECLARATION = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      identifier,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: KEYWORDS3,
    contains: [
      GENERIC_PARAMETERS,
      ...KEYWORD_MODES,
      {
        begin: /:/,
        end: /\{/,
        keywords: KEYWORDS3,
        contains: [
          {
            scope: "title.class.inherited",
            match: typeIdentifier
          },
          ...KEYWORD_MODES
        ],
        relevance: 0
      }
    ]
  };
  for (const variant of STRING.variants) {
    const interpolation = variant.contains.find((mode) => mode.label === "interpol");
    interpolation.keywords = KEYWORDS3;
    const submodes = [
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS
    ];
    interpolation.contains = [
      ...submodes,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...submodes
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: KEYWORDS3,
    contains: [
      ...COMMENTS,
      FUNCTION_OR_MACRO,
      INIT_SUBSCRIPT,
      CLASS_FUNC_DECLARATION,
      CLASS_VAR_DECLARATION,
      TYPE_DECLARATION,
      OPERATOR_DECLARATION,
      PRECEDENCEGROUP,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...COMMENTS],
        relevance: 0
      },
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES4,
      TYPE,
      TUPLE
    ]
  };
}

// node_modules/highlight.js/es/languages/typescript.js
var IDENT_RE2 = "[A-Za-z$_][0-9A-Za-z$_]*";
var KEYWORDS2 = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
var LITERALS2 = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
var TYPES2 = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
var ERROR_TYPES2 = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
var BUILT_IN_GLOBALS2 = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
var BUILT_IN_VARIABLES2 = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
];
var BUILT_INS2 = [].concat(
  BUILT_IN_GLOBALS2,
  TYPES2,
  ERROR_TYPES2
);
function javascript2(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1 = IDENT_RE2;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE2,
    keyword: KEYWORDS2,
    literal: LITERALS2,
    built_in: BUILT_INS2,
    "variable.language": BUILT_IN_VARIABLES2
  };
  const decimalDigits3 = "[0-9](_?[0-9])*";
  const frac3 = `\\.(${decimalDigits3})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac3})|\\.)?|(${frac3}))[eE][+-]?(${decimalDigits3})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac3})\\b|\\.)?|(${frac3})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES2,
        ...ERROR_TYPES2
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS2,
        "super",
        "import"
      ].map((x) => `${x}\\s*\\(`)),
      IDENT_RE$1,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function typescript(hljs) {
  const regex = hljs.regex;
  const tsLanguage = javascript2(hljs);
  const IDENT_RE$1 = IDENT_RE2;
  const TYPES3 = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ];
  const NAMESPACE = {
    begin: [
      /namespace/,
      /\s+/,
      hljs.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  };
  const INTERFACE = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: "interface extends",
      built_in: TYPES3
    },
    contains: [tsLanguage.exports.CLASS_REFERENCE]
  };
  const USE_STRICT = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  };
  const TS_SPECIFIC_KEYWORDS = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ];
  const KEYWORDS$1 = {
    $pattern: IDENT_RE2,
    keyword: KEYWORDS2.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS2,
    built_in: BUILT_INS2.concat(TYPES3),
    "variable.language": BUILT_IN_VARIABLES2
  };
  const DECORATOR = {
    className: "meta",
    begin: "@" + IDENT_RE$1
  };
  const swapMode = (mode, label, replacement) => {
    const indx = mode.contains.findIndex((m) => m.label === label);
    if (indx === -1) {
      throw new Error("can not find mode to replace");
    }
    mode.contains.splice(indx, 1, replacement);
  };
  Object.assign(tsLanguage.keywords, KEYWORDS$1);
  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
  const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find((c2) => c2.scope === "attr");
  const OPTIONAL_KEY_OR_ARGUMENT = Object.assign(
    {},
    ATTRIBUTE_HIGHLIGHT,
    { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) }
  );
  tsLanguage.exports.PARAMS_CONTAINS.push([
    tsLanguage.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    ATTRIBUTE_HIGHLIGHT,
    // highlight the params key
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE,
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  swapMode(tsLanguage, "use_strict", USE_STRICT);
  const functionDeclaration = tsLanguage.contains.find((m) => m.label === "func.def");
  functionDeclaration.relevance = 0;
  Object.assign(tsLanguage, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  });
  return tsLanguage;
}

// node_modules/highlight.js/es/languages/vbnet.js
function vbnet(hljs) {
  const regex = hljs.regex;
  const CHARACTER = {
    className: "string",
    begin: /"(""|[^/n])"C\b/
  };
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [
      {
        // double quote escape
        begin: /""/
      }
    ]
  };
  const MM_DD_YYYY = /\d{1,2}\/\d{1,2}\/\d{4}/;
  const YYYY_MM_DD = /\d{4}-\d{1,2}-\d{1,2}/;
  const TIME_12H = /(\d|1[012])(:\d+){0,2} *(AM|PM)/;
  const TIME_24H = /\d{1,2}(:\d{1,2}){1,2}/;
  const DATE = {
    className: "literal",
    variants: [
      {
        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
        begin: regex.concat(/# */, regex.either(YYYY_MM_DD, MM_DD_YYYY), / *#/)
      },
      {
        // #H:mm[:ss]# (24h Time)
        begin: regex.concat(/# */, TIME_24H, / *#/)
      },
      {
        // #h[:mm[:ss]] A# (12h Time)
        begin: regex.concat(/# */, TIME_12H, / *#/)
      },
      {
        // date plus time
        begin: regex.concat(
          /# */,
          regex.either(YYYY_MM_DD, MM_DD_YYYY),
          / +/,
          regex.either(TIME_12H, TIME_24H),
          / *#/
        )
      }
    ]
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      {
        // Float
        begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/
      },
      {
        // Integer (base 10)
        begin: /\b\d[\d_]*((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 16)
        begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 8)
        begin: /&O[0-7_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 2)
        begin: /&B[01_]+((U?[SIL])|[%&])?/
      }
    ]
  };
  const LABEL = {
    className: "label",
    begin: /^\w+:/
  };
  const DOC_COMMENT = hljs.COMMENT(/'''/, /$/, { contains: [
    {
      className: "doctag",
      begin: /<\/?/,
      end: />/
    }
  ] });
  const COMMENT = hljs.COMMENT(null, /$/, { variants: [
    { begin: /'/ },
    {
      // TODO: Use multi-class for leading spaces
      begin: /([\t ]|^)REM(?=\s)/
    }
  ] });
  const DIRECTIVES = {
    className: "meta",
    // TODO: Use multi-class for indentation once available
    begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
    end: /$/,
    keywords: { keyword: "const disable else elseif enable end externalsource if region then" },
    contains: [COMMENT]
  };
  return {
    name: "Visual Basic .NET",
    aliases: ["vb"],
    case_insensitive: true,
    classNameAliases: { label: "symbol" },
    keywords: {
      keyword: "addhandler alias aggregate ansi as async assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
      built_in: (
        // Operators https://docs.microsoft.com/dotnet/visual-basic/language-reference/operators
        "addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort"
      ),
      type: (
        // Data types https://docs.microsoft.com/dotnet/visual-basic/language-reference/data-types
        "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort"
      ),
      literal: "true false nothing"
    },
    illegal: "//|\\{|\\}|endif|gosub|variant|wend|^\\$ ",
    contains: [
      CHARACTER,
      STRING,
      DATE,
      NUMBER,
      LABEL,
      DOC_COMMENT,
      COMMENT,
      DIRECTIVES
    ]
  };
}

// node_modules/highlight.js/es/languages/vbscript.js
function vbscript(hljs) {
  const regex = hljs.regex;
  const BUILT_IN_FUNCTIONS = [
    "lcase",
    "month",
    "vartype",
    "instrrev",
    "ubound",
    "setlocale",
    "getobject",
    "rgb",
    "getref",
    "string",
    "weekdayname",
    "rnd",
    "dateadd",
    "monthname",
    "now",
    "day",
    "minute",
    "isarray",
    "cbool",
    "round",
    "formatcurrency",
    "conversions",
    "csng",
    "timevalue",
    "second",
    "year",
    "space",
    "abs",
    "clng",
    "timeserial",
    "fixs",
    "len",
    "asc",
    "isempty",
    "maths",
    "dateserial",
    "atn",
    "timer",
    "isobject",
    "filter",
    "weekday",
    "datevalue",
    "ccur",
    "isdate",
    "instr",
    "datediff",
    "formatdatetime",
    "replace",
    "isnull",
    "right",
    "sgn",
    "array",
    "snumeric",
    "log",
    "cdbl",
    "hex",
    "chr",
    "lbound",
    "msgbox",
    "ucase",
    "getlocale",
    "cos",
    "cdate",
    "cbyte",
    "rtrim",
    "join",
    "hour",
    "oct",
    "typename",
    "trim",
    "strcomp",
    "int",
    "createobject",
    "loadpicture",
    "tan",
    "formatnumber",
    "mid",
    "split",
    "cint",
    "sin",
    "datepart",
    "ltrim",
    "sqr",
    "time",
    "derived",
    "eval",
    "date",
    "formatpercent",
    "exp",
    "inputbox",
    "left",
    "ascw",
    "chrw",
    "regexp",
    "cstr",
    "err"
  ];
  const BUILT_IN_OBJECTS = [
    "server",
    "response",
    "request",
    // take no arguments so can be called without ()
    "scriptengine",
    "scriptenginebuildversion",
    "scriptengineminorversion",
    "scriptenginemajorversion"
  ];
  const BUILT_IN_CALL = {
    begin: regex.concat(regex.either(...BUILT_IN_FUNCTIONS), "\\s*\\("),
    // relevance 0 because this is acting as a beginKeywords really
    relevance: 0,
    keywords: { built_in: BUILT_IN_FUNCTIONS }
  };
  const LITERALS3 = [
    "true",
    "false",
    "null",
    "nothing",
    "empty"
  ];
  const KEYWORDS3 = [
    "call",
    "class",
    "const",
    "dim",
    "do",
    "loop",
    "erase",
    "execute",
    "executeglobal",
    "exit",
    "for",
    "each",
    "next",
    "function",
    "if",
    "then",
    "else",
    "on",
    "error",
    "option",
    "explicit",
    "new",
    "private",
    "property",
    "let",
    "get",
    "public",
    "randomize",
    "redim",
    "rem",
    "select",
    "case",
    "set",
    "stop",
    "sub",
    "while",
    "wend",
    "with",
    "end",
    "to",
    "elseif",
    "is",
    "or",
    "xor",
    "and",
    "not",
    "class_initialize",
    "class_terminate",
    "default",
    "preserve",
    "in",
    "me",
    "byval",
    "byref",
    "step",
    "resume",
    "goto"
  ];
  return {
    name: "VBScript",
    aliases: ["vbs"],
    case_insensitive: true,
    keywords: {
      keyword: KEYWORDS3,
      built_in: BUILT_IN_OBJECTS,
      literal: LITERALS3
    },
    illegal: "//",
    contains: [
      BUILT_IN_CALL,
      hljs.inherit(hljs.QUOTE_STRING_MODE, { contains: [{ begin: '""' }] }),
      hljs.COMMENT(
        /'/,
        /$/,
        { relevance: 0 }
      ),
      hljs.C_NUMBER_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/vim.js
function vim(hljs) {
  return {
    name: "Vim Script",
    keywords: {
      $pattern: /[!#@\w]+/,
      keyword: (
        // express version except: ! & * < = > !! # @ @@
        "N|0 P|0 X|0 a|0 ab abc abo al am an|0 ar arga argd arge argdo argg argl argu as au aug aun b|0 bN ba bad bd be bel bf bl bm bn bo bp br brea breaka breakd breakl bro bufdo buffers bun bw c|0 cN cNf ca cabc caddb cad caddf cal cat cb cc ccl cd ce cex cf cfir cgetb cgete cg changes chd che checkt cl cla clo cm cmapc cme cn cnew cnf cno cnorea cnoreme co col colo com comc comp con conf cope cp cpf cq cr cs cst cu cuna cunme cw delm deb debugg delc delf dif diffg diffo diffp diffpu diffs diffthis dig di dl dell dj dli do doautoa dp dr ds dsp e|0 ea ec echoe echoh echom echon el elsei em en endfo endf endt endw ene ex exe exi exu f|0 files filet fin fina fini fir fix fo foldc foldd folddoc foldo for fu go gr grepa gu gv ha helpf helpg helpt hi hid his ia iabc if ij il im imapc ime ino inorea inoreme int is isp iu iuna iunme j|0 ju k|0 keepa kee keepj lN lNf l|0 lad laddb laddf la lan lat lb lc lch lcl lcs le lefta let lex lf lfir lgetb lgete lg lgr lgrepa lh ll lla lli lmak lm lmapc lne lnew lnf ln loadk lo loc lockv lol lope lp lpf lr ls lt lu lua luad luaf lv lvimgrepa lw m|0 ma mak map mapc marks mat me menut mes mk mks mksp mkv mkvie mod mz mzf nbc nb nbs new nm nmapc nme nn nnoreme noa no noh norea noreme norm nu nun nunme ol o|0 om omapc ome on ono onoreme opt ou ounme ow p|0 profd prof pro promptr pc ped pe perld po popu pp pre prev ps pt ptN ptf ptj ptl ptn ptp ptr pts pu pw py3 python3 py3d py3f py pyd pyf quita qa rec red redi redr redraws reg res ret retu rew ri rightb rub rubyd rubyf rund ru rv sN san sa sal sav sb sbN sba sbf sbl sbm sbn sbp sbr scrip scripte scs se setf setg setl sf sfir sh sim sig sil sl sla sm smap smapc sme sn sni sno snor snoreme sor so spelld spe spelli spellr spellu spellw sp spr sre st sta startg startr star stopi stj sts sun sunm sunme sus sv sw sy synti sync tN tabN tabc tabdo tabe tabf tabfir tabl tabm tabnew tabn tabo tabp tabr tabs tab ta tags tc tcld tclf te tf th tj tl tm tn to tp tr try ts tu u|0 undoj undol una unh unl unlo unm unme uns up ve verb vert vim vimgrepa vi viu vie vm vmapc vme vne vn vnoreme vs vu vunme windo w|0 wN wa wh wi winc winp wn wp wq wqa ws wu wv x|0 xa xmapc xm xme xn xnoreme xu xunme y|0 z|0 ~ Next Print append abbreviate abclear aboveleft all amenu anoremenu args argadd argdelete argedit argglobal arglocal argument ascii autocmd augroup aunmenu buffer bNext ball badd bdelete behave belowright bfirst blast bmodified bnext botright bprevious brewind break breakadd breakdel breaklist browse bunload bwipeout change cNext cNfile cabbrev cabclear caddbuffer caddexpr caddfile call catch cbuffer cclose center cexpr cfile cfirst cgetbuffer cgetexpr cgetfile chdir checkpath checktime clist clast close cmap cmapclear cmenu cnext cnewer cnfile cnoremap cnoreabbrev cnoremenu copy colder colorscheme command comclear compiler continue confirm copen cprevious cpfile cquit crewind cscope cstag cunmap cunabbrev cunmenu cwindow delete delmarks debug debuggreedy delcommand delfunction diffupdate diffget diffoff diffpatch diffput diffsplit digraphs display deletel djump dlist doautocmd doautoall deletep drop dsearch dsplit edit earlier echo echoerr echohl echomsg else elseif emenu endif endfor endfunction endtry endwhile enew execute exit exusage file filetype find finally finish first fixdel fold foldclose folddoopen folddoclosed foldopen function global goto grep grepadd gui gvim hardcopy help helpfind helpgrep helptags highlight hide history insert iabbrev iabclear ijump ilist imap imapclear imenu inoremap inoreabbrev inoremenu intro isearch isplit iunmap iunabbrev iunmenu join jumps keepalt keepmarks keepjumps lNext lNfile list laddexpr laddbuffer laddfile last language later lbuffer lcd lchdir lclose lcscope left leftabove lexpr lfile lfirst lgetbuffer lgetexpr lgetfile lgrep lgrepadd lhelpgrep llast llist lmake lmap lmapclear lnext lnewer lnfile lnoremap loadkeymap loadview lockmarks lockvar lolder lopen lprevious lpfile lrewind ltag lunmap luado luafile lvimgrep lvimgrepadd lwindow move mark make mapclear match menu menutranslate messages mkexrc mksession mkspell mkvimrc mkview mode mzscheme mzfile nbclose nbkey nbsart next nmap nmapclear nmenu nnoremap nnoremenu noautocmd noremap nohlsearch noreabbrev noremenu normal number nunmap nunmenu oldfiles open omap omapclear omenu only onoremap onoremenu options ounmap ounmenu ownsyntax print profdel profile promptfind promptrepl pclose pedit perl perldo pop popup ppop preserve previous psearch ptag ptNext ptfirst ptjump ptlast ptnext ptprevious ptrewind ptselect put pwd py3do py3file python pydo pyfile quit quitall qall read recover redo redir redraw redrawstatus registers resize retab return rewind right rightbelow ruby rubydo rubyfile rundo runtime rviminfo substitute sNext sandbox sargument sall saveas sbuffer sbNext sball sbfirst sblast sbmodified sbnext sbprevious sbrewind scriptnames scriptencoding scscope set setfiletype setglobal setlocal sfind sfirst shell simalt sign silent sleep slast smagic smapclear smenu snext sniff snomagic snoremap snoremenu sort source spelldump spellgood spellinfo spellrepall spellundo spellwrong split sprevious srewind stop stag startgreplace startreplace startinsert stopinsert stjump stselect sunhide sunmap sunmenu suspend sview swapname syntax syntime syncbind tNext tabNext tabclose tabedit tabfind tabfirst tablast tabmove tabnext tabonly tabprevious tabrewind tag tcl tcldo tclfile tearoff tfirst throw tjump tlast tmenu tnext topleft tprevious trewind tselect tunmenu undo undojoin undolist unabbreviate unhide unlet unlockvar unmap unmenu unsilent update vglobal version verbose vertical vimgrep vimgrepadd visual viusage view vmap vmapclear vmenu vnew vnoremap vnoremenu vsplit vunmap vunmenu write wNext wall while winsize wincmd winpos wnext wprevious wqall wsverb wundo wviminfo xit xall xmapclear xmap xmenu xnoremap xnoremenu xunmap xunmenu yank"
      ),
      built_in: (
        // built in func
        "synIDtrans atan2 range matcharg did_filetype asin feedkeys xor argv complete_check add getwinposx getqflist getwinposy screencol clearmatches empty extend getcmdpos mzeval garbagecollect setreg ceil sqrt diff_hlID inputsecret get getfperm getpid filewritable shiftwidth max sinh isdirectory synID system inputrestore winline atan visualmode inputlist tabpagewinnr round getregtype mapcheck hasmapto histdel argidx findfile sha256 exists toupper getcmdline taglist string getmatches bufnr strftime winwidth bufexists strtrans tabpagebuflist setcmdpos remote_read printf setloclist getpos getline bufwinnr float2nr len getcmdtype diff_filler luaeval resolve libcallnr foldclosedend reverse filter has_key bufname str2float strlen setline getcharmod setbufvar index searchpos shellescape undofile foldclosed setqflist buflisted strchars str2nr virtcol floor remove undotree remote_expr winheight gettabwinvar reltime cursor tabpagenr finddir localtime acos getloclist search tanh matchend rename gettabvar strdisplaywidth type abs py3eval setwinvar tolower wildmenumode log10 spellsuggest bufloaded synconcealed nextnonblank server2client complete settabwinvar executable input wincol setmatches getftype hlID inputsave searchpair or screenrow line settabvar histadd deepcopy strpart remote_peek and eval getftime submatch screenchar winsaveview matchadd mkdir screenattr getfontname libcall reltimestr getfsize winnr invert pow getbufline byte2line soundfold repeat fnameescape tagfiles sin strwidth spellbadword trunc maparg log lispindent hostname setpos globpath remote_foreground getchar synIDattr fnamemodify cscope_connection stridx winbufnr indent min complete_add nr2char searchpairpos inputdialog values matchlist items hlexists strridx browsedir expand fmod pathshorten line2byte argc count getwinvar glob foldtextresult getreg foreground cosh matchdelete has char2nr simplify histget searchdecl iconv winrestcmd pumvisible writefile foldlevel haslocaldir keys cos matchstr foldtext histnr tan tempname getcwd byteidx getbufvar islocked escape eventhandler remote_send serverlist winrestview synstack pyeval prevnonblank readfile cindent filereadable changenr exp"
      )
    },
    illegal: /;/,
    contains: [
      hljs.NUMBER_MODE,
      {
        className: "string",
        begin: "'",
        end: "'",
        illegal: "\\n"
      },
      /*
            A double quote can start either a string or a line comment. Strings are
            ended before the end of a line by another double quote and can contain
            escaped double-quotes and post-escaped line breaks.
      
            Also, any double quote at the beginning of a line is a comment but we
            don't handle that properly at the moment: any double quote inside will
            turn them into a string. Handling it properly will require a smarter
            parser.
            */
      {
        className: "string",
        begin: /"(\\"|\n\\|[^"\n])*"/
      },
      hljs.COMMENT('"', "$"),
      {
        className: "variable",
        begin: /[bwtglsav]:[\w\d_]+/
      },
      {
        begin: [
          /\b(?:function|function!)/,
          /\s+/,
          hljs.IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title"
        },
        end: "$",
        relevance: 0,
        contains: [
          {
            className: "params",
            begin: "\\(",
            end: "\\)"
          }
        ]
      },
      {
        className: "symbol",
        begin: /<[\w-]+>/
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/x86asm.js
function x86asm(hljs) {
  return {
    name: "Intel x86 Assembly",
    case_insensitive: true,
    keywords: {
      $pattern: "[.%]?" + hljs.IDENT_RE,
      keyword: "lock rep repe repz repne repnz xaquire xrelease bnd nobnd aaa aad aam aas adc add and arpl bb0_reset bb1_reset bound bsf bsr bswap bt btc btr bts call cbw cdq cdqe clc cld cli clts cmc cmp cmpsb cmpsd cmpsq cmpsw cmpxchg cmpxchg486 cmpxchg8b cmpxchg16b cpuid cpu_read cpu_write cqo cwd cwde daa das dec div dmint emms enter equ f2xm1 fabs fadd faddp fbld fbstp fchs fclex fcmovb fcmovbe fcmove fcmovnb fcmovnbe fcmovne fcmovnu fcmovu fcom fcomi fcomip fcomp fcompp fcos fdecstp fdisi fdiv fdivp fdivr fdivrp femms feni ffree ffreep fiadd ficom ficomp fidiv fidivr fild fimul fincstp finit fist fistp fisttp fisub fisubr fld fld1 fldcw fldenv fldl2e fldl2t fldlg2 fldln2 fldpi fldz fmul fmulp fnclex fndisi fneni fninit fnop fnsave fnstcw fnstenv fnstsw fpatan fprem fprem1 fptan frndint frstor fsave fscale fsetpm fsin fsincos fsqrt fst fstcw fstenv fstp fstsw fsub fsubp fsubr fsubrp ftst fucom fucomi fucomip fucomp fucompp fxam fxch fxtract fyl2x fyl2xp1 hlt ibts icebp idiv imul in inc incbin insb insd insw int int01 int1 int03 int3 into invd invpcid invlpg invlpga iret iretd iretq iretw jcxz jecxz jrcxz jmp jmpe lahf lar lds lea leave les lfence lfs lgdt lgs lidt lldt lmsw loadall loadall286 lodsb lodsd lodsq lodsw loop loope loopne loopnz loopz lsl lss ltr mfence monitor mov movd movq movsb movsd movsq movsw movsx movsxd movzx mul mwait neg nop not or out outsb outsd outsw packssdw packsswb packuswb paddb paddd paddsb paddsiw paddsw paddusb paddusw paddw pand pandn pause paveb pavgusb pcmpeqb pcmpeqd pcmpeqw pcmpgtb pcmpgtd pcmpgtw pdistib pf2id pfacc pfadd pfcmpeq pfcmpge pfcmpgt pfmax pfmin pfmul pfrcp pfrcpit1 pfrcpit2 pfrsqit1 pfrsqrt pfsub pfsubr pi2fd pmachriw pmaddwd pmagw pmulhriw pmulhrwa pmulhrwc pmulhw pmullw pmvgezb pmvlzb pmvnzb pmvzb pop popa popad popaw popf popfd popfq popfw por prefetch prefetchw pslld psllq psllw psrad psraw psrld psrlq psrlw psubb psubd psubsb psubsiw psubsw psubusb psubusw psubw punpckhbw punpckhdq punpckhwd punpcklbw punpckldq punpcklwd push pusha pushad pushaw pushf pushfd pushfq pushfw pxor rcl rcr rdshr rdmsr rdpmc rdtsc rdtscp ret retf retn rol ror rdm rsdc rsldt rsm rsts sahf sal salc sar sbb scasb scasd scasq scasw sfence sgdt shl shld shr shrd sidt sldt skinit smi smint smintold smsw stc std sti stosb stosd stosq stosw str sub svdc svldt svts swapgs syscall sysenter sysexit sysret test ud0 ud1 ud2b ud2 ud2a umov verr verw fwait wbinvd wrshr wrmsr xadd xbts xchg xlatb xlat xor cmove cmovz cmovne cmovnz cmova cmovnbe cmovae cmovnb cmovb cmovnae cmovbe cmovna cmovg cmovnle cmovge cmovnl cmovl cmovnge cmovle cmovng cmovc cmovnc cmovo cmovno cmovs cmovns cmovp cmovpe cmovnp cmovpo je jz jne jnz ja jnbe jae jnb jb jnae jbe jna jg jnle jge jnl jl jnge jle jng jc jnc jo jno js jns jpo jnp jpe jp sete setz setne setnz seta setnbe setae setnb setnc setb setnae setcset setbe setna setg setnle setge setnl setl setnge setle setng sets setns seto setno setpe setp setpo setnp addps addss andnps andps cmpeqps cmpeqss cmpleps cmpless cmpltps cmpltss cmpneqps cmpneqss cmpnleps cmpnless cmpnltps cmpnltss cmpordps cmpordss cmpunordps cmpunordss cmpps cmpss comiss cvtpi2ps cvtps2pi cvtsi2ss cvtss2si cvttps2pi cvttss2si divps divss ldmxcsr maxps maxss minps minss movaps movhps movlhps movlps movhlps movmskps movntps movss movups mulps mulss orps rcpps rcpss rsqrtps rsqrtss shufps sqrtps sqrtss stmxcsr subps subss ucomiss unpckhps unpcklps xorps fxrstor fxrstor64 fxsave fxsave64 xgetbv xsetbv xsave xsave64 xsaveopt xsaveopt64 xrstor xrstor64 prefetchnta prefetcht0 prefetcht1 prefetcht2 maskmovq movntq pavgb pavgw pextrw pinsrw pmaxsw pmaxub pminsw pminub pmovmskb pmulhuw psadbw pshufw pf2iw pfnacc pfpnacc pi2fw pswapd maskmovdqu clflush movntdq movnti movntpd movdqa movdqu movdq2q movq2dq paddq pmuludq pshufd pshufhw pshuflw pslldq psrldq psubq punpckhqdq punpcklqdq addpd addsd andnpd andpd cmpeqpd cmpeqsd cmplepd cmplesd cmpltpd cmpltsd cmpneqpd cmpneqsd cmpnlepd cmpnlesd cmpnltpd cmpnltsd cmpordpd cmpordsd cmpunordpd cmpunordsd cmppd comisd cvtdq2pd cvtdq2ps cvtpd2dq cvtpd2pi cvtpd2ps cvtpi2pd cvtps2dq cvtps2pd cvtsd2si cvtsd2ss cvtsi2sd cvtss2sd cvttpd2pi cvttpd2dq cvttps2dq cvttsd2si divpd divsd maxpd maxsd minpd minsd movapd movhpd movlpd movmskpd movupd mulpd mulsd orpd shufpd sqrtpd sqrtsd subpd subsd ucomisd unpckhpd unpcklpd xorpd addsubpd addsubps haddpd haddps hsubpd hsubps lddqu movddup movshdup movsldup clgi stgi vmcall vmclear vmfunc vmlaunch vmload vmmcall vmptrld vmptrst vmread vmresume vmrun vmsave vmwrite vmxoff vmxon invept invvpid pabsb pabsw pabsd palignr phaddw phaddd phaddsw phsubw phsubd phsubsw pmaddubsw pmulhrsw pshufb psignb psignw psignd extrq insertq movntsd movntss lzcnt blendpd blendps blendvpd blendvps dppd dpps extractps insertps movntdqa mpsadbw packusdw pblendvb pblendw pcmpeqq pextrb pextrd pextrq phminposuw pinsrb pinsrd pinsrq pmaxsb pmaxsd pmaxud pmaxuw pminsb pminsd pminud pminuw pmovsxbw pmovsxbd pmovsxbq pmovsxwd pmovsxwq pmovsxdq pmovzxbw pmovzxbd pmovzxbq pmovzxwd pmovzxwq pmovzxdq pmuldq pmulld ptest roundpd roundps roundsd roundss crc32 pcmpestri pcmpestrm pcmpistri pcmpistrm pcmpgtq popcnt getsec pfrcpv pfrsqrtv movbe aesenc aesenclast aesdec aesdeclast aesimc aeskeygenassist vaesenc vaesenclast vaesdec vaesdeclast vaesimc vaeskeygenassist vaddpd vaddps vaddsd vaddss vaddsubpd vaddsubps vandpd vandps vandnpd vandnps vblendpd vblendps vblendvpd vblendvps vbroadcastss vbroadcastsd vbroadcastf128 vcmpeq_ospd vcmpeqpd vcmplt_ospd vcmpltpd vcmple_ospd vcmplepd vcmpunord_qpd vcmpunordpd vcmpneq_uqpd vcmpneqpd vcmpnlt_uspd vcmpnltpd vcmpnle_uspd vcmpnlepd vcmpord_qpd vcmpordpd vcmpeq_uqpd vcmpnge_uspd vcmpngepd vcmpngt_uspd vcmpngtpd vcmpfalse_oqpd vcmpfalsepd vcmpneq_oqpd vcmpge_ospd vcmpgepd vcmpgt_ospd vcmpgtpd vcmptrue_uqpd vcmptruepd vcmplt_oqpd vcmple_oqpd vcmpunord_spd vcmpneq_uspd vcmpnlt_uqpd vcmpnle_uqpd vcmpord_spd vcmpeq_uspd vcmpnge_uqpd vcmpngt_uqpd vcmpfalse_ospd vcmpneq_ospd vcmpge_oqpd vcmpgt_oqpd vcmptrue_uspd vcmppd vcmpeq_osps vcmpeqps vcmplt_osps vcmpltps vcmple_osps vcmpleps vcmpunord_qps vcmpunordps vcmpneq_uqps vcmpneqps vcmpnlt_usps vcmpnltps vcmpnle_usps vcmpnleps vcmpord_qps vcmpordps vcmpeq_uqps vcmpnge_usps vcmpngeps vcmpngt_usps vcmpngtps vcmpfalse_oqps vcmpfalseps vcmpneq_oqps vcmpge_osps vcmpgeps vcmpgt_osps vcmpgtps vcmptrue_uqps vcmptrueps vcmplt_oqps vcmple_oqps vcmpunord_sps vcmpneq_usps vcmpnlt_uqps vcmpnle_uqps vcmpord_sps vcmpeq_usps vcmpnge_uqps vcmpngt_uqps vcmpfalse_osps vcmpneq_osps vcmpge_oqps vcmpgt_oqps vcmptrue_usps vcmpps vcmpeq_ossd vcmpeqsd vcmplt_ossd vcmpltsd vcmple_ossd vcmplesd vcmpunord_qsd vcmpunordsd vcmpneq_uqsd vcmpneqsd vcmpnlt_ussd vcmpnltsd vcmpnle_ussd vcmpnlesd vcmpord_qsd vcmpordsd vcmpeq_uqsd vcmpnge_ussd vcmpngesd vcmpngt_ussd vcmpngtsd vcmpfalse_oqsd vcmpfalsesd vcmpneq_oqsd vcmpge_ossd vcmpgesd vcmpgt_ossd vcmpgtsd vcmptrue_uqsd vcmptruesd vcmplt_oqsd vcmple_oqsd vcmpunord_ssd vcmpneq_ussd vcmpnlt_uqsd vcmpnle_uqsd vcmpord_ssd vcmpeq_ussd vcmpnge_uqsd vcmpngt_uqsd vcmpfalse_ossd vcmpneq_ossd vcmpge_oqsd vcmpgt_oqsd vcmptrue_ussd vcmpsd vcmpeq_osss vcmpeqss vcmplt_osss vcmpltss vcmple_osss vcmpless vcmpunord_qss vcmpunordss vcmpneq_uqss vcmpneqss vcmpnlt_usss vcmpnltss vcmpnle_usss vcmpnless vcmpord_qss vcmpordss vcmpeq_uqss vcmpnge_usss vcmpngess vcmpngt_usss vcmpngtss vcmpfalse_oqss vcmpfalsess vcmpneq_oqss vcmpge_osss vcmpgess vcmpgt_osss vcmpgtss vcmptrue_uqss vcmptruess vcmplt_oqss vcmple_oqss vcmpunord_sss vcmpneq_usss vcmpnlt_uqss vcmpnle_uqss vcmpord_sss vcmpeq_usss vcmpnge_uqss vcmpngt_uqss vcmpfalse_osss vcmpneq_osss vcmpge_oqss vcmpgt_oqss vcmptrue_usss vcmpss vcomisd vcomiss vcvtdq2pd vcvtdq2ps vcvtpd2dq vcvtpd2ps vcvtps2dq vcvtps2pd vcvtsd2si vcvtsd2ss vcvtsi2sd vcvtsi2ss vcvtss2sd vcvtss2si vcvttpd2dq vcvttps2dq vcvttsd2si vcvttss2si vdivpd vdivps vdivsd vdivss vdppd vdpps vextractf128 vextractps vhaddpd vhaddps vhsubpd vhsubps vinsertf128 vinsertps vlddqu vldqqu vldmxcsr vmaskmovdqu vmaskmovps vmaskmovpd vmaxpd vmaxps vmaxsd vmaxss vminpd vminps vminsd vminss vmovapd vmovaps vmovd vmovq vmovddup vmovdqa vmovqqa vmovdqu vmovqqu vmovhlps vmovhpd vmovhps vmovlhps vmovlpd vmovlps vmovmskpd vmovmskps vmovntdq vmovntqq vmovntdqa vmovntpd vmovntps vmovsd vmovshdup vmovsldup vmovss vmovupd vmovups vmpsadbw vmulpd vmulps vmulsd vmulss vorpd vorps vpabsb vpabsw vpabsd vpacksswb vpackssdw vpackuswb vpackusdw vpaddb vpaddw vpaddd vpaddq vpaddsb vpaddsw vpaddusb vpaddusw vpalignr vpand vpandn vpavgb vpavgw vpblendvb vpblendw vpcmpestri vpcmpestrm vpcmpistri vpcmpistrm vpcmpeqb vpcmpeqw vpcmpeqd vpcmpeqq vpcmpgtb vpcmpgtw vpcmpgtd vpcmpgtq vpermilpd vpermilps vperm2f128 vpextrb vpextrw vpextrd vpextrq vphaddw vphaddd vphaddsw vphminposuw vphsubw vphsubd vphsubsw vpinsrb vpinsrw vpinsrd vpinsrq vpmaddwd vpmaddubsw vpmaxsb vpmaxsw vpmaxsd vpmaxub vpmaxuw vpmaxud vpminsb vpminsw vpminsd vpminub vpminuw vpminud vpmovmskb vpmovsxbw vpmovsxbd vpmovsxbq vpmovsxwd vpmovsxwq vpmovsxdq vpmovzxbw vpmovzxbd vpmovzxbq vpmovzxwd vpmovzxwq vpmovzxdq vpmulhuw vpmulhrsw vpmulhw vpmullw vpmulld vpmuludq vpmuldq vpor vpsadbw vpshufb vpshufd vpshufhw vpshuflw vpsignb vpsignw vpsignd vpslldq vpsrldq vpsllw vpslld vpsllq vpsraw vpsrad vpsrlw vpsrld vpsrlq vptest vpsubb vpsubw vpsubd vpsubq vpsubsb vpsubsw vpsubusb vpsubusw vpunpckhbw vpunpckhwd vpunpckhdq vpunpckhqdq vpunpcklbw vpunpcklwd vpunpckldq vpunpcklqdq vpxor vrcpps vrcpss vrsqrtps vrsqrtss vroundpd vroundps vroundsd vroundss vshufpd vshufps vsqrtpd vsqrtps vsqrtsd vsqrtss vstmxcsr vsubpd vsubps vsubsd vsubss vtestps vtestpd vucomisd vucomiss vunpckhpd vunpckhps vunpcklpd vunpcklps vxorpd vxorps vzeroall vzeroupper pclmullqlqdq pclmulhqlqdq pclmullqhqdq pclmulhqhqdq pclmulqdq vpclmullqlqdq vpclmulhqlqdq vpclmullqhqdq vpclmulhqhqdq vpclmulqdq vfmadd132ps vfmadd132pd vfmadd312ps vfmadd312pd vfmadd213ps vfmadd213pd vfmadd123ps vfmadd123pd vfmadd231ps vfmadd231pd vfmadd321ps vfmadd321pd vfmaddsub132ps vfmaddsub132pd vfmaddsub312ps vfmaddsub312pd vfmaddsub213ps vfmaddsub213pd vfmaddsub123ps vfmaddsub123pd vfmaddsub231ps vfmaddsub231pd vfmaddsub321ps vfmaddsub321pd vfmsub132ps vfmsub132pd vfmsub312ps vfmsub312pd vfmsub213ps vfmsub213pd vfmsub123ps vfmsub123pd vfmsub231ps vfmsub231pd vfmsub321ps vfmsub321pd vfmsubadd132ps vfmsubadd132pd vfmsubadd312ps vfmsubadd312pd vfmsubadd213ps vfmsubadd213pd vfmsubadd123ps vfmsubadd123pd vfmsubadd231ps vfmsubadd231pd vfmsubadd321ps vfmsubadd321pd vfnmadd132ps vfnmadd132pd vfnmadd312ps vfnmadd312pd vfnmadd213ps vfnmadd213pd vfnmadd123ps vfnmadd123pd vfnmadd231ps vfnmadd231pd vfnmadd321ps vfnmadd321pd vfnmsub132ps vfnmsub132pd vfnmsub312ps vfnmsub312pd vfnmsub213ps vfnmsub213pd vfnmsub123ps vfnmsub123pd vfnmsub231ps vfnmsub231pd vfnmsub321ps vfnmsub321pd vfmadd132ss vfmadd132sd vfmadd312ss vfmadd312sd vfmadd213ss vfmadd213sd vfmadd123ss vfmadd123sd vfmadd231ss vfmadd231sd vfmadd321ss vfmadd321sd vfmsub132ss vfmsub132sd vfmsub312ss vfmsub312sd vfmsub213ss vfmsub213sd vfmsub123ss vfmsub123sd vfmsub231ss vfmsub231sd vfmsub321ss vfmsub321sd vfnmadd132ss vfnmadd132sd vfnmadd312ss vfnmadd312sd vfnmadd213ss vfnmadd213sd vfnmadd123ss vfnmadd123sd vfnmadd231ss vfnmadd231sd vfnmadd321ss vfnmadd321sd vfnmsub132ss vfnmsub132sd vfnmsub312ss vfnmsub312sd vfnmsub213ss vfnmsub213sd vfnmsub123ss vfnmsub123sd vfnmsub231ss vfnmsub231sd vfnmsub321ss vfnmsub321sd rdfsbase rdgsbase rdrand wrfsbase wrgsbase vcvtph2ps vcvtps2ph adcx adox rdseed clac stac xstore xcryptecb xcryptcbc xcryptctr xcryptcfb xcryptofb montmul xsha1 xsha256 llwpcb slwpcb lwpval lwpins vfmaddpd vfmaddps vfmaddsd vfmaddss vfmaddsubpd vfmaddsubps vfmsubaddpd vfmsubaddps vfmsubpd vfmsubps vfmsubsd vfmsubss vfnmaddpd vfnmaddps vfnmaddsd vfnmaddss vfnmsubpd vfnmsubps vfnmsubsd vfnmsubss vfrczpd vfrczps vfrczsd vfrczss vpcmov vpcomb vpcomd vpcomq vpcomub vpcomud vpcomuq vpcomuw vpcomw vphaddbd vphaddbq vphaddbw vphadddq vphaddubd vphaddubq vphaddubw vphaddudq vphadduwd vphadduwq vphaddwd vphaddwq vphsubbw vphsubdq vphsubwd vpmacsdd vpmacsdqh vpmacsdql vpmacssdd vpmacssdqh vpmacssdql vpmacsswd vpmacssww vpmacswd vpmacsww vpmadcsswd vpmadcswd vpperm vprotb vprotd vprotq vprotw vpshab vpshad vpshaq vpshaw vpshlb vpshld vpshlq vpshlw vbroadcasti128 vpblendd vpbroadcastb vpbroadcastw vpbroadcastd vpbroadcastq vpermd vpermpd vpermps vpermq vperm2i128 vextracti128 vinserti128 vpmaskmovd vpmaskmovq vpsllvd vpsllvq vpsravd vpsrlvd vpsrlvq vgatherdpd vgatherqpd vgatherdps vgatherqps vpgatherdd vpgatherqd vpgatherdq vpgatherqq xabort xbegin xend xtest andn bextr blci blcic blsi blsic blcfill blsfill blcmsk blsmsk blsr blcs bzhi mulx pdep pext rorx sarx shlx shrx tzcnt tzmsk t1mskc valignd valignq vblendmpd vblendmps vbroadcastf32x4 vbroadcastf64x4 vbroadcasti32x4 vbroadcasti64x4 vcompresspd vcompressps vcvtpd2udq vcvtps2udq vcvtsd2usi vcvtss2usi vcvttpd2udq vcvttps2udq vcvttsd2usi vcvttss2usi vcvtudq2pd vcvtudq2ps vcvtusi2sd vcvtusi2ss vexpandpd vexpandps vextractf32x4 vextractf64x4 vextracti32x4 vextracti64x4 vfixupimmpd vfixupimmps vfixupimmsd vfixupimmss vgetexppd vgetexpps vgetexpsd vgetexpss vgetmantpd vgetmantps vgetmantsd vgetmantss vinsertf32x4 vinsertf64x4 vinserti32x4 vinserti64x4 vmovdqa32 vmovdqa64 vmovdqu32 vmovdqu64 vpabsq vpandd vpandnd vpandnq vpandq vpblendmd vpblendmq vpcmpltd vpcmpled vpcmpneqd vpcmpnltd vpcmpnled vpcmpd vpcmpltq vpcmpleq vpcmpneqq vpcmpnltq vpcmpnleq vpcmpq vpcmpequd vpcmpltud vpcmpleud vpcmpnequd vpcmpnltud vpcmpnleud vpcmpud vpcmpequq vpcmpltuq vpcmpleuq vpcmpnequq vpcmpnltuq vpcmpnleuq vpcmpuq vpcompressd vpcompressq vpermi2d vpermi2pd vpermi2ps vpermi2q vpermt2d vpermt2pd vpermt2ps vpermt2q vpexpandd vpexpandq vpmaxsq vpmaxuq vpminsq vpminuq vpmovdb vpmovdw vpmovqb vpmovqd vpmovqw vpmovsdb vpmovsdw vpmovsqb vpmovsqd vpmovsqw vpmovusdb vpmovusdw vpmovusqb vpmovusqd vpmovusqw vpord vporq vprold vprolq vprolvd vprolvq vprord vprorq vprorvd vprorvq vpscatterdd vpscatterdq vpscatterqd vpscatterqq vpsraq vpsravq vpternlogd vpternlogq vptestmd vptestmq vptestnmd vptestnmq vpxord vpxorq vrcp14pd vrcp14ps vrcp14sd vrcp14ss vrndscalepd vrndscaleps vrndscalesd vrndscaless vrsqrt14pd vrsqrt14ps vrsqrt14sd vrsqrt14ss vscalefpd vscalefps vscalefsd vscalefss vscatterdpd vscatterdps vscatterqpd vscatterqps vshuff32x4 vshuff64x2 vshufi32x4 vshufi64x2 kandnw kandw kmovw knotw kortestw korw kshiftlw kshiftrw kunpckbw kxnorw kxorw vpbroadcastmb2q vpbroadcastmw2d vpconflictd vpconflictq vplzcntd vplzcntq vexp2pd vexp2ps vrcp28pd vrcp28ps vrcp28sd vrcp28ss vrsqrt28pd vrsqrt28ps vrsqrt28sd vrsqrt28ss vgatherpf0dpd vgatherpf0dps vgatherpf0qpd vgatherpf0qps vgatherpf1dpd vgatherpf1dps vgatherpf1qpd vgatherpf1qps vscatterpf0dpd vscatterpf0dps vscatterpf0qpd vscatterpf0qps vscatterpf1dpd vscatterpf1dps vscatterpf1qpd vscatterpf1qps prefetchwt1 bndmk bndcl bndcu bndcn bndmov bndldx bndstx sha1rnds4 sha1nexte sha1msg1 sha1msg2 sha256rnds2 sha256msg1 sha256msg2 hint_nop0 hint_nop1 hint_nop2 hint_nop3 hint_nop4 hint_nop5 hint_nop6 hint_nop7 hint_nop8 hint_nop9 hint_nop10 hint_nop11 hint_nop12 hint_nop13 hint_nop14 hint_nop15 hint_nop16 hint_nop17 hint_nop18 hint_nop19 hint_nop20 hint_nop21 hint_nop22 hint_nop23 hint_nop24 hint_nop25 hint_nop26 hint_nop27 hint_nop28 hint_nop29 hint_nop30 hint_nop31 hint_nop32 hint_nop33 hint_nop34 hint_nop35 hint_nop36 hint_nop37 hint_nop38 hint_nop39 hint_nop40 hint_nop41 hint_nop42 hint_nop43 hint_nop44 hint_nop45 hint_nop46 hint_nop47 hint_nop48 hint_nop49 hint_nop50 hint_nop51 hint_nop52 hint_nop53 hint_nop54 hint_nop55 hint_nop56 hint_nop57 hint_nop58 hint_nop59 hint_nop60 hint_nop61 hint_nop62 hint_nop63",
      built_in: (
        // Instruction pointer
        "ip eip rip al ah bl bh cl ch dl dh sil dil bpl spl r8b r9b r10b r11b r12b r13b r14b r15b ax bx cx dx si di bp sp r8w r9w r10w r11w r12w r13w r14w r15w eax ebx ecx edx esi edi ebp esp eip r8d r9d r10d r11d r12d r13d r14d r15d rax rbx rcx rdx rsi rdi rbp rsp r8 r9 r10 r11 r12 r13 r14 r15 cs ds es fs gs ss st st0 st1 st2 st3 st4 st5 st6 st7 mm0 mm1 mm2 mm3 mm4 mm5 mm6 mm7 xmm0  xmm1  xmm2  xmm3  xmm4  xmm5  xmm6  xmm7  xmm8  xmm9 xmm10  xmm11 xmm12 xmm13 xmm14 xmm15 xmm16 xmm17 xmm18 xmm19 xmm20 xmm21 xmm22 xmm23 xmm24 xmm25 xmm26 xmm27 xmm28 xmm29 xmm30 xmm31 ymm0  ymm1  ymm2  ymm3  ymm4  ymm5  ymm6  ymm7  ymm8  ymm9 ymm10  ymm11 ymm12 ymm13 ymm14 ymm15 ymm16 ymm17 ymm18 ymm19 ymm20 ymm21 ymm22 ymm23 ymm24 ymm25 ymm26 ymm27 ymm28 ymm29 ymm30 ymm31 zmm0  zmm1  zmm2  zmm3  zmm4  zmm5  zmm6  zmm7  zmm8  zmm9 zmm10  zmm11 zmm12 zmm13 zmm14 zmm15 zmm16 zmm17 zmm18 zmm19 zmm20 zmm21 zmm22 zmm23 zmm24 zmm25 zmm26 zmm27 zmm28 zmm29 zmm30 zmm31 k0 k1 k2 k3 k4 k5 k6 k7 bnd0 bnd1 bnd2 bnd3 cr0 cr1 cr2 cr3 cr4 cr8 dr0 dr1 dr2 dr3 dr8 tr3 tr4 tr5 tr6 tr7 r0 r1 r2 r3 r4 r5 r6 r7 r0b r1b r2b r3b r4b r5b r6b r7b r0w r1w r2w r3w r4w r5w r6w r7w r0d r1d r2d r3d r4d r5d r6d r7d r0h r1h r2h r3h r0l r1l r2l r3l r4l r5l r6l r7l r8l r9l r10l r11l r12l r13l r14l r15l db dw dd dq dt ddq do dy dz resb resw resd resq rest resdq reso resy resz incbin equ times byte word dword qword nosplit rel abs seg wrt strict near far a32 ptr"
      ),
      meta: "%define %xdefine %+ %undef %defstr %deftok %assign %strcat %strlen %substr %rotate %elif %else %endif %if %ifmacro %ifctx %ifidn %ifidni %ifid %ifnum %ifstr %iftoken %ifempty %ifenv %error %warning %fatal %rep %endrep %include %push %pop %repl %pathsearch %depend %use %arg %stacksize %local %line %comment %endcomment .nolist __FILE__ __LINE__ __SECT__  __BITS__ __OUTPUT_FORMAT__ __DATE__ __TIME__ __DATE_NUM__ __TIME_NUM__ __UTC_DATE__ __UTC_TIME__ __UTC_DATE_NUM__ __UTC_TIME_NUM__  __PASS__ struc endstruc istruc at iend align alignb sectalign daz nodaz up down zero default option assume public bits use16 use32 use64 default section segment absolute extern global common cpu float __utf16__ __utf16le__ __utf16be__ __utf32__ __utf32le__ __utf32be__ __float8__ __float16__ __float32__ __float64__ __float80m__ __float80e__ __float128l__ __float128h__ __Infinity__ __QNaN__ __SNaN__ Inf NaN QNaN SNaN float8 float16 float32 float64 float80m float80e float128l float128h __FLOAT_DAZ__ __FLOAT_ROUND__ __FLOAT__"
    },
    contains: [
      hljs.COMMENT(
        ";",
        "$",
        { relevance: 0 }
      ),
      {
        className: "number",
        variants: [
          // Float number and x87 BCD
          {
            begin: "\\b(?:([0-9][0-9_]*)?\\.[0-9_]*(?:[eE][+-]?[0-9_]+)?|(0[Xx])?[0-9][0-9_]*(\\.[0-9_]*)?(?:[pP](?:[+-]?[0-9_]+)?)?)\\b",
            relevance: 0
          },
          // Hex number in $
          {
            begin: "\\$[0-9][0-9A-Fa-f]*",
            relevance: 0
          },
          // Number in H,D,T,Q,O,B,Y suffix
          { begin: "\\b(?:[0-9A-Fa-f][0-9A-Fa-f_]*[Hh]|[0-9][0-9_]*[DdTt]?|[0-7][0-7_]*[QqOo]|[0-1][0-1_]*[BbYy])\\b" },
          // Number in X,D,T,Q,O,B,Y prefix
          { begin: "\\b(?:0[Xx][0-9A-Fa-f_]+|0[DdTt][0-9_]+|0[QqOo][0-7_]+|0[BbYy][0-1_]+)\\b" }
        ]
      },
      // Double quote string
      hljs.QUOTE_STRING_MODE,
      {
        className: "string",
        variants: [
          // Single-quoted string
          {
            begin: "'",
            end: "[^\\\\]'"
          },
          // Backquoted string
          {
            begin: "`",
            end: "[^\\\\]`"
          }
        ],
        relevance: 0
      },
      {
        className: "symbol",
        variants: [
          // Global label and local label
          { begin: "^\\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\\s+label)" },
          // Macro-local label
          { begin: "^\\s*%%[A-Za-z0-9_$#@~.?]*:" }
        ],
        relevance: 0
      },
      // Macro parameter
      {
        className: "subst",
        begin: "%[0-9]+",
        relevance: 0
      },
      // Macro parameter
      {
        className: "subst",
        begin: "%!S+",
        relevance: 0
      },
      {
        className: "meta",
        begin: /^\s*\.[\w_-]+/
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/xml.js
function xml(hljs) {
  const regex = hljs.regex;
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: "string" });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [XML_ENTITIES]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [XML_ENTITIES]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/yaml.js
function yaml(hljs) {
  const LITERALS3 = "true false yes no null";
  const URI_CHARACTERS = "[\\w#;/?:@&=+$,.~*'()[\\]]+";
  const KEY = {
    className: "attr",
    variants: [
      // added brackets support and special char support
      { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
      {
        // double quoted keys - with brackets and special char support
        begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
      },
      {
        // single quoted keys - with brackets and special char support
        begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
      }
    ]
  };
  const TEMPLATE_VARIABLES = {
    className: "template-variable",
    variants: [
      {
        // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      {
        // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTE_STRING = {
    className: "string",
    relevance: 0,
    begin: /'/,
    end: /'/,
    contains: [
      {
        match: /''/,
        scope: "char.escape",
        relevance: 0
      }
    ]
  };
  const STRING = {
    className: "string",
    relevance: 0,
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };
  const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
    {
      begin: /'/,
      end: /'/,
      contains: [
        {
          begin: /''/,
          relevance: 0
        }
      ]
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] });
  const DATE_RE = "[0-9]{4}(-[0-9][0-9]){0,2}";
  const TIME_RE = "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?";
  const FRACTION_RE = "(\\.[0-9]*)?";
  const ZONE_RE = "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?";
  const TIMESTAMP = {
    className: "number",
    begin: "\\b" + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + "\\b"
  };
  const VALUE_CONTAINER = {
    end: ",",
    endsWithParent: true,
    excludeEnd: true,
    keywords: LITERALS3,
    relevance: 0
  };
  const OBJECT = {
    begin: /\{/,
    end: /\}/,
    contains: [VALUE_CONTAINER],
    illegal: "\\n",
    relevance: 0
  };
  const ARRAY = {
    begin: "\\[",
    end: "\\]",
    contains: [VALUE_CONTAINER],
    illegal: "\\n",
    relevance: 0
  };
  const MODES4 = [
    KEY,
    {
      className: "meta",
      begin: "^---\\s*$",
      relevance: 10
    },
    {
      // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: "string",
      begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
    },
    {
      // Ruby/Rails erb
      begin: "<%[%=-]?",
      end: "[%-]?%>",
      subLanguage: "ruby",
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0
    },
    {
      // named tags
      className: "type",
      begin: "!\\w+!" + URI_CHARACTERS
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + URI_CHARACTERS + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + URI_CHARACTERS
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + URI_CHARACTERS
    },
    {
      // fragment id &ref
      className: "meta",
      begin: "&" + hljs.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // fragment reference *ref
      className: "meta",
      begin: "\\*" + hljs.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // array listing
      className: "bullet",
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: "-(?=[ ]|$)",
      relevance: 0
    },
    hljs.HASH_COMMENT_MODE,
    {
      beginKeywords: LITERALS3,
      keywords: { literal: LITERALS3 }
    },
    TIMESTAMP,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: hljs.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    OBJECT,
    ARRAY,
    SINGLE_QUOTE_STRING,
    STRING
  ];
  const VALUE_MODES = [...MODES4];
  VALUE_MODES.pop();
  VALUE_MODES.push(CONTAINER_STRING);
  VALUE_CONTAINER.contains = VALUE_MODES;
  return {
    name: "YAML",
    case_insensitive: true,
    aliases: ["yml"],
    contains: MODES4
  };
}

// src/client/languages.js
var LANGUAGES = Object.freeze(
  [
    // --- Markup / web -------------------------------------------------------
    {
      id: "javascript",
      label: "JavaScript",
      short: "JS",
      extensions: ["js", "mjs", "cjs", "jsx"]
    },
    {
      id: "typescript",
      label: "TypeScript",
      short: "TS",
      extensions: ["ts", "mts", "cts", "tsx"]
    },
    {
      id: "json",
      label: "JSON",
      short: "JSON",
      // JSONC (JSON with comments) is highlighted by the JSON grammar.
      extensions: ["json", "jsonc"],
      filenames: [".babelrc", ".eslintrc", ".prettierrc", ".stylelintrc"]
    },
    {
      id: "html",
      label: "HTML",
      short: "HTML",
      hljs: "xml",
      extensions: ["html", "htm", "xhtml", "vue", "svelte", "astro"]
    },
    {
      id: "xml",
      label: "XML",
      short: "XML",
      extensions: ["xml", "svg", "plist", "xsd", "xsl", "xslt", "rss", "atom"]
    },
    { id: "css", label: "CSS", short: "CSS", extensions: ["css"] },
    { id: "scss", label: "SCSS", short: "SCSS", extensions: ["scss", "sass"] },
    { id: "less", label: "Less", short: "LESS", extensions: ["less"] },
    {
      id: "markdown",
      label: "Markdown",
      short: "MD",
      extensions: ["md", "mdx", "markdown"]
    },
    { id: "yaml", label: "YAML", short: "YAML", extensions: ["yml", "yaml"] },
    {
      id: "ini",
      label: "INI / Config",
      short: "INI",
      // TOML has no highlight.js grammar; the ini grammar is a close enough
      // approximation for the card's purposes (spec decision).
      extensions: ["ini", "cfg", "conf", "properties", "toml"],
      filenames: [".editorconfig", ".npmrc", ".yarnrc", ".gitconfig", ".env", "cargo.toml"]
    },
    // --- Data / serialization ----------------------------------------------
    { id: "sql", label: "SQL", short: "SQL", extensions: ["sql"] },
    {
      id: "graphql",
      label: "GraphQL",
      short: "GQL",
      extensions: ["graphql", "gql"]
    },
    {
      id: "protobuf",
      label: "Protocol Buffers",
      short: "PROTO",
      extensions: ["proto"]
    },
    { id: "diff", label: "Diff", short: "DIFF", extensions: ["diff", "patch"] },
    // --- Backend / general purpose -----------------------------------------
    {
      id: "python",
      label: "Python",
      short: "PY",
      extensions: ["py", "pyw", "pyi"]
    },
    { id: "java", label: "Java", short: "JAVA", extensions: ["java"] },
    { id: "kotlin", label: "Kotlin", short: "KT", extensions: ["kt", "kts"] },
    { id: "go", label: "Go", short: "GO", extensions: ["go"] },
    { id: "rust", label: "Rust", short: "RS", extensions: ["rs"] },
    // `.h` is claimed by Objective-C below, per the team spec.
    { id: "c", label: "C", short: "C", extensions: ["c"] },
    {
      id: "cpp",
      label: "C++",
      short: "CPP",
      extensions: ["cpp", "cc", "cxx", "c++", "hpp", "hh", "hxx", "ipp"]
    },
    { id: "csharp", label: "C#", short: "CS", extensions: ["cs", "csx"] },
    {
      id: "php",
      label: "PHP",
      short: "PHP",
      extensions: ["php", "phtml", "php3", "php4", "php5", "phps"]
    },
    {
      id: "ruby",
      label: "Ruby",
      short: "RB",
      extensions: ["rb", "rake", "gemspec", "ru"],
      filenames: [
        "gemfile",
        "rakefile",
        "vagrantfile",
        "brewfile",
        "podfile",
        "guardfile",
        "capfile",
        "fastfile",
        "appfile",
        "berksfile",
        "thorfile"
      ]
    },
    { id: "swift", label: "Swift", short: "SWIFT", extensions: ["swift"] },
    {
      id: "objectivec",
      label: "Objective-C",
      short: "OBJC",
      extensions: ["m", "mm", "h"]
    },
    { id: "scala", label: "Scala", short: "SCALA", extensions: ["scala", "sc"] },
    { id: "dart", label: "Dart", short: "DART", extensions: ["dart"] },
    { id: "elixir", label: "Elixir", short: "EX", extensions: ["ex", "exs"] },
    { id: "erlang", label: "Erlang", short: "ERL", extensions: ["erl", "hrl"] },
    {
      id: "haskell",
      label: "Haskell",
      short: "HS",
      extensions: ["hs", "lhs"]
    },
    {
      id: "clojure",
      label: "Clojure",
      short: "CLJ",
      extensions: ["clj", "cljs", "cljc", "edn"]
    },
    { id: "lua", label: "Lua", short: "LUA", extensions: ["lua"] },
    { id: "perl", label: "Perl", short: "PL", extensions: ["pl", "pm", "pod"] },
    { id: "r", label: "R", short: "R", extensions: ["r"] },
    { id: "julia", label: "Julia", short: "JL", extensions: ["jl"] },
    {
      id: "groovy",
      label: "Groovy",
      short: "GRV",
      extensions: ["groovy", "gradle", "gvy"],
      filenames: ["jenkinsfile"]
    },
    {
      id: "fsharp",
      label: "F#",
      short: "FS",
      extensions: ["fs", "fsx", "fsi"]
    },
    {
      id: "ocaml",
      label: "OCaml",
      short: "ML",
      extensions: ["ml", "mli", "mll", "mly"]
    },
    {
      id: "fortran",
      label: "Fortran",
      short: "F90",
      extensions: ["f90", "f95", "f03", "f08", "for", "f"]
    },
    { id: "d", label: "D", short: "D", extensions: ["d", "di"] },
    { id: "nim", label: "Nim", short: "NIM", extensions: ["nim", "nims", "nimble"] },
    { id: "crystal", label: "Crystal", short: "CR", extensions: ["cr"] },
    // --- Scripts / build / terminal ----------------------------------------
    {
      id: "shell",
      label: "Shell",
      short: "SH",
      hljs: "bash",
      extensions: ["sh", "bash", "zsh", "ksh", "fish"],
      filenames: [
        ".bashrc",
        ".bash_profile",
        ".bash_login",
        ".bash_logout",
        ".profile",
        ".zshrc",
        ".zprofile",
        ".zshenv",
        ".zlogin",
        ".kshrc",
        ".cshrc"
      ]
    },
    {
      id: "powershell",
      label: "PowerShell",
      short: "PS",
      extensions: ["ps1", "psm1", "psd1"]
    },
    { id: "dos", label: "Batch", short: "BAT", extensions: ["bat", "cmd"] },
    {
      id: "makefile",
      label: "Makefile",
      short: "MK",
      extensions: ["mk", "mak"],
      filenames: ["makefile", "gnumakefile", "makefile.am", "makefile.in"]
    },
    {
      id: "dockerfile",
      label: "Dockerfile",
      short: "DOCK",
      extensions: ["dockerfile"],
      filenames: ["dockerfile", "containerfile"]
    },
    {
      id: "cmake",
      label: "CMake",
      short: "CMAKE",
      extensions: ["cmake"],
      filenames: ["cmakelists.txt"]
    },
    {
      id: "nginx",
      label: "Nginx",
      short: "NGINX",
      extensions: ["nginx"],
      filenames: ["nginx.conf"]
    },
    {
      id: "vim",
      label: "Vim script",
      short: "VIM",
      extensions: ["vim"],
      filenames: [".vimrc", "vimrc", ".gvimrc", "gvimrc", ".exrc"]
    },
    {
      id: "x86asm",
      label: "x86 Assembly",
      short: "ASM",
      extensions: ["asm", "s"]
    },
    { id: "vbscript", label: "VBScript", short: "VBS", extensions: ["vbs"] },
    { id: "vbnet", label: "VB.NET", short: "VB", extensions: ["vb"] },
    // --- Documentation / other ---------------------------------------------
    { id: "latex", label: "LaTeX", short: "TEX", extensions: ["tex", "latex", "sty", "cls"] },
    { id: "asciidoc", label: "AsciiDoc", short: "ADOC", extensions: ["adoc", "asciidoc", "asc"] }
  ].map((entry) => Object.freeze(entry))
);
var PLAINTEXT_INFO = Object.freeze({
  id: "plaintext",
  label: "Plain text",
  short: "TXT"
});
var PLAINTEXT_EXTENSIONS = /* @__PURE__ */ new Set(["txt", "text", "log"]);
var PLAINTEXT_FILENAMES = /* @__PURE__ */ new Set([
  ".gitignore",
  ".dockerignore",
  ".gitattributes",
  ".npmignore",
  "license",
  "licence",
  "copying",
  "notice",
  "authors",
  "contributors",
  "go.mod",
  "go.sum",
  "go.work",
  "procfile"
]);
var COMPOUND_SUFFIXES = Object.freeze(
  [
    [".d.ts", "typescript"],
    [".d.mts", "typescript"],
    [".d.cts", "typescript"],
    [".min.js", "javascript"],
    [".min.mjs", "javascript"],
    [".min.cjs", "javascript"],
    [".min.css", "css"]
  ].sort((a, b) => b[0].length - a[0].length)
);
var FILENAME_PREFIXES = Object.freeze([
  ["dockerfile.", "dockerfile"],
  [".env.", "ini"]
]);
var SHEBANG_LANGUAGES = /* @__PURE__ */ new Map([
  ["node", "javascript"],
  ["nodejs", "javascript"],
  ["deno", "javascript"],
  ["bun", "javascript"],
  ["ts-node", "typescript"],
  ["tsx", "typescript"],
  ["python", "python"],
  ["py", "python"],
  ["pypy", "python"],
  ["sh", "shell"],
  ["bash", "shell"],
  ["zsh", "shell"],
  ["ksh", "shell"],
  ["dash", "shell"],
  ["fish", "shell"],
  ["csh", "shell"],
  ["tcsh", "shell"],
  ["ruby", "ruby"],
  ["perl", "perl"],
  ["php", "php"],
  ["lua", "lua"],
  ["rscript", "r"],
  ["julia", "julia"],
  ["pwsh", "powershell"],
  ["powershell", "powershell"],
  ["groovy", "groovy"],
  ["swift", "swift"],
  ["scala", "scala"]
]);
var LANGUAGE_BY_ID = /* @__PURE__ */ new Map();
var EXTENSION_LANGUAGE = /* @__PURE__ */ new Map();
var FILENAME_LANGUAGE = /* @__PURE__ */ new Map();
for (const language of LANGUAGES) {
  if (!LANGUAGE_BY_ID.has(language.id)) LANGUAGE_BY_ID.set(language.id, language);
  for (const extension of language.extensions) {
    const key = extension.toLowerCase();
    if (!EXTENSION_LANGUAGE.has(key)) EXTENSION_LANGUAGE.set(key, language.id);
  }
  for (const filename of language.filenames ?? []) {
    const key = filename.toLowerCase();
    if (!FILENAME_LANGUAGE.has(key)) FILENAME_LANGUAGE.set(key, language.id);
  }
}
for (const filename of PLAINTEXT_FILENAMES) {
  if (!FILENAME_LANGUAGE.has(filename)) FILENAME_LANGUAGE.set(filename, "plaintext");
}
function basenameOf(path) {
  const trimmed = path.replace(/[\\/]+$/, "");
  if (trimmed === "") return "";
  const lastSlash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  return lastSlash === -1 ? trimmed : trimmed.slice(lastSlash + 1);
}
function normalizeInterpreter(command) {
  let name = command;
  const lastSlash = Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\"));
  if (lastSlash !== -1) name = name.slice(lastSlash + 1);
  name = name.toLowerCase().replace(/\.(exe|cmd|bat|com)$/, "");
  name = name.replace(/[0-9.]+$/, "");
  return name;
}
function detectFromShebang(text) {
  if (typeof text !== "string" || text === "") return null;
  const newline = text.indexOf("\n");
  let firstLine2 = newline === -1 ? text : text.slice(0, newline);
  if (firstLine2.endsWith("\r")) firstLine2 = firstLine2.slice(0, -1);
  if (!firstLine2.startsWith("#!")) return null;
  const body = firstLine2.slice(2).trim();
  if (body === "") return null;
  const parts = body.split(/\s+/);
  let command = parts[0];
  let index = 0;
  if (normalizeInterpreter(command) === "env") {
    index = 1;
    while (index < parts.length && (parts[index].startsWith("-") || parts[index].includes("="))) index++;
    if (index >= parts.length) return null;
    command = parts[index];
  }
  return SHEBANG_LANGUAGES.get(normalizeInterpreter(command)) ?? null;
}
function detectLanguage(path, text = "") {
  if (typeof path !== "string" || path === "") return null;
  const basename = basenameOf(path).toLowerCase();
  if (basename === "" || basename === "." || basename === "..") return null;
  for (const [suffix, id] of COMPOUND_SUFFIXES) {
    if (basename.endsWith(suffix)) return id;
  }
  const filenameHit = FILENAME_LANGUAGE.get(basename);
  if (filenameHit !== void 0) return filenameHit;
  for (const [prefix, id] of FILENAME_PREFIXES) {
    if (basename.startsWith(prefix)) return id;
  }
  const dot = basename.lastIndexOf(".");
  const extension = dot > 0 && dot < basename.length - 1 ? basename.slice(dot + 1) : "";
  if (extension !== "") {
    if (PLAINTEXT_EXTENSIONS.has(extension)) return "plaintext";
    const extensionHit = EXTENSION_LANGUAGE.get(extension);
    if (extensionHit !== void 0) return extensionHit;
  }
  return detectFromShebang(typeof text === "string" ? text : "");
}
function languageInfo(id) {
  if (typeof id !== "string" || id === "") return null;
  if (id === "plaintext") return PLAINTEXT_INFO;
  return LANGUAGE_BY_ID.get(id) ?? null;
}
function supportedLanguages() {
  return [...LANGUAGES].sort((a, b) => a.label.localeCompare(b.label, "en"));
}

// src/client/highlight.js
var GRAMMARS = Object.freeze({
  asciidoc,
  bash,
  c,
  clojure,
  cmake,
  cpp,
  csharp,
  css,
  crystal,
  d,
  dart,
  diff,
  dockerfile,
  dos,
  elixir,
  erlang,
  fortran,
  fsharp,
  go,
  graphql,
  groovy,
  haskell,
  ini,
  java,
  javascript,
  json,
  julia,
  kotlin,
  latex,
  less,
  lua,
  makefile,
  markdown,
  nginx,
  nim,
  objectivec,
  ocaml,
  perl,
  php,
  powershell,
  protobuf,
  python,
  r,
  ruby,
  rust,
  scala,
  scss,
  sql,
  swift,
  typescript,
  vbnet,
  vbscript,
  vim,
  x86asm,
  xml,
  yaml
});
var LANGUAGE_BY_ID2 = new Map(LANGUAGES.map((entry) => [entry.id, entry]));
var MAX_SIDE_TEXT_LENGTH = 2e5;
var MAX_SIDE_LINES = 4e3;
var MAX_TOKEN_LINE_LENGTH = 2e3;
function registerLanguageEntry(entry) {
  const grammar = GRAMMARS[entry.hljs ?? entry.id];
  if (typeof grammar !== "function") return false;
  try {
    if (!core_default.getLanguage(entry.id)) core_default.registerLanguage(entry.id, grammar);
  } catch {
    return false;
  }
  return Boolean(core_default.getLanguage(entry.id));
}
for (const entry of LANGUAGES) registerLanguageEntry(entry);
function ensureLanguage(languageId) {
  const entry = LANGUAGE_BY_ID2.get(languageId);
  if (!entry) return false;
  if (core_default.getLanguage(languageId)) return true;
  return registerLanguageEntry(entry);
}
function groupForClass(className) {
  if (typeof className !== "string" || className === "") return "var";
  const parts = className.trim().toLowerCase().split(/[\s.]+/).map((part) => part.startsWith("hljs-") ? part.slice(5) : part).filter((part) => part !== "");
  if (parts.length === 0) return "var";
  const primary = parts[0];
  const modifiers = parts.length > 1 ? parts.slice(1) : [];
  if (primary === "title" && modifiers.includes("class_")) return "type";
  if (primary === "title" && modifiers.includes("function_")) return "fn";
  if (primary === "variable" && modifiers.includes("language_")) return "kw";
  return PRIMARY_GROUPS.get(primary) ?? "var";
}
var PRIMARY_GROUPS = /* @__PURE__ */ new Map([
  // keywords / control flow
  ["keyword", "kw"],
  ["selector-tag", "kw"],
  ["selector-class", "kw"],
  ["selector-id", "kw"],
  ["meta-keyword", "kw"],
  ["doctag", "kw"],
  // strings / regexps / template text
  ["string", "str"],
  ["char", "str"],
  ["regexp", "str"],
  ["attr-value", "str"],
  ["meta-string", "str"],
  ["template-string", "str"],
  ["code", "str"],
  // numbers / constants
  ["number", "num"],
  ["literal", "num"],
  ["symbol", "num"],
  ["bullet", "num"],
  // functions / types
  ["function", "fn"],
  ["function_", "fn"],
  ["title", "fn"],
  ["built_in", "type"],
  ["type", "type"],
  ["class-name", "type"],
  ["class_", "type"],
  // properties / attributes / variables
  ["attr", "prop"],
  ["attribute", "prop"],
  ["property", "prop"],
  ["variable", "prop"],
  ["language_", "kw"],
  ["params", "prop"],
  ["template-variable", "prop"],
  ["subst", "prop"],
  ["selector-attr", "prop"],
  // comments
  ["comment", "com"],
  ["quote", "com"],
  // meta / annotations / preprocessor
  ["meta", "meta"],
  // diff grammar markers: never red/green semantics, just meta
  ["addition", "meta"],
  ["deletion", "meta"],
  // tags / headings
  ["tag", "tag"],
  ["name", "tag"],
  ["section", "head"],
  // operators / punctuation
  ["operator", "op"],
  ["punctuation", "punct"],
  // emphasis / links
  ["emphasis", "emph"],
  ["strong", "emph"],
  ["link", "link"]
]);
var NAMED_ENTITIES = /* @__PURE__ */ new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", " "]
]);
function decodeEntity(entity) {
  const body = entity.slice(1, -1);
  if (body === "") return null;
  if (body.charCodeAt(0) === 35) {
    const hex = body.length > 1 && (body[1] === "x" || body[1] === "X");
    const digits = hex ? body.slice(2) : body.slice(1);
    if (digits === "") return null;
    const valid = hex ? /^[0-9a-fA-F]+$/.test(digits) : /^[0-9]+$/.test(digits);
    if (!valid) return null;
    const codePoint = Number.parseInt(digits, hex ? 16 : 10);
    if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 1114111) return null;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return null;
    }
  }
  const named = NAMED_ENTITIES.get(body.toLowerCase());
  return named !== void 0 ? named : null;
}
function lineText(tokens) {
  let text = "";
  for (const token of tokens) text += token.text;
  return text;
}
function parseHighlightedHtml(html) {
  const lines = [[]];
  const stack = [];
  const pushToken = (text, group) => {
    if (text === "") return;
    const line = lines[lines.length - 1];
    const previous = line[line.length - 1];
    if (previous !== void 0 && previous.g === group) previous.text += text;
    else line.push({ text, g: group });
  };
  const appendText = (text) => {
    if (text === "") return;
    const group = stack.length > 0 ? stack[stack.length - 1].group : "var";
    let start = 0;
    for (let index2 = 0; index2 < text.length; index2++) {
      if (text.charCodeAt(index2) !== 10) continue;
      pushToken(text.slice(start, index2), group);
      lines.push([]);
      start = index2 + 1;
    }
    pushToken(text.slice(start), group);
  };
  let index = 0;
  const length = html.length;
  while (index < length) {
    const charCode = html.charCodeAt(index);
    if (charCode === 60) {
      const end = html.indexOf(">", index + 1);
      if (end === -1) break;
      const tag = html.slice(index, end + 1);
      index = end + 1;
      if (tag.startsWith("</")) {
        if (stack.length > 0) stack.pop();
        continue;
      }
      if (!/^<span\b/i.test(tag)) continue;
      const match = /class\s*=\s*"([^"]*)"/i.exec(tag) ?? /class\s*=\s*'([^']*)'/i.exec(tag);
      const className = match ? match[1] : "";
      stack.push({ group: groupForClass(className) });
      continue;
    }
    if (charCode === 38) {
      const semicolon = html.indexOf(";", index + 1);
      if (semicolon !== -1 && semicolon - index <= 12) {
        const entity = html.slice(index, semicolon + 1);
        const decoded = decodeEntity(entity);
        if (decoded !== null) {
          appendText(decoded);
          index = semicolon + 1;
          continue;
        }
      }
      appendText("&");
      index += 1;
      continue;
    }
    let next = index + 1;
    while (next < length) {
      const code = html.charCodeAt(next);
      if (code === 60 || code === 38) break;
      next += 1;
    }
    appendText(html.slice(index, next));
    index = next;
  }
  return lines;
}
function highlightLines(code, sourceLines, languageId) {
  if (sourceLines.length === 0) return [];
  if (code.length > MAX_SIDE_TEXT_LENGTH || sourceLines.length > MAX_SIDE_LINES) return null;
  let html;
  try {
    const result = core_default.highlight(code, { language: languageId, ignoreIllegals: true });
    html = result?.value;
  } catch {
    return null;
  }
  if (typeof html !== "string") return null;
  let parsed;
  try {
    parsed = parseHighlightedHtml(html);
  } catch {
    return null;
  }
  if (parsed.length !== sourceLines.length) return null;
  for (let line = 0; line < parsed.length; line++) {
    if (lineText(parsed[line]) !== sourceLines[line]) return null;
  }
  return parsed;
}
function prepareFullSide(text) {
  if (typeof text !== "string") {
    return { present: false, withinBudget: true, lines: null, code: "" };
  }
  const lines = contentLines(text);
  if (text.length > MAX_SIDE_TEXT_LENGTH || lines.length > MAX_SIDE_LINES) {
    return { present: true, withinBudget: false, lines, code: "" };
  }
  return { present: true, withinBudget: true, lines, code: lines.join("\n") };
}
var HUNK_TOKEN_CACHE = /* @__PURE__ */ new WeakMap();
function hunkSideTexts(hunk) {
  const rows = hunk.rows;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const oldLines = [];
  const newLines = [];
  for (const row of rows) {
    if (row === null || typeof row !== "object" || typeof row.text !== "string") return null;
    if (row.text.includes("\n")) return null;
    if (row.kind !== "add") oldLines.push(row.text);
    if (row.kind !== "del") newLines.push(row.text);
  }
  return { oldLines, newLines };
}
function hunkTokensFor(hunk, languageId) {
  let byLanguage = HUNK_TOKEN_CACHE.get(hunk);
  if (!byLanguage) {
    byLanguage = /* @__PURE__ */ new Map();
    HUNK_TOKEN_CACHE.set(hunk, byLanguage);
  }
  if (byLanguage.has(languageId)) return byLanguage.get(languageId);
  let entry = null;
  const sideTexts = hunkSideTexts(hunk);
  if (sideTexts !== null) {
    const oldCode = sideTexts.oldLines.join("\n");
    const newCode = sideTexts.newLines.join("\n");
    const oldLines = highlightLines(oldCode, sideTexts.oldLines, languageId);
    const newLines = highlightLines(newCode, sideTexts.newLines, languageId);
    if (oldLines !== null || newLines !== null) entry = { old: oldLines, new: newLines };
  }
  byLanguage.set(languageId, entry);
  return entry;
}
function rowIndexInHunk(hunk, row, side) {
  const rows = hunk.rows;
  if (!Array.isArray(rows)) return -1;
  let oldIndex = 0;
  let newIndex = 0;
  for (const candidate of rows) {
    if (candidate === row) return side === "old" ? oldIndex : newIndex;
    if (candidate === null || typeof candidate !== "object") continue;
    if (candidate.kind !== "add") oldIndex += 1;
    if (candidate.kind !== "del") newIndex += 1;
  }
  return -1;
}
var DIFF_CACHE = /* @__PURE__ */ new WeakMap();
function getDiffHighlighter(diff2, languageId) {
  try {
    if (diff2 === null || typeof diff2 !== "object") return null;
    if (typeof languageId !== "string" || languageId === "" || languageId === "plaintext") return null;
    let byLanguage = DIFF_CACHE.get(diff2);
    if (!byLanguage) {
      byLanguage = /* @__PURE__ */ new Map();
      DIFF_CACHE.set(diff2, byLanguage);
    }
    if (byLanguage.has(languageId)) return byLanguage.get(languageId);
    const highlighter = buildHighlighter(diff2, languageId);
    byLanguage.set(languageId, highlighter);
    return highlighter;
  } catch {
    return null;
  }
}
function buildHighlighter(diff2, languageId) {
  if (!ensureLanguage(languageId)) return null;
  const oldSide = prepareFullSide(diff2.beforeText);
  const newSide = prepareFullSide(diff2.afterText);
  if (!oldSide.withinBudget || !newSide.withinBudget) return null;
  const hasFullText = oldSide.present || newSide.present;
  if (hasFullText) {
    const oldLines = oldSide.present ? highlightLines(oldSide.code, oldSide.lines, languageId) : null;
    const newLines = newSide.present ? highlightLines(newSide.code, newSide.lines, languageId) : null;
    if (oldLines === null && newLines === null) return null;
    return { languageId, mode: "full", oldLines, newLines };
  }
  const hunks = Array.isArray(diff2.hunks) ? diff2.hunks : [];
  const hasRows = hunks.some((hunk) => hunk !== null && typeof hunk === "object" && Array.isArray(hunk.rows) && hunk.rows.length > 0);
  if (!hasRows) return null;
  return { languageId, mode: "meta", oldLines: null, newLines: null };
}
function tokensForRow(highlighter, hunk, row, side) {
  try {
    if (highlighter === null || typeof highlighter !== "object") return null;
    if (row === null || typeof row !== "object" || typeof row.text !== "string") return null;
    if (row.text.length > MAX_TOKEN_LINE_LENGTH) return null;
    const lineSide = side === "old" ? "old" : "new";
    if (highlighter.mode === "full") {
      const fromFullText = tokensFromFullText(highlighter, row, lineSide);
      if (fromFullText !== void 0) return fromFullText;
    }
    if (hunk === null || typeof hunk !== "object" || !Array.isArray(hunk.rows)) return null;
    return tokensFromHunk(highlighter, hunk, row, lineSide);
  } catch {
    return null;
  }
}
function tokensFromFullText(highlighter, row, side) {
  const lines = side === "old" ? highlighter.oldLines : highlighter.newLines;
  if (!Array.isArray(lines)) return void 0;
  const lineNumber = side === "old" ? row.oldNo : row.newNo;
  if (!Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > lines.length) return void 0;
  const tokens = lines[lineNumber - 1];
  if (!Array.isArray(tokens)) return void 0;
  if (lineText(tokens) !== row.text) return void 0;
  return tokens;
}
function tokensFromHunk(highlighter, hunk, row, side) {
  const languageId = highlighter.languageId;
  if (typeof languageId !== "string") return null;
  const entry = hunkTokensFor(hunk, languageId);
  if (entry === null) return null;
  const lines = side === "old" ? entry.old : entry.new;
  if (!Array.isArray(lines)) return null;
  const index = rowIndexInHunk(hunk, row, side);
  if (index < 0 || index >= lines.length) return null;
  const tokens = lines[index];
  if (!Array.isArray(tokens)) return null;
  if (lineText(tokens) !== row.text) return null;
  return tokens;
}

// src/client/store.js
var payload = null;
var listeners2 = /* @__PURE__ */ new Set();
function openDiffModal(next) {
  payload = next;
  for (const listener of listeners2) listener();
}
function closeDiffModal() {
  if (payload === null) return;
  payload = null;
  for (const listener of listeners2) listener();
}
function getDiffModal() {
  return payload;
}
function subscribeDiffModal(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}

// src/client/components.jsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function useCardSettings2() {
  return (0, import_react3.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
function Icon({ kind, size = 14 }) {
  const common = {
    viewBox: "0 0 16 16",
    width: size,
    height: size,
    fill: "none",
    "aria-hidden": true,
    focusable: "false"
  };
  if (kind === "chevron") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6 3.5 10.5 8 6 12.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) });
  }
  if (kind === "expand") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "path",
      {
        d: "M9.5 2h4.5v4.5M6.5 2H2v4.5M9.5 14H14V9.5M6.5 14H2V9.5",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ) });
  }
  if (kind === "close") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "path",
    {
      d: "M11.6 1.9a1.75 1.75 0 0 1 2.5 2.5l-.7.7-2.5-2.5.7-.7Zm-1.4 1.4 2.5 2.5-7.4 7.4-3.4.9.9-3.4 7.4-7.4Z",
      fill: "currentColor"
    }
  ) });
}
function range(start, end) {
  if (start === null || start === void 0) return "";
  return start === end ? `L${start}` : `L${start}–L${end}`;
}
function hunkRangeText(hunk, t) {
  if (hunk.hasNumbers !== true) return t("unknownRange");
  if (hunk.oldCount === 0) return t("hunkHeaderNew", { new: range(hunk.newStart, hunk.newEnd) });
  if (hunk.newCount === 0) return t("hunkHeaderDel", { old: range(hunk.oldStart, hunk.oldEnd) });
  return t("hunkHeader", {
    old: range(hunk.oldStart, hunk.oldEnd),
    new: range(hunk.newStart, hunk.newEnd)
  });
}
function stateKeyOf(status) {
  if (status === "preparing") return "state.preparing";
  if (status === "running") return "state.running";
  if (status === "error") return "state.error";
  if (status === "stopped") return "state.stopped";
  return null;
}
function sourceLabel(source3, t) {
  if (source3 === "snapshot") return t("snapshotSource");
  if (source3 === "located") return t("locatedSource");
  if (source3 === "preview") return t("preview");
  if (source3 === "args") return t("argsSource");
  return t("lineUnknown");
}
function buildInlinePlan(diff2) {
  const parts = [];
  let budget = INLINE_ROW_CAP;
  let shown = 0;
  let total = 0;
  for (const hunk of diff2.hunks) total += hunk.rows.length;
  for (const hunk of diff2.hunks) {
    if (budget <= 0) break;
    if (hunk.gapBefore !== null && hunk.gapBefore !== void 0) {
      parts.push({ type: "gap", gap: hunk.gapBefore, key: "gap" + hunk.index });
    }
    const rows = [];
    for (const row of hunk.rows) {
      if (budget <= 0) break;
      rows.push(row);
      budget--;
      shown++;
    }
    parts.push({ type: "hunk", hunk, rows, key: "hunk" + hunk.index });
  }
  return { parts, shown, total };
}
function badgeClassName(className) {
  return className === void 0 || className === null || className === "" ? "did-lang" : `did-lang ${className}`;
}
function LanguageBadge({ languageId, settings, t, className }) {
  const base = badgeClassName(className);
  if (settings.languageBadge === "hidden") return null;
  if (languageId === null || languageId === void 0) {
    if (settings.unknownLanguage === "hidden") return null;
    const label = t("langUnknown");
    const title2 = t("langTitle", { name: label });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: base, "data-unknown": "true", title: title2, "aria-label": title2, children: label });
  }
  if (languageId === "plaintext") {
    const label = t("langPlaintext");
    const title2 = t("langTitle", { name: label });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: base, "data-plain": "true", title: title2, "aria-label": title2, children: label });
  }
  const info = languageInfo(languageId);
  if (info === null || info === void 0) return null;
  const variant = settings.languageBadge === "full" ? "full" : "short";
  const title = t("langTitle", { name: info.label });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: base, "data-variant": variant, title, "aria-label": title, children: variant === "full" ? info.label : info.short });
}
function usableTokens(row, tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return null;
  if (row === null || row === void 0 || typeof row.text !== "string") return null;
  let rebuilt = "";
  for (const token of tokens) {
    if (token === null || typeof token !== "object" || typeof token.text !== "string") return null;
    rebuilt += token.text;
  }
  return rebuilt === row.text ? tokens : null;
}
function TokenSpan({ token }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-tok", "data-g": token.g, children: token.text });
}
function splitTokensBySegments(tokens, segments) {
  let expected = 0;
  for (const segment of segments) {
    if (segment === null || typeof segment !== "object" || typeof segment.text !== "string") return null;
    expected += segment.text.length;
  }
  let available = 0;
  for (const token of tokens) available += token.text.length;
  if (expected !== available) return null;
  const groups = [];
  let tokenIndex = 0;
  let offset = 0;
  for (const segment of segments) {
    const length = segment.text.length;
    const pieces = [];
    let used = 0;
    while (used < length && tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const take = Math.min(token.text.length - offset, length - used);
      if (take > 0) pieces.push({ text: token.text.slice(offset, offset + take), g: token.g });
      offset += take;
      used += take;
      if (offset >= token.text.length) {
        tokenIndex++;
        offset = 0;
      }
    }
    groups.push({ changed: segment.changed === true, pieces });
  }
  return groups;
}
function RowText({ row, fallback, tokens }) {
  const segments = row === null || row === void 0 ? null : row.segments;
  const colorable = usableTokens(row, tokens);
  const hasSegments = Array.isArray(segments) && segments.length > 0;
  if (colorable !== null && !hasSegments) {
    return colorable.map((token, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TokenSpan, { token }, index));
  }
  if (colorable !== null && hasSegments) {
    const groups = splitTokensBySegments(colorable, segments);
    if (groups !== null) {
      return groups.map((group, index) => group.changed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-seg", "data-changed": "true", children: group.pieces.map((piece, pieceIndex) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TokenSpan, { token: piece }, pieceIndex)) }, index) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react3.Fragment, { children: group.pieces.map((piece, pieceIndex) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TokenSpan, { token: piece }, pieceIndex)) }, index));
    }
  }
  if (!hasSegments) return fallback;
  return segments.map((segment, index) => segment.changed === true ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-seg", "data-changed": "true", children: segment.text }, index) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: segment.text }, index));
}
function moveText(move, t) {
  const end = move.endLine;
  if (typeof end === "number" && end > move.line) {
    return move.kind === "to" ? t("movedToRange", { from: move.line, to: end }) : t("movedFromRange", { from: move.line, to: end });
  }
  return move.kind === "to" ? t("movedTo", { line: move.line }) : t("movedFrom", { line: move.line });
}
function InlineRow({ row, t, highlighter, hunk }) {
  const code = row.text === "" ? " " : row.text;
  const move = row.move;
  const tokens = highlighter === null || highlighter === void 0 ? null : tokensForRow(highlighter, hunk ?? null, row, row.kind === "del" ? "old" : "new");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-row", "data-kind": row.kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", "data-side": "old", children: row.oldNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", "data-side": "new", children: row.newNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-sign", children: row.kind === "add" ? "+" : row.kind === "del" ? "−" : " " }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "did-code", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code, tokens }) }),
    move !== void 0 && move !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-move", children: moveText(move, t) }) : null
  ] });
}
function GapBand({ gap, t }) {
  if (gap === null || gap === void 0) return null;
  const shift = gap.shift;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-gap", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: "⋯" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-gap-range", children: t("gapUnchanged", { n: gap.count }) }),
    shift !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-gap-range", children: t("gapRange", { old: `L${gap.oldStart}–L${gap.oldEnd}`, new: `L${gap.newStart}–L${gap.newEnd}` }) }) : null,
    shift !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-shift", children: shift > 0 ? t("shift", { delta: shift }) : t("shiftDown", { delta: Math.abs(shift) }) }) : null
  ] });
}
function isTrustedGesture(event) {
  const native = event === null || event === void 0 ? null : event.nativeEvent ?? event;
  return native === null || native.isTrusted !== false;
}
function InlineHunk({ hunk, rows, t, pathLabel, highlighter }) {
  const hidden = hunk.rows.length - rows.length;
  const sides = gutterSides(hunk);
  const hasOldNumbers = sides.old;
  const hasNewNumbers = sides.new;
  const legendSides = hasOldNumbers && hasNewNumbers ? "both" : hasOldNumbers ? "old" : hasNewNumbers ? "new" : "none";
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-hunk", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-file", title: pathLabel || void 0, children: pathLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-range", children: hunkRangeText(hunk, t) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
          "+",
          hunk.added
        ] }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
          "−",
          hunk.removed
        ] })
      ] })
    ] }),
    hunk.hasNumbers === false ? null : (
      // Column legend for the two line-number gutters: makes it obvious which
      // number is the old-file line and which is the new-file line, on every
      // hunk rather than only in the hunk header above. A side that this hunk
      // never numbers keeps its column but drops the label.
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-numhead", "aria-hidden": "true", "data-sides": legendSides, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-numhead-label", "data-side": "old", children: hasOldNumbers ? t("gutterOld") : "" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-numhead-label", "data-side": "new", children: hasNewNumbers ? t("gutterNew") : "" })
      ] })
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-rows", children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InlineRow, { row, hunk, t, highlighter }, index)) }),
    hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-note", children: t("inlineMore", { n: hidden }) }) : null
  ] });
}
function pairRows(rows, cap) {
  const pairs = [];
  let i = 0;
  let used = 0;
  while (i < rows.length && used < cap) {
    const row = rows[i];
    if (row.kind === "ctx") {
      pairs.push({ left: row, right: row });
      i++;
      used++;
      continue;
    }
    const deleted = [];
    const added = [];
    while (i < rows.length && rows[i].kind !== "ctx") {
      if (rows[i].kind === "del") deleted.push(rows[i]);
      else added.push(rows[i]);
      i++;
      used++;
    }
    const count = Math.max(deleted.length, added.length);
    for (let k = 0; k < count; k++) pairs.push({ left: deleted[k] ?? null, right: added[k] ?? null });
  }
  return { pairs, truncated: i < rows.length };
}
function SideCell({ row, side, t, highlighter, hunk }) {
  const kind = row === null ? "none" : row.kind;
  const lineNo = row === null ? null : side === "left" ? row.oldNo : row.newNo;
  const code = row === null ? "" : row.text === "" ? " " : row.text;
  const move = row === null ? null : row.move;
  const tokens = row === null || highlighter === null || highlighter === void 0 ? null : tokensForRow(highlighter, hunk ?? null, row, side === "left" ? "old" : "new");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-cell", "data-kind": kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", children: lineNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "did-code", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code || " ", tokens }) }),
    move !== null && move !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-move", children: moveText(move, t) }) : null
  ] });
}
function PairRow({ pair, t, highlighter, hunk }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-pair", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideCell, { row: pair.left, side: "left", t, highlighter, hunk }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideCell, { row: pair.right, side: "right", t, highlighter, hunk })
  ] });
}
function PanesHead({ t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-panes-head", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-pane-label", children: t("before") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-pane-label", children: t("after") })
  ] });
}
function SideBySide({ diff: diff2, mode, pathLabel, t, highlighter }) {
  if (mode === "full") {
    const { pairs, truncated } = pairRows(diff2.rows, FULL_VIEW_ROW_CAP);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-sbs", "data-mode": "full", children: [
      pairs.map((pair, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PairRow, { pair, t, highlighter, hunk: null }, index)),
      truncated ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-full-note", children: t("fullNote", { n: diff2.rows.length }) }) : null
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-sbs", "data-mode": "hunks", children: diff2.hunks.map((hunk) => {
    const { pairs } = pairRows(hunk.rows, Number.POSITIVE_INFINITY);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react3.Fragment, { children: [
      hunk.gapBefore !== null && hunk.gapBefore !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GapBand, { gap: hunk.gapBefore, t }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-bar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-bar-file", title: pathLabel || void 0, children: pathLabel }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-range", children: [
          t("hunk.i", { i: hunk.index, n: diff2.hunks.length }),
          " · ",
          hunkRangeText(hunk, t)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-bar-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
            "+",
            hunk.added
          ] }),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
            "−",
            hunk.removed
          ] })
        ] })
      ] }),
      pairs.map((pair, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PairRow, { pair, t, highlighter, hunk }, index))
    ] }, hunk.index);
  }) });
}
function noticeText(notice, t) {
  if (notice.kind === "huge") return t("noticeHuge", { old: notice.old, new: notice.new });
  if (notice.kind === "coarse") return t("noticeCoarse");
  if (notice.kind === "tool") return t("noticeTool");
  if (notice.kind === "toolLocate") return t("noticeToolLocate");
  if (notice.kind === "history") return t("noticeHistory");
  if (notice.kind === "locate") return t("noticeLocate");
  return t("noticeLinesPending");
}
function modalPayloadOf(model) {
  return {
    callId: model.callId,
    toolName: model.toolName,
    titleKey: model.titleKey,
    filePath: model.filePath,
    absolutePath: model.absolutePath,
    operation: model.operation,
    status: model.status,
    source: model.source,
    diff: model.diff,
    notice: model.notice
  };
}
function InlineDiffCard(props) {
  const { block, toolName, cwd, home, openFile, inspect, sessionId, t } = props;
  const tone = useCardSettings2();
  const call2 = (0, import_react3.useMemo)(() => deriveCall(block), [block]);
  const [snapshot, setSnapshot] = (0, import_react3.useState)(void 0);
  const [fileText, setFileText] = (0, import_react3.useState)(null);
  const [collapsed, setCollapsed] = (0, import_react3.useState)(false);
  const requested = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    if (requested.current) return;
    if (!call2.settled || call2.isError) return;
    requested.current = true;
    let alive = true;
    const run = async () => {
      const captured = await cachedSnapshot(sessionId, call2.callId);
      if (!alive) return;
      setSnapshot(captured ?? null);
      if (captured === null) {
        const metaPath = call2.meta !== null && typeof call2.meta === "object" && typeof call2.meta.path === "string" ? call2.meta.path : "";
        if (metaPath !== "" && typeof cwd === "string" && cwd !== "") {
          const read = await cachedFileText(cwd, metaPath);
          if (alive && read !== null && read.kind === "text") setFileText(read.text);
        }
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [call2.settled, call2.isError, call2.callId, call2.meta, cwd, sessionId]);
  const model = (0, import_react3.useMemo)(() => buildCardModel({
    block,
    toolName,
    cwd,
    home,
    snapshot: snapshot ?? null,
    fileText,
    loading: snapshot === void 0 && call2.settled && !call2.isError
  }), [block, toolName, cwd, home, snapshot, fileText, call2.settled, call2.isError]);
  const diff2 = model.diff;
  const languageId = (0, import_react3.useMemo)(
    () => detectLanguage(model.absolutePath ?? model.filePath, model.diff?.afterText ?? model.diff?.beforeText ?? ""),
    [model.absolutePath, model.filePath, model.diff]
  );
  const highlighter = (0, import_react3.useMemo)(
    () => tone.syntaxHighlight !== false && languageId !== null && diff2 !== null && diff2 !== void 0 ? getDiffHighlighter(diff2, languageId) : null,
    [diff2, languageId, tone.syntaxHighlight]
  );
  const hasHunks = diff2 !== null && diff2 !== void 0 && diff2.hunks.length > 0;
  const stateKey = stateKeyOf(model.status);
  const totalHunks = hasHunks ? diff2.hunks.length : 0;
  const plan = (0, import_react3.useMemo)(() => hasHunks ? buildInlinePlan(diff2) : null, [diff2, hasHunks]);
  const hidden = plan === null ? 0 : plan.total - plan.shown;
  const openModal = (event) => {
    event?.stopPropagation?.();
    if (!isTrustedGesture(event)) return;
    if (!hasHunks) return;
    openDiffModal(modalPayloadOf(model));
  };
  const toggle = () => setCollapsed((value) => !value);
  const onHeadClick = (event) => {
    if (isTrustedGesture(event)) toggle();
  };
  const onHeadKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };
  const emptyBody = () => {
    if (model.status === "error") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-error", children: model.errorMessage || t("failedSummary") });
    if (model.status === "nochange") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("noChanges") });
    if (model.loading) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("loading") });
    if (model.status === "preparing") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-empty", children: [
      t("state.preparing"),
      "…"
    ] });
    if (model.status === "running") return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-empty", children: [
      t("state.running"),
      "…"
    ] });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-empty", children: t("noDiff") });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react3.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-card", "data-state": model.status, "data-tool": model.toolName, "data-call-id": model.callId, "data-inline-diff": "row", "data-shell-tone": tone.fileShellTone, "data-inner-tone": tone.fileInnerTone, "data-language": languageId ?? "unknown", "data-syn-emphasis": tone.syntaxEmphasis, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: "did-head",
        role: "button",
        tabIndex: 0,
        "aria-expanded": !collapsed,
        "aria-haspopup": "false",
        onClick: onHeadClick,
        onKeyDown: onHeadKeyDown,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-chevron", "data-open": !collapsed ? "true" : "false", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "chevron" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-icon", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "edit" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-title", children: t(model.titleKey) }),
          model.operation !== null && model.operation !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-op", children: t(operationKey(model.operation)) }) : null,
          model.filePath !== "" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              className: "did-path",
              title: model.absolutePath ?? model.filePath,
              onClick: (event) => {
                event.stopPropagation();
                const target = model.absolutePath ?? model.filePath;
                if (target !== "" && typeof openFile === "function") openFile(target);
              },
              onKeyDown: (event) => event.stopPropagation(),
              children: model.filePath
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LanguageBadge, { languageId, settings: tone, t }),
          hasHunks ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-stats", "aria-label": t("hunks", { n: totalHunks }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-add", children: [
              "+",
              diff2.added
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-del", children: [
              "−",
              diff2.removed
            ] })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-meta", children: hasHunks ? t("hunks", { n: totalHunks }) : model.status === "nochange" ? t("noChanges") : model.status === "error" ? t("failedSummary") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-actions", onClick: (event) => event.stopPropagation(), children: [
            stateKey !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-state", "data-state": model.status, children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-dot", "aria-hidden": "true" }),
              t(stateKey)
            ] }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InspectButton, { inspect, t }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                className: "did-zoom",
                "aria-disabled": hasHunks ? void 0 : "true",
                "data-disabled": hasHunks ? void 0 : "true",
                onClick: openModal,
                onKeyDown: (event) => event.stopPropagation(),
                title: t("zoom"),
                "aria-label": t("zoom"),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "expand", size: 11 }),
                  t("zoom")
                ]
              }
            )
          ] })
        ]
      }
    ),
    model.notice !== null && model.notice !== void 0 && model.notice.kind !== "history" && model.notice.kind !== "locate" && model.notice.kind !== "tool" && model.notice.kind !== "toolLocate" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice", children: noticeText(model.notice, t) }) : null,
    !collapsed ? hasHunks ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-body", children: plan.parts.map((part) => {
        if (part.type === "gap") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GapBand, { gap: part.gap, t }, part.key);
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          InlineHunk,
          {
            hunk: part.hunk,
            rows: part.rows,
            t,
            pathLabel: model.filePath,
            highlighter
          },
          part.key
        );
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-foot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sourceLabel(model.source, t) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-grow" }),
        hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("inlineMore", { n: hidden }) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-link", onClick: openModal, children: t("openViewer") })
      ] })
    ] }) : emptyBody() : null
  ] }) });
}
function DiffModal({ t }) {
  const payload2 = (0, import_react3.useSyncExternalStore)(subscribeDiffModal, getDiffModal, getDiffModal);
  const settings = useCardSettings2();
  const [tab, setTab] = (0, import_react3.useState)("hunks");
  const [portalHost, setPortalHost] = (0, import_react3.useState)(null);
  const dialogRef = (0, import_react3.useRef)(null);
  const callId = payload2 === null ? null : payload2.callId;
  const languageId = (0, import_react3.useMemo)(
    () => payload2 === null ? null : detectLanguage(payload2.absolutePath ?? payload2.filePath, payload2.diff?.afterText ?? payload2.diff?.beforeText ?? ""),
    [payload2]
  );
  const highlighter = (0, import_react3.useMemo)(
    () => settings.syntaxHighlight !== false && languageId !== null && payload2?.diff !== null && payload2?.diff !== void 0 ? getDiffHighlighter(payload2.diff, languageId) : null,
    [payload2, languageId, settings.syntaxHighlight]
  );
  (0, import_react3.useEffect)(() => {
    setPortalHost(document.body);
  }, []);
  (0, import_react3.useEffect)(() => {
    setTab("hunks");
  }, [callId]);
  (0, import_react3.useEffect)(() => {
    if (payload2 === null) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeDiffModal();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [payload2]);
  (0, import_react3.useEffect)(() => {
    if (payload2 === null) return;
    dialogRef.current?.focus?.();
  }, [payload2]);
  if (payload2 === null) return null;
  const diff2 = payload2.diff;
  const hasHunks = diff2 !== null && diff2 !== void 0 && diff2.hunks.length > 0;
  if (!hasHunks) return null;
  const canFull = diff2.hasNumbers === true && Array.isArray(diff2.rows) && diff2.rows.length > 0;
  const activeTab = tab === "full" && canFull ? "full" : "hunks";
  const oldLines = diff2.oldLineCount;
  const newLines = diff2.newLineCount;
  const close = () => closeDiffModal();
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react3.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay-root", "data-open": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay", onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "did-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t("modal.title"),
      tabIndex: -1,
      ref: dialogRef,
      "data-language": languageId ?? "unknown",
      "data-syn-emphasis": settings.syntaxEmphasis,
      onClick: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-icon", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "edit" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-title", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-dialog-path", title: payload2.absolutePath ?? payload2.filePath, children: payload2.filePath !== "" ? payload2.filePath : t(payload2.titleKey) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "did-dialog-sub", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LanguageBadge, { languageId, settings, t }),
              t(payload2.titleKey),
              payload2.operation !== null && payload2.operation !== void 0 ? ` · ${t(operationKey(payload2.operation))}` : "",
              ` · +${diff2.added} −${diff2.removed}`,
              oldLines !== null && newLines !== null ? ` · ${t("oldFile", { n: oldLines })} / ${t("newFile", { n: newLines })}` : ""
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-tabs", role: "tablist", "aria-label": t("modal.title"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "did-tab",
                role: "tab",
                "aria-selected": activeTab === "hunks",
                "data-active": activeTab === "hunks" ? "true" : "false",
                onClick: () => setTab("hunks"),
                children: t("tab.hunks")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "did-tab",
                role: "tab",
                "aria-selected": activeTab === "full",
                "data-active": activeTab === "full" ? "true" : "false",
                disabled: !canFull,
                title: canFull ? void 0 : payload2.notice?.kind === "tool" || payload2.notice?.kind === "toolLocate" ? t("fullToolUnavailable") : payload2.notice?.kind === "history" || payload2.notice?.kind === "lines" ? t("fullHistoryUnavailable") : payload2.notice?.kind === "locate" ? t("fullLocateUnavailable") : t("fullTooLarge"),
                onClick: () => setTab("full"),
                children: t("tab.full")
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-close", onClick: close, "aria-label": t("close"), title: t("close"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { kind: "close", size: 13 }) })
        ] }),
        payload2.notice !== null && payload2.notice !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice did-dialog-notice", children: noticeText(payload2.notice, t) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PanesHead, { t }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-dialog-body", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SideBySide, { diff: diff2, mode: activeTab, pathLabel: payload2.filePath, t, highlighter }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-dialog-foot", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sourceLabel(payload2.source, t) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-grow" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: `${t("oldFile", { n: oldLines ?? "?" })} · ${t("newFile", { n: newLines ?? "?" })}` }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            "Esc · ",
            t("close")
          ] })
        ] })
      ]
    }
  ) }) }) });
  return portalHost === null ? overlay : (0, import_react_dom.createPortal)(overlay, portalHost);
}

// src/client/locales.js
var NS = "inline-diff";
var zh = {
  "title.edit": "编辑",
  "title.write": "写入",
  "title.strReplace": "替换编辑",
  "langUnknown": "未知语言",
  "langPlaintext": "纯文本",
  "langTitle": "语言：{name}",
  "op.create": "新建文件",
  "op.update": "更新文件",
  "op.overwrite": "覆盖写入",
  "state.preparing": "准备中",
  "state.running": "执行中",
  "state.error": "失败",
  "state.stopped": "已中止",
  "hunks": "{n} 处修改",
  "hunk.i": "修改点 {i}/{n}",
  "gutterOld": "旧",
  "gutterNew": "新",
  "noChanges": "内容无变化",
  "noDiff": "没有可展示的差异",
  "zoom": "放大",
  "collapse": "收起",
  "expand": "展开",
  "modal.title": "修改对比",
  "tab.hunks": "变更块",
  "tab.full": "全文对照",
  "close": "关闭",
  "before": "修改前",
  "after": "修改后",
  "oldFile": "旧文件 {n} 行",
  "newFile": "新文件 {n} 行",
  "gapUnchanged": "{n} 行未修改",
  "shift": "行号顺延 {delta}",
  "shiftDown": "行号顺延 −{delta}",
  "movedTo": "移至 新 L{line}",
  "movedToRange": "移至 新 L{from}–L{to}",
  "movedFrom": "移自 旧 L{line}",
  "movedFromRange": "移自 旧 L{from}–L{to}",
  "inlineMore": "另有 {n} 行未展开，点击「放大」查看全部",
  "openViewer": "左右对照",
  "preview": "执行中的预览（精确行号将在完成后标注）",
  "lineUnknown": "行号待定",
  "snapshotSource": "按执行快照精确对照",
  "argsSource": "按调用参数重建",
  "locatedSource": "按文件定位行号",
  "failedSummary": "文件修改失败",
  "loading": "读取文件上下文…",
  "fullTooLarge": "文件较大，全文对照不可用",
  "fullHistoryUnavailable": "历史回放缺少修改前全文，全文对照不可用",
  "fullLocateUnavailable": "历史回放缺少修改前全文，且行号无法定位，全文对照不可用",
  "fullToolUnavailable": "该工具调用不保存执行快照，全文对照不可用",
  "noticeHistory": "这是历史回放：只能读取修改块和行号，修改前全文已不可用，因此「全文对照」置灰；当前实时修改的卡片仍可全文对照。",
  "noticeLocate": "这是历史回放：修改前全文已不可用，且当前文件已变化、无法定位行号；只展示修改块，行号标记为待定。",
  "noticeTool": "该工具调用不保存执行快照：只能展示修改块与行号，「全文对照」不可用。",
  "noticeToolLocate": "该工具调用不保存执行快照，且当前文件已变化、无法定位行号；只展示修改块，行号标记为待定。",
  "noticeHuge": "文件较大（旧 {old} 行 / 新 {new} 行），已切换为差异块模式：保留逐行号与修改点，移动识别与「全文对照」不可用。",
  "noticeCoarse": "文件较大，已使用粗粒度对齐：颜色与行号仍准确，移动识别已关闭。",
  "noticeLinesPending": "未能读取当前文件，行号标记为待定；差异内容仍按工具记录展示。",
  "openFile": "在文件面板中打开",
  "hunkHeader": "旧 {old} → 新 {new}",
  "hunkHeaderNew": "新文件 {new}",
  "hunkHeaderDel": "删除 旧 {old}",
  "added": "新增 {n} 行",
  "removed": "删除 {n} 行",
  "unknownRange": "行号待定",
  "fullNote": "共 {n} 行；超出显示上限的部分已截断",
  "emptyFile": "（空文件）",
  "settings.nav": "内联差异",
  "settings.short": "差异样式",
  "settings.title": "内联差异 · 显示样式",
  "settings.description": "只影响 Web 界面的展示方式，不改变会话记录、模型输入或工具执行。「展开风格」采用平板、透明的输出效果：文件修改显示逐次内联差异，命令与其它工具默认展开 IN/OUT；「DSH 原生」保持官方样式。",
  "settings.fileCards": "文件修改卡片",
  "settings.fileCardsDesc": "edit / write / str_replace_editor 工具调用在对话中的展示方式。展开风格显示逐次内联差异卡片，DSH 原生显示官方文件修改行。",
  "settings.syntax": "语法高亮",
  "settings.syntaxDesc": "按扩展名、特殊文件名（如 Dockerfile、Makefile）或脚本首行（shebang）识别文件语言，只改变代码文字颜色，不影响文件内容与差异标记。高亮配色刻意避开红色与绿色，避免与新增/删除标记混淆。",
  "settings.syntaxOn": "开启",
  "settings.syntaxOff": "关闭",
  "settings.languageBadge": "语言标识",
  "settings.languageBadgeDesc": "显示在卡片标题栏的文件路径旁，放大弹窗中也会显示。只占一小枚徽章，不改动现有布局，窄屏时自然截断。选择「隐藏」会隐藏全部语言徽章（含纯文本与未知语言）。",
  "settings.badgeShort": "短代码",
  "settings.badgeFull": "全名",
  "settings.badgeHidden": "隐藏",
  "settings.unknownLanguage": "未知语言",
  "settings.unknownLanguageDesc": "识别不到语言时的处理：显示「未知语言」徽章，或完全不显示语言标识。此时不做语法高亮，代码使用默认前景色（跟随当前浅色/深色外观），新增/删除标记不受影响。",
  "settings.unknownShow": "显示“未知语言”",
  "settings.unknownHidden": "不显示",
  "settings.syntaxEmphasis": "字体强调",
  "settings.syntaxEmphasisDesc": "在配色之外给关键词、类型与函数名加粗，注释用斜体；关闭后只用颜色区分，观感更克制。",
  "settings.emphasisOn": "颜色 + 字体样式",
  "settings.emphasisOff": "仅颜色",
  "settings.supportedLanguages": "支持的语言",
  "settings.supportedLanguagesNote": "已支持 {n} 种语言（按扩展名、特殊文件名与脚本首行识别）。语法高亮配色刻意避开红色与绿色，避免和新增/删除标记混淆。",
  "settings.syntaxToggleNote": "关闭高亮后，代码仍按当前浅色/深色外观使用默认前景色显示。",
  "settings.shellRows": "命令执行行",
  "settings.shellRowsDesc": "bash / pwsh / win_bash 工具调用的展示方式。展开风格默认展开 IN/OUT，DSH 原生显示官方命令行。",
  "settings.shellTone": "外壳配色",
  "settings.innerTone": "内部配色",
  "settings.toneAutoShell": "自动（主题+外观）",
  "settings.toneAutoInner": "自动（官方外观）",
  "settings.toneLight": "浅色",
  "settings.toneDark": "深色",
  "settings.toneSameShell": "与外壳一致",
  "settings.toolCalls": "其它工具调用",
  "settings.toolCallsDesc": "普通、详情、搜索与网页类工具调用（查询运行时、任务与会话、grep / glob、web_search / web_fetch 等）。展开风格默认展开 IN/OUT 并保留折叠按钮；读取、待办、提问、图片等富结果卡片保持原生。开启本项会即时生效，并自动把「过程折叠」切换为不折叠，否则展开行会被 DSH 折叠组遮住。",
  "settings.toolCallsNeedsFlat": "提示：当前「过程折叠」为 DSH 原生，已完成的工具行会被收进折叠组；要直接看到展开效果，请把「过程折叠」也切换为「不折叠」。",
  "settings.transcript": "过程折叠（整份对话）",
  "settings.transcriptEnhancedNote": "启用 DSH 官方的 Verbose 对话记录偏好：整轮过程不折叠、工具行平板展示。设置会持久保存，可在 DSH 设置 → 通用 → 对话记录样式中恢复。",
  "settings.transcriptNativeNote": "保持你当前在 DSH 中的对话记录偏好，插件不会改动它。",
  "settings.styleEnhanced": "展开风格",
  "settings.styleNative": "DSH 原生",
  "settings.flat": "不折叠",
  "settings.subagentNote": "子代理会话与主会话共用这套设置；差异快照按各自 Session 独立记录，互不影响。",
  "settings.dsmCurrent": "当前 DSH 对话记录模式：{mode}",
  "settings.reset": "恢复默认",
  "settings.saving": "正在保存…",
  "settings.live": "设置自动生效",
  "shell.in": "IN",
  "shell.out": "OUT",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "工具调用",
  "readFrom": "L {line} 起",
  "inspectTrajectory": "在轨迹中查看",
  "inspectShort": "轨迹",
  "gapRange": "旧 {old} → 新 {new}",
  "search.matches": "{n} 处匹配",
  "search.files": "{n} 个文件",
  "web.sources": "{n} 个来源",
  "web.status": "HTTP {code}",
  "toolTitle.create_goal": "创建目标",
  "toolTitle.get_goal": "查看目标",
  "toolTitle.update_goal": "更新目标",
  "toolTitle.schedule_create": "创建定时任务",
  "toolTitle.schedule_list": "查看定时任务",
  "toolTitle.schedule_view": "查看定时任务详情",
  "toolTitle.schedule_edit": "编辑定时任务",
  "toolTitle.schedule_delete": "删除定时任务",
  "toolTitle.schedule_update": "更新定时任务",
  "toolTitle.grep": "搜索文件内容",
  "toolTitle.glob": "搜索文件",
  "toolTitle.web_search": "网页搜索",
  "toolTitle.web_fetch": "抓取网页",
  "toolTitle.cordis_inspect_list": "检查提供方",
  "toolTitle.cordis_inspect_query": "查询运行时",
  "toolTitle.cordis_inspect_self": "检查动态插件",
  "toolTitle.workflow": "运行工作流",
  "toolTitle.ralph": "运行循环工作流",
  "toolTitle.session_event_read": "读取事件",
  "toolTitle.session_event_search": "搜索事件",
  "toolTitle.session_event_trace": "追踪事件",
  "toolTitle.session_search": "搜索会话",
  "toolTitle.session_trace": "追踪会话",
  "toolTitle.list_subagent_models": "查看可用模型",
  "toolTitle.subagent": "创建子智能体",
  "toolTitle.list_agents": "查看子智能体",
  "toolTitle.send_message": "发送消息",
  "toolTitle.interrupt_agent": "中断智能体",
  "toolTitle.spawn_teammate": "创建队友",
  "toolTitle.wait_agent": "等待智能体",
  "toolTitle.job_list": "查看后台任务",
  "toolTitle.job_output": "读取任务输出",
  "toolTitle.job_kill": "取消后台任务",
  "toolTitle.terminal_open": "创建终端",
  "toolTitle.terminal_read": "读取终端",
  "toolTitle.terminal_list": "查看终端",
  "toolTitle.terminal_signal": "发送终端信号",
  "toolTitle.terminal_close": "关闭终端",
  "toolTitle.lsp": "语言服务",
  "toolTitle.team_task_create": "创建团队任务",
  "toolTitle.team_task_get": "查看团队任务",
  "toolTitle.team_task_update": "更新团队任务",
  "toolTitle.team_task_list": "查看团队任务列表"
};
var en = {
  "title.edit": "Edit",
  "title.write": "Write",
  "title.strReplace": "Replace",
  "langUnknown": "Unknown",
  "langPlaintext": "Plain text",
  "langTitle": "Language: {name}",
  "op.create": "New file",
  "op.update": "Updated file",
  "op.overwrite": "Overwritten",
  "state.preparing": "Preparing",
  "state.running": "Running",
  "state.error": "Failed",
  "state.stopped": "Stopped",
  "hunks": "{n} changes",
  "hunk.i": "Change {i}/{n}",
  "gutterOld": "OLD",
  "gutterNew": "NEW",
  "noChanges": "No content change",
  "noDiff": "No diff to show",
  "zoom": "Expand",
  "collapse": "Collapse",
  "expand": "Expand",
  "modal.title": "Change comparison",
  "tab.hunks": "Changes",
  "tab.full": "Whole file",
  "close": "Close",
  "before": "Before",
  "after": "After",
  "oldFile": "Before · {n} lines",
  "newFile": "After · {n} lines",
  "gapUnchanged": "{n} unchanged lines",
  "shift": "line numbers shifted {delta}",
  "shiftDown": "line numbers shifted −{delta}",
  "movedTo": "moved to new L{line}",
  "movedToRange": "moved to new L{from}–L{to}",
  "movedFrom": "moved from old L{line}",
  "movedFromRange": "moved from old L{from}–L{to}",
  "inlineMore": "{n} more lines not shown — use “Expand” to see all",
  "openViewer": "Side-by-side",
  "preview": "Live preview — exact line numbers appear when the edit settles",
  "lineUnknown": "line numbers pending",
  "snapshotSource": "Exact comparison from the execution snapshot",
  "argsSource": "Rebuilt from the call arguments",
  "locatedSource": "Line numbers located in the file",
  "failedSummary": "File change failed",
  "loading": "Reading file context…",
  "fullTooLarge": "File is large — whole-file comparison unavailable",
  "fullHistoryUnavailable": "Before-image text is unavailable for replayed history; whole-file comparison is unavailable",
  "fullLocateUnavailable": "Before-image text and line numbers are unavailable for replayed history; whole-file comparison is unavailable",
  "fullToolUnavailable": "This tool call keeps no execution snapshot; whole-file comparison is unavailable",
  "noticeHistory": "Replayed history: only the changed hunks and line numbers are available, so the whole-file tab is disabled. Cards from the live session still support it.",
  "noticeLocate": "Replayed history: the before-image is unavailable and the current file no longer matches that edit, so line numbers cannot be located; only the changed hunks are shown.",
  "noticeTool": "This tool call keeps no execution snapshot: only the changed hunks and line numbers are shown, so whole-file comparison is unavailable.",
  "noticeToolLocate": "This tool call keeps no execution snapshot and the current file no longer matches that edit, so line numbers cannot be located; only the changed hunks are shown.",
  "noticeHuge": "Large file (before: {old} lines, after: {new} lines) — switched to changed-hunk mode: line numbers and hunks are kept; moved-block detection and the whole-file tab are unavailable.",
  "noticeCoarse": "Large file — coarse alignment in use. Coloring and line numbers stay accurate; moved-block detection is off.",
  "noticeLinesPending": "The current file could not be read, so line numbers are pending; the recorded diff is still shown.",
  "openFile": "Open in file panel",
  "hunkHeader": "old {old} → new {new}",
  "hunkHeaderNew": "new file {new}",
  "hunkHeaderDel": "deleted old {old}",
  "added": "{n} added",
  "removed": "{n} removed",
  "unknownRange": "line numbers pending",
  "fullNote": "{n} lines total; display capped",
  "emptyFile": "(empty file)",
  "settings.nav": "Inline Diff",
  "settings.short": "Diff style",
  "settings.title": "Inline Diff · Display",
  "settings.description": "Presentation only: session records, model input, and tool execution are unchanged. The expanded style gives flat, transparent output — per-edit inline diffs for file changes and IN/OUT expanded by default for commands and other tools; DSH native keeps the stock presentation.",
  "settings.fileCards": "File-change cards",
  "settings.fileCardsDesc": "How edit / write / str_replace_editor calls render. Expanded shows per-edit inline diff cards; DSH native shows the stock file-mutation row.",
  "settings.syntax": "Syntax highlighting",
  "settings.syntaxDesc": "Detects the file language from its extension, special filenames (Dockerfile, Makefile, …), or a script shebang, and only changes code text colors — file contents and diff markers are untouched. Highlight colors deliberately avoid red and green so they never read as added/removed markers.",
  "settings.syntaxOn": "On",
  "settings.syntaxOff": "Off",
  "settings.languageBadge": "Language badge",
  "settings.languageBadgeDesc": "Shown next to the file path in the card title bar and in the expanded dialog. A small badge that does not disturb the existing layout and truncates naturally on narrow screens. “Hidden” hides every language badge, including the plain-text and unknown-language markers.",
  "settings.badgeShort": "Short code",
  "settings.badgeFull": "Full name",
  "settings.badgeHidden": "Hidden",
  "settings.unknownLanguage": "Unknown language",
  "settings.unknownLanguageDesc": "What to show when the language cannot be detected: a neutral “Unknown” badge, or no badge at all. Syntax highlighting is skipped in that case, so code uses the default foreground color for the current light/dark appearance; added/removed markers are unaffected.",
  "settings.unknownShow": "Show “Unknown”",
  "settings.unknownHidden": "Hide",
  "settings.syntaxEmphasis": "Font emphasis",
  "settings.syntaxEmphasisDesc": "Beyond color, bold keywords, types, and function names and italicize comments; turning it off keeps color only for a more restrained look.",
  "settings.emphasisOn": "Color + font style",
  "settings.emphasisOff": "Color only",
  "settings.supportedLanguages": "Supported languages",
  "settings.supportedLanguagesNote": "Supports {n} languages (detected by extension, special filenames, and script shebang). Highlight colors deliberately avoid red and green so they are never confused with added/removed markers.",
  "settings.syntaxToggleNote": "When highlighting is off, code keeps the default foreground color for the current light/dark appearance.",
  "settings.shellRows": "Command rows",
  "settings.shellRowsDesc": "How bash / pwsh / win_bash calls render. Expanded shows IN/OUT open; DSH native shows the stock command row.",
  "settings.shellTone": "Shell tone",
  "settings.innerTone": "Inner tone",
  "settings.toneAutoShell": "Auto (theme + appearance)",
  "settings.toneAutoInner": "Auto (official appearance)",
  "settings.toneLight": "Light",
  "settings.toneDark": "Dark",
  "settings.toneSameShell": "Same as shell",
  "settings.toolCalls": "Other tool calls",
  "settings.toolCallsDesc": "Generic, details, search, and web tool calls such as runtime queries, session/job queries, grep / glob, and web_search / web_fetch. Expanded shows IN/OUT open with a fold button; rich cards (read, todo, questions, images) stay native. Enabling this applies instantly and also unfolds completed turns, otherwise DSH folding would hide the expanded rows.",
  "settings.toolCallsNeedsFlat": "Note: process folding is DSH-native, so completed tool rows stay inside folded groups. Switch Process folding to Unfolded to see the expanded rows directly.",
  "settings.transcript": "Process folding (whole chat)",
  "settings.transcriptEnhancedNote": "Uses DSH's official Verbose transcript preference: completed turns stay unfolded and tool rows stay flat. It is persisted and can be restored in DSH Settings → General → Transcript.",
  "settings.transcriptNativeNote": "Keep your current DSH transcript preference; the plugin does not modify it.",
  "settings.styleEnhanced": "Expanded",
  "settings.styleNative": "DSH native",
  "settings.flat": "Unfolded",
  "settings.subagentNote": "Subagent sessions use the same settings; diff snapshots are recorded per Session and never interfere.",
  "settings.dsmCurrent": "Current DSH transcript mode: {mode}",
  "settings.reset": "Reset to defaults",
  "settings.saving": "Saving…",
  "settings.live": "Settings apply automatically",
  "shell.in": "IN",
  "shell.out": "OUT",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "Tool call",
  "readFrom": "from L {line}",
  "inspectTrajectory": "Inspect in trajectory",
  "inspectShort": "Trace",
  "gapRange": "old {old} → new {new}",
  "search.matches": "{n} matches",
  "search.files": "{n} files",
  "web.sources": "{n} sources",
  "web.status": "HTTP {code}",
  "toolTitle.create_goal": "Create goal",
  "toolTitle.get_goal": "Get goal",
  "toolTitle.update_goal": "Update goal",
  "toolTitle.schedule_create": "Create schedule",
  "toolTitle.schedule_list": "List schedules",
  "toolTitle.schedule_view": "View schedule",
  "toolTitle.schedule_edit": "Edit schedule",
  "toolTitle.schedule_delete": "Delete schedule",
  "toolTitle.schedule_update": "Update schedule",
  "toolTitle.grep": "Search file contents",
  "toolTitle.glob": "Find files",
  "toolTitle.web_search": "Web search",
  "toolTitle.web_fetch": "Fetch page",
  "toolTitle.cordis_inspect_list": "Inspect providers",
  "toolTitle.cordis_inspect_query": "Query runtime",
  "toolTitle.cordis_inspect_self": "Inspect plugins",
  "toolTitle.workflow": "Run workflow",
  "toolTitle.ralph": "Run loop workflow",
  "toolTitle.session_event_read": "Read event",
  "toolTitle.session_event_search": "Search events",
  "toolTitle.session_event_trace": "Trace event",
  "toolTitle.session_search": "Search sessions",
  "toolTitle.session_trace": "Trace session",
  "toolTitle.list_subagent_models": "List models",
  "toolTitle.subagent": "Create subagent",
  "toolTitle.list_agents": "List subagents",
  "toolTitle.send_message": "Send message",
  "toolTitle.interrupt_agent": "Interrupt agent",
  "toolTitle.spawn_teammate": "Spawn teammate",
  "toolTitle.wait_agent": "Wait agent",
  "toolTitle.job_list": "List jobs",
  "toolTitle.job_output": "Read job output",
  "toolTitle.job_kill": "Kill job",
  "toolTitle.terminal_open": "Open terminal",
  "toolTitle.terminal_read": "Read terminal",
  "toolTitle.terminal_list": "List terminals",
  "toolTitle.terminal_signal": "Signal terminal",
  "toolTitle.terminal_close": "Close terminal",
  "toolTitle.lsp": "Language service",
  "toolTitle.team_task_create": "Create team task",
  "toolTitle.team_task_get": "Get team task",
  "toolTitle.team_task_update": "Update team task",
  "toolTitle.team_task_list": "List team tasks"
};
var dicts = { zh, en };

// src/client/styles.js
var CSS = `
/* ---- appearance-aware surfaces -------------------------------------------
   Shell (card frame, dialogs, headers, footers) follows the active theme and
   the host light/dark setting: layering the theme's own surface token over an
   appearance-specific opaque base keeps the blue/gold/or whatever hue of the
   theme while avoiding translucent, washed-out windows.
   Inner content (diff rows, command execution, tool IO) follows the official
   DSH light/dark code-block palette instead: dark near-black gray, light
   near-white gray, with matching foreground colors so text never blends into
   the background.

   The derived variables are declared on \`body\`, not \`:root\`: the official DSH
   theme (and the descriptors injected by skin-center) define their
   \`--dsw-alias-*\` tokens on \`body\`. A var() declared on \`:root\` resolves on the
   root element, where those body-level tokens do not exist yet, so every
   surface would silently keep the literal fallbacks and never follow the
   theme. Declaring them on \`body\` resolves the theme tokens against the same
   element that defines them (and keeps working for skins that define their
   tokens on the root, because body inherits them). */
body {
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  /* dark appearance: neutral opaque underlay so the shell hue comes from the
     theme's own surface token (blue with the maid skin, gray with the official
     theme, whatever hue other themes define). */
  --did-shell-base: #101216;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  /* Elevated surfaces (settings dialog) use the theme's layer-2 surface, not
     --dsw-alias-bg-overlay: in the official dark theme the overlay token is a
     mid-gray (around #61666b) meant for scrims, so a dialog filled with it looks
     washed out/white against the dark UI. */
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #1a1c22);
  /* inner content uses the official dark code-block palette, not the theme */
  --did-io-bg: #1b1d21;
  --did-io-fg: #e9ebef;
  --did-io-muted: #9199a8;
  --did-io-border: rgba(255, 255, 255, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
body[data-dsh-inline-diff-appearance='light'] {
  --did-fg-primary: #172347;
  --did-fg-secondary: #4d5d7f;
  --did-fg-tertiary: #6f7c99;
  --did-border-1: rgba(71, 91, 145, 0.24);
  --did-border-2: rgba(71, 91, 145, 0.42);
  /* light appearance: neutral near-white underlay, shell hue again comes from
     the theme's own light surface token. */
  --did-shell-base: #ffffff;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #f4f6f9);
  /* inner content uses the official light code-block palette */
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
/* ---- per-card-type shell / inner tone overrides --------------------------
   Set by the settings panel on each rendered card; the values here override
   the document-level appearance variables for that card only. */
[data-shell-tone='light'] {
  --did-shell-base: #ffffff;
  --did-surface-1: #f4f6f9;
  --did-surface-2: #edf0f4;
  --did-surface-elevated: #f4f6f9;
  --did-fg-primary: #172347;
  --did-fg-secondary: #4d5d7f;
  --did-fg-tertiary: #6f7c99;
  --did-border-1: rgba(71, 91, 145, 0.24);
  --did-border-2: rgba(71, 91, 145, 0.42);
  --did-seg-bg: #edf0f4;
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
}
[data-shell-tone='dark'] {
  --did-shell-base: #101216;
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
}
[data-inner-tone='light'] {
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
}
[data-inner-tone='dark'] {
  --did-io-bg: #1b1d21;
  --did-io-fg: #e9ebef;
  --did-io-muted: #9199a8;
  --did-io-border: rgba(255, 255, 255, 0.12);
}
[data-inner-tone='same'] {
  --did-io-bg: transparent;
  --did-io-fg: var(--did-fg-primary);
  --did-io-muted: var(--did-fg-tertiary);
  --did-io-border: var(--did-border-1);
}
/* ---- enhanced flat flat command row (bash / pwsh) ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  /* No gap between the head and the IO panel: the IN status bar must reach the
     title strip without a blank band above it. Spacing is carried by the head
     padding instead. */
  gap: 0;
  min-width: 0;
  margin: 4px 0 4px 2px;
  padding: 4px 0 0;
  border: 0.5px solid var(--did-border-1);
  border-inline-width: 0.25px;
  border-bottom-width: 0;
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
  color: var(--did-fg-primary);
  overflow: hidden;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
}
.enhanced-head { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 1px 5px; }
/* Body cards: keep breathing room under the title text, but the IO panel and
   its status bars still touch the title strip. */
.enhanced-tool[data-body='true'] .enhanced-head { padding-bottom: 3px; }
.enhanced-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--did-fg-tertiary);
}
.enhanced-tool[data-state='ok'] .enhanced-dot { background: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] .enhanced-dot { background: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] .enhanced-dot { background: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: dsh-inline-diff-pulse 1.1s ease-in-out infinite; }
.enhanced-kind { display: inline-flex; flex: none; color: var(--did-fg-tertiary); }
.enhanced-tool[data-variant='command'] .enhanced-kind { color: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-variant='tool'] .enhanced-kind { color: var(--dsw-alias-brand-primary); }
.enhanced-tag {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-secondary);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.02em;
}
.enhanced-sep { flex: none; color: var(--did-fg-tertiary); opacity: 0.65; }
.enhanced-name { flex: none; font-weight: 600; color: var(--did-fg-primary); }
.enhanced-tool[data-variant='command'] .enhanced-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.enhanced-inspect {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 20px;
  padding: 0 7px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: transparent;
  color: var(--did-fg-tertiary);
  font: inherit;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  cursor: pointer;
}
.enhanced-inspect:hover {
  color: var(--dsw-alias-brand-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--did-border-2));
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
}
.enhanced-inspect:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.enhanced-inspect-label { font-size: 11px; line-height: 18px; }
.enhanced-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  padding-left: 8px;
}
.enhanced-badge {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--did-surface-2);
  color: var(--did-fg-secondary);
  font-family: var(--enhanced-mono);
  font-size: 10.5px;
  line-height: 17px;
  white-space: nowrap;
}
.enhanced-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--did-fg-secondary);
}
.enhanced-exit { flex: none; color: var(--dsw-alias-state-error-primary); font-family: var(--enhanced-mono); font-size: 11px; }
.enhanced-state { flex: none; color: var(--did-fg-tertiary); font-size: 11px; white-space: nowrap; }
.enhanced-io {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 0;
  border: 0;
  border-top: 0.5px solid var(--did-io-border);
  border-radius: 0;
  background: var(--did-io-bg);
  color: var(--did-io-fg);
  overflow: hidden;
}
.enhanced-tool[data-state='ok'] { --did-accent-bar: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] { --did-accent-bar: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] { --did-accent-bar: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'],
.enhanced-tool[data-state='preparing'] { --did-accent-bar: var(--dsw-alias-brand-primary); }
.enhanced-tool[data-body='false'] { padding-bottom: 4px; }
.enhanced-section {
  --did-section-bar: var(--dsw-alias-label-tertiary);
  display: grid;
  grid-template-columns: 2.6em minmax(0, 1fr);
  gap: 8px;
  /* No right padding: the scroll container below reaches the card's right edge
     so its scrollbar sits against the border (like the diff cards); the scroll
     content carries the visual inset itself. */
  padding: 8px 0 8px 7.5px;
  border-left: 2.5px solid color-mix(in srgb, var(--did-section-bar, var(--dsw-alias-label-tertiary)) 70%, transparent);
}
/* IN and OUT own their own status bar, drawn as the section's left border so it
   can follow the card's rounded bottom corner instead of being clipped by it:
   IN runs from the title strip down to the IN/OUT hairline, OUT runs from that
   hairline all the way along the card's curve to the bottom edge. The hairline
   is the only separator, so the two bars need no extra blank area between them. */
.enhanced-section:last-child {
  border-bottom-left-radius: var(--dsw-radius-lg, 16px);
}
.enhanced-section[data-state='ok'] { --did-section-bar: var(--dsw-alias-state-success-primary); }
.enhanced-section[data-state='error'] { --did-section-bar: var(--dsw-alias-state-error-primary); }
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] { --did-section-bar: var(--dsw-alias-brand-primary); }
.enhanced-section[data-state='stopped'] { --did-section-bar: var(--dsw-alias-state-warn-primary); }
.enhanced-section[data-state='skipped'] { --did-section-bar: var(--dsw-alias-label-tertiary); }
@keyframes dsh-inline-diff-bar-pulse {
  0%, 100% { border-left-color: color-mix(in srgb, var(--did-section-bar) 28%, transparent); }
  50% { border-left-color: color-mix(in srgb, var(--did-section-bar) 92%, transparent); }
}
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] {
  animation: dsh-inline-diff-bar-pulse 1.2s ease-in-out infinite;
}
/* One independent scroll area per section (IN and OUT each own theirs). The
   container spans to the card's right edge so its scrollbar is flush with the
   border; padding-right keeps the code text off the scrollbar. */
.enhanced-scroll { min-width: 0; max-height: 260px; overflow: auto; padding-right: 10px; }
.enhanced-scroll-in { max-height: 180px; }
.enhanced-label {
  color: var(--did-io-muted);
  font-size: 11px;
  line-height: 18px;
  font-family: var(--enhanced-mono);
  user-select: none;
}
.enhanced-code {
  min-width: 0;
  margin: 0;
  /* Default code text follows the inner tone / appearance (light inner = dark
     text, dark inner = light text) instead of the shell foreground. */
  color: var(--did-io-fg);
  font-family: var(--enhanced-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
}
.enhanced-code[data-error] { color: var(--dsw-alias-state-error-primary); }
.enhanced-code[data-placeholder='true'] { color: var(--did-io-muted); font-style: italic; }
.enhanced-divider { flex: none; height: 0.5px; background: var(--did-io-border); }
.enhanced-toggle {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--did-fg-tertiary);
  cursor: pointer;
  transition: transform 0.12s ease;
}
.enhanced-toggle[aria-expanded='true'] { transform: rotate(90deg); }
.enhanced-toggle:hover { color: var(--did-fg-primary); }
.enhanced-toggle-placeholder { flex: none; width: 14px; height: 14px; }

/* ---- sidebar-foot launcher ---- */
.did-launcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.did-launcher:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }
.did-launcher-label { overflow: hidden; text-overflow: ellipsis; }

/* ---- settings panel / page / modal ---- */
.did-settings-page { max-width: 760px; padding: 4px 0 24px; }
.did-settings { display: flex; flex-direction: column; min-width: 0; color: var(--did-fg-primary); }
.did-settings-head { display: flex; align-items: flex-start; gap: 12px; padding: 2px 0 16px; }
.did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-title { font-size: 18px; font-weight: 600; line-height: 26px; }
.did-settings-sub { margin-top: 4px; color: var(--did-fg-tertiary); font-size: 12px; line-height: 18px; }
.did-settings-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--did-fg-secondary);
  cursor: pointer;
}
.did-settings-close:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }
.did-settings-body { display: flex; flex-direction: column; border-top: 0.5px solid var(--did-border-1); }
.did-setting { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-bottom: 0.5px solid var(--did-border-1); }
.did-setting-text { flex: 1 1 auto; min-width: 0; }
.did-setting-label { font-size: 14px; color: var(--did-fg-primary); line-height: 21px; }
.did-setting-desc { margin-top: 3px; color: var(--did-fg-tertiary); font-size: 12px; line-height: 18px; }
.did-tones { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 7px; }
.did-tone { display: inline-flex; align-items: center; gap: 5px; }
.did-tone-label { color: var(--did-fg-tertiary); font-size: 11px; white-space: nowrap; }
.did-select {
  height: 22px;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-1);
  border-radius: 5px;
  background: var(--did-surface-2);
  color: var(--did-fg-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.did-select:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.did-setting-control { flex: none; }
.did-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--did-seg-bg); box-shadow: inset 0 0 0 0.5px var(--did-border-1); }
.did-seg-option {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;
}
.did-seg-option[data-active='true'] {
  background: var(--did-seg-active);
  color: var(--did-fg-primary);
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);
}
.did-seg-option:hover:not(:disabled) { color: var(--did-fg-primary); }
.did-seg-option:disabled { opacity: 0.5; cursor: default; }
.did-settings-note {
  margin-top: 12px;
  padding: 9px 12px;
  border: 0.5px solid var(--did-border-1);
  border-radius: 8px;
  background: var(--did-surface-1);
  color: var(--did-fg-secondary);
  font-size: 12px;
  line-height: 18px;
}
.did-settings-error { margin-top: 10px; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; white-space: pre-wrap; }
.did-settings-foot { display: flex; align-items: center; gap: 10px; padding-top: 14px; }
.did-settings-reset {
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 12px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}
.did-settings-grow { flex: 1 1 auto; }
.did-settings-author {
  color: var(--did-fg-tertiary);
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.did-settings-author:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.did-settings-hint { color: var(--did-fg-tertiary); font-size: 11.5px; }

.did-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
  pointer-events: auto;
}
.did-settings-dialog {
  width: min(760px, 96vw);
  max-height: min(820px, 90vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 55%, var(--did-border-1));
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-elevated), var(--did-surface-elevated));
  color: var(--did-fg-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}
/* Modal header banner: title + description + close stay fixed; the scroll body
   below is the only scrolling element, so its scrollbar never crosses the
   banner and the rounded dialog corners clip it instead of letting it spill. */
.did-settings-banner {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 22px 14px;
  border-bottom: 0.5px solid var(--did-border-1);
}
.did-settings-banner .did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-dialog .did-settings-head { display: none; }
.did-settings-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  /* Right padding keeps the scrollbar a little inside the rounded dialog edge
     instead of hugging (and appearing to spill over) the border. */
  padding: 14px 12px 16px 22px;
}
.did-settings-scroll .did-settings-body { border-top: 0; }
@media (max-width: 720px) {
  .did-setting { flex-direction: column; align-items: stretch; gap: 8px; }
  .did-setting-control { align-self: flex-start; }
  .did-settings-banner { padding: 16px 16px 12px; }
  .did-settings-scroll { padding: 12px 10px 14px 16px; }
}
.did-card {
  --did-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  --did-inset-x: 9px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 4px 0 4px 2px;
  /* A touch thicker than the host hairline so the card edge reads as a real
     surface; the color rows below still bleed all the way to that edge. */
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 45%, var(--did-border-1));
  border-inline-width: 0.25px;
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
  color: var(--did-fg-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
  overflow: hidden;
}

.did-card[data-state='error'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--did-border-1));
}

.did-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 5px var(--did-inset-x);
  cursor: pointer;
  user-select: none;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  font: inherit;
}

.did-head:hover { background: color-mix(in srgb, var(--did-fg-primary) 4%, transparent); }
.did-head:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }

.did-chevron {
  display: inline-flex;
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--did-fg-tertiary);
  transition: transform 0.12s ease;
}
.did-chevron[data-open='true'] { transform: rotate(90deg); }

.did-icon {
  display: inline-flex;
  flex: none;
  width: 15px;
  height: 15px;
  color: var(--did-fg-secondary);
}

.did-title {
  flex: none;
  font-weight: 500;
  color: var(--did-fg-primary);
}

.did-op {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-secondary);
  font-size: 10.5px;
  line-height: 16px;
}

.did-path {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 46%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  text-align: left;
  text-decoration: underline dotted 1px;
  text-underline-offset: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}
.did-path:hover { color: var(--dsw-alias-brand-primary); }

.did-stats {
  display: inline-flex;
  flex: none;
  gap: 5px;
  margin-left: 2px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  font-variant-numeric: tabular-nums;
}
.did-add { color: var(--dsw-alias-state-success-primary); }
.did-del { color: var(--dsw-alias-state-error-primary); }

.did-meta {
  flex: none;
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
  white-space: nowrap;
}

.did-spacer { flex: 1 1 auto; min-width: 4px; }
.did-actions { display: inline-flex; flex: none; align-items: center; gap: 7px; margin-left: auto; padding-left: 6px; }

.did-state {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  color: var(--did-fg-tertiary);
  font-size: 11px;
  white-space: nowrap;
}
.did-state[data-state='error'] { color: var(--dsw-alias-state-error-primary); }
.did-state[data-state='running'], .did-state[data-state='preparing'] { color: var(--dsw-alias-brand-primary); }
.did-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: dsh-inline-diff-pulse 1.1s ease-in-out infinite; }
@keyframes dsh-inline-diff-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.did-zoom {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 11px;
  line-height: 17px;
  cursor: pointer;
}
.did-zoom:hover:not([aria-disabled='true']) { color: var(--dsw-alias-brand-primary); border-color: currentColor; }
/* Not a native disabled button on purpose: it must still swallow the click so
   the card header (the collapse toggle) never receives it. */
.did-zoom[aria-disabled='true'] { opacity: 0.4; cursor: default; }

.did-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border-top: 0.5px solid var(--did-io-border);
  background: var(--did-io-bg);
}

.did-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 4px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, var(--did-io-bg));
  color: var(--did-fg-secondary);
  position: sticky;
  top: 0;
  z-index: 4;
  font-size: 11.5px;
  line-height: 18px;
}
.did-body > .did-hunk:first-child > .did-bar { border-top: 0; }

.did-bar-file {
  min-width: 0;
  max-width: 38%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--did-fg-primary);
}
.did-bar-range { white-space: nowrap; font-variant-numeric: tabular-nums; }
.did-bar-stats { margin-left: auto; flex: none; font-family: var(--did-mono); font-variant-numeric: tabular-nums; }

.did-rows { display: flex; flex-direction: column; min-width: 0; }

.did-row {
  display: grid;
  /* Compact gutters: both line-number columns stay tabular, but the code text
     starts much closer to the card edge instead of after a wide blank gutter. */
  grid-template-columns: 2.2em 2.2em 0.8em minmax(0, 1fr) auto;
  column-gap: 1px;
  min-width: 0;
  padding: 0 var(--did-inset-x, 9px) 0 8px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
}
.did-row[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-row[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-num {
  overflow: hidden;
  text-align: right;
  color: var(--did-fg-tertiary);
  font-variant-numeric: tabular-nums;
  user-select: none;
  font-size: 10.5px;
  letter-spacing: -0.01em;
}
/* Explicit gutter legend per hunk: labels the two line-number columns as the
   old-file and new-file line, so a changed row reads "old 42 / new 41" without
   having to decode the hunk header.
   The number columns below are sized in em against the row font size, so this
   strip must use the same base size; only the labels themselves are drawn
   smaller. Otherwise 2.2em here would be narrower than 2.2em in the rows and
   the 旧/新 glyphs would sit left of their number columns. */
.did-numhead {
  display: grid;
  grid-template-columns: 2.2em 2.2em 0.8em minmax(0, 1fr) auto;
  column-gap: 1px;
  padding: 3px var(--did-inset-x, 9px) 1px 8px;
  background: color-mix(in srgb, var(--did-fg-primary) 3%, transparent);
  color: var(--did-fg-tertiary);
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 12px;
  letter-spacing: 0;
  user-select: none;
}
.did-numhead-label {
  text-align: right;
  font-size: 9px;
  line-height: 12px;
  letter-spacing: 0;
  white-space: nowrap;
}
.did-numhead-label[data-side='old'] { color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 62%, var(--did-fg-tertiary)); }
.did-numhead-label[data-side='new'] { color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 62%, var(--did-fg-tertiary)); }
/* Reinforce the mapping on change rows: the gutter that belongs to the changed
   side is tinted like that side (deleted row → old number, added row → new). */
.did-row[data-kind='del'] .did-num[data-side='old'] {
  color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 60%, var(--did-fg-tertiary));
  font-weight: 600;
}
.did-row[data-kind='add'] .did-num[data-side='new'] {
  color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 60%, var(--did-fg-tertiary));
  font-weight: 600;
}
.did-sign { text-align: center; user-select: none; color: var(--did-fg-tertiary); }
.did-row[data-kind='add'] .did-sign { color: var(--dsw-alias-state-success-primary); }
.did-row[data-kind='del'] .did-sign { color: var(--dsw-alias-state-error-primary); }

.did-code {
  min-width: 0;
  margin: 0;
  padding: 0 4px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
  color: var(--did-fg-primary);
  tab-size: 4;
}

.did-move {
  align-self: center;
  margin-left: 6px;
  padding: 0 5px;
  border: 0.5px solid currentColor;
  border-radius: 999px;
  font-family: var(--dsh-content-font-family, system-ui, sans-serif);
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
  opacity: 0.85;
}
.did-row[data-kind='del'] .did-move { color: var(--dsw-alias-state-error-primary); }
.did-row[data-kind='add'] .did-move { color: var(--dsw-alias-state-success-primary); }

/* Word/character-level spans: deeper than the row's line-level wash. */
.did-row[data-kind='del'] .did-seg[data-changed='true'],
.did-cell[data-kind='del'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 65%, transparent);
}
.did-row[data-kind='add'] .did-seg[data-changed='true'],
.did-cell[data-kind='add'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 30%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 62%, transparent);
}

.did-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 3px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--did-fg-primary) 3.5%, transparent);
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.did-gap-range { font-variant-numeric: tabular-nums; white-space: nowrap; }
.did-shift {
  padding: 0 6px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  white-space: nowrap;
}

.did-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 4px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 17px;
}
.did-foot .did-grow { flex: 1 1 auto; }
.did-link {
  flex: none;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 11px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}

.did-note {
  padding: 7px var(--did-inset-x, 12px);
  color: var(--did-fg-secondary);
  font-size: 11.5px;
}

.did-notice {
  padding: 6px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--did-fg-secondary);
  font-size: 11.5px;
  line-height: 16px;
}
.did-dialog-notice {
  flex: none;
  border-top: 0;
  border-bottom: 0.5px solid var(--did-border-1);
}

.did-empty {
  padding: 9px var(--did-inset-x, 12px);
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
}

.did-error {
  padding: 8px var(--did-inset-x, 12px);
  color: var(--dsw-alias-state-error-primary);
  font-size: 11.5px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---- root overlay / modal ---- */

.did-overlay-root { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }
.did-overlay-root[data-open='true'] { pointer-events: auto; }

.did-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
}

.did-dialog {
  --did-inset-x: 16px;
  display: flex;
  flex-direction: column;
  width: min(1440px, 96vw);
  height: min(900px, 90vh);
  min-width: 0;
  overflow: hidden;
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 55%, var(--did-border-1));
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-dialog-surface), var(--did-dialog-surface));
  color: var(--did-fg-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}

.did-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px var(--did-inset-x);
  border-bottom: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
}

.did-dialog-title { display: flex; flex-direction: column; gap: 1px; flex: 1 1 auto; min-width: 0; }
.did-dialog-path { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.did-dialog-sub { font-size: 11.5px; color: var(--did-fg-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.did-tabs { display: inline-flex; flex: none; gap: 2px; padding: 2px; border-radius: 8px; background: var(--did-seg-bg); box-shadow: inset 0 0 0 0.5px var(--did-border-1); }
.did-tab {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}
.did-tab[data-active='true'] { background: var(--did-seg-active); color: var(--did-fg-primary); box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); }
.did-tab:disabled { opacity: 0.4; cursor: default; }

.did-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  cursor: pointer;
}
.did-close:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }

.did-dialog-body { flex: 1 1 auto; min-height: 0; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; background: var(--did-io-bg); color: var(--did-io-fg); }

.did-dialog-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px var(--did-inset-x);
  border-top: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
}
.did-dialog-foot .did-grow { flex: 1 1 auto; }

.did-sbs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

/* The before/after strip is part of the dialog header now (outside the
   scrollable body), so it keeps its own row and never shares space with the
   body scrollbar. It no longer needs sticky positioning or a stacking level. */
.did-panes-head { flex: none; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: var(--did-dialog-surface); border-bottom: 0.5px solid var(--did-border-2); }
.did-pane-label { padding: 5px var(--did-inset-x); color: var(--did-fg-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--did-border-1); }

/* Hunk bars stick to the top of the scrollable body: the before/after strip is
   above that body in normal flow, so the bars can never paint over it. */
.did-sbs .did-bar { grid-column: 1 / -1; align-self: start; }

.did-read-main { min-width: 0; }
.did-read-range[hidden] { display: none; }
.did-read-range {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 0 6px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-tertiary);
  font-family: var(--enhanced-mono, var(--dsw-font-markdown-code-block-small, ui-monospace, monospace));
  font-size: 10.5px;
  line-height: 16px;
  white-space: nowrap;
  vertical-align: middle;
}
.did-sbs .did-gap { grid-column: 1 / -1; }
.did-sbs .did-note { grid-column: 1 / -1; }

.did-pair { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

.did-cell {
  display: grid;
  grid-template-columns: 2.7em minmax(0, 1fr) auto;
  min-width: 0;
  padding: 0 var(--did-inset-x) 0 14px;
  font-family: var(--did-mono, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
  border-left: 0.5px solid transparent;
}
.did-pair > .did-cell + .did-cell { border-left: 0.5px solid var(--did-border-1); }
.did-cell[data-kind='none'] { background: color-mix(in srgb, var(--did-fg-primary) 3%, transparent); }
.did-cell[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); }
.did-cell[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); }
.did-cell[data-kind='del'] { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-cell[data-kind='add'] { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-cell .did-num { font-size: 10.5px; }
.did-cell .did-code { padding: 0 4px; }

.did-full-note { grid-column: 1 / -1; padding: 9px var(--did-inset-x); color: var(--did-fg-tertiary); font-size: 11.5px; }

@media (max-width: 860px) {
  .did-overlay { padding: 8px; }
  .did-dialog { width: 100%; height: 94vh; }
  .did-pair { grid-template-columns: minmax(0, 1fr); }
  .did-cell + .did-cell { border-top: 0.5px dashed var(--did-border-2); }
}

/* ---- settings: supported-language list -----------------------------------
   Only the layout shell lives here; the badge look itself is the shared
   .did-lang style injected with the syntax stylesheet, so the settings list
   and the card header badges stay identical. */
.did-langs-details { margin-top: 8px; }
.did-langs-details > summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  color: var(--did-fg-secondary);
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  user-select: none;
}
.did-langs-details > summary::-webkit-details-marker { display: none; }
.did-langs-details > summary::before {
  content: '▸';
  padding-right: 1px;
  color: var(--did-fg-tertiary);
  font-size: 10px;
}
.did-langs-details[open] > summary::before { content: '▾'; }
.did-langs-details > summary:hover { color: var(--did-fg-primary); }
.did-langs-details > summary:focus-visible {
  outline: 1px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
.did-langs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.did-langs .did-lang { font-size: 10.5px; line-height: 18px; }
`;

// src/client/syntax-styles.js
var SYNTAX_PALETTE = {
  dark: {
    kw: "#c5a8ff",
    str: "#86b6ff",
    num: "#74d9e6",
    type: "#aab8ff",
    prop: "#8fd0e8",
    com: "#a3acbd",
    meta: "#9fa8c8",
    op: "#b3bac6",
    punct: "#aab2c0"
  },
  light: {
    kw: "#6d3fd1",
    str: "#1f4fbf",
    num: "#0b6b7d",
    type: "#4652c4",
    prop: "#0f6076",
    com: "#525c6a",
    meta: "#46527d",
    op: "#55606f",
    punct: "#4c5563"
  }
};
var VARIABLE_GROUPS = ["kw", "str", "num", "type", "prop", "com", "meta", "op", "punct"];
function paletteVars(palette) {
  return VARIABLE_GROUPS.map((group) => `  --did-syn-${group}: ${palette[group]};`).join("\n");
}
function paletteBlock(selector, palette) {
  return `${selector} {
${paletteVars(palette)}
}`;
}
var TOKEN_RULES = `
.did-tok[data-g='kw'] { color: var(--did-syn-kw); }
.did-tok[data-g='str'] { color: var(--did-syn-str); }
.did-tok[data-g='num'] { color: var(--did-syn-num); }
.did-tok[data-g='type'] { color: var(--did-syn-type); }
.did-tok[data-g='prop'] { color: var(--did-syn-prop); }
.did-tok[data-g='com'] { color: var(--did-syn-com); }
.did-tok[data-g='meta'] { color: var(--did-syn-meta); }
.did-tok[data-g='op'] { color: var(--did-syn-op); }
.did-tok[data-g='punct'] { color: var(--did-syn-punct); }
/* Secondary groups reuse a related hue instead of adding more colors. */
.did-tok[data-g='fn'],
.did-tok[data-g='tag'],
.did-tok[data-g='head'] { color: var(--did-syn-kw); }
.did-tok[data-g='attr'],
.did-tok[data-g='link'] { color: var(--did-syn-str); }
.did-tok[data-g='lit'] { color: var(--did-syn-num); }
/* Ordinary identifiers and emphasis keep the default code foreground. */
.did-tok[data-g='var'],
.did-tok[data-g='emph'] { color: inherit; }
`.trim();
var EMPHASIS_RULES = `
[data-syn-emphasis='on'] .did-tok[data-g='kw'],
[data-syn-emphasis='on'] .did-tok[data-g='fn'],
[data-syn-emphasis='on'] .did-tok[data-g='type'],
[data-syn-emphasis='on'] .did-tok[data-g='tag'],
[data-syn-emphasis='on'] .did-tok[data-g='head'] { font-weight: 600; }
[data-syn-emphasis='on'] .did-tok[data-g='com'] { font-style: italic; }
[data-syn-emphasis='on'] .did-tok[data-g='link'] { text-decoration: underline; }
/* "Color only": make sure no emphasis style leaks in from elsewhere. */
[data-syn-emphasis='off'] .did-tok {
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}
`.trim();
var BADGE_RULES = `
.did-lang {
  display: inline-flex;
  flex: none;
  align-items: center;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--did-fg-primary) 5%, transparent);
  color: var(--did-fg-tertiary);
  font-family: var(--did-mono, ui-monospace, monospace);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  user-select: none;
}
.did-lang[data-variant='full'] {
  font-family: inherit;
  font-size: 10.5px;
  letter-spacing: 0;
}
.did-lang[data-unknown='true'] { border-style: dashed; }
.did-lang[data-plain='true'] { opacity: 0.9; }
/* Card header: allow the badge to shrink instead of pushing the header
   actions out on a narrow window; the parent clamps it with overflow hidden.
   The 12em ceiling comfortably fits localized "未知语言"/"Unknown" and even the
   longest full language label. */
.did-head > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
}
/* Dialog subtitle: the badge sits inline before the existing text. */
.did-dialog-sub > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
  margin-right: 5px;
  vertical-align: -1px;
}
`.trim();
var SYNTAX_CSS = `
/* ---- syntax highlighting: foreground colors only -----------------------
   Add/remove row washes, gutter signs, and changed-segment backgrounds stay
   red/green in styles.js; these rules only touch token text color.
   Palette variables live on body for the same reason the surface variables do
   (the host theme declares its tokens on body, so a :root declaration would
   never see them; see styles.js). */
${paletteBlock("body", SYNTAX_PALETTE.dark)}
/* Official light appearance (host setting): light inner surface. */
${paletteBlock("body[data-dsh-inline-diff-appearance='light']", SYNTAX_PALETTE.light)}
/* Per-card inner tone override. The "auto" value intentionally has no rule: it
   follows the document appearance above. */
${paletteBlock("[data-inner-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='dark']", SYNTAX_PALETTE.dark)}
/* Inner tone "same as shell": the code background is then the shell surface,
   so the palette follows the shell tone. Shell tone "auto" likewise inherits
   the document appearance, so it needs no extra rule either. */
${paletteBlock("[data-inner-tone='same'][data-shell-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='same'][data-shell-tone='dark']", SYNTAX_PALETTE.dark)}

${TOKEN_RULES}

${EMPHASIS_RULES}

${BADGE_RULES}
`;

// src/client/read-range.js
function compressLineRanges(numbers) {
  const ranges = [];
  let start = null;
  let previous = null;
  for (const value of numbers) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (start === null) {
      start = previous = value;
    } else if (value === previous + 1) {
      previous = value;
    } else {
      ranges.push({ start, end: previous });
      start = previous = value;
    }
  }
  if (start !== null) ranges.push({ start, end: previous });
  return ranges;
}
function positiveInt(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}
function readRangesForBlock(block) {
  const call2 = deriveCall(block);
  const meta = call2.meta;
  if (meta !== null && typeof meta === "object" && Array.isArray(meta.lines) && meta.lines.length > 0) {
    const numbers = meta.lines.map((line) => line !== null && typeof line === "object" ? line.number : void 0).filter((value) => typeof value === "number" && Number.isFinite(value));
    if (numbers.length > 0) return compressLineRanges(numbers);
  }
  const args = call2.args;
  if (args === null || typeof args !== "object") return null;
  const offset = positiveInt(args.offset);
  const limit = positiveInt(args.limit);
  if (offset === null && limit === null) return null;
  const start = offset ?? 1;
  if (limit === null) return [{ start, end: null }];
  return [{ start, end: start + limit - 1 }];
}
function readRangeLabels(ranges, t) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null;
  const max = 4;
  const labels = ranges.slice(0, max).map((range2) => {
    if (range2.end === null) return t("readFrom", { line: range2.start });
    if (range2.start === range2.end) return `L ${range2.start}`;
    return `L ${range2.start} – L ${range2.end}`;
  });
  if (ranges.length > max) labels.push("…");
  return labels.join(" · ");
}

// src/client/read-range-dom.js
var CHIP_ATTR = "data-dsh-inline-diff-read-range";
var rowCache = /* @__PURE__ */ new WeakMap();
function blockFromFiber(element) {
  const key = Object.keys(element).find((name) => name.startsWith("__reactFiber$") || name.startsWith("__reactInternalInstance$"));
  if (key === void 0) return null;
  let fiber = element[key];
  let guard = 0;
  while (fiber !== null && fiber !== void 0 && guard < 60) {
    const props = fiber.memoizedProps;
    if (props !== null && typeof props === "object") {
      const block = props.block;
      if (block !== null && typeof block === "object" && ("kind" in block || "phase" in block || "call" in block)) return block;
    }
    fiber = fiber.return;
    guard++;
  }
  return null;
}
function syncReadRow(row, t) {
  const block = blockFromFiber(row);
  if (block === null) return;
  const cached = rowCache.get(row);
  let label;
  if (cached !== void 0 && cached.block === block) {
    label = cached.label;
  } else {
    const ranges = readRangesForBlock(block);
    label = ranges === null ? null : readRangeLabels(ranges, t);
    rowCache.set(row, { block, label });
  }
  const explicitHeader = row.querySelector("[data-disclosure-row]");
  if (explicitHeader === null) return;
  let chip = explicitHeader.querySelector(`[${CHIP_ATTR}]`);
  if (label === null) {
    if (chip !== null) chip.remove();
    return;
  }
  const fileLink = explicitHeader.querySelector("button");
  if (fileLink === null) return;
  if (chip === null || chip.isConnected !== true) {
    chip = document.createElement("span");
    chip.className = "did-read-range";
    chip.setAttribute(CHIP_ATTR, "true");
    fileLink.insertAdjacentElement("afterend", chip);
  }
  if (chip.textContent !== label) chip.textContent = label;
  if (chip.title !== label) chip.title = label;
  const expanded = explicitHeader.getAttribute("aria-expanded") === "true";
  if (chip.hidden !== expanded) chip.hidden = expanded;
}
function isReadRelevant(node) {
  if (node === null || node === void 0 || node.nodeType !== 1) return false;
  if (typeof node.matches === "function" && node.matches('[data-tool="read"]')) return true;
  return typeof node.querySelector === "function" && node.querySelector('[data-tool="read"]') !== null;
}
function startReadRangeChips(t) {
  if (typeof document === "undefined" || typeof MutationObserver !== "function") return () => {
  };
  let scheduled = false;
  let frame = null;
  const scan = () => {
    scheduled = false;
    frame = null;
    for (const row of document.querySelectorAll('[data-tool="read"]')) syncReadRow(row, t);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(scan) : setTimeout(scan, 16);
  };
  schedule();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        const row = typeof record.target.closest === "function" ? record.target.closest('[data-tool="read"]') : null;
        if (row !== null) {
          schedule();
          return;
        }
        continue;
      }
      for (const node of record.addedNodes) {
        if (isReadRelevant(node)) {
          schedule();
          return;
        }
      }
      for (const node of record.removedNodes) {
        if (isReadRelevant(node)) {
          schedule();
          return;
        }
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-expanded"] });
  return () => {
    observer.disconnect();
    if (frame !== null) {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
    }
    for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) chip.remove();
  };
}

// src/client/project.js
var VERSION = "1.2.6";
var AUTHOR = "Him666233";
var AUTHOR_URL = "https://github.com/Him666233";
var REPO_URL = "https://github.com/Him666233/dsh-inline-diff";

// src/client/settings-ui.jsx
var import_react4 = require("react");
var import_react_dom2 = require("react-dom");
var import_jsx_runtime4 = require("react/jsx-runtime");
var modalOpen = false;
var modalListeners = /* @__PURE__ */ new Set();
function openSettingsModal() {
  if (modalOpen) return;
  modalOpen = true;
  for (const listener of modalListeners) listener();
}
function closeSettingsModal() {
  if (!modalOpen) return;
  modalOpen = false;
  for (const listener of modalListeners) listener();
}
function subscribeModal(listener) {
  modalListeners.add(listener);
  return () => modalListeners.delete(listener);
}
function useModalOpen() {
  return (0, import_react4.useSyncExternalStore)(subscribeModal, () => modalOpen, () => modalOpen);
}
function useSettings() {
  return (0, import_react4.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}
var languagesCache;
function supportedLanguageList() {
  if (languagesCache === void 0) {
    try {
      const list = supportedLanguages();
      languagesCache = Array.isArray(list) ? list : [];
    } catch {
      languagesCache = [];
    }
  }
  return languagesCache;
}
function Segmented({ ariaLabel, value, options, disabled, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-seg", role: "radiogroup", "aria-label": ariaLabel, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "button",
    {
      type: "button",
      role: "radio",
      "aria-checked": value === option.value,
      className: "did-seg-option",
      "data-active": value === option.value ? "true" : "false",
      disabled,
      onClick: () => onChange(option.value),
      children: option.label
    },
    option.value
  )) });
}
function ToneSelect({ label, value, options, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "did-tone", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-tone-label", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("select", { className: "did-select", value, onChange: (event) => onChange(event.target.value), children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: option.value, children: option.label }, option.value)) })
  ] });
}
function shellToneOptions(t) {
  return [
    { value: "auto", label: t("settings.toneAutoShell") },
    { value: "light", label: t("settings.toneLight") },
    { value: "dark", label: t("settings.toneDark") }
  ];
}
function innerToneOptions(t) {
  return [
    { value: "auto", label: t("settings.toneAutoInner") },
    { value: "light", label: t("settings.toneLight") },
    { value: "dark", label: t("settings.toneDark") },
    { value: "same", label: t("settings.toneSameShell") }
  ];
}
function SlidersIcon({ size = 15 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { viewBox: "0 0 16 16", width: size, height: size, fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "path",
      {
        d: "M2 4h6M11.5 4H14M2 8h2.5M8 8h6M2 12h7M12.5 12H14",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "9.75", cy: "4", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "6.25", cy: "8", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "10.75", cy: "12", r: "1.6", stroke: "currentColor", strokeWidth: "1.4" })
  ] });
}
function SettingRow({ label, description, children, extra }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-setting", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-setting-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-label", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-desc", children: description }),
      extra === void 0 ? null : extra
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-control", children })
  ] });
}
function SettingsCloseButton({ onClose, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "did-settings-close", onClick: onClose, "aria-label": t("close"), title: t("close"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) });
}
function SupportedLanguages({ t, languages }) {
  const [open, setOpen] = (0, import_react4.useState)(false);
  const detailsRef = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    const node = detailsRef.current;
    if (node === null) return void 0;
    const onToggle = () => setOpen(node.open);
    setOpen(node.open);
    node.addEventListener("toggle", onToggle);
    return () => node.removeEventListener("toggle", onToggle);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("details", { className: "did-langs-details", ref: detailsRef, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("summary", { children: [
      t("settings.supportedLanguages"),
      " (",
      languages.length,
      ")"
    ] }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-langs", children: languages.map((language) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-lang", "data-variant": "full", children: language.label }, language.id)) }) : null
  ] });
}
function SettingsPanel({ t, onClose }) {
  const settings = useSettings();
  const languageList = supportedLanguageList();
  const [dsmMode, setDsmMode] = (0, import_react4.useState)(void 0);
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)("");
  (0, import_react4.useEffect)(() => {
    setDsmMode(currentTranscriptMode());
  }, [settings.transcript]);
  const chooseTranscript = async (mode) => {
    setBusy(true);
    setError("");
    try {
      await setTranscriptPreference(mode);
      setDsmMode(currentTranscriptMode());
    } catch (reason) {
      setError(String(reason?.message ?? reason));
    } finally {
      setBusy(false);
    }
  };
  const doReset = async () => {
    setBusy(true);
    setError("");
    const previousToolCalls = settings.toolCalls;
    try {
      await resetSettings();
      setDsmMode(currentTranscriptMode());
      if (getSettings().toolCalls !== previousToolCalls) window.setTimeout(() => window.location.reload(), 180);
    } catch (reason) {
      setError(String(reason?.message ?? reason));
    } finally {
      setBusy(false);
    }
  };
  const transcriptNote = settings.transcript === "enhanced" ? t("settings.transcriptEnhancedNote") : t("settings.transcriptNativeNote");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-headtext", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-title", children: t("settings.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-sub", children: t("settings.description") })
      ] }),
      onClose === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsCloseButton, { onClose, t })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        SettingRow,
        {
          label: t("settings.fileCards"),
          description: t("settings.fileCardsDesc"),
          extra: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-tones", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.shellTone"), value: settings.fileShellTone, onChange: (value) => updateSettings({ fileShellTone: value }), options: shellToneOptions(t) }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.innerTone"), value: settings.fileInnerTone, onChange: (value) => updateSettings({ fileInnerTone: value }), options: innerToneOptions(t) })
          ] }),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Segmented,
            {
              ariaLabel: t("settings.fileCards"),
              value: settings.fileCards,
              onChange: (value) => updateSettings({ fileCards: value }),
              options: [
                { value: "enhanced", label: t("settings.styleEnhanced") },
                { value: "native", label: t("settings.styleNative") }
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        SettingRow,
        {
          label: t("settings.syntax"),
          description: t("settings.syntaxDesc"),
          extra: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-desc", children: t("settings.syntaxToggleNote") }),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Segmented,
            {
              ariaLabel: t("settings.syntax"),
              value: settings.syntaxHighlight === false ? "off" : "on",
              onChange: (value) => updateSettings({ syntaxHighlight: value === "on" }),
              options: [
                { value: "on", label: t("settings.syntaxOn") },
                { value: "off", label: t("settings.syntaxOff") }
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.languageBadge"), description: t("settings.languageBadgeDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.languageBadge"),
          value: settings.languageBadge,
          onChange: (value) => updateSettings({ languageBadge: value }),
          options: [
            { value: "short", label: t("settings.badgeShort") },
            { value: "full", label: t("settings.badgeFull") },
            { value: "hidden", label: t("settings.badgeHidden") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.unknownLanguage"), description: t("settings.unknownLanguageDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.unknownLanguage"),
          value: settings.unknownLanguage,
          onChange: (value) => updateSettings({ unknownLanguage: value }),
          options: [
            { value: "show", label: t("settings.unknownShow") },
            { value: "hidden", label: t("settings.unknownHidden") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.syntaxEmphasis"), description: t("settings.syntaxEmphasisDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.syntaxEmphasis"),
          value: settings.syntaxEmphasis,
          onChange: (value) => updateSettings({ syntaxEmphasis: value }),
          options: [
            { value: "on", label: t("settings.emphasisOn") },
            { value: "off", label: t("settings.emphasisOff") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-note", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: t("settings.supportedLanguagesNote", { n: languageList.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SupportedLanguages, { t, languages: languageList })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        SettingRow,
        {
          label: t("settings.shellRows"),
          description: t("settings.shellRowsDesc"),
          extra: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-tones", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.shellTone"), value: settings.shellShellTone, onChange: (value) => updateSettings({ shellShellTone: value }), options: shellToneOptions(t) }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.innerTone"), value: settings.shellInnerTone, onChange: (value) => updateSettings({ shellInnerTone: value }), options: innerToneOptions(t) })
          ] }),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Segmented,
            {
              ariaLabel: t("settings.shellRows"),
              value: settings.shellRows,
              onChange: (value) => updateSettings({ shellRows: value }),
              options: [
                { value: "enhanced", label: t("settings.styleEnhanced") },
                { value: "native", label: t("settings.styleNative") }
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        SettingRow,
        {
          label: t("settings.toolCalls"),
          description: t("settings.toolCallsDesc"),
          extra: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-tones", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.shellTone"), value: settings.toolShellTone, onChange: (value) => updateSettings({ toolShellTone: value }), options: shellToneOptions(t) }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToneSelect, { label: t("settings.innerTone"), value: settings.toolInnerTone, onChange: (value) => updateSettings({ toolInnerTone: value }), options: innerToneOptions(t) })
          ] }),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Segmented,
            {
              ariaLabel: t("settings.toolCalls"),
              value: settings.toolCalls,
              onChange: (value) => {
                if (value === settings.toolCalls) return;
                updateSettings({ toolCalls: value });
                if (value === "enhanced" && settings.transcript === "native") {
                  setTranscriptPreference("enhanced").catch(() => {
                  });
                }
              },
              options: [
                { value: "enhanced", label: t("settings.styleEnhanced") },
                { value: "native", label: t("settings.styleNative") }
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.transcript"), description: transcriptNote, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.transcript"),
          value: settings.transcript,
          disabled: busy,
          onChange: chooseTranscript,
          options: [
            { value: "enhanced", label: t("settings.flat") },
            { value: "native", label: t("settings.styleNative") }
          ]
        }
      ) }),
      settings.toolCalls === "enhanced" && settings.transcript === "native" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.toolCallsNeedsFlat") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.subagentNote") }),
      dsmMode !== void 0 && settings.transcript === "enhanced" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("settings.dsmCurrent", { mode: dsmMode }) }) : null,
      error !== "" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-error", children: error }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "did-settings-reset", disabled: busy, onClick: doReset, children: t("settings.reset") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-settings-grow" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("a", { className: "did-settings-author", href: AUTHOR_URL, target: "_blank", rel: "noreferrer", title: AUTHOR_URL, children: AUTHOR }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("a", { className: "did-settings-author", href: REPO_URL, target: "_blank", rel: "noreferrer", title: REPO_URL, children: "GitHub" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "did-settings-hint", children: [
        "v",
        VERSION,
        " · ",
        busy ? t("settings.saving") : t("settings.live")
      ] })
    ] })
  ] });
}
function SettingsSection({ t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-page", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t }) });
}
function SettingsLauncher({ wide, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      className: "did-launcher",
      onClick: openSettingsModal,
      title: t("settings.title"),
      "aria-label": t("settings.title"),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SlidersIcon, {}),
        wide ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-launcher-label", children: t("settings.short") }) : null
      ]
    }
  );
}
function SettingsModal({ t }) {
  const open = useModalOpen();
  const [host, setHost] = (0, import_react4.useState)(null);
  (0, import_react4.useEffect)(() => {
    setHost(document.body);
  }, []);
  (0, import_react4.useEffect)(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeSettingsModal();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open]);
  if (!open) return null;
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react4.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-overlay", onPointerDown: closeSettingsModal, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("settings.title"), onPointerDown: (event) => event.stopPropagation(), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-headtext", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-title", children: t("settings.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-sub", children: t("settings.description") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsCloseButton, { onClose: closeSettingsModal, t })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t, onClose: closeSettingsModal }) })
  ] }) }) });
  return host === null ? overlay : (0, import_react_dom2.createPortal)(overlay, host);
}

// src/client/index.jsx
var inject = ["slots", "locale", "configForms"];
var INLINE_DIFF_KEYS = MUTATION_TOOLS;
var ENHANCED_SHELL_KEYS = ["bash", "pwsh", "win_bash"];
var VIEW_PRIORITY = -100;
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dicts), "dsh-inline-diff: dictionaries");
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.dshPlugin = "inline-diff";
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, "dsh-inline-diff: stylesheet");
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.dshPlugin = "inline-diff-syntax";
    style.textContent = SYNTAX_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, "dsh-inline-diff: syntax stylesheet");
  const t = ctx.locale.bind(NS);
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`);
  ctx.effect(() => startReadRangeChips(t), "dsh-inline-diff: read range chips");
  initSettings(ctx.configForms);
  ctx.effect(() => {
    const stopAppearance = startAppearanceTracking();
    return () => {
      stopAppearance();
      if (typeof document !== "undefined") {
        delete document.documentElement.dataset.dshInlineDiffAppearance;
        if (document.body !== null) delete document.body.dataset.dshInlineDiffAppearance;
      }
    };
  }, "dsh-inline-diff: appearance");
  ctx.slots.inject("tool.call.toolview", () => {
    let disposers = [];
    let signature = "";
    const clear = () => {
      for (const dispose of disposers) dispose();
      disposers = [];
    };
    const sync = () => {
      const settings = getSettings();
      const next = `${settings.fileCards}|${settings.shellRows}|${settings.toolCalls}`;
      if (next === signature) return;
      signature = next;
      clear();
      if (settings.fileCards === "enhanced") {
        for (const key of INLINE_DIFF_KEYS) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: VIEW_PRIORITY,
            locale: NS
          }, InlineDiffCard));
        }
      }
      if (settings.shellRows === "enhanced") {
        for (const key of ENHANCED_SHELL_KEYS) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: VIEW_PRIORITY,
            locale: NS
          }, EnhancedShellCard));
        }
      }
      if (settings.toolCalls === "enhanced") {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS, ...ENHANCED_SEARCH_WEB_KEYS]) {
          disposers.push(ctx.slots.register({
            name: "tool.call.toolview",
            key,
            priority: VIEW_PRIORITY,
            locale: NS
          }, EnhancedExpandedTool));
        }
      }
    };
    const unsubscribe = subscribeSettings(sync);
    sync();
    return () => {
      unsubscribe();
      clear();
    };
  });
  ctx.slots.inject("shell.overlay", function* () {
    yield ctx.slots.register({
      name: "shell.overlay",
      id: "inline-diff.modal",
      order: 60,
      locale: NS
    }, DiffModal);
    yield ctx.slots.register({
      name: "shell.overlay",
      id: "inline-diff.settings",
      order: 61,
      locale: NS
    }, SettingsModal);
  });
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "inline-diff",
    order: 40,
    label: () => t("settings.nav"),
    locale: NS
  }, SettingsSection));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "inline-diff.settings",
    order: 40,
    label: () => t("settings.short"),
    locale: NS
  }, SettingsLauncher));
}
		return module.exports;
	}
});
