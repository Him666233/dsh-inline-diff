/**
 * 插件级 i18n 与 language 设置的单测。
 *
 * 覆盖范围（对应 1.3.0 需求）：
 *   1. resolveLanguage 的全部分支：固定 zh / 固定 en / auto 跟随宿主 / 宿主语言
 *      未知 / 非法设置值回退中文；
 *   2. translate 的回退链（选中语言 → zh → key 本身）、占位符替换、未知 key、
 *      缺参数、字典整体缺失、恶意 getter / 原型链属性等边界；
 *   3. settings.js 的 language 设置：旧存档迁移、非法值回退、localStorage 与
 *      configForms 不可用时的内存回退、持久化与 reset；
 *   4. zh / en 字典键集合一致性与原创声明要点；
 *   5. getPluginLanguage / subscribePluginLanguage 的宿主语言跟随；
 *   6. withPluginI18n 覆盖 slot 注入的 t 并随语言切换；
 *   7. 安全审计 LOW-5 / LOW-6 的加固：localStorage 原始 JSON 长度上界、
 *      previousTranscript 的 DSH transcriptView 白名单、updateSettings 的
 *      已知键/枚举/布尔形状校验。
 *
 * 注意：settings.js 在模块求值时就读取 localStorage 并把存档迁移为 v5，因此
 * “不同存档”的用例必须用带 query 串的动态 import 拿到全新的模块实例（ESM 按
 * 完整 URL 缓存），并在 import 前装好内存版 localStorage。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { dicts } from '../src/client/locales.js'
import {
  DEFAULT_LANGUAGE,
  DEFAULT_LANGUAGE_SETTING,
  LANGUAGE_SETTINGS,
  SUPPORTED_LANGUAGES,
  attachHostLocale,
  getPluginLanguage,
  hostLanguageKind,
  installI18nRuntime,
  normalizeLanguageSetting,
  pluginTranslate,
  resolveLanguage,
  subscribePluginLanguage,
  translate,
  translatorFor,
  withPluginI18n,
} from '../src/client/i18n.js'
import {
  DEFAULTS,
  getSettings,
  initSettings,
  resetSettings,
  updateSettings,
} from '../src/client/settings.js'

/** settings.js 里使用的 localStorage key（与实现保持同步，供迁移断言用）。 */
const STORAGE_KEY = 'dsh-inline-diff.settings.v5'
const LEGACY_KEY = 'dsh-inline-diff.settings.v4'
const OLDER_KEY = 'dsh-inline-diff.settings.v3'
const V2_KEY = 'dsh-inline-diff.settings.v2'

/* ========================================================================
 * 测试基建
 * ===================================================================== */

/** 极简内存版 localStorage，够 settings.js 的 getItem/setItem/removeItem 使用。 */
function createStorage(seed = {}) {
  const entries = new Map(Object.entries(seed))
  return {
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null
    },
    setItem(key, value) {
      entries.set(key, String(value))
    },
    removeItem(key) {
      entries.delete(key)
    },
    clear() {
      entries.clear()
    },
    /** 当前存档快照，用于“重新加载后读到持久化值”的断言。 */
    dump() {
      return Object.fromEntries(entries)
    },
  }
}

/**
 * 临时替换 globalThis.localStorage（Node 默认没有它），返回恢复函数。
 * 用 try/finally 保证用例失败也不会把替身泄漏给其它用例。
 */
function setLocalStorage(value) {
  const previous = globalThis.localStorage
  globalThis.localStorage = value
  return () => {
    if (previous === undefined) delete globalThis.localStorage
    else globalThis.localStorage = previous
  }
}

/** 每次 import 用的唯一 query 串（绕开 ESM 模块缓存）。 */
let importSequence = 0

/**
 * 在指定存档 + 可用/不可用的 localStorage 环境里重新加载一个全新的 settings.js。
 *
 * @param {Record<string,string>} seed - 初始 localStorage 内容。
 * @param {{hasStorage?: boolean}} [options] - hasStorage=false 模拟隐私模式/禁用存储。
 * @param {(env: {settings: object, storage: object|undefined}) => void|Promise<void>} run - 用例主体。
 */
async function withFreshSettings(seed, options, run) {
  const hasStorage = options?.hasStorage !== false
  const storage = hasStorage ? createStorage(seed) : undefined
  const restore = setLocalStorage(storage)
  const url = new URL('../src/client/settings.js', import.meta.url)
  url.searchParams.set('locales-test', String(importSequence++))
  try {
    const settings = await import(url.href)
    return await run({ settings, storage })
  } finally {
    restore()
  }
}

/** 生成一条当前格式（v5）的存档。 */
function archive(record) {
  return { [STORAGE_KEY]: JSON.stringify(record) }
}

/* ========================================================================
 * 1. 常量与 resolveLanguage
 * ===================================================================== */

test('语言常量：字典兜底中文、设置默认 auto 跟随 DSH，支持 zh/en/auto', () => {
  // 字典只有中文/英文两套，回退链最后落到 zh。
  assert.equal(DEFAULT_LANGUAGE, 'zh')
  assert.equal(DEFAULT_LANGUAGE_SETTING, 'auto')
  assert.deepEqual([...SUPPORTED_LANGUAGES], ['zh', 'en'])
  assert.deepEqual([...LANGUAGE_SETTINGS], ['zh', 'en', 'auto'])
  // 设置默认值：旧版本默认固定中文，现在默认自动跟随 DSH。
  assert.equal(DEFAULTS.language, 'auto')
  assert.equal(normalizeLanguageSetting('zh'), 'zh')
  assert.equal(normalizeLanguageSetting('en'), 'en')
  assert.equal(normalizeLanguageSetting('auto'), 'auto')
  // 非法/缺失 → 默认设置值 auto（而不是挑一个可能的语言）。
  for (const value of [undefined, null, 'fr', 'EN', 42, {}, []]) {
    assert.equal(normalizeLanguageSetting(value), 'auto')
  }
})

test('hostLanguageKind：按主语言子标签归类，无法识别时返回 undefined', () => {
  assert.equal(hostLanguageKind('zh'), 'zh')
  assert.equal(hostLanguageKind('zh-CN'), 'zh')
  assert.equal(hostLanguageKind('ZH_cn'), 'zh')
  assert.equal(hostLanguageKind('en'), 'en')
  assert.equal(hostLanguageKind('en-US'), 'en')
  assert.equal(hostLanguageKind('ja'), 'en')
  assert.equal(hostLanguageKind('pt-BR'), 'en')
  assert.equal(hostLanguageKind(undefined), undefined)
  assert.equal(hostLanguageKind(null), undefined)
  assert.equal(hostLanguageKind(''), undefined)
  assert.equal(hostLanguageKind('   '), undefined)
  assert.equal(hostLanguageKind(42), undefined)
  assert.equal(hostLanguageKind({}), undefined)
})

test('resolveLanguage：固定 zh / 固定 en / auto 跟随宿主 / 非法值按 auto 处理', () => {
  // 固定中文：无论宿主/DSH 是什么语言都显示中文。
  assert.equal(resolveLanguage('zh', 'en'), 'zh')
  assert.equal(resolveLanguage('zh', 'ja'), 'zh')
  assert.equal(resolveLanguage('zh', undefined), 'zh')
  // 固定英文：即使 DSH 是中文也显示英文。
  assert.equal(resolveLanguage('en', 'zh'), 'en')
  assert.equal(resolveLanguage('en', 'ja'), 'en')
  assert.equal(resolveLanguage('en', undefined), 'en')
  // auto：DSH 中文 → 中文。
  assert.equal(resolveLanguage('auto', 'zh'), 'zh')
  assert.equal(resolveLanguage('auto', 'zh-CN'), 'zh')
  assert.equal(resolveLanguage('auto', 'zh-TW'), 'zh')
  // auto：DSH 其它语言 → 英文（插件没有 ja/es/... 字典）。
  assert.equal(resolveLanguage('auto', 'en'), 'en')
  assert.equal(resolveLanguage('auto', 'en-US'), 'en')
  assert.equal(resolveLanguage('auto', 'ja'), 'en')
  assert.equal(resolveLanguage('auto', 'pt-BR'), 'en')
  // auto + 宿主语言未知（locale 服务未接线 / 单测环境）→ 默认中文。
  assert.equal(resolveLanguage('auto', undefined), 'zh')
  assert.equal(resolveLanguage('auto', null), 'zh')
  assert.equal(resolveLanguage('auto', ''), 'zh')
  assert.equal(resolveLanguage('auto', 42), 'zh')
  // 非法 / 缺失设置值 → 视为默认 auto（跟随 DSH）；宿主未知时回退中文。
  for (const setting of [undefined, null, 'fr', 'EN', 'AUTO', '', 0, true, {}, []]) {
    assert.equal(resolveLanguage(setting, 'en'), 'en', `设置值 ${JSON.stringify(setting)} 应跟随英文宿主`)
    assert.equal(resolveLanguage(setting, 'zh'), 'zh', `设置值 ${JSON.stringify(setting)} 应跟随中文宿主`)
    assert.equal(resolveLanguage(setting, undefined), 'zh')
  }
})

/* ========================================================================
 * 2. translate：回退链与占位符
 * ===================================================================== */

test('translate：选中语言 → zh → key 本身的回退链', () => {
  assert.equal(translate(dicts, 'zh', 'close'), '关闭')
  assert.equal(translate(dicts, 'en', 'close'), 'Close')
  // 两边都缺 → key 本身（便于发现漏翻）。
  assert.equal(translate(dicts, 'en', 'no.such.key'), 'no.such.key')
  // 选中语言缺 key → 回退 zh 字典。
  const partial = { zh: { only: '只有中文' }, en: { other: 'English only' } }
  assert.equal(translate(partial, 'en', 'only'), '只有中文')
  // zh 字典也缺 → key 本身。
  assert.equal(translate(partial, 'zh', 'other'), 'other')
  // 目标语言子字典整体缺失 → zh。
  assert.equal(translate({ zh: { only: '只有中文' } }, 'en', 'only'), '只有中文')
  // 语言 id 非法 / 缺失 → 用默认中文翻译。
  assert.equal(translate(dicts, undefined, 'close'), '关闭')
  assert.equal(translate(dicts, '', 'close'), '关闭')
  assert.equal(translate(dicts, 'ja', 'close'), '关闭')
  // 字典整体缺失 / 形状错误：返回 key，绝不抛错。
  for (const dictionary of [undefined, null, 'x', 42, [], { zh: null }, { zh: 'x' }, { en: {} }]) {
    assert.doesNotThrow(() => translate(dictionary, 'en', 'close'))
    assert.equal(translate(dictionary, 'en', 'close'), 'close', `字典 ${JSON.stringify(dictionary)}`)
  }
  // 字典值类型错误 → 视为缺失。
  assert.equal(translate({ zh: { a: 42 }, en: {} }, 'zh', 'a'), 'a')
  // 原型链上的同名属性不能冒充文案。
  assert.equal(translate(dicts, 'zh', 'toString'), 'toString')
  assert.equal(translate({ zh: Object.create({ inherited: 'x' }), en: {} }, 'zh', 'inherited'), 'inherited')
  // 非字符串 key：返回空串即可，不抛错。
  for (const key of [undefined, null, 0, {}, []]) {
    assert.doesNotThrow(() => translate(dicts, 'zh', key))
    assert.equal(translate(dicts, 'zh', key), '')
  }
})

test('translate：占位符替换、缺参数与恶意参数值的边界', () => {
  assert.equal(translate(dicts, 'en', 'hunks', { n: 3 }), '3 changes')
  assert.equal(translate(dicts, 'zh', 'hunks', { n: 3 }), '3 处修改')
  assert.equal(translate(dicts, 'zh', 'gapUnchanged', { n: 0 }), '0 行未修改')
  assert.equal(translate(dicts, 'en', 'langTitle', { name: 'JSON', extra: 1 }), 'Language: JSON')
  // 缺参数：保留占位符原文，不抛错。
  assert.equal(translate(dicts, 'zh', 'langTitle'), '语言：{name}')
  assert.equal(translate(dicts, 'zh', 'langTitle', {}), '语言：{name}')
  assert.equal(translate(dicts, 'zh', 'langTitle', { other: 1 }), '语言：{name}')
  // undefined / null 参数值同样保留占位符。
  assert.equal(translate(dicts, 'zh', 'langTitle', { name: undefined }), '语言：{name}')
  assert.equal(translate(dicts, 'zh', 'langTitle', { name: null }), '语言：{name}')
  // 只认自有属性：原型链上的参数不参与替换。
  const inheritedParams = Object.create({ n: 3 })
  assert.equal(translate(dicts, 'en', 'hunks', inheritedParams), '{n} changes')
  // 参数值 toString 抛错时保留占位符，不把异常带到渲染层。
  const hostileParams = {
    n: {
      toString() {
        throw new Error('boom')
      },
    },
  }
  assert.doesNotThrow(() => translate(dicts, 'en', 'hunks', hostileParams))
  assert.equal(translate(dicts, 'en', 'hunks', hostileParams), '{n} changes')
  // params 本身不是对象时原样返回模板。
  assert.equal(translate(dicts, 'en', 'hunks', 'nope'), '{n} changes')
})

test('translatorFor：同一语言引用稳定，切换语言换新引用', () => {
  const zhA = translatorFor(dicts, 'zh')
  const zhB = translatorFor(dicts, 'zh')
  assert.equal(zhA, zhB)
  const en = translatorFor(dicts, 'en')
  assert.notEqual(en, zhA)
  assert.equal(zhA('close'), '关闭')
  assert.equal(en('close'), 'Close')
  // 非法语言按默认中文处理，复用同一个翻译函数。
  assert.equal(translatorFor(dicts, undefined), zhA)
})

/* ========================================================================
 * 3. 字典一致性 + 原创声明要点
 * ===================================================================== */

test('zh / en 字典键集合完全一致，且每个值都是非空字符串', () => {
  const zhKeys = Object.keys(dicts.zh).sort()
  const enKeys = Object.keys(dicts.en).sort()
  assert.deepEqual(enKeys, zhKeys, 'en 字典必须与 zh 字典键集合一致（缺键会静默回退中文）')
  for (const key of zhKeys) {
    assert.equal(typeof dicts.zh[key], 'string', `zh 字典 ${key}`)
    assert.ok(dicts.zh[key].length > 0, `zh 字典 ${key} 不能为空`)
    assert.equal(typeof dicts.en[key], 'string', `en 字典 ${key}`)
    assert.ok(dicts.en[key].length > 0, `en 字典 ${key} 不能为空`)
  }
})

test('语言设置与原创声明的文案键存在且中英齐全', () => {
  const keys = [
    'settings.language',
    'settings.languageDesc',
    'settings.languageZh',
    'settings.languageEn',
    'settings.languageAuto',
    'originality.title',
    'originality.body',
    'noticeTruncated',
    'lineTruncated',
  ]
  for (const key of keys) {
    assert.ok(Object.prototype.hasOwnProperty.call(dicts.zh, key), `zh 缺 ${key}`)
    assert.ok(Object.prototype.hasOwnProperty.call(dicts.en, key), `en 缺 ${key}`)
  }
  // 语言选项的两个语言名是产品名，中英字典保持一致。
  assert.equal(dicts.zh['settings.languageEn'], 'English')
  assert.equal(dicts.zh['settings.languageZh'], '中文')
  assert.equal(dicts.en['settings.languageZh'], '中文')
  assert.equal(dicts.en['settings.languageEn'], 'English')
})

test('新增更新功能的中英文文案齐全且占位符一致', () => {
  const updateKeys = Object.keys(dicts.zh).filter(key => key.startsWith('update.'))
  assert.ok(updateKeys.length >= 20, `update.* 文案数量过少：${updateKeys.length}`)
  for (const key of updateKeys) {
    assert.ok(Object.prototype.hasOwnProperty.call(dicts.en, key), `en 缺 ${key}`)
    const zhText = dicts.zh[key]
    const enText = dicts.en[key]
    assert.ok(typeof zhText === 'string' && zhText.trim() !== '', `zh.${key} 为空`)
    assert.ok(typeof enText === 'string' && enText.trim() !== '', `en.${key} 为空`)
    assert.notEqual(enText, zhText, `${key} 的英文与中文相同，疑似漏翻`)
    const placeholders = text => [...String(text).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map(match => match[1]).sort()
    assert.deepEqual(placeholders(enText), placeholders(zhText), `${key} 占位符不一致`)
  }
})

test('全部字典：中英键集合与占位符完全一致', () => {
  const zhKeys = Object.keys(dicts.zh).sort()
  const enKeys = Object.keys(dicts.en).sort()
  assert.deepEqual(enKeys, zhKeys, '中英字典键集合必须一致')
  for (const key of zhKeys) {
    const placeholders = text => [...String(text).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map(match => match[1]).sort()
    assert.deepEqual(placeholders(dicts.en[key]), placeholders(dicts.zh[key]), `${key} 占位符不一致`)
  }
})

test('原创声明覆盖需求中的全部要点（中文 + 英文）', () => {
  const repo = 'https://github.com/JanEickholt/dsh-inline-diff'
  const zh = translate(dicts, 'zh', 'originality.body', { repo })
  assert.ok(zh.includes(repo), '中文声明必须包含对方仓库链接')
  for (const phrase of ['完全原创', '无任何关联', '雷同', '纯属巧合', '实现方式', '代码效果', '没有参考', '衍生', '复刻']) {
    assert.ok(zh.includes(phrase), `中文声明缺少要点：${phrase}`)
  }
  const en = translate(dicts, 'en', 'originality.body', { repo })
  assert.ok(en.includes(repo), '英文声明必须包含对方仓库链接')
  for (const phrase of ['fully original', 'no affiliation', 'coincidental', 'implementation', 'entirely different', 'no reference', 'derivative', 'replica']) {
    assert.ok(en.toLowerCase().includes(phrase), `英文声明缺少要点：${phrase}`)
  }
  assert.equal(translate(dicts, 'zh', 'originality.title'), '原创声明')
  assert.equal(translate(dicts, 'en', 'originality.title'), 'Originality')
})

/* ========================================================================
 * 4. settings.js：language 设置的迁移、回退与持久化
 * ===================================================================== */

test('settings：无存档时 language 默认为 auto（跟随 DSH）并写入 v5', async () => {
  await withFreshSettings({}, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    const saved = JSON.parse(storage.getItem(STORAGE_KEY))
    assert.equal(saved.language, 'auto')
  })
})

test('settings：旧 v4 存档没有 language 字段 → 迁移为新默认 auto', async () => {
  const seed = { [LEGACY_KEY]: JSON.stringify({ fileCards: 'native', syntaxHighlight: false }) }
  await withFreshSettings(seed, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(settings.getSettings().fileCards, 'native')
    // 迁移后旧 v4 key 被清理，v5 落盘。
    assert.equal(storage.getItem(LEGACY_KEY), null)
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
  })
})

test('settings：v3 旧存档迁移为 v5 并把 language 补成 auto', async () => {
  const seed = { [OLDER_KEY]: JSON.stringify({ fileCards: 'native', shellRows: 'enhanced' }) }
  await withFreshSettings(seed, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(settings.getSettings().shellRows, 'enhanced')
    // 迁移后旧 key 被清理，新 key 落盘。
    assert.equal(storage.getItem(OLDER_KEY), null)
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
  })
})

test('settings：v2 旧存档迁移为 v5 并把 language 补成 auto', async () => {
  const seed = { [V2_KEY]: JSON.stringify({ fileCards: 'enhanced' }) }
  await withFreshSettings(seed, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(storage.getItem(V2_KEY), null)
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
  })
})

test('settings：明确选择过的语言原样保留；旧存档里的 zh 迁移到 auto', async () => {
  // 新版会写 languageChosen=true；此时 zh / en / auto 都保留用户选择。
  for (const language of ['zh', 'en', 'auto']) {
    await withFreshSettings(archive({ language, languageChosen: true }), {}, ({ settings }) => {
      assert.equal(settings.getSettings().language, language)
      assert.equal(settings.getSettings().languageChosen, true)
    })
  }
  // 旧存档（没有 languageChosen）：zh 是旧默认值 → 迁移到 auto；en 是用户曾
  // 主动选择 → 保留英文并补上标记。
  await withFreshSettings(archive({ language: 'zh' }), {}, ({ settings }) => {
    assert.equal(settings.getSettings().language, 'auto')
  })
  await withFreshSettings(archive({ language: 'en' }), {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'en')
    assert.equal(settings.getSettings().languageChosen, true)
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'en')
  })
})

test('settings：非法 language 值一律回退新默认 auto', async () => {
  const invalid = ['fr', 'EN', 'Auto', '', '  ', 42, 0, true, null, [], {}, ['zh']]
  for (const language of invalid) {
    await withFreshSettings(archive({ language }), {}, ({ settings, storage }) => {
      assert.equal(settings.getSettings().language, 'auto', `非法值 ${JSON.stringify(language)}`)
      // 回退结果同样落盘，下次加载不会再次踩到非法值。
      assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
    })
  }
})

test('settings：损坏 / 非对象存档 → 全部默认值（language 为 auto）', async () => {
  for (const raw of ['{not json', '"text"', '42', 'null', 'true', '[1,2]']) {
    await withFreshSettings({ [STORAGE_KEY]: raw }, {}, ({ settings }) => {
      assert.equal(settings.getSettings().language, 'auto', `存档 ${raw}`)
    })
  }
})

test('settings：超过 64 KiB 的原始存档在 JSON.parse 前被放弃并用默认值覆盖', async () => {
  // 安全审计 LOW-5：超大/损坏存档不得进入启动路径的 JSON.parse。
  const oversized = JSON.stringify({ language: 'en' }).padEnd(70_000, ' ')
  assert.ok(oversized.length > 65536)
  await withFreshSettings({ [STORAGE_KEY]: oversized }, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(settings.getSettings().fileCards, 'enhanced')
    // 坏存档已被本次启动的 persist() 用默认值覆盖成正常大小。
    const saved = storage.getItem(STORAGE_KEY)
    assert.ok(typeof saved === 'string' && saved.length < 4096, '坏存档应被覆盖')
    assert.equal(JSON.parse(saved).language, 'auto')
  })
  // 旧 key 里的超大存档同样被放弃并清理。
  await withFreshSettings({ [LEGACY_KEY]: oversized }, {}, ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(storage.getItem(LEGACY_KEY), null)
    assert.ok(JSON.parse(storage.getItem(STORAGE_KEY)).language === 'auto')
  })
})

test('settings：updateSettings 只接受已知键与合法枚举/布尔值', async () => {
  await withFreshSettings({}, {}, ({ settings, storage }) => {
    const before = settings.getSettings()
    // 全部非法/未知：不改变状态、不写盘。
    settings.updateSettings({ evil: 'x', fileCards: 'nope', syntaxHighlight: 'yes', fileShellTone: 'lime' })
    assert.equal(settings.getSettings(), before, '非法补丁不应产生新状态')
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).fileCards, 'enhanced')
    settings.updateSettings(null)
    settings.updateSettings('nope')
    settings.updateSettings(['fileCards'])
    assert.equal(settings.getSettings(), before)
    // 合法字段生效；同一补丁里的非法字段被忽略。
    settings.updateSettings({ fileCards: 'native', syntaxHighlight: 'yes', fileShellTone: 'dark' })
    assert.equal(settings.getSettings().fileCards, 'native')
    assert.equal(settings.getSettings().syntaxHighlight, true, '非法布尔值应被忽略')
    assert.equal(settings.getSettings().fileShellTone, 'dark')
    // 未知键不会进入存档。
    assert.equal('evil' in JSON.parse(storage.getItem(STORAGE_KEY)), false)
  })
})

/** 极简 configForms 替身：只实现 `ui-chat` 表单的 getSnapshot/set（set 会更新快照）。 */
function fakeConfigForms(initial) {
  const writes = []
  let current = initial
  const service = {
    get(namespace) {
      assert.equal(namespace, 'ui-chat')
      return {
        getSnapshot: () => ({ value: { transcriptView: current } }),
        set: async (field, value) => {
          writes.push({ field, value })
          if (field === 'transcriptView') current = value
        },
      }
    },
  }
  return { service, writes }
}

test('settings：previousTranscript 只接受 DSH transcriptView 白名单', async () => {
  // 非法存档值：恢复时回退 standard，绝不把任意字符串回传给 DSH 设置。
  await withFreshSettings(archive({ transcript: 'enhanced', previousTranscript: 'hacked' }), {}, async ({ settings }) => {
    const fake = fakeConfigForms('verbose')
    settings.initSettings(fake.service)
    await settings.setTranscriptPreference('native')
    assert.deepEqual(fake.writes.at(-1), { field: 'transcriptView', value: 'standard' })
  })
  // 合法旧值 normal → 恢复为当前名称 detailed。
  await withFreshSettings(archive({ transcript: 'enhanced', previousTranscript: 'normal' }), {}, async ({ settings }) => {
    const fake = fakeConfigForms('verbose')
    settings.initSettings(fake.service)
    await settings.setTranscriptPreference('native')
    assert.deepEqual(fake.writes.at(-1), { field: 'transcriptView', value: 'detailed' })
  })
  // 合法当前值 compact 原样恢复。
  await withFreshSettings(archive({ transcript: 'enhanced', previousTranscript: 'compact' }), {}, async ({ settings }) => {
    const fake = fakeConfigForms('verbose')
    settings.initSettings(fake.service)
    await settings.setTranscriptPreference('native')
    assert.deepEqual(fake.writes.at(-1), { field: 'transcriptView', value: 'compact' })
  })
  // 切回 native 时只有 DSH 当前确实处于 verbose 才回写（不打扰用户自己的设置）。
  // 用 transcript:'native' 的存档避免 initSettings 触发 adopt（那会主动切到 flat）。
  await withFreshSettings(archive({ transcript: 'native', previousTranscript: 'standard' }), {}, async ({ settings }) => {
    const fake = fakeConfigForms('detailed')
    settings.initSettings(fake.service)
    await settings.setTranscriptPreference('native')
    assert.equal(fake.writes.length, 0, 'DSH 不在 verbose 时不应回写')
  })
})

test('settings：开启 enhanced 时记录的 previousTranscript 也经过白名单归一', async () => {
  // DSH 当前是 compact：切到 flat 时记录 compact，切回时恢复 compact。
  await withFreshSettings({}, {}, async ({ settings }) => {
    const fake = fakeConfigForms('compact')
    settings.initSettings(fake.service)
    await settings.setTranscriptPreference('enhanced')
    assert.deepEqual(fake.writes.at(-1), { field: 'transcriptView', value: 'verbose' })
    await settings.setTranscriptPreference('native')
    assert.deepEqual(fake.writes.at(-1), { field: 'transcriptView', value: 'compact' })
  })
})

test('settings：localStorage 不可用时回退内存默认值且可继续切换', async () => {
  await withFreshSettings({}, { hasStorage: false }, ({ settings }) => {
    assert.equal(settings.getSettings().language, 'auto')
    settings.updateSettings({ language: 'en' })
    assert.equal(settings.getSettings().language, 'en')
    // configForms 不可用（未初始化）也不能影响语言设置本身。
    assert.doesNotThrow(() => settings.initSettings(undefined))
    assert.equal(settings.getSettings().language, 'en')
    settings.updateSettings({ language: 'zh' })
    assert.equal(settings.getSettings().language, 'zh')
  })
})

test('settings：updateSettings 归一化非法 language 值并持久化', async () => {
  await withFreshSettings({}, {}, ({ settings, storage }) => {
    settings.updateSettings({ language: 'fr' })
    assert.equal(settings.getSettings().language, 'auto')
    settings.updateSettings({ language: 'auto' })
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
    settings.updateSettings({ language: 'en' })
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'en')
  })
})

test('settings：resetSettings 把 language 恢复默认 auto（跟随 DSH）', async () => {
  await withFreshSettings(archive({ language: 'en', languageChosen: true, fileCards: 'native' }), {}, async ({ settings, storage }) => {
    assert.equal(settings.getSettings().language, 'en')
    await settings.resetSettings()
    assert.equal(settings.getSettings().language, 'auto')
    assert.equal(settings.getSettings().languageChosen, false)
    assert.equal(settings.getSettings().fileCards, 'enhanced')
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).language, 'auto')
  })
})

test('settings：UI 显式选择 zh 后写 languageChosen，重新加载仍保留中文', async () => {
  let snapshot
  await withFreshSettings({}, {}, ({ settings, storage }) => {
    settings.updateSettings({ language: 'zh' })
    assert.equal(settings.getSettings().language, 'zh')
    assert.equal(settings.getSettings().languageChosen, true)
    assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).languageChosen, true)
    snapshot = storage.dump()
  })
  await withFreshSettings(snapshot, {}, ({ settings }) => {
    assert.equal(settings.getSettings().language, 'zh')
  })
})

test('settings：语言持久化后重新加载仍能读到', async () => {
  let snapshot
  await withFreshSettings({}, {}, ({ settings, storage }) => {
    settings.updateSettings({ language: 'en' })
    snapshot = storage.dump()
  })
  await withFreshSettings(snapshot, {}, ({ settings }) => {
    assert.equal(settings.getSettings().language, 'en')
  })
})

/* ========================================================================
 * 5. 插件语言状态：宿主 locale 跟随与订阅
 * ===================================================================== */

/** 极简宿主 locale face：`ctx.locale` 只需要 getSnapshot/subscribe 两个方法。 */
function fakeLocaleFace(active) {
  return {
    getSnapshot: () => ({ active, revision: 1 }),
    subscribe: () => () => {},
  }
}

test('getPluginLanguage：跟随插件设置与宿主 DSH 语言', () => {
  const restore = setLocalStorage(undefined)
  try {
    const detachEn = attachHostLocale(fakeLocaleFace('en'))
    try {
      updateSettings({ language: 'zh' })
      assert.equal(getPluginLanguage(), 'zh')
      updateSettings({ language: 'en' })
      assert.equal(getPluginLanguage(), 'en')
      updateSettings({ language: 'auto' })
      assert.equal(getPluginLanguage(), 'en')
    } finally {
      detachEn()
    }
    // 未接线宿主 locale 时 auto 回退默认中文。
    assert.equal(getPluginLanguage(), 'zh')
    const detachZh = attachHostLocale(fakeLocaleFace('zh-CN'))
    try {
      updateSettings({ language: 'auto' })
      assert.equal(getPluginLanguage(), 'zh')
    } finally {
      detachZh()
    }
  } finally {
    updateSettings({ language: 'zh' })
    restore()
  }
})

test('subscribePluginLanguage：只在解析后的语言真的变化时通知', () => {
  const restore = setLocalStorage(undefined)
  try {
    updateSettings({ language: 'zh' })
    let calls = 0
    const unsubscribe = subscribePluginLanguage(() => { calls++ })
    try {
      // 其它显示设置变化不触发语言订阅者。
      updateSettings({ fileCards: 'native' })
      assert.equal(calls, 0)
      updateSettings({ language: 'en' })
      assert.equal(calls, 1)
      // 值没变不重复通知。
      updateSettings({ language: 'en' })
      assert.equal(calls, 1)
      updateSettings({ language: 'auto' }) // 宿主未接线 → 解析结果 zh，与 en 不同
      assert.equal(calls, 2)
      updateSettings({ language: 'fr' }) // 归一化为 zh，与已解析的 zh 相同
      assert.equal(calls, 2)
    } finally {
      unsubscribe()
    }
  } finally {
    updateSettings({ language: 'zh' })
    updateSettings({ fileCards: 'enhanced' })
    restore()
  }
})

test('pluginTranslate：按当前插件语言即时翻译（非 React 上下文用）', () => {
  const restore = setLocalStorage(undefined)
  try {
    updateSettings({ language: 'en' })
    assert.equal(pluginTranslate('close'), 'Close')
    assert.equal(pluginTranslate('originality.title'), 'Originality')
    updateSettings({ language: 'zh' })
    assert.equal(pluginTranslate('close'), '关闭')
    assert.equal(pluginTranslate('originality.title'), '原创声明')
  } finally {
    updateSettings({ language: 'zh' })
    restore()
  }
})

/* ========================================================================
 * 6. withPluginI18n：覆盖 slot 注入的 t
 * ===================================================================== */

test('withPluginI18n：用插件语言替换宿主 t，且随语言设置切换', () => {
  const restore = setLocalStorage(undefined)
  const Probe = function Probe() {
    return null
  }
  Probe.displayName = 'Probe'
  // 注入假 React 运行时：createElement 只记录“渲染成了哪个组件、传了什么 props”；
  // useSyncExternalStore 直接读快照（测试里不涉及真实订阅）。
  installI18nRuntime({
    createElement: (Component, props) => ({ Component, props }),
    useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
  })
  try {
    const Wrapped = withPluginI18n(Probe)
    assert.match(Wrapped.displayName, /withPluginI18n\(Probe\)/)
    updateSettings({ language: 'zh' })
    const zhRender = Wrapped({ t: () => 'HOST', value: 7 })
    assert.equal(zhRender.Component, Probe)
    assert.equal(zhRender.props.value, 7, '其余 props 必须原样透传')
    assert.equal(zhRender.props.t('close'), '关闭')
    assert.equal(zhRender.props.t('close'), '关闭')
    // 切到英文：包装组件重渲染后 t 立即变成英文。
    updateSettings({ language: 'en' })
    assert.equal(Wrapped({}).props.t('close'), 'Close')
    // auto 且宿主 locale 未接线 → 默认中文。
    updateSettings({ language: 'auto' })
    assert.equal(Wrapped({}).props.t('close'), '关闭')
    // auto 且宿主 locale = en → 英文。
    const detach = attachHostLocale(fakeLocaleFace('en'))
    try {
      assert.equal(Wrapped({}).props.t('close'), 'Close')
    } finally {
      detach()
    }
    // 非函数输入原样返回，不构造非法组件。
    assert.equal(withPluginI18n(null), null)
    assert.equal(withPluginI18n('x'), 'x')
  } finally {
    updateSettings({ language: 'zh' })
    restore()
  }
})

test('主 settings 实例：显式 updateSettings 中文可读且状态一致', () => {
  const restore = setLocalStorage(undefined)
  try {
    updateSettings({ language: 'zh' })
    assert.equal(getSettings().language, 'zh')
    assert.equal(getSettings().fileCards, DEFAULTS.fileCards)
  } finally {
    restore()
  }
})

// 确保主实例的初始化函数存在（configForms 缺省时也不抛错）。
test('initSettings：configForms 不可用时不抛错', () => {
  assert.doesNotThrow(() => initSettings(undefined))
  assert.doesNotThrow(() => resetSettings())
})
