import { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-webpack5";
import Odontogram, { getToothNotations } from "..";
import type { ToothDetail } from "../type";
import { teethPaths } from "../data";

export default {
    title: "Components/Baby Teeth ",
    component: Odontogram,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "light",
            values: [
                { name: "light", value: "#f5f5f5" },
                { name: "dark", value: "#0b0d1a" },
            ],
        },
    },
    argTypes: {
        name: {
            control: "text",
        },
        theme: {
            control: "radio",
            options: ["light", "dark"],
        },
        notation: {
            control: "radio",
            options: ["FDI", "Universal", "Palmer"],
        },
        colors: {
            control: "object",
        },
        onChange: { action: "changed" },
        maxTeeth: {
            control: 'number',
            options: [8, 4]
        }
    },
} as Meta<typeof Odontogram>;

const Template: StoryFn<typeof Odontogram> = (args) => {
    const [selected, setSelected] = useState<ToothDetail[]>(
        args.defaultSelected?.map((id) => ({
            id,
            notations: getToothNotations(id),
            type:
                teethPaths.find((t) => t.name === id.replace("teeth-", "").slice(1))
                    ?.type ??
                "Unknown",
        })) ?? []
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Form submitted:\n" + JSON.stringify({ teeth: selected }, null, 2));
    };

    return (
        <form
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
            onSubmit={handleSubmit}
        >
            <Odontogram {...args} onChange={setSelected} />

            <button
                type="submit"
                style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                }}
            >
                Submit Form
            </button>

            <pre
                style={{
                    marginTop: 20,
                    padding: 10,
                    background: "#eaeaea",
                    borderRadius: 6,
                    fontSize: 14,
                }}
            >
                {JSON.stringify({ teeth: selected }, null, 2)}
            </pre>
        </form>
    );
};

export const Form = Template.bind({});
Form.args = {
    theme: "light",
    colors: {},
    defaultSelected: ["teeth-11", "teeth-12", "teeth-22"],
    maxTeeth: 5
};

const PureUncontrolledFormTemplate: StoryFn<typeof Odontogram> = (args) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const teethJson = formData.get("teeth") as string;

        alert("Form submitted:\n" + teethJson);
    };

    return (
        <form
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
            onSubmit={handleSubmit}
        >
            <Odontogram {...args} />

            <button
                type="submit"
                style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                }}
            >
                Submit Form
            </button>

            <pre
                style={{
                    marginTop: 20,
                    padding: 10,
                    background: "#eaeaea",
                    borderRadius: 6,
                    fontSize: 14,
                }}
            >
                {`FormData.teeth = (filled after submitting)`}
            </pre>
        </form>
    );
};

export const PureUncontrolledForm = PureUncontrolledFormTemplate.bind({});
PureUncontrolledForm.args = {
    name: "teeth",
    theme: "light",
    colors: {},
    defaultSelected: ["teeth-11", "teeth-12"],
    maxTeeth: 5
};
