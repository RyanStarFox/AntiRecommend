<p align="center">
  <img src="media/logo_text.png" alt="AntiRecommend" width="420" />
</p>

> Hide recommendations, disable autoplay, and redirect distracting entry pages on **YouTube** and **Bilibili**.
>
> 隐藏 **YouTube** 和 **Bilibili** 的推荐，关闭自动连播，并重定向干扰性入口页面。

> **Ad blocking** has moved to the companion script **[AntiAds](https://github.com/RyanStarFox/AntiAds)**. Install both for the full experience.
>
> **去广告功能**已拆分到配套脚本 **[AntiAds](https://github.com/RyanStarFox/AntiAds)**，可同时安装两者获得完整体验。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![LINUX DO](https://img.shields.io/badge/LINUX-DO-FFB003.svg?logo=data:image/svg%2bxml;base64,DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik00Ni44Mi0uMDU1aDYuMjVxMjMuOTY5IDIuMDYyIDM4IDIxLjQyNmM1LjI1OCA3LjY3NiA4LjIxNSAxNi4xNTYgOC44NzUgMjUuNDV2Ni4yNXEtMi4wNjQgMjMuOTY4LTIxLjQzIDM4LTExLjUxMiA3Ljg4NS0yNS40NDUgOC44NzRoLTYuMjVxLTIzLjk3LTIuMDY0LTM4LjAwNC0yMS40M1EuOTcxIDY3LjA1Ni0uMDU0IDUzLjE4di02LjQ3M0MxLjM2MiAzMC43ODEgOC41MDMgMTguMTQ4IDIxLjM3IDguODE3IDI5LjA0NyAzLjU2MiAzNy41MjcuNjA0IDQ2LjgyMS0uMDU2IiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZWNlY2VjO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZD0iTTQ3LjI2NiAyLjk1N3EyMi41My0uNjUgMzcuNzc3IDE1LjczOGE0OS43IDQ5LjcgMCAwIDEgNi44NjcgMTAuMTU3cS00MS45NjQuMjIyLTgzLjkzIDAgOS43NS0xOC42MTYgMzAuMDI0LTI0LjM4N2E2MSA2MSAwIDAgMSA5LjI2Mi0xLjUwOCIgc3R5bGU9InN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzE5MTkxOTtmaWxsLW9wYWNpdHk6MSIvPjxwYXRoIGQ9Ik03Ljk4IDcwLjkyNmMyNy45NzctLjAzNSA1NS45NTQgMCA4My45My4xMTNRODMuNDI2IDg3LjQ3MyA2Ni4xMyA5NC4wODZxLTE4LjgxIDYuNTQ0LTM2LjgzMi0xLjg5OC0xNC4yMDMtNy4wOS0yMS4zMTctMjEuMjYyIiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZjlhZjAwO2ZpbGwtb3BhY2l0eToxIi8+PC9zdmc+)](https://linux.do)

---

## Features / 功能

| | English | 中文 |
|---|---|---|
| 🚫 | Hide sidebar recommendations | 隐藏侧边栏推荐 |
| 🎬 | Hide in-player end-screen recommendations | 隐藏播放器内结束页推荐 |
| ⏸️ | Hide pause overlay suggestions (YouTube) | 隐藏暂停时的推荐浮层（YouTube） |
| 🔁 | Disable autoplay / auto-advance | 关闭自动播放 / 自动连播 |
| 🔀 | Redirect distracting homepage & search URLs | 重定向干扰性首页与搜索 URL |
| ⚡ | Inject CSS at `document-start` — no flicker | 在页面加载前注入 CSS，无闪烁 |
| 👁️ | MutationObserver for SPA dynamic content | 监听 SPA 动态内容，持续生效 |

---

## Supported Sites / 支持站点

| Site / 站点 | Pages / 页面 | Sidebar / 侧边栏 | End Screen / 结束页 | Autoplay / 自动连播 | Redirects / 重定向 |
|---|---|---|---|---|---|
| YouTube (Desktop) | 首页、搜索、视频页 | ✅ | ✅ | ✅ | ✅ |
| YouTube (Mobile) | 视频页 | ✅ | ✅ | ✅ | — |
| Bilibili | 首页、搜索、视频、番剧 | ✅ | ✅ | ✅ | ✅ |

---

## URL Redirects / 页面重定向

脚本会自动将以下页面重定向到更「干净」的入口：

| From / 原页面 | To / 跳转到 |
|---|---|
| `https://www.youtube.com/` | `https://www.youtube.com/feed/playlists` |
| YouTube 搜索「超级搜索」 | `https://www.youtube.com/feed/playlists` |
| `https://www.bilibili.com/` | `https://search.bilibili.com/all` |
| Bilibili 搜索「超级搜索」 | `https://search.bilibili.com/all` |

> 重定向在 `document-start` 执行，并持续监听 SPA 内导航（如 YouTube 站内搜索）。
>
> Redirects run at `document-start` and also watch for in-page SPA navigation.

---

## Installation / 安装

### Step 1 — Choose a userscript manager / 选择脚本管理器

| Browser / 浏览器 | Recommended / 推荐 | Download / 下载 |
|---|---|---|
| Chrome | [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | Chrome Web Store |
| Microsoft Edge | [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) | Edge Add-ons |
| Firefox | [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/) | Firefox Add-ons |
| Safari (macOS / iOS) | [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) | App Store（免费开源 / free & open-source） |
| Brave / Opera / Vivaldi | [Tampermonkey](https://www.tampermonkey.net/) | 官网选择对应浏览器 / pick your browser on the site |

> **Safari 用户注意：** Userscripts 是 Safari 上最常用的脚本管理器，需在系统设置中授予扩展权限后才能在网页上运行脚本。
>
> **Safari note:** Userscripts is the most common manager on Safari. Grant the extension permission in System Settings before scripts can run on web pages.

---

### Step 2 — Install Anti-Recommend / 安装脚本

#### Option A — Greasy Fork（推荐 / Recommended）

1. 确保已安装并启用上面的脚本管理器 / Make sure your userscript manager is installed and enabled.
2. 打开安装页 / Open the install page:
   - [Greasy Fork — Anti-Recommend](https://greasyfork.org/scripts/anti-recommend)
3. 点击 **Install** / **安装**，在弹窗中确认 / confirm in the popup.

#### Option B — GitHub 源码 / From source

```bash
git clone https://github.com/RyanStarFox/AntiRecommend.git
```

**Tampermonkey / Violentmonkey：**

1. 点击浏览器工具栏中的扩展图标 → **Dashboard / 管理面板**
2. 点击 **+** 或 **Create a new script / 新建脚本**
3. 删除默认内容，粘贴 `anti-recommend.user.js` 的全部内容
4. 保存（`Cmd+S` / `Ctrl+S`）

**Safari — Userscripts：**

1. 打开 Userscripts App → **Settings / 设置** → 启用 Safari 扩展
2. 在 Safari 中打开 **Settings → Extensions → Userscripts**，允许在目标网站运行
3. 将 `anti-recommend.user.js` 导入 Userscripts（可通过 iCloud 同步或本地文件导入）
4. 在 Userscripts 中为 `youtube.com` 和 `bilibili.com` 启用该脚本

---

## Usage / 使用方法

安装完成后**无需额外配置**，脚本会在匹配的页面自动生效：

Once installed, the script runs automatically on matching pages — no extra setup needed.

1. **打开目标网站 / Open a supported site**
   - YouTube：`https://www.youtube.com`
   - Bilibili：`https://www.bilibili.com`

2. **确认脚本已启用 / Confirm the script is active**
   - Tampermonkey：点击扩展图标，确认脚本为 **Enabled / 已启用**
   - Userscripts：在 Safari 扩展菜单中确认脚本对当前站点已开启

3. **刷新页面 / Refresh the page**
   - 首次安装或更新后，建议硬刷新：`Cmd+Shift+R`（macOS）或 `Ctrl+Shift+R`（Windows / Linux）
   - After installing or updating, do a hard refresh to load the latest script

4. **验证效果 / Verify it works**
   - **YouTube**：首页跳转到播放列表；侧边栏推荐消失；视频结束后不再弹出推荐网格
   - **Bilibili**：首页跳转到搜索页；右侧推荐消失；“自动开播”“自动连播”会被关闭，播放方式设为“播完暂停”

5. **更新脚本 / Update the script**
   - Tampermonkey 默认会自动检查更新；也可在 Dashboard 中手动点击 **Check for userscript updates**
   - Userscripts 需重新导入新版本，或通过 iCloud 同步更新

> 当前最新版本 / Latest version: **v1.6.0**

---

## How It Works / 工作原理

Anti-Recommend uses a layered approach to keep video pages clean without breaking playback:

Anti-Recommend 采用多层策略清理页面，同时不影响正常播放：

1. **Early CSS injection** — Styles are injected at `document-start`, hiding elements before the first paint.
   **早期 CSS 注入** — 在 `document-start` 阶段注入样式，首屏渲染前即隐藏目标元素。

2. **Shadow DOM support** — YouTube's player lives inside Shadow DOM; the script injects styles there too.
   **Shadow DOM 支持** — YouTube 播放器位于 Shadow DOM 内，脚本会同步注入样式。

3. **MutationObserver** — Watches for dynamically added nodes and re-applies hiding instantly.
   **DOM 监听** — 监听动态插入的节点，实时重新隐藏。

4. **Autoplay toggle** — Automatically clicks off the autoplay switch when detected.
   **自动连播关闭** — 检测到自动播放开关时自动关闭。

5. **History interception** — Blocks programmatic navigation triggered by playlist auto-advance after a video ends.
   **历史记录拦截** — 阻止视频结束后播放列表触发的自动跳转。

6. **URL redirects** — Rewrites distracting homepage and blocked-search URLs at load time and during SPA navigation.
   **URL 重定向** — 在页面加载及 SPA 导航时，将干扰性首页与特定搜索 URL 重定向到更干净的页面。

---

## FAQ / 常见问题

**Q: Recommendations still appear after updating?**
**问：更新后推荐仍然出现？**

Hard-refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`) and confirm your userscript manager shows the latest version (currently **v1.6.0**).

硬刷新页面（`Cmd+Shift+R` / `Ctrl+Shift+R`），并确认脚本管理器中版本为最新（当前 **v1.6.0**）。

**Q: Does this affect video playback or the progress bar?**
**问：会影响视频播放或进度条吗？**

No. The script only targets recommendation containers, not the player itself.
If you encounter issues, please open an [Issue](https://github.com/RyanStarFox/AntiRecommend/issues).

不会。脚本只针对推荐相关容器，不会隐藏播放器本体。
如遇异常，请在 [Issues](https://github.com/RyanStarFox/AntiRecommend/issues) 反馈。

**Q: Where did ad blocking go?**
**问：去广告功能去哪了？**

Ad blocking was split into **[AntiAds](https://github.com/RyanStarFox/AntiAds)** in v1.6.0. Install it alongside AntiRecommend for the same ad-hiding behavior as before.

v1.6.0 起去广告功能已拆分到 **[AntiAds](https://github.com/RyanStarFox/AntiAds)**，与 AntiRecommend 同时安装即可恢复原有去广告效果。

**Q: Homepage redirects don't work?**
**问：首页重定向不生效？**

Make sure the script is enabled for the site (e.g. `www.bilibili.com`, `www.youtube.com`) and hard-refresh. Tampermonkey must have permission to run on those domains.

确认脚本已对对应域名启用（如 `www.bilibili.com`、`www.youtube.com`）并硬刷新。Tampermonkey 需获得在这些域名上运行的权限。

---

## Contributing / 贡献

Issues and pull requests are welcome!

欢迎提交 Issue 和 Pull Request。

---

## License / 许可证

[MIT](LICENSE)

---

本开源项目已链接并认可 [LINUX DO 社区](https://linux.do)。
