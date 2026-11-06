/**
 * Card model derivation: turn one tool-call block (plus the Host snapshot, or
 * the Host-authored presentation diffs as a fallback) into the display model
 * the card and the modal share.
 */
import {
  ALIGN_MAX_CELLS,
  ALIGN_MAX_SIDE_LINES,
  contentLines,
  diffFromMeta,
  diffText,
  displayPath,
  fragmentDiff,
  joinPath,
  narrowDiffs,
} from './diff.js'

/** Tool names this plugin presents as diff cards. */
export const MUTATION_TOOLS = ['edit', 'write', 'str_replace_editor']

/** Parse raw tool-call arguments into an object, or null. */
export function parseArgs(raw) {
  if (typeof raw !== 'string' || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function stringArg(args, key) {
  if (args === null) return undefined
  const value = args[key]
  return typeof value === 'string' ? value : undefined
}

/**
 * Normalize the two block shapes the owner supplies: a running call
 * (`StartedToolCall` / `PreparingToolCall`) and a settled `ToolResultNode`.
 */
export function deriveCall(block) {
  const settled = block !== null && typeof block === 'object' && 'kind' in block
  const call = settled ? block.call : block
  const phase = settled ? 'result' : (call?.phase === 'preparing' ? 'preparing' : 'start')
  return {
    settled,
    phase,
    name: typeof call?.name === 'string' ? call.name : '',
    argsRaw: typeof call?.argsRaw === 'string' ? call.argsRaw : null,
    args: parseArgs(call?.argsRaw),
    meta: settled ? block.meta : undefined,
    callId: settled ? block.callId : call?.callId,
    parentCallId: settled ? block.parentCallId : call?.parentCallId,
    isError: settled && block.isError === true,
    error: settled ? block.error : undefined,
    content: settled && Array.isArray(block.content) ? block.content : [],
    raw: block,
  }
}

/** The tool name shown on the row, resolved from either stage. */
export function resolveToolName(call, fallback) {
  if (call.name !== '') return call.name
  return typeof fallback === 'string' ? fallback : ''
}

/** First line of the settled result text (error summaries). */
function errorMessage(call) {
  if (call.isError !== true) return ''
  const parts = []
  for (const part of call.content) {
    if (part?.type === 'text' && typeof part.text === 'string') parts.push(part.text)
  }
  const info = call.error
  if (parts.length === 0 && info !== null && typeof info === 'object') {
    const reason = typeof info.reason === 'string' ? info.reason : typeof info.code === 'string' ? info.code : typeof info.name === 'string' ? info.name : ''
    if (reason !== '') parts.push(reason)
  }
  const text = parts.join('\n').trim()
  if (text === '') return ''
  const newline = text.indexOf('\n')
  return newline === -1 ? text : text.slice(0, newline)
}

/** The title key for a mutation tool. */
export function titleKeyOf(toolName) {
  if (toolName === 'write') return 'title.write'
  if (toolName === 'str_replace_editor') return 'title.strReplace'
  return 'title.edit'
}

/** The operation display key for the card badge. */
export function operationKey(operation) {
  if (operation === 'create') return 'op.create'
  if (operation === 'overwrite') return 'op.overwrite'
  return 'op.update'
}

/** Snapshot or meta operation, normalized. */
function resolveOperation(snapshot, call, toolName) {
  if (snapshot !== null && snapshot !== undefined) {
    if (snapshot.operation === 'create' || snapshot.before === null) return 'create'
    return 'update'
  }
  const metaOperation = call.meta !== null && typeof call.meta === 'object' ? call.meta.operation : undefined
  if (metaOperation === 'create') return 'create'
  if (metaOperation === 'update') return 'update'
  // A pure-addition edit adds lines to an existing file; do not mistake it for
  // a new file. `meta.diffs` for a real creation carries `oldText: null`, and
  // `str_replace_editor create` names the operation in its arguments.
  if (toolName === 'str_replace_editor' && stringArg(call.args, 'command') === 'create') return 'create'
  const diffs = call.meta !== null && typeof call.meta === 'object' && Array.isArray(call.meta.diffs) ? call.meta.diffs : []
  if (diffs.length > 0 && diffs.every(diff => diff !== null && typeof diff === 'object' && diff.oldText === null)) return 'create'
  return 'update'
}

/** Too large to align in the browser with the full LCS table. */
function exceedsAlignBudget(beforeText, afterText) {
  const oldCount = contentLines(beforeText).length
  const newCount = contentLines(afterText).length
  return oldCount > ALIGN_MAX_SIDE_LINES || newCount > ALIGN_MAX_SIDE_LINES || oldCount * newCount > ALIGN_MAX_CELLS
}

/**
 * Derive the display model.
 * @param {object} input
 * @param {object} input.block - owner-supplied call/result block.
 * @param {string} [input.toolName] - keyed dispatch name (fallback while preparing).
 * @param {string} [input.cwd] - session workspace root.
 * @param {string} [input.home] - host home for `~` abbreviations.
 * @param {object|null} [input.snapshot] - captured `{ before, after, path, operation }`.
 * @param {string|null} [input.fileLines] - current file text for the fallback.
 * @param {string} [input.sessionId]
 */
export function buildCardModel({ block, toolName, cwd, home, snapshot, fileText, loading }) {
  const call = deriveCall(block)
  const resolvedToolName = resolveToolName(call, toolName)
  const argsPath = stringArg(call.args, 'file_path') ?? stringArg(call.args, 'path')
  const metaPath = call.meta !== null && typeof call.meta === 'object' && typeof call.meta.path === 'string' ? call.meta.path : null
  const absolutePath = metaPath !== null && metaPath !== '' ? metaPath : joinPath(cwd, argsPath ?? '')
  const shownPath = displayPath(metaPath !== null && metaPath !== '' ? metaPath : (argsPath ?? ''), cwd, home)
  const base = {
    toolName: resolvedToolName,
    titleKey: titleKeyOf(resolvedToolName),
    callId: call.callId,
    filePath: shownPath,
    absolutePath: absolutePath !== '' ? absolutePath : null,
    operation: 'update',
    status: 'running',
    source: null,
    diff: null,
    notice: null,
    errorMessage: '',
    loading: loading === true,
    parentCallId: call.parentCallId,
  }

  if (call.phase === 'preparing') {
    return { ...base, status: 'preparing' }
  }

  if (call.settled && call.isError) {
    return { ...base, status: 'error', errorMessage: errorMessage(call) }
  }

  if (call.settled) {
    // 1. Exact Host snapshot (live session).
    if (snapshot !== null && snapshot !== undefined && typeof snapshot.after === 'string') {
      const before = typeof snapshot.before === 'string' ? snapshot.before : null
      const after = snapshot.after
      const operation = resolveOperation(snapshot, call, resolvedToolName)
      if (before !== null && before === after) {
        return { ...base, status: 'nochange', operation, source: 'snapshot', diff: diffText(before, after) }
      }
      if (before !== null && exceedsAlignBudget(before, after)) {
        const oldCount = contentLines(before).length
        const newCount = contentLines(after).length
        const diffs = narrowDiffs(call.meta?.diffs)
        if (diffs !== null) {
          const located = diffFromMeta(diffs, contentLines(after))
          // The exact side lengths are known even though the browser skipped
          // the full alignment: keep them for the dialog footer.
          located.oldLineCount = oldCount
          located.newLineCount = newCount
          return {
            ...base,
            status: 'ok',
            operation,
            source: 'located',
            notice: { kind: 'huge', old: oldCount, new: newCount },
            diff: located,
          }
        }
        const coarse = diffText(before, after)
        return {
          ...base,
          status: 'ok',
          operation,
          source: 'snapshot',
          notice: coarse.coarse
            ? { kind: 'coarse', old: oldCount, new: newCount }
            : { kind: 'huge', old: oldCount, new: newCount },
          diff: coarse,
        }
      }
      return {
        ...base,
        status: 'ok',
        operation,
        source: 'snapshot',
        diff: diffText(before ?? '', after),
      }
    }
    // 2. Host-authored presentation diffs (+ current file for line numbers).
    const diffs = narrowDiffs(call.meta?.diffs)
    if (diffs !== null) {
      const lines = typeof fileText === 'string' ? contentLines(fileText) : null
      const located = diffFromMeta(diffs, lines)
      const hasNumbers = located.hasNumbers === true
      // `str_replace_editor` never produces a Host execution snapshot (only
      // `edit` / `write` are captured), so its cards are not "history replay" —
      // they simply cannot offer the full-file comparison. Use a dedicated
      // notice instead of the replay wording used for lost snapshots.
      const snapshotlessTool = resolvedToolName === 'str_replace_editor'
      return {
        ...base,
        status: 'ok',
        operation: resolveOperation(null, call, resolvedToolName),
        source: lines === null || !hasNumbers ? 'meta' : 'located',
        notice: lines === null
          ? (loading === true ? null : { kind: 'lines' })
          : snapshotlessTool
            ? { kind: hasNumbers ? 'tool' : 'toolLocate' }
            : hasNumbers ? { kind: 'history' } : { kind: 'locate' },
        diff: located,
      }
    }
    // 3. A write with no applied diffs is a creation (or an identical rewrite).
    if (resolvedToolName === 'write') {
      const content = stringArg(call.args, 'content')
      const metaOperation = call.meta !== null && typeof call.meta === 'object' ? call.meta.operation : undefined
      if (typeof content === 'string' && metaOperation !== 'update') {
        const created = diffText('', content)
        return { ...base, status: 'ok', operation: 'create', source: 'args', diff: created }
      }
      return { ...base, status: 'nochange', operation: metaOperation === 'create' ? 'create' : 'update', source: null }
    }
    return { ...base, status: 'empty' }
  }

  // Running/preparing call: a preview derived from the arguments only. It is
  // replaced by the exact settled snapshot once the call completes.
  const args = call.args
  if (resolvedToolName === 'write') {
    const content = stringArg(args, 'content')
    if (typeof content === 'string') {
      const preview = diffText('', content)
      return { ...base, status: 'running', operation: 'create', source: 'preview', diff: preview }
    }
  } else if (resolvedToolName === 'edit') {
    const oldString = stringArg(args, 'old_string')
    const newString = stringArg(args, 'new_string')
    if (typeof oldString === 'string' && typeof newString === 'string') {
      const preview = fragmentDiff(oldString, newString)
      return { ...base, status: 'running', operation: 'update', source: 'preview', diff: preview }
    }
  } else if (resolvedToolName === 'str_replace_editor') {
    const oldString = stringArg(args, 'old_str')
    const newString = stringArg(args, 'new_str')
    const fileTextArg = stringArg(args, 'file_text')
    if (typeof fileTextArg === 'string') {
      return { ...base, status: 'running', operation: 'create', source: 'preview', diff: diffText('', fileTextArg) }
    }
    if (typeof oldString === 'string' && typeof newString === 'string') {
      return { ...base, status: 'running', operation: 'update', source: 'preview', diff: fragmentDiff(oldString, newString) }
    }
  }
  return { ...base, status: 'running' }
}
