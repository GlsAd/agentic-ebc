import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { WELCOME } from '../content';
import { BrandFrame } from './ui/BrandFrame';
export function WelcomeScreen({ onBegin, loading }) {
    return (_jsx(BrandFrame, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: 'easeOut' }, children: [_jsx("div", { className: "eyebrow", children: WELCOME.eyebrow }), _jsx("h1", { className: "title", children: WELCOME.title }), _jsx("p", { className: "lead", children: WELCOME.subhead }), _jsx("div", { className: "astro-welcome", children: _jsx(motion.img, { src: "/brand/astro/astro-pose-1.png", alt: "", initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.15, duration: 0.55, ease: 'easeOut' } }) }), _jsx("p", { className: "body", children: WELCOME.body }), _jsx("button", { className: "btn-primary", onClick: onBegin, disabled: loading, children: loading ? 'Starting…' : WELCOME.cta })] }) }));
}
