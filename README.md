

# 🦷 `react-odontogram`



[![npm version](https://img.shields.io/npm/v/react-odontogram?color=blue\&label=npm)](https://www.npmjs.com/package/react-odontogram)
[![npm downloads](https://img.shields.io/npm/dm/react-odontogram?color=green\&label=downloads)](https://www.npmjs.com/package/react-odontogram)
[![Storybook](https://img.shields.io/badge/Storybook-Demo-orange)](https://biomathcode.github.io/react-odontogram)
[![codecov](https://codecov.io/gh/biomathcode/react-odontogram/branch/main/graph/badge.svg?token=)](https://codecov.io/gh/biomathcode/react-odontogram)

A modern, interactive **React Odontogram** component for dental chart visualization and data collection.
Built with SVG and React hooks — fully customizable, accessible, and designed for clinical or academic applications.

---

## 🖼️ Preview

| Light Mode                                                                                                   | Dark Mode                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| ![Light preview](https://github.com/biomathcode/react-odontogram/blob/main/assets/previewlight.png) | ![Dark preview](https://github.com/biomathcode/react-odontogram/blob/main/assets/previewdark.png) |

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
import "react-odontogram/style.css";

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
type ToothDetail = {
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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultSelected` | `string[]` | `[]` | Tooth IDs selected on first render. |
| `singleSelect` | `boolean` | `false` | Allow selecting only one tooth at a time (clicking the selected tooth clears it). |
| `onChange` | `(selectedTeeth: ToothDetail[]) => void` | — | Called whenever selection changes. |
| `name` | `string` | `"teeth"` | Name used for hidden form input. |
| `className` | `string` | `""` | Additional class for wrapper customization. |
| `theme` | `"light" \| "dark"` | `"light"` | Applies built-in light/dark palette. |
| `colors` | `{ darkBlue?: string; baseBlue?: string; lightBlue?: string }` | `{}` | Override palette colors. |
| `notation` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Display notation in native tooth titles/tooltips. |
| `tooltip` | `{ placement?: Placement; margin?: number; content?: ReactNode \| ((payload?: ToothDetail) => ReactNode) }` | `{ placement: "top", margin: 10 }` | Tooltip behavior and custom content renderer. |
| `showTooltip` | `boolean` | `true` | Enables/disables tooltip rendering. |
| `showHalf` | `"full" \| "upper" \| "lower"` | `"full"` | Render full chart or only upper/lower arches. |
| `maxTeeth` | `number` | `8` | Number of teeth per quadrant (for baby/mixed dentition views). |
| `teethConditions` | `ToothConditionGroup[]` | `undefined` | Colorize specific teeth by condition. |
| `readOnly` | `boolean` | `false` | Disable interactions and selection changes. |
| `showLabels` | `boolean` | `false` | Show the condition legend under the chart. |
| `layout` | `"circle" \| "square"` | `"circle"` | Render classic arch layout or square/row layout. |
| `styles` | `React.CSSProperties` | `undefined` | Inline styles applied to the root container. |

`Placement` values:

```ts
type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";
```

`teethConditions` shape:

```ts
type ToothConditionGroup = {
  label: string;
  teeth: string[]; // e.g. ["teeth-11", "teeth-12"]
  outlineColor: string;
  fillColor: string;
};
```

---

## 🧩 Common Recipes

### 1) Render a custom tooltip

```tsx
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";

export default function CustomTooltipExample() {
  return (
    <Odontogram
      tooltip={{
        placement: "top",
        content: (payload) => (
          <div style={{ minWidth: 140 }}>
            <strong>Tooth {payload?.notations.fdi}</strong>
            <div>{payload?.type}</div>
            <small>Universal: {payload?.notations.universal}</small>
          </div>
        ),
      }}
    />
  );
}
```

### 2) Change theme and colors

```tsx
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";

export default function ThemeExample() {
  return (
    <Odontogram
      className="my-odontogram"
      theme="dark"
      colors={{
        darkBlue: "#7c9cff",
        baseBlue: "#c7d2fe",
        lightBlue: "#4f46e5",
      }}
    />
  );
}
```

```css
.my-odontogram {
  --odontogram-tooltip-bg: #0f172a;
  --odontogram-tooltip-fg: #f8fafc;
}
```

### 3) Show `teethConditions` (with legend)

```tsx
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";

const conditions = [
  {
    label: "caries",
    teeth: ["teeth-16", "teeth-26", "teeth-36"],
    fillColor: "#ef4444",
    outlineColor: "#b91c1c",
  },
  {
    label: "filling",
    teeth: ["teeth-14", "teeth-24"],
    fillColor: "#60a5fa",
    outlineColor: "#1d4ed8",
  },
];

export default function ConditionsExample() {
  return <Odontogram teethConditions={conditions} showLabels readOnly />;
}
```

### 4) Adjust tooltip position

```tsx
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";

export default function TooltipPositionExample() {
  return (
    <Odontogram
      tooltip={{
        placement: "right-start", // try: top, right, bottom-end, left-start...
        margin: 18, // larger = farther from tooth, smaller = closer
      }}
    />
  );
}
```

---

## 🦷 Tooth Data Model

Each tooth is internally defined in a structured format:

```ts
{
  name: "1",
  type: "Central Incisor",
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
