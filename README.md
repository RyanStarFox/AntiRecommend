# Anti-Recommend

A userscript that removes sidebar recommendations and end-screen recommendations on YouTube and Bilibili, helping you stay focused on the video you're watching.

## Supported Sites

| Site | Sidebar | End Screen | Pause Overlay |
|------|---------|------------|---------------|
| YouTube (Desktop & Mobile) | ✅ | ✅ | ✅ |
| Bilibili | ✅ | ✅ | — |

## Installation

### Desktop

1. Install a userscript manager:
   - **Chrome / Edge / Firefox**: [Tampermonkey](https://www.tampermonkey.net/)
   - **Safari**: [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (free, open-source)
2. [Click here to install](https://greasyfork.org/scripts/anti-recommend) (Greasy Fork)
3. Or install from source: copy `anti-recommend.user.js` into Tampermonkey's dashboard

### Manual (from source)

```bash
git clone https://github.com/RyanStarFox/AntiRecommend.git
```

Then drag `anti-recommend.user.js` into your userscript manager.

## How It Works

- **CSS injection** at `document-start`: hides recommendation elements before the first paint — no flicker.
- **MutationObserver**: catches dynamically-loaded content in SPAs (YouTube and Bilibili are single-page apps).

## License

MIT
