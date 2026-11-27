/**
 * Chat line height for DSH.
 *
 * Adds a "Chat line height" row to Settings > General (after Font size) with
 * presets Standard (the shipped spacing), Comfortable, Compact, and Custom.
 * Non-standard values redefine the Markdown typography tokens only inside
 * Conversation chat regions, so responses (main chat, split panes, sidebar
 * subagent chats) change while the composer, sidebar, and settings keep theirs.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-line-height',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useSyncExternalStore } = React

    const NS = 'line-height'
    const STORAGE_KEY = 'dsh-line-height:v1'
    /** Shipped ratio: 24px line on a 14px body. */
    const NATIVE = 24 / 14
    const MIN = 1.0
    const MAX = 3.0
    const STEP = 0.05
    const PRESETS = { comfortable: 1.5, compact: 1.3 }
    const MODES = ['standard', 'comfortable', 'compact', 'custom']

    const DICTS = {
      en: {
        title: 'Chat line height',
        description: 'Space between lines in chat responses. Standard keeps the DSH default (about 1.7).',
        'mode.standard': 'Standard',
        'mode.comfortable': 'Comfortable',
        'mode.compact': 'Compact',
        'mode.custom': 'Custom',
        'custom.title': 'Custom line height',
        'custom.description': 'Line height as a multiple of the font size, from 1.0 to 3.0.',
        'custom.increase': 'Increase line height',
        'custom.decrease': 'Decrease line height',
        reset: 'Reset to standard',
      },
      ru: {
        title: 'Межстрочный интервал в чате',
        description: 'Расстояние между строками в ответах чата. «Стандартный» оставляет значение DSH по умолчанию (около 1,7).',
        'mode.standard': 'Стандартный',
        'mode.comfortable': 'Удобный',
        'mode.compact': 'Компактный',
        'mode.custom': 'Свой',
        'custom.title': 'Свой интервал',
        'custom.description': 'Интервал как множитель размера шрифта, от 1,0 до 3,0.',
        'custom.increase': 'Увеличить интервал',
        'custom.decrease': 'Уменьшить интервал',
        reset: 'Сбросить на стандартный',
      },
      zh: {
        title: '对话行高',
        description: '对话回复中的行间距。“标准”保留 DSH 默认值（约 1.7）。',
        'mode.standard': '标准',
        'mode.comfortable': '舒适',
        'mode.compact': '紧凑',
        'mode.custom': '自定义',
        'custom.title': '自定义行高',
        'custom.description': '行高为字号的倍数，范围 1.0 到 3.0。',
        'custom.increase': '增大行高',
        'custom.decrease': '减小行高',
        reset: '恢复为标准',
      },
    }

    const round = v => Math.round(v * 100) / 100
    const clamp = v => Math.min(MAX, Math.max(MIN, round(v)))

    function load() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
        if (parsed && MODES.includes(parsed.mode)) {
          return { mode: parsed.mode, custom: clamp(Number(parsed.custom) || 1.3) }
        }
      } catch (_error) { /* fall through */ }
      return { mode: 'standard', custom: 1.3 }
    }

    function createStore(initial) {
      let value = initial
      const listeners = new Set()
      return {
        getSnapshot: () => value,
        subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
        set(next) {
          if (next === value) return
          value = next
          for (const listener of [...listeners]) listener()
        },
      }
    }

    const factorOf = pref => pref.mode === 'standard' ? null
      : pref.mode === 'custom' ? pref.custom : PRESETS[pref.mode]

    /** Token overrides for one line-height factor, scoped to chat regions. */
    function tokenCss(f) {
      const s = f / NATIVE
      const r = (ratio, min = 1.1) => round(Math.max(min, ratio * s) * 1000) / 1000
      const body = 'var(--dsh-content-font-size, 14px)'
      const sec = 'var(--dsh-content-font-size-secondary, 13px)'
      const hSize = px => `calc(${px}px + var(--dsh-content-font-delta, 0px))`
      const fam = 'var(--dsw-font-family)'
      const lh = (size, k) => `calc(${size} * ${k})`
      const base = lh(body, round(f * 1000) / 1000)
      const h1 = hSize(21); const h2 = hSize(19); const h3 = hSize(18)
      const table = lh(sec, r(22 / 13))
      return `[data-conversation-region="chat"]{
--dsw-font-markdown-base:${body}/${base} ${fam};
--dsw-font-markdown-base-line-height:${base};
--dsw-font-markdown-base-strong:600 ${body}/${base} ${fam};
--dsw-font-markdown-base-strong-line-height:${base};
--dsw-font-markdown-base-italic:italic ${body}/${base} ${fam};
--dsw-font-markdown-base-italic-line-height:${base};
--dsw-font-markdown-base-strong-italic:italic 600 ${body}/${base} ${fam};
--dsw-font-markdown-base-strong-italic-line-height:${base};
--dsw-font-markdown-h1:700 ${h1}/${lh(h1, r(30 / 21))} ${fam};
--dsw-font-markdown-h1-line-height:${lh(h1, r(30 / 21))};
--dsw-font-markdown-h2:700 ${h2}/${lh(h2, r(28 / 19))} ${fam};
--dsw-font-markdown-h2-line-height:${lh(h2, r(28 / 19))};
--dsw-font-markdown-h3:700 ${h3}/${lh(h3, r(26 / 18))} ${fam};
--dsw-font-markdown-h3-line-height:${lh(h3, r(26 / 18))};
--dsw-font-markdown-h4:600 ${body}/${base} ${fam};
--dsw-font-markdown-h4-line-height:${base};
--dsw-font-markdown-table:${sec}/${table} ${fam};
--dsw-font-markdown-table-line-height:${table};
--dsw-font-markdown-table-head:500 ${sec}/${table} ${fam};
--dsw-font-markdown-table-head-line-height:${table};
}`
    }

    const ROW_CSS = `
.dshlh-row{display:flex;align-items:center;gap:8px;padding:16px 0;border-bottom:0.5px solid var(--dsw-alias-border-l2)}
.dshlh-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px}
.dshlh-title{font-size:14px;font-weight:400;line-height:22px;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:6px}
.dshlh-desc{font-size:12px;font-weight:400;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dshlh-seg{display:inline-flex;flex:none;gap:2px;padding:2px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-module-platform)}
.dshlh-seg button{height:32px;padding:0 12px;border:none;border-radius:calc(var(--dsw-radius-md,8px) - 2px);background:transparent;font:inherit;font-size:13px;line-height:18px;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}
.dshlh-seg button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 0.5px 2px rgba(0,0,0,.12)}
@media (hover:hover){.dshlh-seg button:hover:not([aria-pressed=true]){color:var(--dsw-alias-label-primary)}}
.dshlh-seg button:focus-visible,.dshlh-step button:focus-visible,.dshlh-reset:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshlh-reset{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
@media (hover:hover){.dshlh-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.dshlh-custom{display:flex;align-items:center;gap:8px;margin:0 0 0 0;padding:14px 16px;border-bottom:0.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 55%,transparent)}
.dshlh-step{display:inline-flex;flex:none;align-items:stretch;height:36px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-module-platform);overflow:hidden}
.dshlh-step button{width:36px;padding:0;border:none;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dshlh-step button:disabled{color:var(--dsw-alias-label-caption);cursor:default}
@media (hover:hover){.dshlh-step button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.dshlh-step input{width:64px;border:none;border-inline:0.5px solid var(--dsw-alias-border-l2);background:transparent;text-align:center;font:inherit;font-size:14px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);outline:none}
.dshlh-step input:focus{background:var(--dsw-alias-bg-layer-1)}
@media (max-width:767px){.dshlh-row{flex-direction:column;align-items:stretch}.dshlh-text{padding-right:0}}
`

    const glyph = (d, size = 14) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    }, h('path', { d }))

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [locale, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, locale, dict), `line-height: ${locale} dictionary`)
        }

        const pref = createStore(load())
        const save = (next) => {
          pref.set(next)
          try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_error) { /* ignore */ }
        }
        // Keep several windows in step.
        ctx.effect(() => {
          const onStorage = (event) => { if (event.key === STORAGE_KEY) pref.set(load()) }
          window.addEventListener('storage', onStorage)
          return () => { window.removeEventListener('storage', onStorage) }
        }, 'line-height: cross-window sync')

        const usePref = () => useSyncExternalStore(pref.subscribe, pref.getSnapshot, pref.getSnapshot)

        /** Always-mounted frame layer that carries the token overrides. */
        function LineHeightStyle() {
          const value = usePref()
          const f = factorOf(value)
          return f === null ? null : h('style', { 'data-dsh-line-height': f }, tokenCss(f))
        }

        function CustomValue({ value, t }) {
          const [draft, setDraft] = useState(value.toFixed(2))
          useEffect(() => { setDraft(value.toFixed(2)) }, [value])
          const commit = (raw) => {
            const parsed = Number(String(raw).replace(',', '.'))
            if (Number.isFinite(parsed)) save({ ...pref.getSnapshot(), custom: clamp(parsed) })
            else setDraft(value.toFixed(2))
          }
          const bump = d => save({ ...pref.getSnapshot(), custom: clamp(value + d) })
          return h('div', { className: 'dshlh-custom' },
            h('div', { className: 'dshlh-text' },
              h('div', { className: 'dshlh-title' }, t('custom.title')),
              h('div', { className: 'dshlh-desc' }, t('custom.description'))),
            h('div', { className: 'dshlh-step' },
              h('button', {
                type: 'button', 'aria-label': t('custom.decrease'), disabled: value <= MIN,
                onClick: () => { bump(-STEP) },
              }, glyph('M4 8h8')),
              h('input', {
                type: 'text', inputMode: 'decimal', value: draft, 'aria-label': t('custom.title'),
                onChange: (event) => { setDraft(event.target.value) },
                onBlur: (event) => { commit(event.target.value) },
                onKeyDown: (event) => {
                  if (event.key === 'Enter') commit(event.currentTarget.value)
                  else if (event.key === 'ArrowUp') { event.preventDefault(); bump(STEP) }
                  else if (event.key === 'ArrowDown') { event.preventDefault(); bump(-STEP) }
                },
              }),
              h('button', {
                type: 'button', 'aria-label': t('custom.increase'), disabled: value >= MAX,
                onClick: () => { bump(STEP) },
              }, glyph('M4 8h8M8 4v8'))))
        }

        function LineHeightRow({ t }) {
          const value = usePref()
          return h(React.Fragment, null,
            h('style', null, ROW_CSS),
            h('div', { className: 'dshlh-row' },
              h('div', { className: 'dshlh-text' },
                h('div', { className: 'dshlh-title' }, t('title'),
                  value.mode !== 'standard' && h('button', {
                    type: 'button', className: 'dshlh-reset', title: t('reset'), 'aria-label': t('reset'),
                    onClick: () => { save({ ...value, mode: 'standard' }) },
                  }, glyph('M5 4L3 6l2 2M3 6h6.5a3.5 3.5 0 010 7H7', 13))),
                h('div', { className: 'dshlh-desc' }, t('description'))),
              h('div', { className: 'dshlh-seg', role: 'group', 'aria-label': t('title') },
                MODES.map(mode => h('button', {
                  key: mode, type: 'button', 'aria-pressed': value.mode === mode,
                  title: mode in PRESETS ? String(PRESETS[mode]) : undefined,
                  onClick: () => { save({ ...value, mode }) },
                }, t(`mode.${mode}`))))),
            value.mode === 'custom' && h(CustomValue, { value: value.custom, t }))
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'line-height-style', order: -100,
        }, LineHeightStyle))

        ctx.slots.inject('settings.general.item', () => ctx.slots.register({
          name: 'settings.general.item', id: 'chat-line-height', order: 11.5, locale: NS,
        }, LineHeightRow))
      },
    }
  },
})
