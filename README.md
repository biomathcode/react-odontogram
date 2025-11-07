

# 🦷 `react-odontogram`



[![npm version](https://img.shields.io/npm/v/react-odontogram?color=blue\&label=npm)](https://www.npmjs.com/package/react-odontogram)
[![npm downloads](https://img.shields.io/npm/dm/react-odontogram?color=green\&label=downloads)](https://www.npmjs.com/package/react-odontogram)
[![Storybook](https://img.shields.io/badge/Storybook-Demo-orange)](https://biomathcode.github.io/react-odontogram)

A modern, interactive **React Odontogram** component for dental chart visualization and data collection.
Built with SVG and React hooks — fully customizable, accessible, and designed for clinical or academic applications.

---

## 🖼️ Preview

| Light Mode                                 | Dark Mode                                |
| ------------------------------------------ | ---------------------------------------- |
| ![Light preview](/assets/previewlight.png) | ![Dark preview](/assets/previewdark.png) |

---

## 🧩 Demo

👉 **Live Preview:** [https://biomathcode.github.io/react-odontogram](https://biomathcode.github.io/react-odontogram)

---

## 📦 Installation

```bash
# Using npm
npm install react-odontogram

# Using pnpm
pnpm add react-odontogram

# Using yarn
yarn add react-odontogram
```

> Make sure you have `react` and `react-dom` installed as peer dependencies.

---

## 🚀 Quick Start

```tsx
import { Odontogram } from "react-odontogram";

export default function App() {
  const handleChange = (selectedTeeth) => {
    console.log(selectedTeeth);
    /*
      Example output:
      [
        {
          "id": "teeth-21",
          "notations": {
            "fdi": "21",
            "universal": "9",
            "palmer": "1UL"
          },
          "type": "Central Incisor"
        },
        {
          "id": "teeth-12",
          "notations": {
            "fdi": "12",
            "universal": "7",
            "palmer": "2UR"
          },
          "type": "Lateral Incisor"
        }
      ]
    */
  };

  return <Odontogram onChange={handleChange} />;
}
```

---

## 🧠 onChange Return Type

The `onChange` callback returns an **array of selected teeth objects**:

```ts
type ToothSelection = {
  id: string;
  notations: {
    fdi: string;
    universal: string;
    palmer: string;
  };
  type: string;
};
```

Example JSON output:

```json
[
  {
    "id": "teeth-21",
    "notations": {
      "fdi": "21",
      "universal": "9",
      "palmer": "1UL"
    },
    "type": "Central Incisor"
  },
  {
    "id": "teeth-12",
    "notations": {
      "fdi": "12",
      "universal": "7",
      "palmer": "2UR"
    },
    "type": "Lateral Incisor"
  }
]
```

---

## ⚙️ Props

| Prop              | Type                                        | Default | Description                                             |
| ----------------- | ------------------------------------------- | ------- | ------------------------------------------------------- |
| `onChange`        | `(selectedTeeth: ToothSelection[]) => void` | —       | Triggered whenever the user selects or deselects teeth. |
| `initialSelected` | `string[]`                                  | `[]`    | Array of tooth IDs to preselect.                        |
| `readOnly`        | `boolean`                                   | `false` | Makes the odontogram non-interactive (view-only).       |
| `className`       | `string`                                    | —       | Optional class for custom styling.                      |

---

## 🦷 Tooth Data Model

Each tooth is internally defined in a structured format:

```ts
{
  id: "teeth-21",
  name: "21",
  type: "Central Incisor",
  notations: {
    fdi: "21",
    universal: "9",
    palmer: "1UL"
  },
  outlinePath: "...",
  shadowPath: "...",
  lineHighlightPath: "..."
}
```

This makes it easy to extend or customize if you fork the library.

---

## 🧪 Development

Run locally:

```bash
git clone https://github.com/biomathcode/react-odontogram.git
cd react-odontogram
pnpm install
pnpm dev
```

To preview Storybook:

```bash
pnpm storybook
```

---

## 🪶 License

MIT © [biomathcode](https://github.com/biomathcode)

---

## 💬 Feedback

If this library helps your dental project, please ⭐ the repo or open issues/PRs for enhancements!


