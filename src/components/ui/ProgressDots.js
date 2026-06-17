import { jsx as _jsx } from "react/jsx-runtime";
export function ProgressDots({ current }) {
    return (_jsx("div", { className: "dots", "aria-label": `Touchpoint ${current} of 3`, children: [1, 2, 3].map(i => {
            const cls = i === current ? 'dot active' : i < current ? 'dot done' : 'dot';
            return _jsx("span", { className: cls }, i);
        }) }));
}
