import { Notation, OdontogramColors, Placement } from "./type";


export function mapToCssVars(colors: OdontogramColors) {
    const cssVars: Record<string, string> = {};

    if (colors.darkBlue) {
        cssVars["--dark-blue"] = colors.darkBlue;
    }
    if (colors.baseBlue) {
        cssVars["--base-blue"] = colors.baseBlue;
    }
    if (colors.lightBlue) {
        cssVars["--light-blue"] = colors.lightBlue;
    }

    return cssVars;
}


export function getToothNotations(fdi: string) {
    const num = fdi.replace("teeth-", "");
    const universal = convertFDIToNotation(fdi, "Universal");
    const palmer = convertFDIToNotation(fdi, "Palmer");

    return {
        fdi: num,
        universal,
        palmer,
    };
}

export const placements: Record<
    Placement,
    (toothBox: DOMRect, margin: number) => { x: number; y: number }
> = {
    top: (t, m) => ({ x: t.left + t.width / 2, y: t.top - m }),
    "top-start": (t, m) => ({ x: t.left, y: t.top - m }),
    "top-end": (t, m) => ({ x: t.right, y: t.top - m }),
    bottom: (t, m) => ({ x: t.left + t.width / 2, y: t.bottom + m }),
    "bottom-start": (t, m) => ({ x: t.left, y: t.bottom + m }),
    "bottom-end": (t, m) => ({ x: t.right, y: t.bottom + m }),
    left: (t, m) => ({ x: t.left - m, y: t.top + t.height / 2 }),
    "left-start": (t, m) => ({ x: t.left - m, y: t.top }),
    "left-end": (t, m) => ({ x: t.left - m, y: t.bottom }),
    right: (t, m) => ({ x: t.right + m, y: t.top + t.height / 2 }),
    "right-start": (t, m) => ({ x: t.right + m, y: t.top }),
    "right-end": (t, m) => ({ x: t.right + m, y: t.bottom }),
};


export const quadrants: Array<{
    name: "first" | "second" | "third" | "fourth";
    transform: string;
    label: string;
}> = [
        {
            name: "first",
            transform: "",
            label: "Upper Right",
        },
        {
            name: "second",
            transform: "scale(-1, 1) translate(-409, 0)",
            label: "Upper Left",
        },
        {
            name: "third",
            transform: "scale(1, -1) translate(0, -694)",
            label: "Lower Right",
        },
        {
            name: "fourth",
            transform: "scale(-1, -1) translate(-409, -694)",
            label: "Lower Left",
        },
    ];



export function convertFDIToNotation(fdi: string, notation: Notation) {
    const num = fdi.replace("teeth-", "");

    const fdiToUniversal: Record<string, number> = {
        "11": 8,
        "12": 7,
        "13": 6,
        "14": 5,
        "15": 4,
        "16": 3,
        "17": 2,
        "18": 1,
        "21": 9,
        "22": 10,
        "23": 11,
        "24": 12,
        "25": 13,
        "26": 14,
        "27": 15,
        "28": 16,
        "31": 24,
        "32": 23,
        "33": 22,
        "34": 21,
        "35": 20,
        "36": 19,
        "37": 18,
        "38": 17,
        "41": 25,
        "42": 26,
        "43": 27,
        "44": 28,
        "45": 29,
        "46": 30,
        "47": 31,
        "48": 32,
    };

    if (notation === "Universal") {
        return String(fdiToUniversal[num] ?? num);
    }

    if (notation === "Palmer") {
        if (num.length < 2) {
            return num;
        }

        const quadrant = num[0];
        const tooth = num[1];
        const symbols: Record<string, string> = {
            "1": "UR",
            "2": "UL",
            "3": "LL",
            "4": "LR",
        };

        return `${tooth}${symbols[quadrant] ?? ""}`;
    }

    return num;
}
