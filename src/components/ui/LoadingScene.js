import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function LoadingScene({ lines }) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (lines.length <= 1)
            return;
        const id = window.setInterval(() => setIdx(i => (i + 1) % lines.length), 2400);
        return () => window.clearInterval(id);
    }, [lines.length]);
    return (_jsxs("div", { className: "loading-wrap", role: "status", "aria-live": "polite", children: [_jsx("img", { className: "loading-icon", src: "/brand/icons/sparkle.png", alt: "" }), _jsx("div", { className: "loading-text", children: lines[idx] })] }));
}
