import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BrandFrame({ children, rightSlot }) {
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "app-header", children: [_jsx("img", { className: "logo", src: "/brand/logo-horiz-white.svg", alt: "Salesforce" }), rightSlot] }), _jsx("main", { className: "app-main", children: children })] }));
}
