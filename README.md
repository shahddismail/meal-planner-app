# 🥗 Meal Planner — Mobile App

A fully interactive mobile meal planning app built with **React 19 + Vite + Tailwind CSS v4**. Designed as a pixel-perfect iPhone-style UI (390 × 852 px) with three screens, drag-and-drop scheduling, a meal library, and an auto-generated grocery list.

---

## ✨ Features

### 📋 Week Planner
- 7-day horizontal day strip with dot indicators showing filled meals
- Three meal slots per day — **Breakfast**, **Lunch**, **Dinner** — each color-coded
- Tap **+ add** on any empty slot to open the meal picker sheet
- Tap **↻ swap** on a filled slot to replace it
- **Drag** a placed meal card onto another slot to swap them
- **Drag** a placed meal onto the 🗑️ trash zone to remove it

### 🍽️ Meal Library
- 12 curated meals across 3 types and 8 cuisines
- Filter by All / Breakfast / Lunch / Dinner
- Each card shows a photo, name, calories, cook time, and ingredient preview
- **Tap any card** to open a full detail sheet with:
  - Hero image, stats (calories, time, ingredient count)
  - Full ingredient list with quantities
  - "Add to plan" day grid — tap a day to schedule, tap again to remove

### 🛒 Grocery List
- Auto-generated from every meal in your week plan
- Grouped by category: Produce, Protein, Dairy, Grains, Pantry, Spices
- Tap any row to check it off with an animated circle checkbox
- Inline editable quantity fields
- Progress bar banner tracks how many items are still needed
- Duplicate ingredients across meals are merged with a count badge

---

## 🛠️ Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5.7 |
| Package manager | pnpm |
| Fonts | Fraunces · DM Sans · DM Mono (Google Fonts) |
| Images | Unsplash |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`

### 1. Clone the repository

```bash
git clone https://github.com/shahddismail/meal-planner-app.git
cd meal-planner-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
pnpm build
```

Output goes to the `dist/` folder. Preview it with:

```bash
pnpm preview
```

---

## 📁 Project Structure

```
meal-planner-app/
├── index.html              # Vite HTML shell
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx            # React entry point
    ├── index.css           # Tailwind v4 import + Google Fonts
    └── App.tsx             # Full application (single component)
```

---

## 📸 Screenshots

| Week Planner | Meal Library | Grocery List |
|---|---|---|
| Day-by-day scheduling with drag & drop | Tappable meal cards with detail sheets | Auto-grouped shopping list with check-off |

---

## 🔧 Configuration

No `.env` file is required — the app uses only public Unsplash photo URLs and Google Fonts CDN imports. Everything works out of the box after `pnpm install`.

---

## 📄 License

MIT — free to use, modify, and distribute.
