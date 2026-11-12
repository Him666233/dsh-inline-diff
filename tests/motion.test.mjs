/**
 * 呼吸动画相位同步的纯函数测试（不依赖浏览器）。
 *
 * 覆盖：pulsePhase 的确定性/取值范围、动画名白名单，以及 syncPulseAnimations
 * 在正常、缺失 API、pending、不足两个动画、异常等场景下的行为。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ENTRANCE_DURATION_MS,
  OUTPUT_REVEAL_DURATION_MS,
  PULSE_ANIMATION_NAMES,
  PULSE_DURATION_MS,
  isLiveToolState,
  prefersReducedMotion,
  pulsePhase,
  syncPulseAnimations,
} from '../src/client/motion.js'

/** 构造一个最小 Animation 替身：只关心动画名与 startTime。 */
function fakeAnimation(animationName, startTime) {
  return { animationName, startTime }
}

/** 构造一个带 getAnimations 的根元素替身。 */
function fakeRoot(animations) {
  return { getAnimations: () => animations }
}

test('pulsePhase is deterministic and maps every key onto a negative delay inside one period', () => {
  for (const key of ['call_1', 'call_2', '', undefined, null, 42, '长一点的会话 key']) {
    const first = pulsePhase(key)
    assert.equal(first, pulsePhase(key))
    assert.match(first, /^-\d+ms$|^0ms$/)
    const value = Number(first.replace('-', '').replace('ms', ''))
    assert.ok(value >= 0 && value < PULSE_DURATION_MS, `delay ${first} out of range`)
  }
  // 稳定 key 派生出的相位落在周期内且为负值（负延迟即“从周期中途开始”）。
  assert.match(pulsePhase('call_1'), /^-/)
})

test('pulse animation name whitelist covers the dot and bar pulses only', () => {
  assert.deepEqual([...PULSE_ANIMATION_NAMES].sort(), ['dsh-inline-diff-bar-pulse', 'dsh-inline-diff-pulse'])
})

test('syncPulseAnimations aligns every pulse animation to the earliest start time', () => {
  const dot = fakeAnimation('dsh-inline-diff-pulse', 37412)
  const inBar = fakeAnimation('dsh-inline-diff-bar-pulse', 37495)
  const outBar = fakeAnimation('dsh-inline-diff-bar-pulse', 37510)
  assert.equal(syncPulseAnimations(fakeRoot([dot, inBar, outBar])), true)
  assert.equal(dot.startTime, 37412)
  assert.equal(inBar.startTime, 37412)
  assert.equal(outBar.startTime, 37412)
})

test('syncPulseAnimations leaves unrelated animations alone', () => {
  const dot = fakeAnimation('dsh-inline-diff-pulse', 100)
  const theme = fakeAnimation('theme-transition', 900)
  const toast = fakeAnimation('toast-slide', 0)
  syncPulseAnimations(fakeRoot([dot, theme, toast]))
  assert.equal(theme.startTime, 900)
  assert.equal(toast.startTime, 0)
})

test('syncPulseAnimations is a no-op when fewer than two pulse animations exist', () => {
  const dot = fakeAnimation('dsh-inline-diff-pulse', 123)
  assert.equal(syncPulseAnimations(fakeRoot([dot])), false)
  assert.equal(dot.startTime, 123)
  assert.equal(syncPulseAnimations(fakeRoot([])), false)
})

test('pending animations (null startTime) are skipped until they start', () => {
  const dot = fakeAnimation('dsh-inline-diff-pulse', 200)
  const pending = fakeAnimation('dsh-inline-diff-bar-pulse', null)
  assert.equal(syncPulseAnimations(fakeRoot([dot, pending])), false)
  assert.equal(pending.startTime, null)
})

test('syncPulseAnimations tolerates missing/unsupported/exploding getAnimations', () => {
  assert.equal(syncPulseAnimations(null), false)
  assert.equal(syncPulseAnimations(undefined), false)
  assert.equal(syncPulseAnimations({}), false)
  assert.equal(syncPulseAnimations({ getAnimations() { throw new Error('boom') } }), false)
})

test('syncPulseAnimations survives a readonly startTime and still aligns the rest', () => {
  const writable = fakeAnimation('dsh-inline-diff-bar-pulse', 300)
  const frozen = { animationName: 'dsh-inline-diff-pulse', get startTime() { return 100 }, set startTime(_) { throw new Error('readonly') } }
  // 最早的动画不可写时仍以它为目标；写失败不抛出，其余动画照常对齐。
  assert.equal(syncPulseAnimations(fakeRoot([frozen, writable])), true)
  assert.equal(writable.startTime, 100)
})

test('entrance animation only applies to live tool states', () => {
  assert.equal(isLiveToolState('running'), true)
  assert.equal(isLiveToolState('preparing'), true)
  for (const state of ['ok', 'error', 'stopped', 'nochange', '', undefined, null]) {
    assert.equal(isLiveToolState(state), false)
  }
})

test('animation timing constants stay in the subtle range', () => {
  assert.equal(ENTRANCE_DURATION_MS, 200)
  assert.equal(OUTPUT_REVEAL_DURATION_MS, 160)
  for (const duration of [ENTRANCE_DURATION_MS, OUTPUT_REVEAL_DURATION_MS]) {
    assert.ok(duration >= 120 && duration <= 260)
  }
})

test('prefersReducedMotion degrades to false outside the browser', () => {
  // Node 环境没有 window/matchMedia：必须安全返回 false，不能抛错。
  assert.equal(prefersReducedMotion(), false)
})
