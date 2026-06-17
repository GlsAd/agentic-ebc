import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TOUCHPOINTS, SUBMIT_CTA, LOADING_LINES } from '../content';
import { BrandFrame } from './ui/BrandFrame';
import { ProgressDots } from './ui/ProgressDots';
import { LoadingScene } from './ui/LoadingScene';
export function TouchpointScreen({ index, scene, onSubmit, submitting }) {
    const [answer, setAnswer] = useState('');
    const tp = TOUCHPOINTS[index];
    const canSubmit = answer.trim().length > 0 && !submitting;
    return (_jsx(BrandFrame, { rightSlot: _jsx(ProgressDots, { current: (index + 1) }), children: _jsx(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.32, ease: 'easeOut' }, children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "tp-header", children: [_jsx("img", { className: "tp-icon", src: tp.icon, alt: "" }), _jsx("div", { children: _jsx("div", { className: "tp-label", children: tp.label }) })] }), submitting ? (_jsx(LoadingScene, { lines: LOADING_LINES })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "scene", children: scene }), _jsx("textarea", { className: "answer", value: answer, onChange: e => setAnswer(e.target.value), placeholder: "Type what only Alex can do, now that the agent has it covered\u2026", "aria-label": "Your answer" }), _jsx("button", { className: "btn-primary", onClick: () => canSubmit && onSubmit(answer.trim()), disabled: !canSubmit, children: SUBMIT_CTA })] }))] }) }, index) }));
}
