# ◈ CSS Shape Designer

<div align="center">

![CSS Shape Designer Banner](https://img.shields.io/badge/CSS-Shape%20Designer-6366f1?style=for-the-badge&logo=css3&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-f59e0b?style=for-the-badge)
![HTML](https://img.shields.io/badge/built%20with-HTML%20%2B%20CSS%20%2B%20JS-ec4899?style=for-the-badge)

**A powerful, browser-based `clip-path` polygon editor with multi-breakpoint support.**  
Design complex CSS shapes visually — no manual math required.

[🚀 Live Demo](#) • [📖 Documentation](#usage) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

---

## 📸 Preview

> Open `index.html` in any modern browser — no build tools, no dependencies, no npm install needed.

---

## ✨ Features

- 🎨 **Visual Point Editor** — Click canvas to add points, drag to move them
- 📱 **Multi-Breakpoint System** — Create separate shapes for Desktop, Tablet, Mobile etc.
- 🎯 **9 Built-in Presets** — Rectangle, Diamond, Pentagon, Hexagon, Arrow, Chevron, Star, Card Cut, Ribbon
- 📐 **Responsive CSS Generator** — Auto-generates `@media` query code for all breakpoints
- 🔄 **Undo / Redo** — 30-step history
- ↔️ **Mirror Tools** — Flip shape horizontally or vertically
- 🎨 **Custom Fill** — Gradient color picker with angle control
- 📋 **One-Click Copy** — Copy CSS or full responsive CSS instantly
- 🔢 **Point Coordinate Editor** — Fine-tune exact X/Y values from right panel
- 📏 **Visual Breakpoint Ruler** — See all breakpoints mapped on a screen-size ruler
- 🌐 **Zero Dependencies** — Pure HTML + CSS + JavaScript, single file

---

## 🚀 Quick Start

### Option 1: Direct Open
```bash
# Clone the repo
git clone https://github.com/noorulahad/css-shape-designer

# Open in browser
open css-shape-designer/index.html
```

### Option 2: Live Server (recommended for development)
```bash
# Using VS Code Live Server extension, or:
npx serve css-shape-designer
```

### Option 3: GitHub Pages
Just enable **GitHub Pages** in repo settings → point to `master` branch → your tool is live!

---

## 🎮 Usage

### Adding Points
1. Make sure **"Add"** tool is selected (left panel)
2. Click anywhere on the canvas to place a point
3. Minimum **3 points** needed to form a shape

### Moving Points
1. Switch to **"Move"** tool
2. Drag any point to reposition it
3. Or select a point and edit exact X/Y values in right panel → **"Edit Point"** tab

### Deleting Points
1. Switch to **"Delete"** tool
2. Click any point to remove it
3. Or hover a point in the sidebar list and click `×`

### Using Presets
- Click any preset chip in the top bar (Rectangle, Star, Arrow, etc.)
- Preset loads into the **currently active breakpoint**

### Working with Breakpoints

```
Default (base)  →  @1440px and above
Tablet          →  @768px
Mobile          →  @480px
```

1. Click **"+ Add Breakpoint"** in the breakpoint tab bar
2. Enter a name (e.g. "Mobile") and max-width (e.g. 768)
3. Pick a color for easy identification
4. The new tab appears — click it to activate
5. Customize the shape specifically for that breakpoint
6. Go to **"Responsive"** tab in right panel → copy all CSS

### Copying CSS

**Single Breakpoint:**
```css
/* Right Panel → Code Tab → Copy */
.element {
  clip-path: polygon(
    0% 0%,
    85% 0%,
    100% 15%,
    100% 100%,
    0% 100%
  );
}
```

**All Breakpoints (Responsive):**
```css
/* Right Panel → Responsive Tab → Copy All */
.element {
  clip-path: polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%);
}

@media (max-width: 768px) {
  .element {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

@media (max-width: 480px) {
  .element {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
```

---

## 📁 Project Structure

```
css-shape-designer/
│
├── index.html          # Main app — entire tool in a single file
├── README.md           # You are here
├── LICENSE             # MIT License
└── .gitignore          # Standard web gitignore
```

---

## 🛠️ Keyboard Shortcuts (Planned)

| Key | Action |
|-----|--------|
| `A` | Switch to Add mode |
| `M` | Switch to Move mode |
| `D` | Switch to Delete mode |
| `Ctrl+Z` | Undo |
| `Ctrl+C` | Copy current CSS |
| `Delete` | Delete selected point |

---

## 🗺️ Roadmap

- [ ] Keyboard shortcuts
- [ ] Export as SVG
- [ ] `border-radius` shape support
- [ ] `path()` CSS function support
- [ ] Import/export shape JSON
- [ ] Shape library (save custom shapes)
- [ ] Dark/Light theme toggle
- [ ] Mobile touch drag support

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

### Commit Convention
```
feat:     New feature
fix:      Bug fix
style:    UI/CSS changes
refactor: Code refactoring
docs:     Documentation update
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author

**Your Name**
- GitHub: [@noorulahad](https://github.com/noorulahad)
- Instagram: [@noorulahad675](https://instagram.com/noorulahad675)

---

<div align="center">

Made with ❤️ — If this helped you, please ⭐ star the repo!

</div>
