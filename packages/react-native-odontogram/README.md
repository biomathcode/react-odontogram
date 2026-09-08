# react-native-odontogram

React Native dental chart for selecting teeth.

## Installation

```bash
npm install react-native-odontogram react-native-svg
```

## Usage

```tsx
import { NativeOdontogram } from "react-native-odontogram";

export default function App() {
	return (
		<NativeOdontogram
			height={420}
			onChange={(selectedTeeth) => {
				console.log(selectedTeeth);
			}}
			width="100%"
		/>
	);
}
```

The native package supports selection, single-select mode, notation conversion, color overrides, condition coloring, read-only charts, half-chart views, and both circle and square layouts.
