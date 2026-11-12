window.__ModuleLoader__.load({
	id: "@him666233/dsh-inline-diff",
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
var import_react7 = require("react");

// src/client/enhanced-shell.jsx
var import_react4 = require("react");

// src/client/diff.js
var CONTEXT_LINES = 3;
var ALIGN_MAX_SIDE_LINES = 4e3;
var ALIGN_MAX_CELLS = 25e5;
var INLINE_ROW_CAP = 42;
var FULL_VIEW_ROW_CAP = 4e3;
var MAX_MATERIALIZED_LINES = 2e5;
var MAX_SINGLE_LINE_CHARS = 1e6;
function measureTextBudget(text) {
  if (typeof text !== "string" || text === "") return { lines: 0, maxLineLength: 0 };
  let lines = 1;
  let current = 0;
  let maxLineLength = 0;
  for (let index = 0; index < text.length; index++) {
    if (text.charCodeAt(index) === 10) {
      if (current > maxLineLength) maxLineLength = current;
      current = 0;
      lines++;
    } else {
      current++;
    }
  }
  if (text.charCodeAt(text.length - 1) === 10) {
    lines--;
  } else if (current > maxLineLength) {
    maxLineLength = current;
  }
  return { lines, maxLineLength };
}
function exceedsMaterializationBudget(metrics) {
  if (!Array.isArray(metrics)) return false;
  let lines = 0;
  let maxLineLength = 0;
  for (const metric of metrics) {
    if (metric === null || typeof metric !== "object") continue;
    if (Number.isFinite(metric.lines)) lines += metric.lines;
    if (Number.isFinite(metric.maxLineLength) && metric.maxLineLength > maxLineLength) maxLineLength = metric.maxLineLength;
  }
  return lines > MAX_MATERIALIZED_LINES || maxLineLength > MAX_SINGLE_LINE_CHARS;
}
function truncatedTextModel(beforeText, afterText, oldMetric, newMetric) {
  return {
    rows: [],
    hunks: [],
    added: 0,
    removed: 0,
    oldLineCount: oldMetric.lines,
    newLineCount: newMetric.lines,
    coarse: true,
    truncated: true,
    hasNumbers: true,
    beforeText: beforeText ?? "",
    afterText: afterText ?? "",
    beforeLineCount: oldMetric.lines,
    afterLineCount: newMetric.lines
  };
}
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
  if (needle.length * fileLines.length > 5e6) return -1;
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
          // 未修改带的行号位移：正是标注所承诺的“旧 Lx 现在读作新 Ly”。
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
var MOVE_MAX_CANDIDATE_PAIRS = 25e4;
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
  if (deleted.length * added.length > MOVE_MAX_CANDIDATE_PAIRS) return 0;
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
  const oldMetric = measureTextBudget(beforeText);
  const newMetric = measureTextBudget(afterText);
  if (exceedsMaterializationBudget([oldMetric, newMetric])) {
    return truncatedTextModel(beforeText, afterText, oldMetric, newMetric);
  }
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
  const oldMetric = measureTextBudget(oldText);
  const newMetric = measureTextBudget(newText);
  if (exceedsMaterializationBudget([oldMetric, newMetric])) {
    return {
      rows: [],
      hunks: [],
      added: 0,
      removed: 0,
      oldLineCount: oldMetric.lines,
      newLineCount: newMetric.lines,
      hasNumbers: false,
      fragment: true,
      truncated: true,
      beforeText: oldText ?? "",
      afterText: newText ?? ""
    };
  }
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
  let metaLines = 0;
  let metaMaxLine = 0;
  for (const diff2 of Array.isArray(diffs) ? diffs : []) {
    if (diff2 === null || typeof diff2 !== "object") continue;
    const oldMetric = measureTextBudget(diff2.oldText ?? "");
    const newMetric = measureTextBudget(diff2.newText);
    metaLines += oldMetric.lines + newMetric.lines;
    if (oldMetric.maxLineLength > metaMaxLine) metaMaxLine = oldMetric.maxLineLength;
    if (newMetric.maxLineLength > metaMaxLine) metaMaxLine = newMetric.maxLineLength;
  }
  if (metaLines > MAX_MATERIALIZED_LINES || metaMaxLine > MAX_SINGLE_LINE_CHARS) {
    return {
      rows: [],
      hunks: [],
      added: 0,
      removed: 0,
      oldLineCount: null,
      newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
      hasNumbers: false,
      source: "meta",
      truncated: true,
      beforeText: null,
      afterText: null
    };
  }
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
function firstLine(text) {
  if (typeof text !== "string" || text === "") return "";
  const newline = text.indexOf("\n");
  return newline === -1 ? text : text.slice(0, newline);
}
function errorReason(info) {
  if (info === null || typeof info !== "object") return "";
  if (typeof info.reason === "string") return info.reason;
  if (typeof info.code === "string") return info.code;
  if (typeof info.name === "string") return info.name;
  return "";
}
function contentText(call2, imageMarker) {
  const parts = [];
  const blocks = call2 !== null && typeof call2 === "object" && Array.isArray(call2.content) ? call2.content : [];
  for (const part of blocks) {
    if (part === null || typeof part !== "object") continue;
    if (part.type === "text" && typeof part.text === "string") parts.push(part.text);
    else if (part.type === "image" && typeof imageMarker === "string") parts.push(imageMarker);
    else if (part.type !== void 0) parts.push(JSON.stringify(part, null, 2));
  }
  if (parts.length === 0) {
    const reason = errorReason(call2 !== null && typeof call2 === "object" ? call2.error : void 0);
    if (reason !== "") parts.push(reason);
  }
  return parts.join("\n");
}
function stateKeyOf(status) {
  if (status === "preparing") return "state.preparing";
  if (status === "running") return "state.running";
  if (status === "error") return "state.error";
  if (status === "stopped") return "state.stopped";
  return null;
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
  if (parts.length === 0) {
    const reason = errorReason(call2.error);
    if (reason !== "") parts.push(reason);
  }
  const text = parts.join("\n").trim();
  return text === "" ? "" : firstLine(text);
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
  const oldMetric = measureTextBudget(beforeText);
  const newMetric = measureTextBudget(afterText);
  return oldMetric.lines > ALIGN_MAX_SIDE_LINES || newMetric.lines > ALIGN_MAX_SIDE_LINES || oldMetric.lines * newMetric.lines > ALIGN_MAX_CELLS || exceedsMaterializationBudget([oldMetric, newMetric]);
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
      const oldMetric = measureTextBudget(before ?? "");
      const newMetric = measureTextBudget(after);
      const overMaterialization = exceedsMaterializationBudget([oldMetric, newMetric]);
      if (before !== null && before === after) {
        return { ...base, status: "nochange", operation, source: "snapshot", diff: diffText(before, after) };
      }
      if (overMaterialization || before !== null && exceedsAlignBudget(before, after)) {
        const oldCount = oldMetric.lines;
        const newCount = newMetric.lines;
        const diffs2 = narrowDiffs(call2.meta?.diffs);
        if (diffs2 !== null) {
          const fileLines = overMaterialization ? null : contentLines(after);
          const located = diffFromMeta(diffs2, fileLines);
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
        const coarse = diffText(before ?? "", after);
        return {
          ...base,
          status: "ok",
          operation,
          source: "snapshot",
          notice: coarse.truncated === true ? { kind: "huge", old: oldCount, new: newCount } : coarse.coarse ? { kind: "coarse", old: oldCount, new: newCount } : { kind: "huge", old: oldCount, new: newCount },
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
      const lines = typeof fileText === "string" && !exceedsMaterializationBudget([measureTextBudget(fileText)]) ? contentLines(fileText) : null;
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
        if (created.truncated === true) {
          return {
            ...base,
            status: "ok",
            operation: "create",
            source: "args",
            notice: { kind: "huge", old: 0, new: created.newLineCount },
            diff: created
          };
        }
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

// src/client/motion.js
var PULSE_DURATION_MS = 1200;
function pulsePhase(key) {
  const text = typeof key === "string" ? key : key === void 0 || key === null ? "" : String(key);
  if (text === "") return "0ms";
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = hash * 31 + text.charCodeAt(index) >>> 0;
  }
  return `${-(hash % PULSE_DURATION_MS)}ms`;
}
var PULSE_ANIMATION_NAMES = Object.freeze(["dsh-inline-diff-pulse", "dsh-inline-diff-bar-pulse"]);
function isPulseAnimation(animation) {
  const name = animation?.animationName;
  return typeof name === "string" && PULSE_ANIMATION_NAMES.includes(name);
}
function syncPulseAnimations(root) {
  if (root === null || root === void 0 || typeof root.getAnimations !== "function") return false;
  let animations;
  try {
    animations = root.getAnimations({ subtree: true });
  } catch {
    return false;
  }
  const pulses = animations.filter((animation) => isPulseAnimation(animation) && typeof animation.startTime === "number");
  if (pulses.length < 2) return false;
  let base = Infinity;
  for (const animation of pulses) if (animation.startTime < base) base = animation.startTime;
  if (!Number.isFinite(base)) return false;
  let aligned = false;
  for (const animation of pulses) {
    if (animation.startTime === base) continue;
    try {
      animation.startTime = base;
      aligned = true;
    } catch {
    }
  }
  return aligned || pulses.length >= 2;
}
function isLiveToolState(state2) {
  return state2 === "running" || state2 === "preparing";
}

// src/client/surfaces.js
var EFFECT_NATIVE = "native";
var EFFECT_GLASS = "glass";
var EFFECT_LIQUID = "liquid";
var EFFECTS = Object.freeze([EFFECT_NATIVE, EFFECT_GLASS, EFFECT_LIQUID]);
var LIQUID_CLEAR = "clear";
var LIQUID_FROSTED = "frosted";
var LIQUID_MODES = Object.freeze([LIQUID_CLEAR, LIQUID_FROSTED]);
var FX_LIMITS = Object.freeze({
  opacityMin: 0.05,
  opacityMax: 1,
  opacityStep: 0.05,
  blurMin: 0,
  blurMax: 40,
  blurStep: 1
});
var DEFAULT_EFFECT = Object.freeze({
  effect: EFFECT_NATIVE,
  opacity: 0.55,
  blur: 14,
  mode: LIQUID_FROSTED
});
var SURFACES = Object.freeze([
  { id: "fileCardHeader", labelKey: "fx.surface.fileCardHeader", descKey: "fx.surface.fileCardHeaderDesc" },
  { id: "fileCardBody", labelKey: "fx.surface.fileCardBody", descKey: "fx.surface.fileCardBodyDesc" },
  { id: "diffModal", labelKey: "fx.surface.diffModal", descKey: "fx.surface.diffModalDesc" },
  { id: "commandHeader", labelKey: "fx.surface.commandHeader", descKey: "fx.surface.commandHeaderDesc" },
  { id: "commandIO", labelKey: "fx.surface.commandIO", descKey: "fx.surface.commandIODesc" },
  { id: "toolHeader", labelKey: "fx.surface.toolHeader", descKey: "fx.surface.toolHeaderDesc" },
  { id: "toolIO", labelKey: "fx.surface.toolIO", descKey: "fx.surface.toolIODesc" },
  { id: "readRangeChip", labelKey: "fx.surface.readRangeChip", descKey: "fx.surface.readRangeChipDesc" },
  { id: "settingsPanel", labelKey: "fx.surface.settingsPanel", descKey: "fx.surface.settingsPanelDesc" }
]);
var SURFACE_IDS = Object.freeze(SURFACES.map((surface) => surface.id));
function clampNumber(value, min, max, fallback) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  if (number < min) return min;
  if (number > max) return max;
  return number;
}
function normalizeSurfaceEffect(value) {
  const source3 = value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  const effect = EFFECTS.includes(source3.effect) ? source3.effect : DEFAULT_EFFECT.effect;
  const mode = LIQUID_MODES.includes(source3.mode) ? source3.mode : DEFAULT_EFFECT.mode;
  const opacity = clampNumber(source3.opacity, FX_LIMITS.opacityMin, FX_LIMITS.opacityMax, DEFAULT_EFFECT.opacity);
  const blur = clampNumber(source3.blur, FX_LIMITS.blurMin, FX_LIMITS.blurMax, DEFAULT_EFFECT.blur);
  return { effect, opacity, blur, mode };
}
function normalizeEffects(value) {
  const source3 = value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  const next = {};
  for (const id of SURFACE_IDS) next[id] = normalizeSurfaceEffect(source3[id]);
  return next;
}
function defaultEffects() {
  return normalizeEffects(void 0);
}
function effectOf(settings, surfaceId) {
  const effects = settings !== null && settings !== void 0 ? settings.effects : void 0;
  const raw = effects !== null && effects !== void 0 ? effects[surfaceId] : void 0;
  if (raw === void 0) return DEFAULT_EFFECT;
  return normalizeSurfaceEffect(raw);
}
function surfaceProps(settings, surfaceId) {
  const config = effectOf(settings, surfaceId);
  const props = {
    "data-fx": config.effect,
    "data-fx-surface": surfaceId,
    style: {
      "--did-fx-alpha": String(config.opacity),
      "--did-fx-blur": `${config.blur}px`
    }
  };
  if (config.effect === EFFECT_LIQUID) props["data-liquid-mode"] = config.mode;
  return props;
}
function fxRootProps(settings, surfaceIds) {
  for (const id of surfaceIds) {
    if (effectOf(settings, id).effect !== EFFECT_NATIVE) return { "data-fx-root": "true" };
  }
  return {};
}
function surfaceDomValues(settings, surfaceId) {
  return effectOf(settings, surfaceId);
}
function backdropProxyProps(settings, surfaceId) {
  const config = effectOf(settings, surfaceId);
  if (config.effect === EFFECT_NATIVE) return {};
  const props = {
    "data-fx-backdrop": config.effect,
    style: { "--did-fx-blur": `${config.blur}px` }
  };
  if (config.effect === EFFECT_LIQUID) props["data-liquid-mode"] = config.mode;
  return props;
}

// src/client/use-pulse-sync.js
var import_react = require("react");
var LATE_SYNC_MS = 320;
function usePulseSync() {
  const ref = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const root = ref.current;
    if (root === null) return void 0;
    syncPulseAnimations(root);
    let frame = null;
    let timer = null;
    const run = () => {
      syncPulseAnimations(root);
    };
    if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(run);
    else timer = setTimeout(run, 16);
    const late = setTimeout(run, LATE_SYNC_MS);
    return () => {
      if (frame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      if (timer !== null) clearTimeout(timer);
      clearTimeout(late);
    };
  });
  return ref;
}

// src/client/enhanced-tools.jsx
var import_react3 = require("react");

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

// src/client/use-settings.js
var import_react2 = require("react");

// src/client/locales.js
var NS = "inline-diff";
var SUPPORTED_LANGUAGES = Object.freeze(["zh", "en"]);
var LANGUAGE_SETTINGS = Object.freeze(["zh", "en", "auto"]);
var DEFAULT_LANGUAGE = "zh";
var DEFAULT_LANGUAGE_SETTING = "auto";
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
  "noticeTruncated": "文件过大，已启用截断展示：行数与增删统计仍准确，逐行内容与全文对照不可用。",
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
  // 单行超长（如 minified 文件）时的展示截断 title 提示：n 为该行总字符数。
  "lineTruncated": "该行共 {n} 个字符，已截断显示",
  "emptyFile": "（空文件）",
  "settings.nav": "内联差异",
  "settings.short": "差异样式",
  "settings.title": "内联差异 · 显示样式",
  "settings.description": "只影响 Web 界面的展示方式，不改变会话记录、模型输入或工具执行。「展开风格」采用平板、透明的输出效果：文件修改显示逐次内联差异，命令与其它工具默认展开 IN/OUT；「DSH 原生」保持官方样式。",
  // 插件级语言选择（1.3.0）。这一行的文案本身也按“当前插件语言”渲染，
  // 因此切换语言后立刻就能看出效果。
  "settings.language": "语言",
  "settings.languageDesc": "插件界面的显示语言。默认「跟随 DSH」：DSH 为中文时显示中文，其他语言时显示英文；也可以固定中文/英文。切换后立即生效，无需刷新。",
  "settings.languageZh": "中文",
  "settings.languageEn": "English",
  "settings.languageAuto": "跟随 DSH（默认）",
  // 两个设置界面（设置页 + 设置弹窗）顶部展示的原创声明文案。
  "originality.title": "原创声明",
  "originality.body": "本项目（DSH Inline Diff）完全原创，与 {repo} 以及任何其他同名插件或仓库均无任何关联。部分功能雷同纯属巧合；实现方式与代码效果完全不同；开发时没有参考任何同类插件；本项目不是对方的衍生作品或复刻作品。",
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
  "update.title": "版本与更新",
  "update.current": "当前版本 v{version}",
  "update.latest": "最新",
  "update.installed": "当前",
  "update.deprecated": "已废弃",
  "update.unavailable": "不可安装",
  "update.check": "检查更新",
  "update.checking": "正在查询…",
  "update.versions": "版本列表",
  "update.selectVersion": "选择版本",
  "update.updateTo": "更新到 v{version}",
  "update.rollbackTo": "回退到 v{version}",
  "update.reinstall": "重新安装 v{version}",
  "update.installing": "正在安装…",
  "update.restartHint": "安装后需要重启 DSH 才会生效",
  "update.manualHint": "当前环境需手动安装（见下方命令）",
  "update.manualCommandHint": "请先完全退出 DSH，然后在命令行执行（profile：{profile}）",
  "update.idleHint": "点击「检查更新」查看 npm 上的全部版本",
  "update.installOk": "已安装 v{version}，重启 DSH 后生效",
  "update.installFailed": "安装失败（{code}）",
  "update.log": "安装日志",
  "update.errorNetwork": "无法获取版本信息（网络或 registry 不可用）",
  "settings.saving": "正在保存…",
  "settings.live": "设置自动生效",
  // ---- 逐表面外观效果（1.4.0）----
  // 设置面板末尾的「外观效果」折叠分组。表面 id → 文案键的映射在 surfaces.js
  // 的 SURFACES 里（labelKey / descKey），键名必须与那边完全一致。
  "fx.sectionTitle": "外观效果",
  "fx.sectionDesc": "为每个可视表面单独选择材质。原生保持现有外观（默认）；磨砂玻璃为半透明高斯模糊材质，可调透明度与模糊；液态玻璃为 iOS 26 风格，另有「完全通透 / 带一点模糊」两种液态模式。改动即时保存并生效。",
  "fx.note": "玻璃效果依赖浏览器的 backdrop-filter，现代 Chromium / Safari 可用；不支持时会自动退回半透明底色，文字仍然可读。「恢复默认」会同时把所有表面恢复为原生。",
  // 折叠标题 = fx.sectionTitle + 下面两条（键里自带本语言习惯的括号，标题因此
  // 在两种语言下都是自然写法：「外观效果（3 个表面已启用）」）。
  "fx.summaryCount": "（{n} 个表面已启用）",
  "fx.summaryNone": "（全部原生）",
  "fx.effect": "效果",
  "fx.effectNative": "原生",
  "fx.effectGlass": "磨砂玻璃",
  "fx.effectLiquid": "液态玻璃",
  "fx.effectNativeDesc": "保持当前外观，不做任何材质处理（默认）。",
  "fx.effectGlassDesc": "半透明磨砂玻璃：背景高斯模糊 + 细高光描边，透明度与模糊可调。",
  "fx.effectLiquidDesc": "液态玻璃：更通透的折射观感与边缘高光，可选「完全通透」或「带一点模糊」。",
  "fx.opacity": "透明度",
  "fx.blur": "模糊",
  "fx.liquidMode": "液态模式",
  "fx.liquidClear": "完全通透",
  "fx.liquidFrosted": "带一点模糊",
  "fx.surface.fileCardHeader": "文件卡片头部",
  "fx.surface.fileCardHeaderDesc": "文件修改卡片顶部可展开 / 收起的一行。",
  "fx.surface.fileCardBody": "文件卡片内容区",
  "fx.surface.fileCardBodyDesc": "文件修改卡片的差异内容与底部状态条。",
  "fx.surface.diffModal": "放大对照弹窗",
  "fx.surface.diffModalDesc": "在卡片上点「放大」后打开的整窗差异对照。",
  "fx.surface.commandHeader": "命令卡片头部",
  "fx.surface.commandHeaderDesc": "bash / pwsh 等命令执行卡片的标题行。",
  "fx.surface.commandIO": "命令 IN/OUT",
  "fx.surface.commandIODesc": "命令卡片的输入与输出面板。",
  "fx.surface.toolHeader": "工具卡片头部",
  "fx.surface.toolHeaderDesc": "其它工具调用卡片的标题行。",
  "fx.surface.toolIO": "工具 IN/OUT",
  "fx.surface.toolIODesc": "其它工具调用卡片的输入与输出面板。",
  "fx.surface.readRangeChip": "读取行范围徽标",
  "fx.surface.readRangeChipDesc": "读取文件时显示行范围的小徽标。",
  "fx.surface.settingsPanel": "设置面板",
  "fx.surface.settingsPanelDesc": "本设置弹窗与设置页的整个面板。",
  "shell.in": "IN",
  "shell.out": "OUT",
  // 命令行退出码 / 信号徽标（[exit code: N] 标记文本由 Host 产生，这里是 UI 文案）。
  "shell.exit": "退出码 {code}",
  "shell.exitNull": "退出码未知",
  "shell.signal": "信号 {name}",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "工具调用",
  "tool.unknownName": "工具",
  "tool.image": "[图片]",
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
  "noticeTruncated": "File is too large — display truncated: line counts and added/removed totals stay accurate; per-line content and the whole-file comparison are unavailable.",
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
  // 单行超长（如 minified 文件）时的展示截断 title 提示（英文）。
  "lineTruncated": "Line has {n} characters; display truncated",
  "emptyFile": "(empty file)",
  "settings.nav": "Inline Diff",
  "settings.short": "Diff style",
  "settings.title": "Inline Diff · Display",
  "settings.description": "Presentation only: session records, model input, and tool execution are unchanged. The expanded style gives flat, transparent output — per-edit inline diffs for file changes and IN/OUT expanded by default for commands and other tools; DSH native keeps the stock presentation.",
  // 插件级语言选择（1.3.0）：英文界面下的同一组选项。
  "settings.language": "Language",
  "settings.languageDesc": "Display language for this plugin. Default “Follow DSH” mirrors the DSH language setting: Chinese shows Chinese and any other language shows English; you can also pin Chinese or English. The switch applies immediately — no reload needed.",
  "settings.languageZh": "中文",
  "settings.languageEn": "English",
  "settings.languageAuto": "Follow DSH (default)",
  // 两个设置界面（设置页 + 设置弹窗）顶部展示的原创声明文案（英文）。
  "originality.title": "Originality",
  "originality.body": "This project (DSH Inline Diff) is a fully original work and has no affiliation with {repo} or with any other plugin or repository of a similar name. Any similarity in functionality is purely coincidental; the implementation and code behavior are entirely different; no reference was made to any such plugin during development; and this project is neither a derivative nor a replica of it.",
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
  "update.title": "Version & updates",
  "update.current": "Current version v{version}",
  "update.latest": "Latest",
  "update.installed": "Installed",
  "update.deprecated": "Deprecated",
  "update.unavailable": "Unavailable",
  "update.check": "Check for updates",
  "update.checking": "Checking…",
  "update.versions": "Version list",
  "update.selectVersion": "Select a version",
  "update.updateTo": "Update to v{version}",
  "update.rollbackTo": "Roll back to v{version}",
  "update.reinstall": "Reinstall v{version}",
  "update.installing": "Installing…",
  "update.restartHint": "Restart DSH after installing to take effect",
  "update.manualHint": "Manual install required here (see command below)",
  "update.manualCommandHint": "Quit DSH completely, then run in a terminal (profile: {profile})",
  "update.idleHint": "Click “Check for updates” to list all npm versions",
  "update.installOk": "Installed v{version}; restart DSH to take effect",
  "update.installFailed": "Install failed ({code})",
  "update.log": "Install log",
  "update.errorNetwork": "Could not load versions (network or registry unavailable)",
  "settings.saving": "Saving…",
  "settings.live": "Settings apply automatically",
  // ---- Per-surface appearance effects (1.4.0) ----
  // Labels/descriptions for the “Appearance effects” group at the end of the
  // settings panel. The surface id → key mapping lives in surfaces.js
  // (SURFACES[].labelKey / descKey) and must stay in sync with these keys.
  "fx.sectionTitle": "Appearance effects",
  "fx.sectionDesc": "Choose a material for each visible surface. Native keeps the current look (default). Frosted glass is a translucent, blurred material with adjustable opacity and blur. Liquid glass follows the iOS 26 look with its own Clear / Slightly frosted liquid modes. Changes save and apply immediately.",
  "fx.note": "Glass effects rely on the browser backdrop-filter, available in modern Chromium / Safari; unsupported browsers fall back to a translucent color so text stays readable. “Reset to defaults” also returns every surface to native.",
  // Collapsible title = fx.sectionTitle + one of these; the brackets live in the
  // translated string so both languages read naturally (“Appearance effects (3
  // surfaces enabled)”).
  "fx.summaryCount": " ({n} surfaces enabled)",
  "fx.summaryNone": " (all native)",
  "fx.effect": "Effect",
  "fx.effectNative": "Native",
  "fx.effectGlass": "Frosted glass",
  "fx.effectLiquid": "Liquid glass",
  "fx.effectNativeDesc": "Keeps the current look with no material treatment (default).",
  "fx.effectGlassDesc": "Translucent frosted glass: a blurred backdrop with a thin highlight edge; opacity and blur are adjustable.",
  "fx.effectLiquidDesc": "Liquid glass: a clearer, refractive look with edge highlights; choose Clear or Slightly frosted.",
  "fx.opacity": "Opacity",
  "fx.blur": "Blur",
  "fx.liquidMode": "Liquid mode",
  "fx.liquidClear": "Clear",
  "fx.liquidFrosted": "Slightly frosted",
  "fx.surface.fileCardHeader": "File card header",
  "fx.surface.fileCardHeaderDesc": "The clickable row at the top of a file-change card.",
  "fx.surface.fileCardBody": "File card body",
  "fx.surface.fileCardBodyDesc": "The diff content and footer status strip of a file-change card.",
  "fx.surface.diffModal": "Comparison dialog",
  "fx.surface.diffModalDesc": "The full-window diff view opened from a card.",
  "fx.surface.commandHeader": "Command card header",
  "fx.surface.commandHeaderDesc": "The title row of a command card (bash, pwsh, …).",
  "fx.surface.commandIO": "Command IN/OUT",
  "fx.surface.commandIODesc": "The input and output panels of a command card.",
  "fx.surface.toolHeader": "Tool card header",
  "fx.surface.toolHeaderDesc": "The title row of other tool-call cards.",
  "fx.surface.toolIO": "Tool IN/OUT",
  "fx.surface.toolIODesc": "The input and output panels of other tool-call cards.",
  "fx.surface.readRangeChip": "Read range chip",
  "fx.surface.readRangeChipDesc": "The small line-range chip shown for file reads.",
  "fx.surface.settingsPanel": "Settings panel",
  "fx.surface.settingsPanelDesc": "The whole settings dialog and settings page.",
  "shell.in": "IN",
  "shell.out": "OUT",
  // 命令行退出码 / 信号徽标（英文）。
  "shell.exit": "exit {code}",
  "shell.exitNull": "exit code unknown",
  "shell.signal": "signal {name}",
  "tool.in": "IN",
  "tool.out": "OUT",
  "tool.fallbackTitle": "Tool call",
  "tool.unknownName": "Tool",
  "tool.image": "[image]",
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

// src/client/settings.js
var STORAGE_KEY = "dsh-inline-diff.settings.v5";
var LEGACY_KEYS = Object.freeze([
  "dsh-inline-diff.settings.v4",
  "dsh-inline-diff.settings.v3",
  "dsh-inline-diff.settings.v2"
]);
var RETIRED_KEYS = Object.freeze(["dsh-inline-diff.settings.v1"]);
var DEFAULTS = {
  /**
   * 插件级界面语言（1.3.0 新增）：
   *   'auto'（默认）跟随 DSH 全局语言（DSH 中文→中文，其它语言→英文）；
   *   'zh' 固定中文；'en' 固定英文。
   * 这是插件自己的显示偏好，与 DSH 的全局 locale 相互独立：客户端文案从
   * src/client/locales.js 取字典，由插件语言选择；宿主渲染的 slot label 在
   * 语言变化时重新注册。
   * 默认值在 1.3.x 之后从固定中文改为 auto；旧存档若从未明确选择过语言，
   * 迁移时也落到 auto（用户曾经明确选过的 zh/en 会保留，见 languageChosen）。
   */
  language: DEFAULT_LANGUAGE_SETTING,
  /**
   * 内部字段：用户是否在设置页明确选择过语言。
   * 旧版本没有该字段，因此无法区分“默认值 zh”和“用户手动选了 zh”；迁移时
   * 把没有该标记的旧 zh 视为“从未选择”→ 迁移到新默认 auto。用户一旦在 UI
   * 里切换语言（updateSettings 收到合法 language），该标记即置 true。
   */
  languageChosen: false,
  /** 'enhanced' = 内联差异卡片；'native' = DSH 原生文件修改行。 */
  fileCards: "enhanced",
  /** 'enhanced' = 平铺展开的 Bash/PowerShell 行；'native' = DSH 原生行。 */
  shellRows: "native",
  /** 'enhanced' = 其它工具调用（通用/详情/搜索/网页）默认展开 IN/OUT；'native' = DSH 折叠行。 */
  toolCalls: "native",
  /** 'enhanced' = 使用 DSH verbose 对话记录（平铺、不折叠）；'native' = 不改动。 */
  transcript: "native",
  /** 每类卡片的外壳配色：'auto'（主题 + 宿主外观）、'light'、'dark'。 */
  fileShellTone: "auto",
  shellShellTone: "auto",
  toolShellTone: "auto",
  /** 每类卡片的内部配色：'auto'（官方浅/深色）、'light'、'dark'、'same'（与外壳一致）。 */
  fileInnerTone: "auto",
  shellInnerTone: "auto",
  toolInnerTone: "auto",
  /**
   * 逐表面外观效果（1.4.0 新增）：
   *   { [surfaceId]: { effect: 'native'|'glass'|'liquid', opacity, blur, mode } }
   * 表面清单与归一化规则在 ./surfaces.js（唯一事实来源）。旧存档（v4 及更早）
   * 没有该字段，迁移后全部为 native，即外观与旧版本完全一致。
   */
  effects: defaultEffects(),
  /** 差异代码的语法高亮开关（语言识别与配色见 languages.js / highlight.js）。 */
  syntaxHighlight: true,
  /** 语言徽章样式：'short' 短代码、'full' 全名、'hidden' 隐藏。 */
  languageBadge: "short",
  /** 识别不到语言时：'show' 显示中性“未知语言”徽章，'hidden' 不显示。 */
  unknownLanguage: "show",
  /** 'on' = 高亮颜色 + 字体强调（关键词加粗、注释斜体）；'off' = 仅颜色。 */
  syntaxEmphasis: "on"
};
var LANGUAGE_BADGE_VALUES = ["short", "full", "hidden"];
var UNKNOWN_LANGUAGE_VALUES = ["show", "hidden"];
var SYNTAX_EMPHASIS_VALUES = ["on", "off"];
var SHELL_TONE_VALUES = ["auto", "light", "dark"];
var INNER_TONE_VALUES = ["auto", "light", "dark", "same"];
var STYLE_VALUES = ["enhanced", "native"];
var MAX_STORED_SETTINGS_CHARS = 65536;
var TRANSCRIPT_VIEW_VALUES = ["compact", "standard", "detailed", "verbose", "normal", "expanded"];
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
function normalizeTranscriptView(value) {
  return typeof value === "string" && TRANSCRIPT_VIEW_VALUES.includes(value) ? value : void 0;
}
function enumGuard(allowed) {
  return (value) => typeof value === "string" && allowed.includes(value) ? value : void 0;
}
var SETTING_VALIDATORS = {
  language: (value) => normalizeEnum(value, LANGUAGE_SETTINGS, DEFAULTS.language),
  fileCards: enumGuard(STYLE_VALUES),
  shellRows: enumGuard(STYLE_VALUES),
  toolCalls: enumGuard(STYLE_VALUES),
  transcript: enumGuard(STYLE_VALUES),
  fileShellTone: enumGuard(SHELL_TONE_VALUES),
  shellShellTone: enumGuard(SHELL_TONE_VALUES),
  toolShellTone: enumGuard(SHELL_TONE_VALUES),
  fileInnerTone: enumGuard(INNER_TONE_VALUES),
  shellInnerTone: enumGuard(INNER_TONE_VALUES),
  toolInnerTone: enumGuard(INNER_TONE_VALUES),
  // 逐表面外观效果：整份对象做归一化（未知表面丢弃、非法字段回退默认），
  // 因此 updateSettings 收到 `{ effects: 任意值 }` 也只会写入合法配置。
  effects: (value) => normalizeEffects(value),
  syntaxHighlight: (value) => typeof value === "boolean" ? value : void 0,
  languageBadge: enumGuard(LANGUAGE_BADGE_VALUES),
  unknownLanguage: enumGuard(UNKNOWN_LANGUAGE_VALUES),
  syntaxEmphasis: enumGuard(SYNTAX_EMPHASIS_VALUES)
};
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
    if (typeof raw !== "string" || raw === "") {
      for (const legacyKey of LEGACY_KEYS) {
        raw = storage.getItem(legacyKey);
        if (typeof raw === "string" && raw !== "") break;
      }
    }
    if (typeof raw !== "string" || raw === "") return { ...DEFAULTS };
    if (raw.length > MAX_STORED_SETTINGS_CHARS) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ...DEFAULTS };
    const next = { ...DEFAULTS };
    const storedLanguage = normalizeEnum(parsed.language, LANGUAGE_SETTINGS, void 0);
    if (parsed.languageChosen === true) {
      next.language = storedLanguage ?? DEFAULTS.language;
      next.languageChosen = true;
    } else if (storedLanguage === "en" || storedLanguage === "auto") {
      next.language = storedLanguage;
      next.languageChosen = true;
    } else {
      next.language = DEFAULTS.language;
      next.languageChosen = false;
    }
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
    next.effects = normalizeEffects(parsed.effects);
    next.syntaxHighlight = normalizeBoolean(parsed.syntaxHighlight, DEFAULTS.syntaxHighlight);
    next.languageBadge = normalizeEnum(parsed.languageBadge, LANGUAGE_BADGE_VALUES, DEFAULTS.languageBadge);
    next.unknownLanguage = normalizeEnum(parsed.unknownLanguage, UNKNOWN_LANGUAGE_VALUES, DEFAULTS.unknownLanguage);
    next.syntaxEmphasis = normalizeEnum(parsed.syntaxEmphasis, SYNTAX_EMPHASIS_VALUES, DEFAULTS.syntaxEmphasis);
    previousTranscript = normalizeTranscriptView(parsed.previousTranscript);
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
    for (const legacyKey of LEGACY_KEYS) globalThis.localStorage?.removeItem(legacyKey);
    for (const retiredKey of RETIRED_KEYS) globalThis.localStorage?.removeItem(retiredKey);
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
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) return;
  const next = {};
  for (const key of Object.keys(patch)) {
    const validate = SETTING_VALIDATORS[key];
    if (typeof validate !== "function") continue;
    const value = validate(patch[key]);
    if (value !== void 0) next[key] = value;
  }
  if (Object.keys(next).length === 0) return;
  if (next.language !== void 0) next.languageChosen = true;
  state = { ...state, ...next };
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
function restorableTranscript(value) {
  const normalized = normalizeTranscriptView(value);
  if (normalized === void 0) return void 0;
  return normalized === "normal" || normalized === "expanded" ? "detailed" : normalized;
}
function rememberPreviousTranscript(current) {
  const restorable = restorableTranscript(current);
  if (restorable !== void 0 && restorable !== "verbose") previousTranscript = restorable;
}
async function setTranscriptPreference(mode) {
  const form = chatForm();
  if (mode === "enhanced") {
    const current2 = form.getSnapshot().value?.transcriptView;
    if (typeof current2 !== "string") previousTranscript = "standard";
    else rememberPreviousTranscript(current2);
    updateSettings({ transcript: "enhanced" });
    await form.set("transcriptView", "verbose");
    return;
  }
  updateSettings({ transcript: "native" });
  const current = form.getSnapshot().value?.transcriptView;
  if (current === "verbose") {
    await form.set("transcriptView", restorableTranscript(previousTranscript) ?? "standard");
  }
}
async function adoptTranscriptPreference() {
  if (state.transcript !== "enhanced") return;
  try {
    if (configFormsRef === void 0) return;
    const form = chatForm();
    const current = form.getSnapshot().value?.transcriptView;
    if (current !== "verbose") {
      if (typeof current !== "string") previousTranscript = "standard";
      else rememberPreviousTranscript(current);
      await form.set("transcriptView", "verbose");
      persist();
    }
  } catch {
  }
}

// src/client/use-settings.js
function useSettingsSnapshot() {
  return (0, import_react2.useSyncExternalStore)(subscribeSettings, getSettings, getSettings);
}

// src/client/enhanced-tools.jsx
var import_jsx_runtime = require("react/jsx-runtime");
function toolLabel(name, t) {
  if (typeof name !== "string" || name === "") return typeof t === "function" ? t("tool.unknownName") : "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name.replace(/[_-]+/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
function wireName(name, t) {
  if (typeof name !== "string" || name === "") return typeof t === "function" ? t("tool.unknownName") : "Tool";
  if (typeof t === "function") {
    const key = `toolTitle.${name}`;
    const translated = t(key);
    if (typeof translated === "string" && translated !== key) return translated;
  }
  return name;
}
function clampSummary(text) {
  const first = typeof text === "string" ? firstLine(text).trim() : "";
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
function kindOf(toolName) {
  if (SHELL_KEY_SET.has(toolName)) return "command";
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
  const imageMarker = typeof t === "function" ? t("tool.image") : "[image]";
  return {
    title: toolLabel(resolvedName, t),
    displayName: wireName(resolvedName, t),
    // 卡片稳定标识：状态点与 IN/OUT 色条据此共享同一个呼吸相位（见 motion.js）。
    callId: call2.callId,
    summary: summaryOf(call2.args, call2),
    badge: badgeOf(call2, t),
    kind: kindOf(resolvedName),
    input: inputText(call2),
    output: call2.settled ? contentText(call2, imageMarker) : "",
    state: state2,
    inputState: sections.input,
    outputState: sections.output,
    // “输入已接受、输出等待中”：显示 OUT 占位，让工具运行时 OUT 自己的品牌色
    // 呼吸条保持可见。
    waitingForOutput: call2.settled !== true && call2.phase !== "preparing"
  };
}
function EnhancedExpandedTool({ block, toolName, t, inspect }) {
  const tone = useSettingsSnapshot();
  const model = (0, import_react3.useMemo)(() => genericModel(block, toolName, t), [block, toolName, t]);
  const [open, setOpen] = (0, import_react3.useState)(true);
  const [enter] = (0, import_react3.useState)(() => isLiveToolState(model.state));
  const waitingRef = (0, import_react3.useRef)(model.waitingForOutput);
  const outputAppeared = (0, import_react3.useRef)(false);
  if (model.output !== "" && waitingRef.current) outputAppeared.current = true;
  waitingRef.current = model.waitingForOutput;
  const pulseRef = usePulseSync();
  const stateLabel = stateKeyOf(model.state);
  const hasBody = model.input !== "" || model.output !== "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-tool enhanced-generic", ref: pulseRef, ...fxRootProps(tone, ["toolHeader", "toolIO"]), "data-variant": "tool", "data-kind": model.kind, "data-state": model.state, "data-tool": toolName, "data-shell-tone": tone.toolShellTone, "data-inner-tone": tone.toolInnerTone, "data-body": hasBody && open ? "true" : "false", "data-enter": enter ? "" : void 0, style: { "--did-pulse-phase": pulsePhase(model.callId) }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-head", ...surfaceProps(tone, "toolHeader"), children: [
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
    open && hasBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-io", ...surfaceProps(tone, "toolIO"), children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", "data-section": "in", "data-state": model.inputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "enhanced-label", children: t("tool.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "enhanced-code", "data-error": model.inputState === "error" ? "" : void 0, children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, "data-appear": outputAppeared.current ? "" : void 0, children: [
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
var SHELL_KEYS = Object.freeze(["bash", "pwsh", "win_bash"]);
var SHELL_KEY_SET = new Set(SHELL_KEYS);
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
function parseExit(text) {
  const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text);
  if (signal !== null) return { output: text.slice(0, signal.index), signal: signal[1], failed: true };
  const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text);
  if (exit !== null) {
    const code = exit[1] === "null" ? null : Number(exit[1]);
    return { output: text.slice(0, exit.index), code, failed: code !== 0 };
  }
  return { output: text, failed: false };
}
function firstLineOf(text) {
  return firstLine(text).trim();
}
function shellModel(block, toolName) {
  const call2 = deriveCall(block);
  const args = call2.args ?? parseArgs(call2.argsRaw) ?? null;
  const command = args !== null && typeof args.command === "string" ? args.command : "";
  const description = args !== null && typeof args.description === "string" ? args.description : "";
  const background = args !== null && args.run_in_background === true;
  const title = call2.name === "pwsh" || toolName === "pwsh" ? "PowerShell" : "Bash";
  const summary = description.trim() !== "" ? firstLineOf(description) : firstLineOf(command);
  const input = command !== "" ? command : typeof call2.argsRaw === "string" ? call2.argsRaw.trim() : "";
  const text = call2.settled ? contentText(call2) : "";
  const exit = call2.settled && text !== "" ? parseExit(text) : { output: text, failed: false };
  const exitInfo = call2.settled && !call2.isError && (exit.signal !== void 0 || exit.code !== void 0 && exit.code !== 0) ? { signal: exit.signal, code: exit.code } : void 0;
  const sections = shellSectionStates(call2, exit.failed === true);
  const stopped = call2.settled && call2.error !== null && call2.error !== void 0 && call2.error.code === "interrupted";
  const state2 = !call2.settled ? call2.phase === "preparing" ? "preparing" : "running" : stopped ? "stopped" : call2.isError || exit.failed ? "error" : "ok";
  return {
    title,
    summary,
    command,
    input,
    description,
    // 卡片稳定标识：状态点与 IN/OUT 色条据此共享同一个呼吸相位（见 motion.js）。
    callId: call2.callId,
    output: call2.settled ? exit.output : "",
    exitInfo,
    state: state2,
    inputState: sections.input,
    outputState: sections.output,
    // “输入已接受、输出等待中”：OUT 段显示占位文本，让 OUT 自己的品牌色呼吸条
    // 在进程运行时保持可见。
    waitingForOutput: call2.settled !== true && call2.phase !== "preparing",
    background,
    expanded: command !== "" || exit.output !== ""
  };
}
function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props;
  const tone = useSettingsSnapshot();
  const pulseRef = usePulseSync();
  const model = (0, import_react4.useMemo)(() => shellModel(block, toolName), [block, toolName]);
  const [enter] = (0, import_react4.useState)(() => isLiveToolState(model.state));
  const waitingRef = (0, import_react4.useRef)(model.waitingForOutput);
  const outputAppeared = (0, import_react4.useRef)(false);
  if (model.output !== "" && waitingRef.current) outputAppeared.current = true;
  waitingRef.current = model.waitingForOutput;
  const hasIO = model.input !== "" || model.output !== "" || model.waitingForOutput;
  const stateLabel = model.state === "error" ? t("state.error") : model.state === "stopped" ? t("state.stopped") : model.state === "running" ? t("state.running") : model.state === "preparing" ? t("state.preparing") : "";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-tool enhanced-command", ref: pulseRef, ...fxRootProps(tone, ["commandHeader", "commandIO"]), "data-variant": "command", "data-state": model.state, "data-tool": toolName, "data-shell-tone": tone.shellShellTone, "data-inner-tone": tone.shellInnerTone, "data-body": hasIO ? "true" : "false", "data-enter": enter ? "" : void 0, style: { "--did-pulse-phase": pulsePhase(model.callId) }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-head", ...surfaceProps(tone, "commandHeader"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-kind", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KindIcon, { kind: "command" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-dot", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-name", children: model.title }),
      model.summary !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-summary", title: model.command, children: model.summary }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "enhanced-actions", children: [
        model.exitInfo !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-exit", children: model.exitInfo.signal !== void 0 ? t("shell.signal", { name: model.exitInfo.signal }) : model.exitInfo.code === null ? t("shell.exitNull") : t("shell.exit", { code: model.exitInfo.code }) }) : null,
        stateLabel !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-state", children: stateLabel }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InspectButton, { inspect, t })
      ] })
    ] }),
    hasIO ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-io", ...surfaceProps(tone, "commandIO"), children: [
      model.input !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", "data-section": "in", "data-state": model.inputState, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "enhanced-label", children: t("shell.in") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-scroll enhanced-scroll-in", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { className: "enhanced-code", "data-error": model.inputState === "error" ? "" : void 0, children: model.input }) })
      ] }) : null,
      model.input !== "" && model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "enhanced-divider", "aria-hidden": "true" }) : null,
      model.output !== "" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "enhanced-section", "data-section": "out", "data-state": model.outputState, "data-appear": outputAppeared.current ? "" : void 0, children: [
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
var import_react5 = require("react");
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
function trimCache(map, limit) {
  while (map.size > limit) {
    const oldest = map.keys().next().value;
    if (oldest === void 0) break;
    map.delete(oldest);
  }
}
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
  trimCache(fileCache, FILE_CACHE_LIMIT);
  return value;
}
var SNAPSHOT_CACHE_LIMIT = 160;
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
  trimCache(snapshotCache, SNAPSHOT_CACHE_LIMIT);
  return snapshot;
}
async function fetchUpdateInfo(refresh) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25e3);
  try {
    const suffix = refresh === true ? "?refresh=1" : "";
    const response = await fetch(`${API_PREFIX}/update/versions${suffix}`, {
      credentials: "include",
      signal: controller.signal,
      headers: { accept: "application/json" }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data !== null && typeof data === "object" && data.ok === true ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
async function performUpdate(version) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 26e4);
  try {
    const response = await fetch(`${API_PREFIX}/update/install`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ version })
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
    // ---- 标记 / Web 前端 ----
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
      // JSONC（带注释的 JSON）用 JSON grammar 近似高亮。
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
      // TOML 没有 highlight.js grammar；ini grammar 对卡片展示来说足够近似
      // （产品约定，见 README 已知限制）。
      extensions: ["ini", "cfg", "conf", "properties", "toml"],
      filenames: [".editorconfig", ".npmrc", ".yarnrc", ".gitconfig", ".env", "cargo.toml"]
    },
    // ---- 数据 / 序列化 ----
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
    // ---- 后端 / 通用语言 ----
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
    // `.h` 归 Objective-C（见下方注册项），这是产品约定：头文件按 ObjC 高亮
    // 比按 C/C++ 更常见，避免同一后缀在两张表里冲突。
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
    // ---- 脚本 / 构建 / 终端 ----
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
    // ---- 文档 / 其它 ----
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
  // 关键词 / 控制流
  ["keyword", "kw"],
  ["selector-tag", "kw"],
  ["selector-class", "kw"],
  ["selector-id", "kw"],
  ["meta-keyword", "kw"],
  ["doctag", "kw"],
  // 字符串 / 正则 / 模板文本
  ["string", "str"],
  ["char", "str"],
  ["regexp", "str"],
  ["attr-value", "str"],
  ["meta-string", "str"],
  ["template-string", "str"],
  ["code", "str"],
  // 数字 / 常量
  ["number", "num"],
  ["literal", "num"],
  ["symbol", "num"],
  ["bullet", "num"],
  // 函数 / 类型
  ["function", "fn"],
  ["function_", "fn"],
  ["title", "fn"],
  ["built_in", "type"],
  ["type", "type"],
  ["class-name", "type"],
  ["class_", "type"],
  // 属性 / 特性 / 变量
  ["attr", "prop"],
  ["attribute", "prop"],
  ["property", "prop"],
  ["variable", "prop"],
  ["language_", "kw"],
  ["params", "prop"],
  ["template-variable", "prop"],
  ["subst", "prop"],
  ["selector-attr", "prop"],
  // 注释
  ["comment", "com"],
  ["quote", "com"],
  // 元信息 / 注解 / 预处理
  ["meta", "meta"],
  // diff grammar 标记：绝不用红/绿语义，只当中性 meta
  ["addition", "meta"],
  ["deletion", "meta"],
  // 标签 / 标题
  ["tag", "tag"],
  ["name", "tag"],
  ["section", "head"],
  // 运算符 / 标点
  ["operator", "op"],
  ["punctuation", "punct"],
  // 强调 / 链接
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
      return groups.map((group, index) => group.changed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-seg", "data-changed": "true", children: group.pieces.map((piece, pieceIndex) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TokenSpan, { token: piece }, pieceIndex)) }, index) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react5.Fragment, { children: group.pieces.map((piece, pieceIndex) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TokenSpan, { token: piece }, pieceIndex)) }, index));
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
var DISPLAY_LINE_CHARS = 2e4;
function clampLineForDisplay(text) {
  if (typeof text !== "string") return { text: "", truncated: false, total: 0 };
  if (text.length <= DISPLAY_LINE_CHARS) return { text, truncated: false, total: text.length };
  return { text: text.slice(0, DISPLAY_LINE_CHARS) + "…", truncated: true, total: text.length };
}
function InlineRow({ row, t, highlighter, hunk }) {
  const clipped = clampLineForDisplay(row.text);
  const code = clipped.text === "" ? " " : clipped.text;
  const move = row.move;
  const tokens = clipped.truncated || highlighter === null || highlighter === void 0 ? null : tokensForRow(highlighter, hunk ?? null, row, row.kind === "del" ? "old" : "new");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-row", "data-kind": row.kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", "data-side": "old", children: row.oldNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", "data-side": "new", children: row.newNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-sign", children: row.kind === "add" ? "+" : row.kind === "del" ? "−" : " " }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "code",
      {
        className: "did-code",
        title: clipped.truncated ? t("lineTruncated", { n: clipped.total }) : void 0,
        children: clipped.truncated ? code : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code, tokens })
      }
    ),
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
      // 两列行号的显式图例：让用户在每个 hunk 上都能分清哪个数字是旧文件行、
      // 哪个是新文件行，而不是只靠上方的 hunk 头猜。本 hunk 从未编号的一侧
      // 保留列宽但去掉标签。
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
  const clipped = clampLineForDisplay(row === null ? "" : row.text);
  const code = clipped.text === "" ? " " : clipped.text;
  const move = row === null ? null : row.move;
  const tokens = row === null || clipped.truncated || highlighter === null || highlighter === void 0 ? null : tokensForRow(highlighter, hunk ?? null, row, side === "left" ? "old" : "new");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-cell", "data-kind": kind, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-num", children: lineNo ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "code",
      {
        className: "did-code",
        title: clipped.truncated ? t("lineTruncated", { n: clipped.total }) : void 0,
        children: clipped.truncated ? code : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RowText, { row, fallback: code, tokens })
      }
    ),
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
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react5.Fragment, { children: [
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
function noticeText(notice, t, truncated) {
  if (truncated === true) return t("noticeTruncated");
  if (notice === null || notice === void 0) return "";
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
  const tone = useSettingsSnapshot();
  const pulseRef = usePulseSync();
  const call2 = (0, import_react5.useMemo)(() => deriveCall(block), [block]);
  const [snapshot, setSnapshot] = (0, import_react5.useState)(void 0);
  const [fileText, setFileText] = (0, import_react5.useState)(null);
  const [collapsed, setCollapsed] = (0, import_react5.useState)(false);
  const requested = (0, import_react5.useRef)(false);
  (0, import_react5.useEffect)(() => {
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
  const model = (0, import_react5.useMemo)(() => buildCardModel({
    block,
    toolName,
    cwd,
    home,
    snapshot: snapshot ?? null,
    fileText,
    loading: snapshot === void 0 && call2.settled && !call2.isError
  }), [block, toolName, cwd, home, snapshot, fileText, call2.settled, call2.isError]);
  const diff2 = model.diff;
  const languageId = (0, import_react5.useMemo)(
    () => detectLanguage(model.absolutePath ?? model.filePath, model.diff?.afterText ?? model.diff?.beforeText ?? ""),
    [model.absolutePath, model.filePath, model.diff]
  );
  const highlighter = (0, import_react5.useMemo)(
    () => tone.syntaxHighlight !== false && languageId !== null && diff2 !== null && diff2 !== void 0 ? getDiffHighlighter(diff2, languageId) : null,
    [diff2, languageId, tone.syntaxHighlight]
  );
  const hasHunks = diff2 !== null && diff2 !== void 0 && diff2.hunks.length > 0;
  const stateKey = stateKeyOf(model.status);
  const totalHunks = hasHunks ? diff2.hunks.length : 0;
  const plan = (0, import_react5.useMemo)(() => hasHunks ? buildInlinePlan(diff2) : null, [diff2, hasHunks]);
  const hidden = plan === null ? 0 : plan.total - plan.shown;
  const truncated = diff2 !== null && diff2 !== void 0 && diff2.truncated === true;
  const cardNotice = (() => {
    if (truncated) return noticeText(null, t, true);
    const notice = model.notice;
    if (notice === null || notice === void 0) return null;
    if (notice.kind === "history" || notice.kind === "locate" || notice.kind === "tool" || notice.kind === "toolLocate") return null;
    return noticeText(notice, t, false);
  })();
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react5.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-card", ref: pulseRef, ...fxRootProps(tone, ["fileCardHeader", "fileCardBody"]), "data-state": model.status, "data-tool": model.toolName, "data-call-id": model.callId, "data-inline-diff": "row", "data-shell-tone": tone.fileShellTone, "data-inner-tone": tone.fileInnerTone, "data-language": languageId ?? "unknown", "data-syn-emphasis": tone.syntaxEmphasis, style: { "--did-pulse-phase": pulsePhase(model.callId) }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: "did-head",
        ...surfaceProps(tone, "fileCardHeader"),
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
    cardNotice !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice", children: cardNotice }) : null,
    !collapsed ? hasHunks ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-body", ...surfaceProps(tone, "fileCardBody"), children: plan.parts.map((part) => {
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "did-foot", ...surfaceProps(tone, "fileCardBody"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sourceLabel(model.source, t) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "did-grow" }),
        hidden > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("inlineMore", { n: hidden }) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "did-link", onClick: openModal, children: t("openViewer") })
      ] })
    ] }) : emptyBody() : null
  ] }) });
}
function DiffModal({ t }) {
  const payload2 = (0, import_react5.useSyncExternalStore)(subscribeDiffModal, getDiffModal, getDiffModal);
  const settings = useSettingsSnapshot();
  const [tab, setTab] = (0, import_react5.useState)("hunks");
  const [portalHost, setPortalHost] = (0, import_react5.useState)(null);
  const dialogRef = (0, import_react5.useRef)(null);
  const callId = payload2 === null ? null : payload2.callId;
  const languageId = (0, import_react5.useMemo)(
    () => payload2 === null ? null : detectLanguage(payload2.absolutePath ?? payload2.filePath, payload2.diff?.afterText ?? payload2.diff?.beforeText ?? ""),
    [payload2]
  );
  const highlighter = (0, import_react5.useMemo)(
    () => settings.syntaxHighlight !== false && languageId !== null && payload2?.diff !== null && payload2?.diff !== void 0 ? getDiffHighlighter(payload2.diff, languageId) : null,
    [payload2, languageId, settings.syntaxHighlight]
  );
  (0, import_react5.useEffect)(() => {
    setPortalHost(document.body);
  }, []);
  (0, import_react5.useEffect)(() => {
    setTab("hunks");
  }, [callId]);
  (0, import_react5.useEffect)(() => {
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
  (0, import_react5.useEffect)(() => {
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
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react5.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay-root", "data-open": "true", "data-enter": "", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-overlay", ...backdropProxyProps(settings, "diffModal"), onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "did-dialog",
      "data-enter": "",
      ...surfaceProps(settings, "diffModal"),
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
        payload2.notice !== null && payload2.notice !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "did-notice did-dialog-notice", children: noticeText(payload2.notice, t, diff2.truncated === true) }) : null,
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

// src/client/glass-filters.js
var FILTER_DEFS_ID = "dsh-inline-diff-glass-filters";
var REFRACTION_GATE_CLASS = "did-glass-refract-ok";
var MIN_CHROMIUM_MAJOR = 152;
var FILTERS_MARKUP = `
<defs>
  <filter id="did-glass-refract-sm" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.010 0.013" numOctaves="2" seed="7" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="9" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="did-glass-refract-md" x="-18%" y="-18%" width="136%" height="136%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.011" numOctaves="2" seed="13" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="1.8" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="18" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="did-glass-refract-lg" x="-22%" y="-22%" width="144%" height="144%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0075 0.0095" numOctaves="3" seed="21" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="2.2" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="30" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</defs>
`;
function chromiumMajor(userAgent = globalThis.navigator?.userAgent) {
  if (typeof userAgent !== "string") return 0;
  const match = userAgent.match(/Chrom(?:e|ium)\/(\d+)/);
  if (match === null) return 0;
  const major = Number(match[1]);
  return Number.isFinite(major) ? major : 0;
}
function supportsBackdropRefraction(userAgent = globalThis.navigator?.userAgent, css2 = globalThis.CSS) {
  try {
    if (chromiumMajor(userAgent) < MIN_CHROMIUM_MAJOR) return false;
    if (css2 === void 0 || css2 === null || typeof css2.supports !== "function") return false;
    return css2.supports("backdrop-filter", "url(#did-glass-refract-sm)") === true || css2.supports("-webkit-backdrop-filter", "url(#did-glass-refract-sm)") === true;
  } catch {
    return false;
  }
}
function installGlassRefraction() {
  const doc = globalThis.document;
  if (doc === void 0 || doc === null) return () => {
  };
  const root = doc.documentElement;
  const host = doc.body ?? root;
  if (root === null || root === void 0 || host === null || host === void 0) return () => {
  };
  let container = null;
  try {
    if (doc.getElementById(FILTER_DEFS_ID) === null) {
      container = doc.createElement("svg");
      container.id = FILTER_DEFS_ID;
      container.setAttribute("width", "0");
      container.setAttribute("height", "0");
      container.setAttribute("aria-hidden", "true");
      container.setAttribute("focusable", "false");
      container.setAttribute("style", "position:absolute;width:0;height:0;pointer-events:none");
      container.innerHTML = FILTERS_MARKUP;
      host.appendChild(container);
    }
  } catch {
    container = null;
  }
  let gated = false;
  try {
    if (supportsBackdropRefraction()) {
      root.classList.add(REFRACTION_GATE_CLASS);
      gated = true;
    } else {
      root.classList.remove(REFRACTION_GATE_CLASS);
    }
  } catch {
  }
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    try {
      if (container !== null && container.isConnected) container.remove();
      else doc.getElementById(FILTER_DEFS_ID)?.remove();
    } catch {
    }
    if (gated) {
      try {
        root.classList.remove(REFRACTION_GATE_CLASS);
      } catch {
      }
    }
  };
}

// src/client/i18n.js
function hostLanguageKind(hostLanguage) {
  if (typeof hostLanguage !== "string") return void 0;
  const normalized = hostLanguage.trim().toLowerCase().replace(/_/g, "-");
  if (normalized === "") return void 0;
  const primary = normalized.split("-")[0];
  if (primary === "zh") return "zh";
  if (primary === "en") return "en";
  return "en";
}
function resolveLanguage(setting, hostLanguage) {
  if (setting === "zh") return "zh";
  if (setting === "en") return "en";
  const host = hostLanguageKind(hostLanguage);
  if (host === "zh") return "zh";
  if (host === "en") return "en";
  return DEFAULT_LANGUAGE;
}
function lookupDictionary(dictionary, language, key) {
  try {
    if (dictionary === null || typeof dictionary !== "object") return void 0;
    const table = dictionary[language];
    if (table === null || typeof table !== "object") return void 0;
    if (!Object.prototype.hasOwnProperty.call(table, key)) return void 0;
    const value = table[key];
    return typeof value === "string" ? value : void 0;
  } catch {
    return void 0;
  }
}
function formatTemplate(template, params) {
  if (params === null || typeof params !== "object") return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return match;
    let value;
    try {
      value = params[name];
    } catch {
      return match;
    }
    if (value === void 0 || value === null) return match;
    try {
      return String(value);
    } catch {
      return match;
    }
  });
}
function translate(dictionary, language, key, params) {
  if (typeof key !== "string") return "";
  try {
    const wanted = typeof language === "string" && language !== "" ? language : DEFAULT_LANGUAGE;
    const template = lookupDictionary(dictionary, wanted, key) ?? lookupDictionary(dictionary, DEFAULT_LANGUAGE, key) ?? key;
    return formatTemplate(template, params);
  } catch {
    return key;
  }
}
var translatorCache = /* @__PURE__ */ new WeakMap();
function translatorFor(dictionary, language) {
  const table = dictionary !== null && typeof dictionary === "object" ? dictionary : {};
  let perLanguage = translatorCache.get(table);
  if (perLanguage === void 0) {
    perLanguage = /* @__PURE__ */ new Map();
    translatorCache.set(table, perLanguage);
  }
  const wanted = typeof language === "string" && language !== "" ? language : DEFAULT_LANGUAGE;
  let translator = perLanguage.get(wanted);
  if (translator === void 0) {
    translator = (key, params) => translate(table, wanted, key, params);
    perLanguage.set(wanted, translator);
  }
  return translator;
}
var reactRuntime = null;
function installI18nRuntime(runtime) {
  reactRuntime = runtime !== null && typeof runtime === "object" ? runtime : null;
}
var hostLocaleFace = null;
var hostLanguageListeners = /* @__PURE__ */ new Set();
function getHostLanguage() {
  try {
    const snapshot = hostLocaleFace?.getSnapshot?.();
    const active = snapshot !== null && typeof snapshot === "object" ? snapshot.active : void 0;
    return typeof active === "string" && active !== "" ? active : void 0;
  } catch {
    return void 0;
  }
}
function notifyHostLanguage() {
  for (const listener of [...hostLanguageListeners]) {
    try {
      listener();
    } catch {
    }
  }
}
function subscribeHostLanguage(listener) {
  hostLanguageListeners.add(listener);
  return () => {
    hostLanguageListeners.delete(listener);
  };
}
function attachHostLocale(face) {
  if (face === null || typeof face !== "object") return () => {
  };
  hostLocaleFace = face;
  let unsubscribe = () => {
  };
  try {
    if (typeof face.subscribe === "function") {
      const off = face.subscribe(() => notifyHostLanguage());
      if (typeof off === "function") unsubscribe = off;
    }
  } catch {
    unsubscribe = () => {
    };
  }
  notifyHostLanguage();
  return () => {
    try {
      unsubscribe();
    } catch {
    }
    if (hostLocaleFace === face) hostLocaleFace = null;
  };
}
function getPluginLanguage() {
  let setting;
  try {
    setting = getSettings()?.language;
  } catch {
    setting = void 0;
  }
  return resolveLanguage(setting, getHostLanguage());
}
function subscribePluginLanguage(listener) {
  let last = getPluginLanguage();
  const check = () => {
    const next = getPluginLanguage();
    if (next === last) return;
    last = next;
    try {
      listener();
    } catch {
    }
  };
  let offSettings = () => {
  };
  let offHost = () => {
  };
  try {
    offSettings = subscribeSettings(check);
  } catch {
    offSettings = () => {
    };
  }
  try {
    offHost = subscribeHostLanguage(check);
  } catch {
    offHost = () => {
    };
  }
  return () => {
    offSettings();
    offHost();
  };
}
function pluginTranslate(key, params) {
  return translate(dicts, getPluginLanguage(), key, params);
}
function withPluginI18n(Component) {
  if (typeof Component !== "function") return Component;
  function PluginI18nBound(props) {
    const runtime = reactRuntime;
    if (runtime === null || typeof runtime.useSyncExternalStore !== "function") {
      return typeof runtime?.createElement === "function" ? runtime.createElement(Component, props) : null;
    }
    const language = runtime.useSyncExternalStore(subscribePluginLanguage, getPluginLanguage, getPluginLanguage);
    const t = translatorFor(dicts, language);
    return runtime.createElement(Component, { ...props, t });
  }
  const name = typeof Component.displayName === "string" && Component.displayName !== "" ? Component.displayName : typeof Component.name === "string" && Component.name !== "" ? Component.name : "Component";
  PluginI18nBound.displayName = `withPluginI18n(${name})`;
  return PluginI18nBound;
}

// src/client/styles.js
var CSS = `
/* ---- 外观感知的表面配色 ------------------------------------------------
   外壳（卡片框、弹窗、头/脚）跟随当前主题与宿主浅/深色设置：把主题自己的
   表面 token 叠在“外观专属的不透明底色”上，既保留主题的蓝/金/任意色相，又避免
   半透明、发灰的窗口。
   内部内容（差异行、命令执行、工具 IO）则跟随 DSH 官方浅/深色代码块配色：
   深色近黑灰、浅色近白灰，并配对应前景色，文字不会与背景糊在一起。

   派生变量声明在 body 而不是 :root：官方 DSH 主题（以及皮肤中心注入的
   描述符）把 --dsw-alias-* token 声明在 body 上。声明在 :root 的 var()
   会在根元素解析，而根元素上没有那些 body 级 token，于是所有表面都会静默保留
   字面 fallback、永远不跟随主题。声明在 body 上则与定义 token 的元素相同，
   解析得到主题颜色（对把 token 定义在根上的皮肤同样有效，因为 body 会继承）。 */
body {
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  /* 深色外观：中性不透明底层，外壳色相来自主题自己的表面 token
   （女仆皮肤下是蓝色、官方主题下是灰色、其它主题是各自色相）。 */
  --did-shell-base: #101216;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  /* 抬升表面（设置弹窗）使用主题的 layer-2 表面，而不是
   --dsw-alias-bg-overlay：官方深色主题里 overlay token 是给遮罩用的中灰
   （约 #61666b），用它填充弹窗会显得发白/发灰。 */
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #1a1c22);
  /* 内部内容使用官方深色代码块配色，而不是主题色 */
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
  /* 浅色外观：中性近白底层，外壳色相同样来自主题自己的浅色表面 token。 */
  --did-shell-base: #ffffff;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #f4f6f9);
  /* 内部内容使用官方浅色代码块配色 */
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
/* ---- 每类卡片的“外壳 / 内部”配色覆盖 --------------------------------
   由设置面板写到每张已渲染卡片上；这里的值只覆盖该卡片的文档级外观变量。 */
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
  /* 强制深色外壳时，表面底色默认使用中性深色而不是主题 token：浅色外观（以及
     第三方浅色主题）下 --dsw-alias-bg-layer-* 是浅色，用主题 token 会把「深色
     外壳」做成白底 + 浅色文字（不可读）。下面的外观作用域规则在深色外观下再把
     主题的深色表面色相接回来，兼顾「强制基调」与「跟随主题」。 */
  --did-surface-1: #1a1c22;
  --did-surface-2: #202329;
  --did-surface-elevated: #202329;
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
}
/* 强制外壳色调与当前外观一致时，沿用主题自己的表面色相（第三方主题也能带出自己的
   蓝/紫/金等色调）；外观相反时保持上面的中性强制色，保证文字对比度不被浅色 token
   冲掉。 */
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='dark'] {
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='light'] {
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
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
/* ---- 增强风格平铺命令执行行（bash / pwsh / win_bash） ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  /* 头部与 IO 面板之间不留 gap：IN 状态条必须直接顶到标题条，中间不能有空白带。
   间距由头部的 padding 承担。 */
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
/* 有内容的卡片：标题文字下方保留呼吸空间，但 IO 面板及其状态条仍紧贴标题条。 */
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
/* 状态点呼吸：与 IN/OUT 色条共用 1.2s 周期与同一相位变量（--did-pulse-phase），
   保证同一张卡片的圆点和色条同频同相；圆点仍是透明度呼吸，色条是描边颜色呼吸，
   两者视觉效果不同，只是节奏对齐。不同卡片的相位由 motion.js 按 callId 错开。 */
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: dsh-inline-diff-pulse 1.2s ease-in-out infinite; animation-delay: var(--did-pulse-phase, 0ms); }
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
  /* 右内边距为 0：下面的滚动容器一直延伸到卡片右边缘，滚动条贴着边框（与差异
   卡片一致）；视觉留白由滚动内容自己承担。 */
  padding: 8px 0 8px 7.5px;
  border-left: 2.5px solid color-mix(in srgb, var(--did-section-bar, var(--dsw-alias-label-tertiary)) 70%, transparent);
}
/* IN 与 OUT 各自拥有状态条，画成分区的左边框，这样它能沿着卡片底部圆角走而不是
   被圆角裁掉：IN 从标题条向下到 IN/OUT 发丝线，OUT 从发丝线沿卡片曲线一直到
   底边。发丝线是唯一的分隔物，两条状态条之间不需要额外空白。 */
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
/* IN / OUT 各自按自己的状态决定是否呼吸（互不影响）；呼吸周期与卡片状态点一致，
   并使用同一张卡片上的相位变量，使同一卡片的圆点与色条同频同相。 */
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] {
  animation: dsh-inline-diff-bar-pulse 1.2s ease-in-out infinite;
  animation-delay: var(--did-pulse-phase, 0ms);
}
/* 每个分区一个独立滚动区（IN 与 OUT 各自拥有）。容器延伸到卡片右边缘，让滚动条
   与边框齐平；padding-right 让代码文字不压到滚动条上。 */
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
  /* 代码默认文字颜色跟随内部配色/外观（浅色内层 = 深色文字，深色内层 = 浅色
   文字），而不是跟随外壳前景色。 */
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

/* ---- 侧边栏底部启动按钮 ---- */
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

/* ---- 设置面板 / 设置页 / 设置弹窗 ---- */
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
/* 原创声明（设置页 + 设置弹窗）。醒目但克制：品牌色淡染表面 + 左侧强调竖条；
   刻意不用红/绿，因为这两种颜色仍保留给删除/新增差异标记。 */
.did-originality {
  margin: 12px 0 2px;
  padding: 10px 14px 11px;
  border: 0.5px solid color-mix(in srgb, var(--did-accent) 38%, var(--did-border-1));
  border-inline-start: 3px solid var(--did-accent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--did-accent) 8%, var(--did-surface-1));
  color: var(--did-fg-secondary);
}
.did-originality-title {
  margin-bottom: 3px;
  color: var(--did-fg-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 19px;
}
.did-originality-body {
  font-size: 12px;
  line-height: 18px;
  /* 声明里含一个很长的仓库 URL，必须换行而不是把面板撑宽（窄弹窗/窄页面）。 */
  overflow-wrap: anywhere;
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
/* 弹窗头部横幅：标题、说明与关闭按钮固定；下方滚动区是唯一滚动元素，滚动条
   不会穿过横幅，圆角弹窗边缘会裁掉它而不是让它溢出。 */
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
  /* 右内边距让滚动条稍微内缩在圆角边缘里，而不是紧贴（并显得溢出）边框。 */
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
  /* 比宿主发丝线略粗，让卡片边缘看起来是一块真实表面；下面的色行仍会一直
   铺到这条边。 */
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
/* 文件修改卡片的状态点：与命令/工具卡片共用 1.2s 呼吸周期；相位取卡片根节点上的
   --did-pulse-phase（由 motion.js 按 callId 派生），不同卡片互相错开。 */
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: dsh-inline-diff-pulse 1.2s ease-in-out infinite; animation-delay: var(--did-pulse-phase, 0ms); }
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
/* 故意不用原生 disabled 按钮：它必须仍能吞掉点击，让卡片头（折叠开关）永远
   收不到这次点击。 */
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
  /* 紧凑行号槽：两列行号仍保持等宽数字，但代码文字离卡片边缘更近，不再隔着一大段
   空白行号槽才开始。 */
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
/* 在变更行上强化对应关系：属于改动那一侧的行号槽染成该侧颜色
   （删除行 → 旧行号，新增行 → 新行号）。 */
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

/* 词/字符级改动片段：比整行级的洗色更深一层。 */
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

/* ---- 根级浮层 / 对比弹窗 ---- */

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

/* 修改前/后栏头现在是弹窗头部的一部分（在滚动区之外），因此独占一行，永远不会
   与正文滚动条抢空间；也不再需要 sticky 定位或额外的层叠层级。 */
.did-panes-head { flex: none; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: var(--did-dialog-surface); border-bottom: 0.5px solid var(--did-border-2); }
.did-pane-label { padding: 5px var(--did-inset-x); color: var(--did-fg-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--did-border-1); }

/* hunk 头吸顶于滚动区顶部：修改前/后栏头在正常流里位于该滚动区上方，因此
   hunk 头永远不可能盖住它。 */
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

/* ---- 设置页：支持的语言列表 --------------------------------------------
   这里只放布局外壳；徽章外观本身是语法高亮样式表里共享的 .did-lang 样式，
   因此设置页列表与卡片头徽章外观完全一致。 */
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

/* ============================================================================
   ---- 外观效果：原生 / 磨砂玻璃 / 液态玻璃 ----
   ----------------------------------------------------------------------------
   本区段是「外观效果」的唯一 CSS 实现，**只追加、不改上面的任何旧规则**：
   所有规则都以 [data-fx='glass'|'liquid'] / [data-liquid-mode] / [data-fx-root='true']
   为前缀，因此全 native（默认）时一条都不会命中，1.3.0 的既有外观零回归。

   DOM 契约（surfaces.js 与 .team/glass-contract.md）：
     · 每个可视表面元素带 data-fx（native/glass/liquid 三值都写）、data-fx-surface；
       liquid 时另有 data-liquid-mode="clear|frosted"；
       内联变量 --did-fx-alpha（0.05–1，无单位）与 --did-fx-blur（px）。
     · 卡片根 .did-card / .enhanced-tool 在任一子表面非 native 时带 data-fx-root="true"。
     · 9 个表面：fileCardHeader / fileCardBody / diffModal / commandHeader /
       commandIO / toolHeader / toolIO / readRangeChip / settingsPanel。

   实现要点：
     1) 材质画在**子表面自己**身上（头部 / IO / 差异区 / 弹窗 / 徽标）。卡片根在
        fx-root 上下文里交出底色与边框，否则子表面的 backdrop-filter 只能看到卡片
        自己的不透明底，看不到背后的页面壁纸（§4）；
     2) fx-root 上下文里的 native 子表面把原底色补回来（§4.2），保证“一半玻璃
        一半原生”自然。无 data-fx-root 时一律命中不到这些规则；
     3) 液态玻璃的折射使用 Chromium 的 backdrop-filter: url(#…)（研究结论：折射
        必须与 blur 写在**同一条** backdrop-filter 声明里，嵌套 backdrop-filter 会被
        忽略；@supports 对 url() 会误报，所以由 index.jsx 启动时探测并给 <html>
        加 .did-glass-refract-ok 门控类）。不支持折射的引擎自动退回“只有模糊”的材质；
     4) 不支持 backdrop-filter 的引擎（@supports not …）退回更高不透明度的半透明
        底色，保证可读；prefers-reduced-transparency / forced-colors 同理降级（§7）；
     5) 性能：backdrop-filter 只挂在真正 glass/liquid 的表面元素上，不加
        will-change；卡片根只画一条 0.5px 轮廓（::after），不做模糊。

   主题：材质底色全部来自现有 --did-* token（--did-surface-1 / --did-io-bg /
   --did-dialog-surface / --did-surface-elevated），高光/内阴影按深浅外观与每张卡片
   自己的外壳色调（data-shell-tone）切换；文字颜色一律不动，靠半透明底色保证可读。
   ========================================================================== */

/* ---- 外观效果 1. 派生变量（材质参数） --------------------------------- */
[data-fx] {
  /* 用户可调项：markup 以内联 style 写入；这里给兜底值，避免纯 DOM 侧
     （read-range-dom.js）漏写时 var() 解析失败把整条声明丢掉。 */
  --did-fx-alpha: 0.55;
  --did-fx-blur: 14px;

  /* 系数：磨砂玻璃 = 1:1；液态玻璃两种模式在 §1.2 覆盖 */
  --did-fx-alpha-k: 1;
  --did-fx-blur-k: 1;

  /* 最终生效的透明度（0.02–1）与模糊半径 */
  --did-fx-alpha-eff: clamp(0.02, calc(var(--did-fx-alpha) * var(--did-fx-alpha-k)), 1);
  --did-fx-blur-eff: calc(var(--did-fx-blur) * var(--did-fx-blur-k));
  /* 可读性底衬：代码类表面额外叠一小段固定浓度。公式 α' = α + boost × (1 − α)
     随滑杆线性收敛（α=1 时仍是 1、α 越小增补越多），所以滑杆始终有效，只是避免
     用户把透明度拉到很低时大片代码直接糊在壁纸上。逐表面取值见本节下方。 */
  --did-fx-alpha-boost: 0;
  --did-fx-alpha-final: calc(var(--did-fx-alpha-eff) + var(--did-fx-alpha-boost) * (1 - var(--did-fx-alpha-eff)));

  /* backdrop-filter 调色：base 是“原始值”，k 是模式/外观的乘数，分开声明是为了
     让浅色外观覆盖 base 时不会把 clear/frosted 的相对差异冲掉。 */
  --did-fx-sat-base: 1.6;
  --did-fx-bright-base: 1.04;
  --did-fx-sat-k: 1;
  --did-fx-bright-k: 1;
  --did-fx-sat: calc(var(--did-fx-sat-base) * var(--did-fx-sat-k));
  --did-fx-bright: calc(var(--did-fx-bright-base) * var(--did-fx-bright-k));

  /* 材质底色来源：外壳类表面用主题表面色，代码/IO 类表面在下面换成代码块底色。
     用 rgb(from …) 相对色语法在“用户透明度”上重新取 alpha，因此主题 token 自带
     的透明度不会叠加。 */
  --did-fx-tint-base: var(--did-surface-1);

  /* 深浅外观共用的高光/内阴影色板（浅色外观在 §1.3 覆盖） */
  --did-fx-sheen-strong: rgb(255 255 255 / 0.55);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.16);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.30);
  --did-fx-shade: rgb(0 0 0 / 0.20);
  --did-fx-hairline: rgb(255 255 255 / 0.13);
  --did-fx-rim-k: 1;
  --did-fx-rim-opacity: min(1, calc(0.95 * var(--did-fx-rim-k)));
  --did-fx-noise-opacity: 0.12;

  /* 细色散：液态玻璃边缘极轻的冷暖分色（真正色散做不到，用两条 1px 半透明线近似） */
  --did-fx-fringe-a: rgb(130 210 255 / 0.10);
  --did-fx-fringe-b: rgb(255 150 210 / 0.08);

  /* 材质的多层背景（glass / liquid 各一套；浅色外观在 §1.3 换更淡的一套） */
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.055) 0%, rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0) 42%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.06 + 0.12 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 56%),
    linear-gradient(112deg, rgb(255 255 255 / 0.10) 0%, rgb(255 255 255 / 0.028) 30%, rgb(255 255 255 / 0) 56%),
    linear-gradient(180deg, rgb(255 255 255 / 0.05) 0%, rgb(255 255 255 / 0) 62%);

  /* 单独浮层（差异弹窗 / 设置面板 / 行范围徽标）的投影；卡片内子表面不投影，
     保持与原生一致的外轮廓。 */
  --did-fx-outer: 0 0 0 0 transparent;
  --did-fx-drop: rgb(0 0 0 / 0.22);
}

/* 材质底色来源：差异区 / IO 用官方代码块底色；弹窗用弹层底色；设置面板用抬升表面。 */
[data-fx-surface='fileCardBody'],
[data-fx-surface='commandIO'],
[data-fx-surface='toolIO'] { --did-fx-tint-base: var(--did-io-bg); }
[data-fx-surface='diffModal'] { --did-fx-tint-base: var(--did-dialog-surface); }
[data-fx-surface='settingsPanel'] { --did-fx-tint-base: var(--did-surface-elevated); }
/* 逐表面的可读性底衬：代码/IO 区最需要（大片文字直接压在壁纸上），头部等小面积
   元素只需要一点点，徽标更小、更要“浮”起来所以稍高。 */
[data-fx-surface='fileCardHeader'],
[data-fx-surface='commandHeader'],
[data-fx-surface='toolHeader'] { --did-fx-alpha-boost: 0.06; }
[data-fx-surface='fileCardBody'],
[data-fx-surface='commandIO'],
[data-fx-surface='toolIO'] { --did-fx-alpha-boost: 0.22; }
[data-fx-surface='diffModal'] { --did-fx-alpha-boost: 0.08; }
[data-fx-surface='settingsPanel'] { --did-fx-alpha-boost: 0.2; }
[data-fx-surface='readRangeChip'] { --did-fx-alpha-boost: 0.34; }
/* 卡片底部 foot 虽然也归 fileCardBody 表面，但原底色是外壳色，保持外壳色调。 */
.did-card > .did-foot[data-fx-surface='fileCardBody'] { --did-fx-tint-base: var(--did-surface-1); }
/* “与外壳一致”的内部配色把 --did-io-bg 设成 transparent；相对色语法从 transparent
   取通道会退化成黑色，浅色外观里会出现黑玻璃。这种组合改回外壳色做材质。 */
[data-inner-tone='same'] [data-fx-surface='fileCardBody'],
[data-inner-tone='same'] [data-fx-surface='commandIO'],
[data-inner-tone='same'] [data-fx-surface='toolIO'] { --did-fx-tint-base: var(--did-surface-1); }

/* 外壳色调与当前外观相反时（浅色外观里把卡片外壳设为深色，或深色外观里设为浅色），
   头部是一小块半透明材质，13px 标题在页面背景上容易掉到 WCAG AA 以下；把这一情形
   的头部底衬透明度提高一档，保证深底浅字/浅底深字仍然清晰。用户手动调低的透明度
   仍按 alpha 系数生效，这里只做固定比例的可读性补偿。 */
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='fileCardHeader'],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='commandHeader'],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='toolHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='fileCardHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='commandHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='toolHeader'] {
  --did-fx-alpha-boost: 0.32;
}

/* 单独浮层的投影（与原生 1.3.0 的弹窗阴影保持同一观感）。 */
[data-fx-surface='diffModal'],
[data-fx-surface='settingsPanel'] {
  --did-fx-outer: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}
[data-fx-surface='settingsPanel'].did-settings-page {
  --did-fx-outer: 0 12px 36px -18px color-mix(in srgb, var(--did-fg-primary) 18%, transparent);
}
[data-fx-surface='readRangeChip'] { --did-fx-outer: 0 1px 2px var(--did-fx-drop); }

/* ---- 外观效果 1.2. 液态模式系数与玻璃参数 ----------------------------- */
[data-fx='liquid'] {
  --did-fx-sat-base: 1.8;
  --did-fx-bright-base: 1.05;
}
/* frosted（带一点模糊）= 用户模糊 ×1、材质更浓稠、饱和度略收（研究建议 1.15 / 0.95） */
[data-fx='liquid'][data-liquid-mode='frosted'] {
  --did-fx-alpha-k: 1.15;
  --did-fx-blur-k: 1;
  --did-fx-sat-k: 0.95;
}
/* clear（完全通透）= 模糊 ×0.12（14px → 1.7px）、材质更薄、饱和度更高（接近透镜） */
[data-fx='liquid'][data-liquid-mode='clear'] {
  --did-fx-alpha-k: 0.5;
  --did-fx-blur-k: 0.12;
  --did-fx-sat-k: 1.14;
  --did-fx-bright-k: 0.97;
  --did-fx-rim-k: 1.12;
  --did-fx-noise-opacity: 0.08;
}

/* ---- 外观效果 1.3. 浅色外观 / 每张卡片外壳色调的材质色板 --------------
   选择器同时覆盖两种情况：
     · body[data-dsh-inline-diff-appearance='light'] —— 宿主当前浅色外观；
     · [data-shell-tone='light'|'dark'] —— 设置里为单张卡片指定的外壳色调。
   顺序保证：卡片自己的色调覆盖宿主外观（浅色外观里的深色外壳卡片仍用白高光）。 */
body[data-dsh-inline-diff-appearance='light'] [data-fx],
body[data-dsh-inline-diff-appearance='light'] [data-fx-surface],
[data-shell-tone='light'] [data-fx],
[data-shell-tone='light'][data-fx] {
  --did-fx-sat-base: 1.35;
  --did-fx-bright-base: 1;
  --did-fx-sheen-strong: rgb(255 255 255 / 0.9);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.55);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.7);
  --did-fx-shade: rgb(30 40 60 / 0.12);
  --did-fx-hairline: rgb(20 24 32 / 0.14);
  --did-fx-fringe-a: rgb(90 160 220 / 0.07);
  --did-fx-fringe-b: rgb(220 120 170 / 0.05);
  --did-fx-noise-opacity: 0.09;
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.30) 0%, rgb(255 255 255 / 0) 60%),
    linear-gradient(112deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0) 45%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.18 + 0.18 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.34) 0%, rgb(255 255 255 / 0.10) 32%, rgb(255 255 255 / 0) 58%),
    linear-gradient(180deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0) 62%);
  --did-fx-drop: rgb(30 40 60 / 0.22);
}
[data-shell-tone='dark'] [data-fx],
[data-shell-tone='dark'][data-fx] {
  --did-fx-sat-base: 1.8;
  --did-fx-bright-base: 1.05;
  --did-fx-sheen-strong: rgb(255 255 255 / 0.55);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.16);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.30);
  --did-fx-shade: rgb(0 0 0 / 0.20);
  --did-fx-hairline: rgb(255 255 255 / 0.13);
  --did-fx-fringe-a: rgb(130 210 255 / 0.10);
  --did-fx-fringe-b: rgb(255 150 210 / 0.08);
  --did-fx-noise-opacity: 0.12;
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.055) 0%, rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0) 42%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.06 + 0.12 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 56%),
    linear-gradient(112deg, rgb(255 255 255 / 0.10) 0%, rgb(255 255 255 / 0.028) 30%, rgb(255 255 255 / 0) 56%),
    linear-gradient(180deg, rgb(255 255 255 / 0.05) 0%, rgb(255 255 255 / 0) 62%);
  --did-fx-drop: rgb(0 0 0 / 0.22);
}

/* ---- 外观效果 2. 磨砂玻璃（glass） ------------------------------------ */
[data-fx='glass'] {
  position: relative;
  isolation: isolate;
  /* 三层声明是逐级增强的回退链：极旧浏览器只拿实体底色（至少可读），支持
     color-mix 的拿半透明材质，支持相对色语法的按滑杆透明度精确取 alpha。
     （相对色语法可以直接用 clamp() 得到的数字当 alpha，不受 color-mix 百分比限制。） */
  background-color: var(--did-fx-tint-base);
  background-color: color-mix(in srgb, var(--did-fx-tint-base) calc(var(--did-fx-alpha-final) * 100%), transparent);
  background-color: rgb(from var(--did-fx-tint-base) r g b / var(--did-fx-alpha-final));
  background-image: var(--did-fx-glass-image);
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright));
  backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright));
  /* 细高光边框 + 玻璃厚度：顶部 1px 高光、底部 1px 暗边、四周 0.5px 发丝线，
     再叠两条内侧的大半径柔光，让薄片看起来有厚度。 */
  box-shadow:
    inset 0 0 0 0.5px var(--did-fx-hairline),
    inset 0 1px 0 0 var(--did-fx-sheen-mid),
    inset 0 -1px 0 0 var(--did-fx-shade),
    inset 0 14px 26px -22px var(--did-fx-sheen-soft),
    inset 0 -20px 30px -26px var(--did-fx-shade),
    var(--did-fx-outer);
}
/* 头部是可点击的折叠开关，旧规则 .did-head:hover 用 background 简写覆盖底色
   （还会把 background-image 一起清掉）；玻璃头必须把材质原样补回去，
   否则悬停瞬间会闪成全透明。 */
.did-head[data-fx='glass']:hover,
.did-head[data-fx='liquid']:hover,
.enhanced-head[data-fx='glass']:hover,
.enhanced-head[data-fx='liquid']:hover {
  background-color: rgb(from var(--did-fx-tint-base) r g b / min(1, calc(var(--did-fx-alpha-final) + 0.06)));
  background-image: var(--did-fx-glass-image);
}
.did-head[data-fx='liquid']:hover,
.enhanced-head[data-fx='liquid']:hover { background-image: var(--did-fx-liquid-image); }

/* ---- 外观效果 3. 液态玻璃（liquid） ----------------------------------- */
/* 材质本体：半透明底色 + 三层背景（左上镜面泛光 / 斜向光泽 / 上沿提亮），
   backdrop-filter 负责模糊与调色；折射在 §3.2 的门控类下追加到同一条声明里。 */
[data-fx='liquid'] {
  position: relative;
  isolation: isolate;
  background-color: var(--did-fx-tint-base);
  background-color: color-mix(in srgb, var(--did-fx-tint-base) calc(var(--did-fx-alpha-final) * 100%), transparent);
  background-color: rgb(from var(--did-fx-tint-base) r g b / var(--did-fx-alpha-final));
  background-image: var(--did-fx-liquid-image);
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02);
  backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02);
  /* 边缘 specular + 厚度内阴影 + 极轻色散（色散变量在 §1 定义、浅色外观在 §1.3 覆盖）。 */
  box-shadow:
    inset 0 0.5px 0 0 var(--did-fx-sheen-strong),
    inset 0 -0.5px 0 0 var(--did-fx-sheen-mid),
    inset 0.5px 0 0 0 var(--did-fx-sheen-mid),
    inset -0.5px 0 0 0 var(--did-fx-sheen-mid),
    inset 0 1px 0 0 var(--did-fx-fringe-a),
    inset 0 -1px 0 0 var(--did-fx-fringe-b),
    inset 0 2px 4px -2px var(--did-fx-shade),
    inset 0 -28px 36px -32px var(--did-fx-sheen-soft),
    inset 0 24px 32px -34px var(--did-fx-shade),
    var(--did-fx-outer);
}
/* 噪声层：消掉“塑料感”与 8bit 色带。负 z-index + isolation 让它在材质底色之上、
   内容之下，因此不需要改动任何子元素的层级（也绝不会拦截点击）。 */
[data-fx='liquid']::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: var(--did-fx-noise-opacity);
  mix-blend-mode: overlay;
}
/* 边缘 specular 环：conic 渐变 + mask 挖空成 1px 描边。负 z-index 让它压在材质
   之上、内容之下；pointer-events:none 保证不拦点击。 */
[data-fx='liquid']::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: conic-gradient(from 215deg at 50% 50%,
      rgb(255 255 255 / 1)    0deg,
      rgb(255 255 255 / 0.28) 38deg,
      rgb(255 255 255 / 0.05) 112deg,
      rgb(255 255 255 / 0.5)  172deg,
      rgb(255 255 255 / 0.06) 232deg,
      rgb(255 255 255 / 0.62) 296deg,
      rgb(255 255 255 / 1)    360deg);
  opacity: var(--did-fx-rim-opacity);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
}

/* ---- 外观效果 3.2. 折射（Chromium 专有，门控启用） --------------------
   结论来自 .team/liquid-glass/NOTES.md：
     · Chromium 支持 backdrop-filter 里的 url(#svgFilter)（真·位移折射）；
     · 折射必须与 blur/saturate 写在**同一条** backdrop-filter 里（嵌套会被忽略）；
     · 一旦 url() 不被识别，整条 backdrop-filter 失效（连 blur 都没了），
       所以只用 index.jsx 探测通过后挂在 <html> 上的 .did-glass-refract-ok 门控；
     · 挡位按表面尺寸选：徽标 sm（scale 9）、卡片/弹窗默认 md（scale 18）、
       clear 模式 lg（scale 30，透镜扭曲更明显）。
   不支持的引擎（Safari/Firefox/未探测通过）自然停在“只有模糊”的材质上。 */
.did-glass-refract-ok [data-fx='liquid'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-md);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-md);
}
.did-glass-refract-ok [data-fx='liquid'][data-liquid-mode='clear'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-lg);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-lg);
}
/* 小徽标用 sm 挡位：小尺寸表面用大位移会被“吃掉”边缘（研究建议模糊 ≤10px）。
   选择器与上面的 clear 规则同权重、放在其后，保证徽标在 clear 模式下也用 sm 而不是 lg。 */
.did-glass-refract-ok [data-fx='liquid'][data-fx-surface='readRangeChip'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-sm);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-sm);
}

/* ---- 外观效果 4. 卡片根的 fx-root 上下文 ------------------------------
   卡片根交出底色与边框，让子表面的 backdrop-filter 能采到页面壁纸；轮廓由
   一条 0.5px 的覆盖环（::after）负责，颜色沿用卡片原边框色，所以“全玻璃卡片”
   仍然有一圈完整、贴圆角的发丝线。 */
[data-fx-root='true'] {
  --did-fx-card-ring: color-mix(in srgb, var(--did-border-2) 45%, var(--did-border-1));
}
.did-card[data-fx-root='true'],
.enhanced-tool[data-fx-root='true'] {
  position: relative;
  isolation: isolate;
  background-color: transparent;
  background-image: none;
  /* border-color 置透明而不是删边框：宽度保留，布局与 native 完全一致。 */
  border-color: transparent;
}
.did-card[data-fx-root='true']::after,
.enhanced-tool[data-fx-root='true']::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 8;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 0 0 0.5px var(--did-fx-card-ring);
}
/* 出错态沿用卡片原本的红边语义。 */
.did-card[data-fx-root='true'][data-state='error'] {
  --did-fx-card-ring: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--did-border-1));
}
/* .enhanced-tool 顶部有 4px 内边距（原生时由卡片自己的不透明底填充）；fx-root 下
   卡片根透明，这 4px 会透出壁纸形成一条“断层”。把这段内边距移进头部，让材质
   覆盖到卡片顶边，总高度不变（折叠态同理把底部内边距移进头部）。 */
.enhanced-tool[data-fx-root='true'] { padding-top: 0; }
.enhanced-tool[data-fx-root='true'] > .enhanced-head { padding-top: 5px; }
.enhanced-tool[data-fx-root='true'][data-body='false'] { padding-bottom: 0; }
.enhanced-tool[data-fx-root='true'][data-body='false'] > .enhanced-head { padding-bottom: 5px; }

/* ---- 外观效果 4.2. fx-root 里 native 子表面补回原底色 ------------------
   只补“原本由卡片根提供”的那一层：
     · 头部（.did-head / .enhanced-head）原本透明，依赖卡片根的
       --did-shell-base + --did-surface-1 渐变；
     · 差异内容区 / IO 面板原本就是 --did-io-bg，底部 foot 是 --did-surface-1，
       这里显式写回，保证“一半玻璃一半原生”时边界自然、底色不被半透明层影响。 */
.did-card[data-fx-root='true'] > .did-head[data-fx='native'] {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
}
/* 原生头在 fx-root 下仍要保留悬停高亮：旧 .did-head:hover 只叠 4% 前景色，
   在透明卡片根上会变成“透出壁纸”，所以这里把底色和悬停色一起补回来。 */
.did-card[data-fx-root='true'] > .did-head[data-fx='native']:hover {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(
    color-mix(in srgb, var(--did-fg-primary) 5%, var(--did-surface-1)),
    color-mix(in srgb, var(--did-fg-primary) 5%, var(--did-surface-1)));
}
.did-card[data-fx-root='true'] > .did-body[data-fx='native'] { background: var(--did-io-bg); }
.did-card[data-fx-root='true'] > .did-foot[data-fx='native'] { background: var(--did-surface-1); }
.enhanced-tool[data-fx-root='true'] > .enhanced-head[data-fx='native'] {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
}
.enhanced-tool[data-fx-root='true'] > .enhanced-io[data-fx='native'] { background: var(--did-io-bg); }
/* 内部配色 =「与外壳一致」时 --did-io-bg 是 transparent；在 fx-root 卡片里卡片根
   已经透明，native 子表面必须补回外壳表面色，否则会直接透出页面背景（混合模式
   “玻璃头部 + 原生内容区”会露出壁纸）。 */
.did-card[data-fx-root='true'][data-inner-tone='same'] > .did-body[data-fx='native'],
.enhanced-tool[data-fx-root='true'][data-inner-tone='same'] > .enhanced-io[data-fx='native'] {
  background: var(--did-surface-1);
}

/* ---- 外观效果 4.3. 卡片内材质表面的圆角贴合 ----------------------------
   卡片根有 --dsw-radius-lg 圆角 + overflow:hidden；材质表面自己再取一次首/尾
   圆角，边缘高光与色散环才能沿圆角走（否则伪元素描边是直角、在四个角被父级
   裁断）。中间位置的表面（差异 body / IO）保持直角，与原生一致。
   只作用于非 native 表面：native 子表面继续完全由父级裁剪，保证零视觉差异。 */
.did-card > [data-fx='glass']:first-child,
.did-card > [data-fx='liquid']:first-child,
.enhanced-tool > [data-fx='glass']:first-child,
.enhanced-tool > [data-fx='liquid']:first-child {
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
}
.did-card > [data-fx='glass']:last-child,
.did-card > [data-fx='liquid']:last-child,
.enhanced-tool > [data-fx='glass']:last-child,
.enhanced-tool > [data-fx='liquid']:last-child {
  border-end-start-radius: inherit;
  border-end-end-radius: inherit;
}

/* ---- 外观效果 5. 玻璃/液态表面内部的吸顶横条 --------------------------
   差异卡片与放大弹窗里的 hunk 表头（.did-bar）原本是不透明的
   “品牌色 9% + 代码底色”；当承载它的内容区是玻璃时把它改成半透明，
   否则玻璃材质会被这条横条整块盖住。其它内部小元素（行号、gap、notice）
   本来就是半透明色，不需要处理。 */
.did-body[data-fx='glass'] .did-bar,
.did-body[data-fx='liquid'] .did-bar,
.did-dialog[data-fx='glass'] .did-bar,
.did-dialog[data-fx='liquid'] .did-bar {
  /* 底色取 --did-fx-tint-base（内部配色 = “与外壳一致”时它已被换成外壳色，
     避免 --did-io-bg: transparent 被相对色语法解析成黑色）。 */
  background: color-mix(in srgb,
    var(--dsw-alias-brand-primary) 9%,
    rgb(from var(--did-fx-tint-base) r g b / 0.74));
}

/* ---- 外观效果 6. 单独浮层：差异弹窗 / 设置面板 / 行范围徽标 ------------ */
/* 差异弹窗（.did-dialog）整窗即材质面：头部/底部/栏头原本是不透明外壳色，
   现在让材质透出来；差异正文区保留一层 58% 的代码底色作为可读性底衬，
   避免大片代码直接压在壁纸模糊层上。 */
.did-dialog[data-fx='glass'] > .did-dialog-head,
.did-dialog[data-fx='liquid'] > .did-dialog-head,
.did-dialog[data-fx='glass'] > .did-panes-head,
.did-dialog[data-fx='liquid'] > .did-panes-head,
.did-dialog[data-fx='glass'] > .did-dialog-foot,
.did-dialog[data-fx='liquid'] > .did-dialog-foot {
  background: transparent;
}
.did-dialog[data-fx='glass'] > .did-dialog-body,
.did-dialog[data-fx='liquid'] > .did-dialog-body {
  background: color-mix(in srgb, var(--did-io-bg) 58%, transparent);
}
/* 设置弹窗（.did-settings-dialog）内部本来就是透明的，只需保证横幅、滚动区与
   身体不覆盖材质；.did-setting 的分隔线与小控件保持原样。 */
.did-settings-dialog[data-fx='glass'] > .did-settings-banner,
.did-settings-dialog[data-fx='liquid'] > .did-settings-banner,
.did-settings-dialog[data-fx='glass'] > .did-settings-scroll,
.did-settings-dialog[data-fx='liquid'] > .did-settings-scroll { background: transparent; }
/* 设置页面板（.did-settings-page）原本是通栏内容；挂上材质后给它一点内边距和
   圆角，否则文字会贴着材质边缘。只在非 native 时生效。 */
.did-settings-page[data-fx='glass'],
.did-settings-page[data-fx='liquid'] {
  padding: 16px 18px 22px;
  border-radius: var(--dsw-radius-lg, 16px);
}
/* 读取行范围徽标：inline-flex 的胶囊，材质直接画在它身上，尺寸/内边距保持不变
   （原生行里必须保持原布局不跳动）；文字提高一档亮度保证半透明底上可读。 */
.did-read-range[data-fx='glass'],
.did-read-range[data-fx='liquid'] {
  border-color: color-mix(in srgb, var(--did-border-2) 62%, transparent);
  color: var(--did-fg-secondary);
}

/* ---- 外观效果 6.2. 设置面板里的「外观效果」分组控件 --------------------
   由 settings-fx-ui 在设置面板末尾渲染；这里只做渐进增强的布局与滑杆外观，
   没有本段样式时也能靠既有 .did-setting / .did-seg 等类正常使用。 */
.did-fx-details { margin-top: 12px; }
/* 与 .did-langs-details 共用 summary；这里把标题提亮成一级文字并稍加粗。 */
.did-fx-details > summary {
  margin-top: 4px;
  color: var(--did-fg-primary);
  font-size: 13px;
  font-weight: 600;
}
.did-fx-details[open] > summary { margin-bottom: 6px; }
.did-fx-content { padding-top: 8px; }
.did-fx-desc { margin-top: 6px; }
.did-fx-legend { margin-top: 8px; }
.did-fx-legend > div + div { margin-top: 2px; }
.did-fx-list { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
/* 每行本身是 .did-setting（flex：左文字列 + 右分段控件）。这里**不加** flex-wrap：
   参数行的 max-content 是「两个滑杆 + 液态模式」的整排宽度，一旦允许换行，右侧
   效果分段会被挤到下一行左侧；交给 .did-setting-text（min-width:0）收缩、参数行
   自己内部换行即可，窄屏由 ≤720px 的列布局处理。 */
.did-fx-row { padding: 12px 0; }
/* 参数行：透明度滑杆 + 模糊滑杆（+ 液态模式）自动换行，不再首尾相连。 */
.did-fx-params {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  margin-top: 8px;
}
.did-fx-slider {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
}
.did-fx-range {
  width: 130px;
  height: 18px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: pointer;
}
.did-fx-range:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
/* 数值用等宽数字 + 固定最小宽度，拖动时行宽不抖动。 */
.did-fx-slider-value {
  min-width: 38px;
  color: var(--did-fg-primary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.did-fx-mode { margin-top: 2px; }
@media (max-width: 720px) {
  .did-fx-row { flex-direction: column; align-items: stretch; }
  .did-fx-row .did-setting-control { align-self: flex-start; }
  .did-fx-params { width: 100%; }
  .did-fx-range { width: 120px; }
}

/* ---- 外观效果 7. 降级与无障碍 ---------------------------------------- */
/* 7.1 不支持 backdrop-filter 的引擎：去掉模糊，换成高不透明度的半透明底色。
   这里不需要“玻璃感”，只需要保证文字仍然可读。 */
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    -webkit-backdrop-filter: none;
            backdrop-filter: none;
    background-color: rgb(from var(--did-fx-tint-base) r g b / clamp(0.72, calc(var(--did-fx-alpha-final) + 0.4), 1));
    background-image: var(--did-fx-glass-image);
  }
  [data-fx='liquid']::before,
  [data-fx='liquid']::after { display: none; }
}
/* 7.2 系统“降低透明度”：完全不模糊，材质接近实体（苹果在 same 设置下也是这么做的）。 */
@media (prefers-reduced-transparency: reduce) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
    background-color: rgb(from var(--did-fx-tint-base) r g b / clamp(0.86, calc(var(--did-fx-alpha-final) + 0.34), 1));
  }
  [data-fx='liquid']::before { display: none; }
  [data-fx='liquid']::after { opacity: 0.35; }
}
/* 7.3 强制颜色模式：只保留 1px 边框，去掉装饰性高光与噪声。 */
@media (forced-colors: active) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    background-image: none;
    border: 1px solid CanvasText;
    box-shadow: none;
  }
  [data-fx='liquid']::before,
  [data-fx='liquid']::after { display: none; }
  [data-fx-root='true']::after { display: none; }
}

/* ---- 外观效果 8. 弹窗遮罩的“模糊代理” ---------------------------------
   原因（研究结论，见 .team/liquid-glass/NOTES.md probe5）：Chromium 会忽略嵌套的
   backdrop-filter —— 祖先元素有 backdrop-filter 时，子元素/伪元素的 backdrop-filter
   完全失效。放大弹窗（在 .did-overlay 里）与设置弹窗（在 .did-settings-overlay 里）
   的遮罩层都自带模糊，因此这两个“表面”自身的 blur/折射是惰性的，「模糊」滑杆会
   没有可见变化。

   修复：把弹窗表面（diffModal / settingsPanel）的模糊参数接到遮罩层上——markup 在
   表面非 native 时给遮罩挂 data-fx-backdrop 与 --did-fx-blur（surfaces.js 的
   backdropProxyProps），遮罩按同一个 blur 与 clear/frosted 系数做 backdrop-filter，
   弹窗内部的半透明材质叠在“已模糊的背景”上。于是模糊滑杆对这两个表面同样生效。
   表面为 native 时遮罩不带任何属性，旧外观完全不变。 */
.did-overlay[data-fx-backdrop],
.did-settings-overlay[data-fx-backdrop] {
  --did-fx-backdrop-blur: var(--did-fx-blur, 14px);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 52%, transparent);
  -webkit-backdrop-filter: blur(var(--did-fx-backdrop-blur)) saturate(1.1) brightness(0.92);
          backdrop-filter: blur(var(--did-fx-backdrop-blur)) saturate(1.1) brightness(0.92);
}
/* clear（完全通透）：遮罩也几乎不模糊，让弹窗更像一块通透的液态玻璃。 */
.did-overlay[data-fx-backdrop='liquid'][data-liquid-mode='clear'],
.did-settings-overlay[data-fx-backdrop='liquid'][data-liquid-mode='clear'] {
  --did-fx-backdrop-blur: calc(var(--did-fx-blur, 14px) * 0.12);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 38%, transparent);
}
/* 无障碍降级：降低透明度时遮罩不做模糊（与内部材质的降级保持一致）。 */
@media (prefers-reduced-transparency: reduce) {
  .did-overlay[data-fx-backdrop],
  .did-settings-overlay[data-fx-backdrop] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
    background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  }
}
@media (forced-colors: active) {
  .did-overlay[data-fx-backdrop],
  .did-settings-overlay[data-fx-backdrop] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
  }
}


/* ---- 外观效果 9. 浅色 / 强制浅色卡片的可读性校正 -----------------------
   用户反馈：浅色外观下卡片边缘的小字（增删统计、行号、旧/新图例、语言徽章、
   底部状态条、轨迹按钮……）看不清，因为 1.3.0 直接使用宿主的 success/error
   token（官方浅色是 #22c55e / #ec1313 这类高饱和色）和三级灰，在白底/浅色玻璃
   上只有 1.8–4.2 的对比度。

   修复：语义文字统一改走 --did-*-ink 变量（默认值仍等于宿主语义色，深色外观
   因此完全不变），浅色外观与「强制浅色外壳」的卡片用混入深色前景的“墨色”，
   小号辅助文字提升到二级前景色；「强制深色外壳」的卡片反过来使用亮色墨。 */
.did-add,
.did-row[data-kind='add'] .did-sign,
.did-row[data-kind='add'] .did-move,
.enhanced-tool[data-variant='command'] .enhanced-kind {
  color: var(--did-add-ink, var(--dsw-alias-state-success-primary));
}
.did-del,
.did-row[data-kind='del'] .did-sign,
.did-row[data-kind='del'] .did-move,
.enhanced-exit,
.enhanced-code[data-error],
.did-error,
.did-settings-error,
.did-state[data-state='error'] {
  color: var(--did-del-ink, var(--dsw-alias-state-error-primary));
}
.did-row[data-kind='add'] .did-num[data-side='new'] {
  color: var(--did-num-add-ink, color-mix(in srgb, var(--dsw-alias-state-success-primary) 60%, var(--did-fg-tertiary)));
}
.did-row[data-kind='del'] .did-num[data-side='old'] {
  color: var(--did-num-del-ink, color-mix(in srgb, var(--dsw-alias-state-error-primary) 60%, var(--did-fg-tertiary)));
}
.did-numhead-label[data-side='old'] { color: color-mix(in srgb, var(--did-del-ink, var(--dsw-alias-state-error-primary)) 72%, var(--did-fg-secondary)); }
.did-numhead-label[data-side='new'] { color: color-mix(in srgb, var(--did-add-ink, var(--dsw-alias-state-success-primary)) 72%, var(--did-fg-secondary)); }

/* 浅色外观（自动色调）：深墨色 + 小字提级。 */
body[data-dsh-inline-diff-appearance='light'] {
  --did-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--did-fg-primary));
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--did-fg-primary));
  --did-num-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 34%, var(--did-fg-primary));
}
/* 强制浅色外壳（无论当前外观）：同样是深墨色（--did-fg-primary 已被色调块改为深色）。 */
[data-shell-tone='light'] {
  --did-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--did-fg-primary));
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--did-fg-primary));
  --did-num-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 34%, var(--did-fg-primary));
}
/* 强制深色外壳：亮色墨（覆盖浅色外观的深墨色；深色外壳上需要浅色小字）。 */
[data-shell-tone='dark'] {
  --did-add-ink: #4ade80;
  --did-del-ink: #f87171;
  --did-num-add-ink: color-mix(in srgb, #4ade80 55%, var(--did-fg-tertiary));
  --did-num-del-ink: color-mix(in srgb, #f87171 55%, var(--did-fg-tertiary));
}
/* 深色外观默认：错误红略微提亮，保证在深色玻璃上达到 AA。 */
body[data-dsh-inline-diff-appearance='dark'] {
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 70%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, var(--did-fg-tertiary));
}
/* 小号辅助文字：浅色外观 / 强制浅色外壳里提升到二级前景色（白底约 6.6）。 */
body[data-dsh-inline-diff-appearance='light'] .did-read-range,
body[data-dsh-inline-diff-appearance='light'] .did-meta,
body[data-dsh-inline-diff-appearance='light'] .did-empty,
body[data-dsh-inline-diff-appearance='light'] .did-lang,
body[data-dsh-inline-diff-appearance='light'] .did-num,
body[data-dsh-inline-diff-appearance='light'] .did-numhead,
body[data-dsh-inline-diff-appearance='light'] .did-bar-range,
body[data-dsh-inline-diff-appearance='light'] .did-foot,
body[data-dsh-inline-diff-appearance='light'] .enhanced-state,
body[data-dsh-inline-diff-appearance='light'] .enhanced-inspect-label,
[data-shell-tone='light'] .did-meta,
[data-shell-tone='light'] .did-empty,
[data-shell-tone='light'] .did-lang,
[data-shell-tone='light'] .did-num,
[data-shell-tone='light'] .did-numhead,
[data-shell-tone='light'] .did-bar-range,
[data-shell-tone='light'] .did-foot,
[data-shell-tone='light'] .enhanced-state,
[data-shell-tone='light'] .enhanced-inspect-label { color: var(--did-fg-secondary); }
/* 强制深色外壳里，小号辅助文字继续用色调块的浅色二级灰（--did-fg-secondary 已随
   色调变成 #c3cade），上面那条只用 var() 引用，不需要额外规则。 */

/* 语言徽章再深一档：徽章底色本身是浅色混合，二级灰只有 4.48，改用一级前景色。 */
body[data-dsh-inline-diff-appearance='light'] .did-lang,
[data-shell-tone='light'] .did-lang { color: var(--did-fg-primary); }

/* 浅色外观里卡片外轮廓再清晰一点：白底 + 白色高光会让玻璃卡片边缘“糊”在背景里，
   这里把外轮廓环加深一档（只影响带 fx-root 的玻璃卡片，native 卡片不变）。 */
body[data-dsh-inline-diff-appearance='light'] [data-fx-root='true'] {
  --did-fx-card-ring: color-mix(in srgb, var(--did-border-2) 78%, var(--did-border-1));
}

/* ---- 外观效果 10. 强制外壳色调与外观相反时的完整适配 -------------------
   浅色外观里选「深色外壳」（或深色外观里选「浅色外壳」）时，半透明玻璃叠在相反
   的页面底色上会被冲成中灰：深色卡片变灰、浅色文字与语义色一起掉对比度（实测
   1.2–2.0，完全看不清）。这种组合本身意味着用户要一张“强制色调”的卡片，因此：
     1) 卡片内材质不再透出页面底色（--did-fx-alpha-boost 固定 1 → alpha-final=1）；
     2) 在卡片子树内局部替换宿主品牌色与语义色：浅色主题的黑色链接 / 亮绿红不会
        落在深色表面上，深色主题的浅色链接 / 亮绿红不会落在浅色表面上；
     3) 卡片内的「放大」按钮跟随卡片表面色（它原本取宿主 --dsw-alias-bg-base，
        在强制色调卡片里会出现黑胶囊 / 白胶囊与卡片底色撞色）。
   全部只作用于“色调与外观相反”的组合；色调与外观一致的卡片不受影响。 */
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'][data-fx],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'][data-fx] {
  --did-fx-alpha-boost: 1;
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] {
  --dsw-alias-brand-primary: #9db9ff;
  --dsw-alias-brand-text: #9db9ff;
  --dsw-alias-state-success-primary: #4ade80;
  --dsw-alias-state-error-primary: #f87171;
  --dsw-alias-state-warn-primary: #fbbf24;
  --dsw-alias-label-primary: #eef1f8;
  --dsw-alias-label-secondary: #c3cade;
  --dsw-alias-label-tertiary: #94a1bc;
  --dsw-alias-border-l1: rgba(151, 169, 216, 0.24);
  --dsw-alias-border-l2: rgba(151, 169, 216, 0.42);
}
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] {
  --dsw-alias-brand-primary: #1d4ed8;
  --dsw-alias-brand-text: #1d4ed8;
  --dsw-alias-state-success-primary: #166534;
  --dsw-alias-state-error-primary: #991b1b;
  --dsw-alias-state-warn-primary: #b45309;
  --dsw-alias-label-primary: #172347;
  --dsw-alias-label-secondary: #4d5d7f;
  --dsw-alias-label-tertiary: #6f7c99;
  --dsw-alias-border-l1: rgba(71, 91, 145, 0.24);
  --dsw-alias-border-l2: rgba(71, 91, 145, 0.42);
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] .did-zoom,
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] .did-zoom {
  background: var(--did-surface-1);
  border-color: var(--did-border-2);
  color: var(--did-fg-secondary);
}
/* ---- 动效 11. 卡片 / 弹窗入场与输出出现 --------------------------------
   设计原则：
   · 只给“从无到有”的瞬时变化加动画：运行中的工具卡片挂载、命令输出到达、
     设置弹窗 / 放大弹窗打开；历史回放、已结算卡片、几毫秒完成的调用都不加，
     避免为了动画而上动画。
   · 只用 opacity + transform（GPU 合成，不触发重排）；缓动是强 ease-out 的
     阻尼曲线，没有回弹/过冲，克制、不夸张。
   · 「prefers-reduced-motion: reduce」 下全部关闭（用户系统偏好优先）。
   · 动画只作用于本插件自己的 DOM，不影响 DSH 原生行与第三方主题的动画。 */
@keyframes did-card-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes did-output-enter {
  from { opacity: 0; transform: translate3d(0, 2px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes did-overlay-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes did-dialog-enter {
  from { opacity: 0; transform: translate3d(0, 6px, 0) scale(0.985); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@media (prefers-reduced-motion: no-preference) {
  /* 运行中/准备中挂载的工具卡片（仅增强风格，原生行不在此列）。 */
  .enhanced-tool[data-enter] {
    animation: did-card-enter 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* 输出占位切换到真实输出的那一次。 */
  .enhanced-section[data-appear] {
    animation: did-output-enter 160ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* 设置弹窗（启动按钮打开）与放大弹窗：遮罩淡入 + 对话框轻微上浮。 */
  .did-settings-overlay[data-enter],
  .did-overlay-root[data-enter] {
    animation: did-overlay-enter 140ms ease-out both;
  }
  .did-settings-dialog[data-enter],
  .did-dialog[data-enter] {
    animation: did-dialog-enter 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

/* ---- 设置页：版本与更新面板 --------------------------------------------- */
.did-update {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.5px solid var(--did-border-1);
}
.did-update-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.did-update-headtext { flex: 1; min-width: 0; }
.did-update-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--did-fg-primary);
}
.did-update-sub {
  margin-top: 3px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--did-fg-secondary);
}
.did-update-check {
  flex: none;
  padding: 5px 11px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 8px;
  background: transparent;
  color: var(--did-fg-primary);
  font-size: 11.5px;
  cursor: pointer;
}
.did-update-check:hover:not(:disabled) { background: color-mix(in srgb, var(--did-fg-primary) 6%, transparent); }
.did-update-check:disabled { opacity: 0.55; cursor: default; }
.did-update-idle {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--did-fg-tertiary);
}
.did-update-list {
  margin-top: 9px;
  max-height: 210px;
  overflow: auto;
  border: 0.5px solid var(--did-border-1);
  border-radius: 8px;
  background: color-mix(in srgb, var(--did-fg-primary) 2.5%, transparent);
}
.did-update-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 6px 9px;
  border: 0;
  background: transparent;
  color: var(--did-fg-primary);
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}
.did-update-row + .did-update-row { border-top: 0.5px solid var(--did-border-1); }
.did-update-row:hover:not(:disabled) { background: color-mix(in srgb, var(--did-fg-primary) 5%, transparent); }
.did-update-row[data-selected] { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
.did-update-row:disabled { opacity: 0.55; cursor: default; }
.did-update-ver { font-family: var(--did-mono, ui-monospace, monospace); }
.did-update-date { margin-left: auto; color: var(--did-fg-tertiary); font-size: 10.5px; }
.did-update-badge {
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  font-size: 10px;
  line-height: 14px;
  color: var(--did-fg-secondary);
}
.did-update-badge[data-warn] { border-style: dashed; }
.did-update-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 9px;
}
.did-update-hint {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  color: var(--did-fg-tertiary);
}
.did-update-install {
  flex: none;
  padding: 5px 12px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
  color: var(--did-fg-primary);
  font-size: 11.5px;
  cursor: pointer;
}
.did-update-install:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent); }
.did-update-install:disabled { opacity: 0.5; cursor: default; }
.did-update-manual { margin-top: 9px; }
.did-update-manual-hint {
  margin-bottom: 5px;
  font-size: 10.5px;
  color: var(--did-fg-tertiary);
}
.did-update-command {
  display: block;
  padding: 6px 8px;
  overflow-x: auto;
  border: 0.5px solid var(--did-border-1);
  border-radius: 6px;
  background: var(--did-io-bg);
  color: var(--did-fg-secondary);
  font-family: var(--did-mono, ui-monospace, monospace);
  font-size: 10.5px;
  white-space: nowrap;
  user-select: all;
}
.did-update-result {
  margin-top: 9px;
  font-size: 11.5px;
  color: var(--did-add-ink, var(--dsw-alias-state-success-primary));
}
.did-update-log { margin-top: 7px; font-size: 10.5px; color: var(--did-fg-tertiary); }
.did-update-log pre {
  margin: 5px 0 0;
  max-height: 140px;
  overflow: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--did-io-bg);
  color: var(--did-fg-secondary);
  font-family: var(--did-mono, ui-monospace, monospace);
  white-space: pre-wrap;
  word-break: break-all;
}

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
function paletteBlock(selector, palette, segMix) {
  return `${selector} {
${paletteVars(palette)}
  --did-syn-seg-mix: ${segMix};
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
/* 次级分组复用相近色相，不再增加颜色数量。 */
.did-tok[data-g='fn'],
.did-tok[data-g='tag'],
.did-tok[data-g='head'] { color: var(--did-syn-kw); }
.did-tok[data-g='attr'],
.did-tok[data-g='link'] { color: var(--did-syn-str); }
.did-tok[data-g='lit'] { color: var(--did-syn-num); }
/* 普通标识符与强调文字保持代码默认前景色。 */
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
/* “仅颜色”：确保没有任何字体样式从别处泄漏进来。 */
[data-syn-emphasis='off'] .did-tok {
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}
`.trim();
var SEGMENT_RULES = `
.did-seg[data-changed='true'] .did-tok[data-g='kw'],
.did-seg[data-changed='true'] .did-tok[data-g='fn'],
.did-seg[data-changed='true'] .did-tok[data-g='tag'],
.did-seg[data-changed='true'] .did-tok[data-g='head'] { color: color-mix(in srgb, var(--did-syn-kw) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='str'],
.did-seg[data-changed='true'] .did-tok[data-g='attr'],
.did-seg[data-changed='true'] .did-tok[data-g='link'] { color: color-mix(in srgb, var(--did-syn-str) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='num'],
.did-seg[data-changed='true'] .did-tok[data-g='lit'] { color: color-mix(in srgb, var(--did-syn-num) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='type'] { color: color-mix(in srgb, var(--did-syn-type) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='prop'] { color: color-mix(in srgb, var(--did-syn-prop) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='com'] { color: color-mix(in srgb, var(--did-syn-com) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='meta'] { color: color-mix(in srgb, var(--did-syn-meta) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='op'] { color: color-mix(in srgb, var(--did-syn-op) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
.did-seg[data-changed='true'] .did-tok[data-g='punct'] { color: color-mix(in srgb, var(--did-syn-punct) var(--did-syn-seg-mix, 60%), var(--did-fg-primary)); }
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
/* 卡片头：允许徽章收缩而不是把头部动作按钮挤出窄窗口；父级用 overflow
   hidden 截断。12em 上限足以容纳本地化的“未知语言”/“Unknown”以及最长的
   语言全名。 */
.did-head > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
}
/* 弹窗副标题：徽章内联在既有文字之前。 */
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
/* ---- 语法高亮：只使用前景色 ---------------------------------------------
   新增/删除行背景、行号符号与行内改动底色仍由 styles.js 以红/绿表达；
   这里的规则只改 token 文字颜色。
   调色板变量声明在 body 上，原因与 styles.js 相同：宿主主题把它的 token 声明
   在 body，声明在 :root 的 var() 解析不到那些 token（详见 styles.js）。 */
${paletteBlock("body", SYNTAX_PALETTE.dark, "55%")}
/* 官方浅色外观（宿主设置）：浅色内层。 */
${paletteBlock("body[data-dsh-inline-diff-appearance='light']", SYNTAX_PALETTE.light, "50%")}
/* 单卡片内部配色覆盖。'auto' 故意不写规则：跟随上面的文档级外观。 */
${paletteBlock("[data-inner-tone='light']", SYNTAX_PALETTE.light, "50%")}
${paletteBlock("[data-inner-tone='dark']", SYNTAX_PALETTE.dark, "55%")}
/* “内层配色 = 跟随外壳”：代码底色即外壳表面，因此调色板跟随外壳配色。 */
${paletteBlock("[data-inner-tone='same'][data-shell-tone='light']", SYNTAX_PALETTE.light, "50%")}
${paletteBlock("[data-inner-tone='same'][data-shell-tone='dark']", SYNTAX_PALETTE.dark, "55%")}
/* 当“代码底色”与当前外观相反（浅色外观里的深色内层，或强制深色外壳 + 内层
   跟随外壳）时，词级改动片段的底色更深（或更浅），token 需要更多地向可读前景色
   靠拢才能达到 AA。比例在下面的 SEGMENT 调色板块里按上下文覆盖。 */
body[data-dsh-inline-diff-appearance='light'] [data-inner-tone='dark'],
body[data-dsh-inline-diff-appearance='light'] [data-inner-tone='same'][data-shell-tone='dark'] {
  --did-syn-seg-mix: 40%;
}
body[data-dsh-inline-diff-appearance='dark'] [data-inner-tone='light'],
body[data-dsh-inline-diff-appearance='dark'] [data-inner-tone='same'][data-shell-tone='light'] {
  --did-syn-seg-mix: 35%;
}

${TOKEN_RULES}

/* 行内词级改动片段：底色比整行深，token 与前景色混合后在浅/深外观下都能达到
   AA。混色比例 --did-syn-seg-mix 由上面的调色板块按“深/浅代码底色”给出；
   色相仍来自同一调色板，只是整体向可读前景色靠拢，不会变成红/绿语义色。 */
${SEGMENT_RULES}

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
function applyChipAppearance(chip) {
  const config = surfaceDomValues(getSettings(), "readRangeChip");
  chip.setAttribute("data-fx", config.effect);
  chip.setAttribute("data-fx-surface", "readRangeChip");
  if (config.effect === EFFECT_LIQUID) chip.setAttribute("data-liquid-mode", config.mode);
  else chip.removeAttribute("data-liquid-mode");
  chip.style.setProperty("--did-fx-alpha", String(config.opacity));
  chip.style.setProperty("--did-fx-blur", `${config.blur}px`);
}
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
  applyChipAppearance(chip);
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
  const body = document.body;
  if (body === null || body === void 0) return () => {
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
  try {
    observer.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-expanded"] });
  } catch {
    observer.disconnect();
    return () => {
    };
  }
  let unsubscribeSettings = () => {
  };
  try {
    unsubscribeSettings = subscribeSettings(() => {
      for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) applyChipAppearance(chip);
    });
  } catch {
    unsubscribeSettings = () => {
    };
  }
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    unsubscribeSettings();
    observer.disconnect();
    if (frame !== null) {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
    }
    for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) chip.remove();
  };
}

// src/client/project.js
var VERSION = "1.4.0";
var AUTHOR = "Him666233";
var AUTHOR_URL = "https://github.com/Him666233";
var REPO_URL = "https://github.com/Him666233/dsh-inline-diff";

// src/client/settings-ui.jsx
var import_react6 = require("react");
var import_react_dom2 = require("react-dom");

// src/client/updates.js
function parseSemver(text) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(text ?? "").trim());
  if (match === null) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] === void 0 ? [] : match[4].split(".")
  };
}
function compareSemver(left, right) {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (a === null || b === null) return 0;
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] - b[key];
  }
  if (a.pre.length === 0 && b.pre.length === 0) return 0;
  if (a.pre.length === 0) return 1;
  if (b.pre.length === 0) return -1;
  const length = Math.max(a.pre.length, b.pre.length);
  for (let index = 0; index < length; index += 1) {
    const x = a.pre[index];
    const y = b.pre[index];
    if (x === void 0) return -1;
    if (y === void 0) return 1;
    const xn = /^\d+$/.test(x) ? Number(x) : null;
    const yn = /^\d+$/.test(y) ? Number(y) : null;
    if (xn !== null && yn !== null) {
      if (xn !== yn) return xn - yn;
      continue;
    }
    if (xn !== null) return -1;
    if (yn !== null) return 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}
function buildVersionRows(payload2, currentVersion) {
  const rows = [];
  const versions = Array.isArray(payload2?.versions) ? payload2.versions : [];
  const latest = typeof payload2?.latest === "string" ? payload2.latest : null;
  for (const item of versions) {
    if (item === null || typeof item !== "object") continue;
    if (typeof item.version !== "string" || parseSemver(item.version) === null) continue;
    const installable = item.installable !== false;
    const reason = installable ? null : item.bundleMissing === true ? "bundle-missing" : "unavailable";
    rows.push({
      version: item.version,
      latest: item.version === latest || item.latest === true,
      current: currentVersion !== null && currentVersion !== void 0 && item.version === currentVersion,
      publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : null,
      deprecated: typeof item.deprecated === "string" || item.deprecated === true,
      enginesDsh: typeof item.enginesDsh === "string" ? item.enginesDsh : null,
      installable,
      reason
    });
  }
  rows.sort((a, b) => compareSemver(b.version, a.version));
  return rows;
}
function installActionFor(currentVersion, targetVersion) {
  if (parseSemver(currentVersion) === null || parseSemver(targetVersion) === null) return null;
  const order = compareSemver(targetVersion, currentVersion);
  if (order === 0) return "reinstall";
  return order > 0 ? "update" : "rollback";
}
function formatPublishedAt(iso) {
  if (typeof iso !== "string" || iso === "") return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// src/client/settings-ui.jsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var ORIGINALITY_REPO_URL = "https://github.com/JanEickholt/dsh-inline-diff";
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
  return (0, import_react6.useSyncExternalStore)(subscribeModal, () => modalOpen, () => modalOpen);
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
function SettingRow({ label, description, children, extra, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: className === void 0 ? "did-setting" : `did-setting ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-setting-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-label", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-desc", children: description }),
      extra === void 0 ? null : extra
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-control", children })
  ] });
}
var FX_EFFECT_LABEL_KEYS = {
  native: "fx.effectNative",
  glass: "fx.effectGlass",
  liquid: "fx.effectLiquid"
};
var FX_EFFECT_DESC_KEYS = {
  native: "fx.effectNativeDesc",
  glass: "fx.effectGlassDesc",
  liquid: "fx.effectLiquidDesc"
};
var FX_MODE_LABEL_KEYS = { clear: "fx.liquidClear", frosted: "fx.liquidFrosted" };
function FxRange({ label, display, value, min, max, step, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "did-fx-slider", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-fx-slider-label", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        className: "did-fx-range",
        type: "range",
        "aria-label": label,
        min,
        max,
        step,
        value,
        onChange: (event) => onChange(Number(event.target.value))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-fx-slider-value", children: display })
  ] });
}
function FxSettings({ t, settings, onChange }) {
  let enabledCount = 0;
  for (const surface of SURFACES) {
    if (effectOf(settings, surface.id).effect !== "native") enabledCount += 1;
  }
  const summaryState = enabledCount === 0 ? t("fx.summaryNone") : t("fx.summaryCount", { n: enabledCount });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("details", { className: "did-fx-details did-langs-details", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("summary", { children: [
      t("fx.sectionTitle"),
      summaryState
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-fx-content", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-setting-desc did-fx-desc", children: t("fx.sectionDesc") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note did-fx-legend", children: EFFECTS.map((effect) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        t(FX_EFFECT_LABEL_KEYS[effect]),
        " — ",
        t(FX_EFFECT_DESC_KEYS[effect])
      ] }, effect)) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-fx-list", children: SURFACES.map((surface) => {
        const config = effectOf(settings, surface.id);
        const liquid = config.effect === "liquid";
        const params = config.effect === "native" ? void 0 : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-fx-params", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            FxRange,
            {
              label: t("fx.opacity"),
              display: `${Math.round(config.opacity * 100)}%`,
              value: config.opacity,
              min: FX_LIMITS.opacityMin,
              max: FX_LIMITS.opacityMax,
              step: FX_LIMITS.opacityStep,
              onChange: (value) => onChange(surface.id, { opacity: value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            FxRange,
            {
              label: t("fx.blur"),
              display: `${config.blur}px`,
              value: config.blur,
              min: FX_LIMITS.blurMin,
              max: FX_LIMITS.blurMax,
              step: FX_LIMITS.blurStep,
              onChange: (value) => onChange(surface.id, { blur: value })
            }
          ),
          liquid ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-tones did-fx-mode", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-tone-label", children: t("fx.liquidMode") }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              Segmented,
              {
                ariaLabel: t("fx.liquidMode"),
                value: config.mode,
                onChange: (value) => onChange(surface.id, { mode: value }),
                options: LIQUID_MODES.map((mode) => ({ value: mode, label: t(FX_MODE_LABEL_KEYS[mode]) }))
              }
            )
          ] }) : null
        ] });
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          SettingRow,
          {
            className: "did-fx-row",
            label: t(surface.labelKey),
            description: t(surface.descKey),
            extra: params,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              Segmented,
              {
                ariaLabel: `${t(surface.labelKey)} · ${t("fx.effect")}`,
                value: config.effect,
                onChange: (value) => onChange(surface.id, { effect: value }),
                options: EFFECTS.map((effect) => ({ value: effect, label: t(FX_EFFECT_LABEL_KEYS[effect]) }))
              }
            )
          },
          surface.id
        );
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-note", children: t("fx.note") })
    ] })
  ] });
}
function SettingsCloseButton({ onClose, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "did-settings-close", onClick: onClose, "aria-label": t("close"), title: t("close"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { viewBox: "0 0 16 16", width: "13", height: "13", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) });
}
function SupportedLanguages({ t, languages }) {
  const [open, setOpen] = (0, import_react6.useState)(false);
  const detailsRef = (0, import_react6.useRef)(null);
  (0, import_react6.useEffect)(() => {
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
  const settings = useSettingsSnapshot();
  const languageList = supportedLanguageList();
  const [dsmMode, setDsmMode] = (0, import_react6.useState)(void 0);
  const [busy, setBusy] = (0, import_react6.useState)(false);
  const [error, setError] = (0, import_react6.useState)("");
  (0, import_react6.useEffect)(() => {
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
  const patchSurfaceEffect = (surfaceId, patch) => {
    const current = getSettings();
    const effects = { ...current.effects ?? {} };
    effects[surfaceId] = { ...effectOf(current, surfaceId), ...patch };
    updateSettings({ effects });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-headtext", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-title", children: t("settings.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-sub", children: t("settings.description") })
      ] }),
      onClose === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsCloseButton, { onClose, t })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingRow, { label: t("settings.language"), description: t("settings.languageDesc"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Segmented,
        {
          ariaLabel: t("settings.language"),
          value: settings.language,
          onChange: (value) => updateSettings({ language: value }),
          options: [
            { value: "zh", label: t("settings.languageZh") },
            { value: "en", label: t("settings.languageEn") },
            { value: "auto", label: t("settings.languageAuto") }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-originality", role: "note", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-originality-title", children: t("originality.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-originality-body", children: t("originality.body", { repo: ORIGINALITY_REPO_URL }) })
      ] }),
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
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FxSettings, { t, settings, onChange: patchSurfaceEffect }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(UpdateSection, { t }),
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
  const settings = useSettingsSnapshot();
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-page", ...surfaceProps(settings, "settingsPanel"), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t }) });
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
function UpdateSection({ t }) {
  const [info, setInfo] = (0, import_react6.useState)(null);
  const [loading, setLoading] = (0, import_react6.useState)(false);
  const [installing, setInstalling] = (0, import_react6.useState)(false);
  const [error, setError] = (0, import_react6.useState)("");
  const [selected, setSelected] = (0, import_react6.useState)(null);
  const [result, setResult] = (0, import_react6.useState)(null);
  const currentVersion = info?.current ?? VERSION;
  const rows = (0, import_react6.useMemo)(() => info === null ? [] : buildVersionRows(info, currentVersion), [info, currentVersion]);
  const selectedRow = rows.find((row) => row.version === selected) ?? null;
  const action = selectedRow === null ? null : installActionFor(currentVersion, selectedRow.version);
  const manualMode = info?.installer?.mode === "manual";
  const resetFeedback = () => {
    setError("");
    setResult(null);
  };
  const load2 = async (refresh) => {
    if (loading === true || installing === true) return;
    resetFeedback();
    setLoading(true);
    const data = await fetchUpdateInfo(refresh);
    setLoading(false);
    if (data === null) {
      setError(t("update.errorNetwork"));
      return;
    }
    setInfo(data);
    const preferred = data.versions?.find((item) => item.version === data.latest && item.installable !== false) ?? data.versions?.find((item) => item.installable !== false);
    setSelected(preferred?.version ?? null);
  };
  const install = async () => {
    if (selectedRow === null || selectedRow.installable !== true || installing === true) return;
    resetFeedback();
    setInstalling(true);
    const response = await performUpdate(selectedRow.version);
    setInstalling(false);
    if (response === null) {
      setError(t("update.errorNetwork"));
      return;
    }
    setResult(response);
    if (response.ok === true) setInfo((prev) => prev === null ? prev : { ...prev, current: response.installedVersion ?? prev.current });
  };
  const actionLabel = action === "update" ? t("update.updateTo", { version: selectedRow?.version ?? "" }) : action === "rollback" ? t("update.rollbackTo", { version: selectedRow?.version ?? "" }) : action === "reinstall" ? t("update.reinstall", { version: selectedRow?.version ?? "" }) : t("update.selectVersion");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update-headtext", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-title", children: t("update.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update-sub", children: [
          t("update.current", { version: currentVersion }),
          typeof info?.latest === "string" ? ` · ${t("update.latest")} v${info.latest}` : "",
          typeof info?.dshVersion === "string" ? ` · DSH ${info.dshVersion}` : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: "did-update-check",
          disabled: loading || installing,
          onClick: () => load2(true),
          children: loading ? t("update.checking") : t("update.check")
        }
      )
    ] }),
    error !== "" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-error", children: error }) : null,
    info === null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-idle", children: t("update.idleHint") }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_react6.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-list", role: "listbox", "aria-label": t("update.versions"), children: rows.slice(0, 15).map((row) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "button",
        {
          type: "button",
          role: "option",
          "aria-selected": selected === row.version,
          className: "did-update-row",
          "data-selected": selected === row.version ? "" : void 0,
          "data-latest": row.latest ? "" : void 0,
          "data-current": row.current ? "" : void 0,
          "data-unavailable": row.installable ? void 0 : "",
          disabled: !row.installable,
          onClick: () => {
            resetFeedback();
            setSelected(row.version);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "did-update-ver", children: [
              "v",
              row.version
            ] }),
            row.latest ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-badge", children: t("update.latest") }) : null,
            row.current ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-badge", children: t("update.installed") }) : null,
            row.deprecated ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-badge", "data-warn": "", children: t("update.deprecated") }) : null,
            row.installable ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-badge", "data-warn": "", children: t("update.unavailable") }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-date", children: formatPublishedAt(row.publishedAt) })
          ]
        },
        row.version
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "did-update-hint", children: manualMode ? t("update.manualHint") : t("update.restartHint") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            className: "did-update-install",
            disabled: selectedRow === null || selectedRow.installable !== true || installing || manualMode,
            onClick: install,
            children: installing ? t("update.installing") : actionLabel
          }
        )
      ] }),
      manualMode && typeof info?.installer?.command === "string" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-update-manual", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-manual-hint", children: t("update.manualCommandHint", { profile: info?.profile?.name ?? "desktop" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { className: "did-update-command", children: info.installer.command.replace("@<version>", `@${selectedRow?.version ?? "<version>"}`) })
      ] }) : null,
      result !== null ? result.ok ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-result", "data-ok": "", children: t("update.installOk", { version: result.installedVersion ?? selectedRow?.version ?? "" }) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-error", children: [
        t("update.installFailed", { code: result.code ?? "unknown" }),
        typeof result.command === "string" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-update-manual-hint", children: result.command }) : null
      ] }) : null,
      typeof result?.logTail === "string" && result.logTail !== "" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("details", { className: "did-update-log", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("summary", { children: t("update.log") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("pre", { children: result.logTail })
      ] }) : null
    ] })
  ] });
}
function SettingsModal({ t }) {
  const open = useModalOpen();
  const settings = useSettingsSnapshot();
  const [host, setHost] = (0, import_react6.useState)(null);
  (0, import_react6.useEffect)(() => {
    setHost(document.body);
  }, []);
  (0, import_react6.useEffect)(() => {
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
  const overlay = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react6.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-overlay", "data-enter": "", ...backdropProxyProps(settings, "settingsPanel"), onPointerDown: closeSettingsModal, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: "did-settings-dialog",
      "data-enter": "",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t("settings.title"),
      ...surfaceProps(settings, "settingsPanel"),
      onPointerDown: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-banner", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "did-settings-headtext", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-title", children: t("settings.title") }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-sub", children: t("settings.description") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsCloseButton, { onClose: closeSettingsModal, t })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "did-settings-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SettingsPanel, { t, onClose: closeSettingsModal }) })
      ]
    }
  ) }) });
  return host === null ? overlay : (0, import_react_dom2.createPortal)(overlay, host);
}

// src/client/index.jsx
installI18nRuntime({ createElement: import_react7.createElement, useSyncExternalStore: import_react7.useSyncExternalStore });
var PluginInlineDiffCard = withPluginI18n(InlineDiffCard);
var PluginEnhancedShellCard = withPluginI18n(EnhancedShellCard);
var PluginEnhancedExpandedTool = withPluginI18n(EnhancedExpandedTool);
var PluginDiffModal = withPluginI18n(DiffModal);
var PluginSettingsModal = withPluginI18n(SettingsModal);
var PluginSettingsSection = withPluginI18n(SettingsSection);
var PluginSettingsLauncher = withPluginI18n(SettingsLauncher);
var inject = ["slots", "locale", "configForms"];
var INLINE_DIFF_KEYS = MUTATION_TOOLS;
var ENHANCED_SHELL_KEYS = SHELL_KEYS;
var VIEW_PRIORITY = -100;
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dicts), "dsh-inline-diff: dictionaries");
  ctx.effect(() => attachHostLocale(ctx.locale), "dsh-inline-diff: host locale");
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
  ctx.effect(() => installGlassRefraction(), "dsh-inline-diff: glass refraction filters");
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`);
  ctx.effect(() => startReadRangeChips(pluginTranslate), "dsh-inline-diff: read range chips");
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
    const registerView = (key, Component) => {
      try {
        disposers.push(ctx.slots.register({
          name: "tool.call.toolview",
          key,
          priority: VIEW_PRIORITY,
          locale: NS
        }, Component));
      } catch (error) {
        console.warn(`[dsh-inline-diff] cannot take over tool view "${key}"; the stock DSH row stays active`, error);
      }
    };
    const sync = () => {
      const settings = getSettings();
      const next = `${settings.fileCards}|${settings.shellRows}|${settings.toolCalls}`;
      if (next === signature) return;
      signature = next;
      clear();
      if (settings.fileCards === "enhanced") {
        for (const key of INLINE_DIFF_KEYS) registerView(key, PluginInlineDiffCard);
      }
      if (settings.shellRows === "enhanced") {
        for (const key of ENHANCED_SHELL_KEYS) registerView(key, PluginEnhancedShellCard);
      }
      if (settings.toolCalls === "enhanced") {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS, ...ENHANCED_SEARCH_WEB_KEYS]) {
          registerView(key, PluginEnhancedExpandedTool);
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
    }, PluginDiffModal);
    yield ctx.slots.register({
      name: "shell.overlay",
      id: "inline-diff.settings",
      order: 61,
      locale: NS
    }, PluginSettingsModal);
  });
  const injectLocalizedEntry = (slotName, makeOptions, Component) => {
    ctx.slots.inject(slotName, () => {
      let dispose = null;
      let language = null;
      const sync = () => {
        const next = getPluginLanguage();
        if (dispose !== null && next === language) return;
        const previous = dispose;
        dispose = null;
        language = next;
        if (previous !== null) previous();
        dispose = ctx.slots.register(makeOptions(), Component);
      };
      const unsubscribe = subscribePluginLanguage(sync);
      try {
        sync();
      } catch (error) {
        unsubscribe();
        throw error;
      }
      return () => {
        unsubscribe();
        if (dispose !== null) {
          dispose();
          dispose = null;
        }
      };
    });
  };
  injectLocalizedEntry("settings.section", () => ({
    name: "settings.section",
    id: "inline-diff",
    order: 40,
    label: () => pluginTranslate("settings.nav"),
    locale: NS
  }), PluginSettingsSection);
  injectLocalizedEntry("sidebar.footer.action", () => ({
    name: "sidebar.footer.action",
    id: "inline-diff.settings",
    order: 40,
    label: () => pluginTranslate("settings.short"),
    locale: NS
  }), PluginSettingsLauncher);
}
		return module.exports;
	}
});
