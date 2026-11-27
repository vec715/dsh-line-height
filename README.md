# dsh-line-height

Chat line height setting for DeepSeek Harness (DSH), like **Line Height** in Zed.

Find it in **Settings** > **General**, after **Font size**.

## Options

| Mode | Line height |
|---|---|
| Standard | DSH default (about 1.7), no change |
| Comfortable | 1.5 |
| Compact | 1.3 |
| Custom | 1.0 to 3.0, step 0.05 |

- **Custom** opens a stepper (− / value / +). You can also type a value or use the arrow keys.
- When the mode is not Standard, a reset button shows next to the title.
- Headings and tables scale with the same ratio.

## Scope

Changes apply only to chat responses: the main chat, split panes ([dsh-split-view](https://github.com/vec715/dsh-split-view)), and subagent chats in the right sidebar. The composer, sidebar, settings, and code blocks are not changed.

## Install

In DSH, open **Plugins** > **Add plugin** and enter:

```
github:vec715/dsh-line-height
```

Or from the command line:

```sh
dsh plugin add github:vec715/dsh-line-height
```

To pin a version: `github:vec715/dsh-line-height#v1.0.0`.

From a local clone (for development): `git clone https://github.com/vec715/dsh-line-height.git`, then enter the absolute path of the folder in **Plugins** > **Add plugin**.

After installing, reload the window (or restart DSH).

## How it works

This is a DSH client bundle. It does not patch the app.

- The chat Markdown gets its typography from theme tokens (`--dsw-font-markdown-base`, `-h1` to `-h4`, `-table`). The plugin redefines these tokens only inside `[data-conversation-region="chat"]`.
- The style is rendered from an entry in the `shell.overlay` slot. The settings row is an entry in `settings.general.item`.
- The choice is saved in local storage and synced across windows.

## Limitations

- Only line height changes. The gap between paragraphs (16px) stays the same.
- User messages keep their spacing.
- Token names come from DSH theme CSS. A DSH update can rename them.

Tested with DSH 0.2.2-rc.5.
