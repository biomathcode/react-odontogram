import { useMemo, useRef, useState } from "react";
import { Odontogram } from "../../../src/Odontogram";
import type {
	Notation,
	OdontogramProps,
	ToothConditionGroup,
	ToothDetail,
} from "../../../src/type";

type Layout = NonNullable<OdontogramProps["layout"]>;
type ShowHalf = NonNullable<OdontogramProps["showHalf"]>;

const conditionSets: Record<string, ToothConditionGroup[]> = {
	checkup: [
		{
			label: "caries",
			teeth: ["teeth-16", "teeth-26", "teeth-36"],
			fillColor: "#ef4444",
			outlineColor: "#991b1b",
		},
		{
			label: "filling",
			teeth: ["teeth-14", "teeth-24", "teeth-44"],
			fillColor: "#38bdf8",
			outlineColor: "#0369a1",
		},
		{
			label: "watch",
			teeth: ["teeth-11", "teeth-12", "teeth-31"],
			fillColor: "#fde047",
			outlineColor: "#a16207",
		},
	],
	periodontal: [
		{
			label: "mobility",
			teeth: ["teeth-17", "teeth-27", "teeth-37", "teeth-47"],
			fillColor: "#f9a8d4",
			outlineColor: "#be185d",
		},
		{
			label: "monitor",
			teeth: ["teeth-13", "teeth-23", "teeth-33", "teeth-43"],
			fillColor: "#a78bfa",
			outlineColor: "#6d28d9",
		},
	],
	surgery: [
		{
			label: "planned",
			teeth: ["teeth-18", "teeth-28", "teeth-38", "teeth-48"],
			fillColor: "#fb923c",
			outlineColor: "#c2410c",
		},
		{
			label: "reviewed",
			teeth: ["teeth-17", "teeth-27"],
			fillColor: "#86efac",
			outlineColor: "#15803d",
		},
	],
};

const notations: Notation[] = ["FDI", "Universal", "Palmer"];
const layoutModes: Layout[] = ["circle", "square"];
const halves: ShowHalf[] = ["full", "upper", "lower"];

const previewWidths = [
	{ label: "Phone", width: 220 },
	{ label: "Tablet", width: 360 },
	{ label: "Desktop", width: 620 },
];

const faqs = [
	{
		question: "Is this dental chart generator free?",
		answer:
			"Yes. This example is a free browser-based dental chart generator built with react-odontogram. You can create a chart and export SVG, PNG, or JSON files locally.",
	},
	{
		question: "Can I export the odontogram for records or reports?",
		answer:
			"Yes. Use Export SVG for editable vector output, Export PNG for presentations and documents, or Export JSON for the selected teeth and chart settings.",
	},
	{
		question: "Which tooth numbering systems are supported?",
		answer:
			"The generator supports FDI, Universal, and Palmer notation. The exported JSON includes notation details for selected teeth.",
	},
	{
		question: "Does the chart work on mobile screens?",
		answer:
			"Yes. The chart scales inside responsive containers and the page includes phone, tablet, and desktop previews to show how the odontogram adapts.",
	},
];

const getSlug = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "") || "dental-chart";

const downloadBlob = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
};

const serializeSvg = (svg: SVGSVGElement) => {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	clone.setAttribute("width", "1200");
	clone.setAttribute("height", "1200");

	const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
	style.textContent = `
		.Odontogram svg { color: #64748b; fill: none; }
		.Odontogram g.selected { color: #0f766e; }
		.Odontogram g.selected path:nth-of-type(2) { fill: #99f6e4; opacity: 1; }
	`;
	clone.insertBefore(style, clone.firstChild);

	return new XMLSerializer().serializeToString(clone);
};

export default function App() {
	const chartRef = useRef<HTMLDivElement>(null);
	const [layout, setLayout] = useState<Layout>("circle");
	const [notation, setNotation] = useState<Notation>("FDI");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [showHalf, setShowHalf] = useState<ShowHalf>("full");
	const [maxTeeth, setMaxTeeth] = useState(8);
	const [singleSelect, setSingleSelect] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [showLabels, setShowLabels] = useState(true);
	const [conditionKey, setConditionKey] = useState("checkup");
	const [chartTitle, setChartTitle] = useState("Free dental chart");
	const [chartNote, setChartNote] = useState("Initial exam");
	const [selectedTeeth, setSelectedTeeth] = useState<ToothDetail[]>([]);

	const activeConditions = conditionSets[conditionKey];

	const chartStyles = useMemo(
		() => ({
			maxWidth: layout === "square" ? "960px" : "520px",
		}),
		[layout],
	);

	const exportSvg = () => {
		const svg = chartRef.current?.querySelector("svg");
		if (!svg) {
			return;
		}

		downloadBlob(
			new Blob([serializeSvg(svg)], { type: "image/svg+xml;charset=utf-8" }),
			`${getSlug(chartTitle)}.svg`,
		);
	};

	const exportPng = () => {
		const svg = chartRef.current?.querySelector("svg");
		if (!svg) {
			return;
		}

		const svgText = serializeSvg(svg);
		const image = new Image();
		const svgUrl = URL.createObjectURL(
			new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
		);

		image.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 1600;
			canvas.height = 1600;
			const context = canvas.getContext("2d");
			if (!context) {
				URL.revokeObjectURL(svgUrl);
				return;
			}

			context.fillStyle = theme === "dark" ? "#10141b" : "#ffffff";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 120, 80, 1360, 1360);
			canvas.toBlob((blob) => {
				if (blob) {
					downloadBlob(blob, `${getSlug(chartTitle)}.png`);
				}
				URL.revokeObjectURL(svgUrl);
			}, "image/png");
		};

		image.src = svgUrl;
	};

	const exportJson = () => {
		const payload = {
			title: chartTitle,
			note: chartNote,
			generatedAt: new Date().toISOString(),
			settings: {
				conditionSet: conditionKey,
				layout,
				maxTeeth,
				notation,
				showHalf,
				showLabels,
				singleSelect,
				theme,
			},
			conditions: activeConditions,
			selectedTeeth,
		};

		downloadBlob(
			new Blob([JSON.stringify(payload, null, 2)], {
				type: "application/json;charset=utf-8",
			}),
			`${getSlug(chartTitle)}.json`,
		);
	};

	return (
		<main className={`app app-${theme}`}>
			<section className="workbench" aria-label="Free dental chart generator">
				<header className="topbar">
					<div>
						<p className="eyebrow">Free odontogram tool</p>
						<h1>Dental chart generator</h1>
						<p className="lede">
							Create a responsive odontogram, mark conditions, select teeth, and
							export the chart for notes, reports, or patient education.
						</p>
					</div>
					<div className="selection-meter" aria-live="polite">
						<span>{selectedTeeth.length}</span>
						Selected
					</div>
				</header>

				<div className="workspace-grid">
					<aside className="control-panel" aria-label="Dental chart controls">
						<div className="control-group">
							<label htmlFor="chart-title">Chart title</label>
							<input
								id="chart-title"
								onChange={(event) => setChartTitle(event.target.value)}
								type="text"
								value={chartTitle}
							/>
						</div>

						<div className="control-group">
							<label htmlFor="chart-note">Reference note</label>
							<input
								id="chart-note"
								onChange={(event) => setChartNote(event.target.value)}
								type="text"
								value={chartNote}
							/>
						</div>

						<div className="control-group">
							<label htmlFor="layout">Layout</label>
							<div className="segmented" id="layout">
								{layoutModes.map((mode) => (
									<button
										aria-pressed={layout === mode}
										key={mode}
										onClick={() => setLayout(mode)}
										type="button"
									>
										{mode}
									</button>
								))}
							</div>
						</div>

						<div className="control-group">
							<label htmlFor="notation">Notation</label>
							<select
								id="notation"
								onChange={(event) =>
									setNotation(event.target.value as Notation)
								}
								value={notation}
							>
								{notations.map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</select>
						</div>

						<div className="control-group">
							<label htmlFor="condition-set">Condition template</label>
							<select
								id="condition-set"
								onChange={(event) => setConditionKey(event.target.value)}
								value={conditionKey}
							>
								{Object.keys(conditionSets).map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</select>
						</div>

						<div className="control-group">
							<label htmlFor="show-half">Arch</label>
							<select
								id="show-half"
								onChange={(event) =>
									setShowHalf(event.target.value as ShowHalf)
								}
								value={showHalf}
							>
								{halves.map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</select>
						</div>

						<div className="control-group">
							<label htmlFor="max-teeth">Teeth per quadrant</label>
							<div className="range-row">
								<input
									id="max-teeth"
									max={8}
									min={1}
									onChange={(event) => setMaxTeeth(Number(event.target.value))}
									type="range"
									value={maxTeeth}
								/>
								<output htmlFor="max-teeth">{maxTeeth}</output>
							</div>
						</div>

						<div className="switch-list">
							<label>
								<input
									checked={theme === "dark"}
									onChange={(event) =>
										setTheme(event.target.checked ? "dark" : "light")
									}
									type="checkbox"
								/>
								Dark theme
							</label>
							<label>
								<input
									checked={singleSelect}
									onChange={(event) => setSingleSelect(event.target.checked)}
									type="checkbox"
								/>
								Single select
							</label>
							<label>
								<input
									checked={readOnly}
									onChange={(event) => setReadOnly(event.target.checked)}
									type="checkbox"
								/>
								Read only
							</label>
							<label>
								<input
									checked={showLabels}
									onChange={(event) => setShowLabels(event.target.checked)}
									type="checkbox"
								/>
								Condition labels
							</label>
						</div>
					</aside>

					<section className="chart-stage" aria-label="Generated dental chart">
						<div className="chart-document" ref={chartRef}>
							<div className="chart-document-header">
								<div>
									<strong>{chartTitle}</strong>
									<span>{chartNote}</span>
								</div>
								<small>{notation} notation</small>
							</div>
							<Odontogram
								colors={
									theme === "dark"
										? {
												baseBlue: "#dbeafe",
												darkBlue: "#93c5fd",
												lightBlue: "#1d4ed8",
											}
										: {
												baseBlue: "#64748b",
												darkBlue: "#0f766e",
												lightBlue: "#99f6e4",
											}
								}
								defaultSelected={["teeth-11", "teeth-21"]}
								layout={layout}
								maxTeeth={maxTeeth}
								notation={notation}
								onChange={setSelectedTeeth}
								readOnly={readOnly}
								showHalf={showHalf}
								showLabels={showLabels}
								showTooltip={true}
								singleSelect={singleSelect}
								styles={chartStyles}
								teethConditions={activeConditions}
								theme={theme}
								tooltip={{ placement: "right" }}
							/>
						</div>
					</section>

					<aside className="details-panel" aria-label="Export dental chart">
						<h2>Export chart</h2>
						<div className="export-actions">
							<button onClick={exportSvg} type="button">
								Export SVG
							</button>
							<button onClick={exportPng} type="button">
								Export PNG
							</button>
							<button onClick={exportJson} type="button">
								Export JSON
							</button>
						</div>

						<h2>Selected teeth</h2>
						<div className="selected-list">
							{selectedTeeth.length === 0 ? (
								<p>No teeth selected</p>
							) : (
								selectedTeeth.map((tooth) => (
									<div className="selected-item" key={tooth.id}>
										<strong>{tooth.notations.fdi}</strong>
										<span>{tooth.type}</span>
										<small>
											U {tooth.notations.universal} | P {tooth.notations.palmer}
										</small>
									</div>
								))
							)}
						</div>
					</aside>
				</div>
			</section>

			<section
				className="seo-panel"
				aria-label="About the free dental chart generator"
			>
				<div>
					<p className="eyebrow">Free dental chart generator</p>
					<h2>Create an odontogram online</h2>
				</div>
				<p>
					Use this free dental chart generator to build a visual odontogram in
					the browser. Choose FDI, Universal, or Palmer notation, switch between
					full mouth and arch-only views, add condition templates, and export
					the generated chart as SVG, PNG, or structured JSON.
				</p>
			</section>

			<section
				className="preview-band"
				aria-label="Responsive dental chart previews"
			>
				<div className="section-heading">
					<p className="eyebrow">Responsive odontogram</p>
					<h2>One dental chart, multiple screen sizes</h2>
				</div>
				<div className="preview-grid">
					{previewWidths.map((preview) => (
						<div className="preview-cell" key={preview.label}>
							<div className="preview-header">
								<strong>{preview.label}</strong>
								<span>{preview.width}px</span>
							</div>
							<div style={{ maxWidth: preview.width }}>
								<Odontogram
									defaultSelected={["teeth-14", "teeth-24"]}
									layout={preview.width < 300 ? "circle" : layout}
									maxTeeth={preview.width < 300 ? 5 : maxTeeth}
									readOnly={true}
									showLabels={preview.width > 300}
									showTooltip={false}
									styles={{ maxWidth: "100%" }}
									teethConditions={activeConditions}
									theme={theme}
								/>
							</div>
						</div>
					))}
				</div>
			</section>

			<section
				className="feature-grid"
				aria-label="Dental chart feature examples"
			>
				<div className="feature-panel">
					<h2>Upper arch dental chart</h2>
					<Odontogram
						defaultSelected={["teeth-11", "teeth-21"]}
						maxTeeth={8}
						readOnly={true}
						showHalf="upper"
						showLabels={false}
						showTooltip={false}
						styles={{ maxWidth: "420px" }}
						teethConditions={activeConditions}
						theme={theme}
					/>
				</div>
				<div className="feature-panel">
					<h2>Printable square odontogram</h2>
					<Odontogram
						layout="square"
						maxTeeth={8}
						readOnly={true}
						showLabels={true}
						showTooltip={false}
						styles={{ maxWidth: "100%" }}
						teethConditions={activeConditions}
						theme={theme}
					/>
				</div>
			</section>

			<section className="faq-section" aria-label="Dental chart generator FAQ">
				<div className="section-heading">
					<p className="eyebrow">FAQ</p>
					<h2>Dental chart generator questions</h2>
				</div>
				<div className="faq-list">
					{faqs.map((faq) => (
						<details key={faq.question}>
							<summary>{faq.question}</summary>
							<p>{faq.answer}</p>
						</details>
					))}
				</div>
			</section>

			<footer className="site-footer" aria-label="Project and social links">
				<a href="https://coolhead.in">Coolhead</a>
				<a href="https://github.com/biomathcode/react-odontogram">
					React Odontogram on GitHub
				</a>
				<a href="https://github.com/biomathcode">Biomathcode GitHub</a>
				<a href="https://linkedin.com/in/biomathcode">Biomathcode LinkedIn</a>
			</footer>
		</main>
	);
}
