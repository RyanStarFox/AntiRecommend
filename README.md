# Anti-Recommend

> Hide video recommendations and disable autoplay on **YouTube** and **Bilibili** — stay focused on what you came to watch.
>
> 隐藏 **YouTube** 和 **Bilibili** 的视频推荐并关闭自动连播 —— 只看你想看的内容。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![LINUX DO](https://img.shields.io/badge/LINUX-DO-FFB003.svg?logo=data:image/svg%2bxml;base64,DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik00Ni44Mi0uMDU1aDYuMjVxMjMuOTY5IDIuMDYyIDM4IDIxLjQyNmM1LjI1OCA3LjY3NiA4LjIxNSAxNi4xNTYgOC44NzUgMjUuNDV2Ni4yNXEtMi4wNjQgMjMuOTY4LTIxLjQzIDM4LTExLjUxMiA3Ljg4NS0yNS40NDUgOC44NzRoLTYuMjVxLTIzLjk3LTIuMDY0LTM4LjAwNC0yMS40M1EuOTcxIDY3LjA1Ni0uMDU0IDUzLjE4di02LjQ3M0MxLjM2MiAzMC43ODEgOC41MDMgMTguMTQ4IDIxLjM3IDguODE3IDI5LjA0NyAzLjU2MiAzNy41MjcuNjA0IDQ2LjgyMS0uMDU2IiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZWNlY2VjO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZD0iTTQ3LjI2NiAyLjk1N3EyMi41My0uNjUgMzcuNzc3IDE1LjczOGE0OS43IDQ5LjcgMCAwIDEgNi44NjcgMTAuMTU3cS00MS45NjQuMjIyLTgzLjkzIDAgOS43NS0xOC42MTYgMzAuMDI0LTI0LjM4N2E2MSA2MSAwIDAgMSA5LjI2Mi0xLjUwOCIgc3R5bGU9InN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzE5MTkxOTtmaWxsLW9wYWNpdHk6MSIvPjxwYXRoIGQ9Ik03Ljk4IDcwLjkyNmMyNy45NzctLjAzNSA1NS45NTQgMCA4My45My4xMTNRODMuNDI2IDg3LjQ3MyA2Ni4xMyA5NC4wODZxLTE4LjgxIDYuNTQ0LTM2LjgzMi0xLjg5OC0xNC4yMDMtNy4wOS0yMS4zMTctMjEuMjYyIiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZjlhZjAwO2ZpbGwtb3BhY2l0eToxIi8+PC9zdmc+)](https://linux.do)

---

## Features / 功能

| | English | 中文 |
|---|---|---|
| 🚫 | Hide sidebar recommendations | 隐藏侧边栏推荐 |
| 🎬 | Hide in-player end-screen recommendations | 隐藏播放器内结束页推荐 |
| 🧹 | Hide page ads and promoted cards (Bilibili) | 隐藏页面广告和推广卡片（Bilibili） |
| ⏸️ | Hide pause overlay suggestions (YouTube) | 隐藏暂停时的推荐浮层（YouTube） |
| 🔁 | Disable autoplay / auto-advance | 关闭自动播放 / 自动连播 |
| ⚡ | Inject CSS at `document-start` — no flicker | 在页面加载前注入 CSS，无闪烁 |
| 👁️ | MutationObserver for SPA dynamic content | 监听 SPA 动态内容，持续生效 |

---

## Supported Sites / 支持站点

| Site / 站点 | Sidebar / 侧边栏 | End Screen / 结束页 | Pause Overlay / 暂停浮层 | Autoplay / 自动连播 |
|---|---|---|---|---|
| YouTube (Desktop & Mobile) | ✅ | ✅ | ✅ | ✅ |
| Bilibili (Video & Bangumi) | ✅ | ✅ | — | ✅ |

---

## Installation / 安装

### Option 1 — Greasy Fork（推荐 / Recommended）

1. Install a userscript manager / 安装脚本管理器：
   - **Chrome / Edge / Firefox** → [Tampermonkey](https://www.tampermonkey.net/)
   - **Safari** → [Userscripts](https://apps.apple.com/app/userscripts/id1463298887)（免费开源 / free & open-source）
2. Install the script / 安装脚本：
   - [Greasy Fork — Anti-Recommend](https://greasyfork.org/scripts/anti-recommend)

### Option 2 — From Source / 从源码安装

```bash
git clone https://github.com/RyanStarFox/AntiRecommend.git
```

Open your userscript manager dashboard, create a new script, and paste the contents of `anti-recommend.user.js`.

打开脚本管理器，新建脚本，粘贴 `anti-recommend.user.js` 的内容即可。

---

## How It Works / 工作原理

Anti-Recommend uses a layered approach to block recommendations without breaking playback:

Anti-Recommend 采用多层策略拦截推荐，同时不影响正常播放：

1. **Early CSS injection** — Styles are injected at `document-start`, hiding recommendation elements before the first paint.
   **早期 CSS 注入** — 在 `document-start` 阶段注入样式，首屏渲染前即隐藏推荐元素。

2. **Shadow DOM support** — YouTube's player lives inside Shadow DOM; the script injects styles there too.
   **Shadow DOM 支持** — YouTube 播放器位于 Shadow DOM 内，脚本会同步注入样式。

3. **MutationObserver** — Watches for dynamically added recommendation nodes and re-hides them instantly.
   **DOM 监听** — 监听动态插入的推荐节点，实时重新隐藏。

4. **Autoplay toggle** — Automatically clicks off the autoplay switch when detected.
   **自动连播关闭** — 检测到自动播放开关时自动关闭。

5. **History interception** — Blocks programmatic page navigation triggered by playlist auto-advance after a video ends.
   **历史记录拦截** — 阻止视频结束后播放列表触发的自动跳转。

---

## FAQ / 常见问题

**Q: Recommendations still appear after updating?**
**问：更新后推荐仍然出现？**

Hard-refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`) and confirm Tampermonkey shows the latest version (currently **v1.5.7**).

硬刷新页面（`Cmd+Shift+R` / `Ctrl+Shift+R`），并确认 Tampermonkey 中脚本版本为最新（当前 **v1.5.7**）。

**Q: Does this affect video playback or the progress bar?**
**问：会影响视频播放或进度条吗？**

No. The script only targets recommendation containers, not the player itself.
If you encounter issues, please open an [Issue](https://github.com/RyanStarFox/AntiRecommend/issues).

不会。脚本只针对推荐相关容器，不会隐藏播放器本体。
如遇异常，请在 [Issues](https://github.com/RyanStarFox/AntiRecommend/issues) 反馈。

---

## Contributing / 贡献

Issues and pull requests are welcome!

欢迎提交 Issue 和 Pull Request。

---

## License / 许可证

[MIT](LICENSE)

---

本开源项目已链接并认可 [LINUX DO 社区](https://linux.do)。
