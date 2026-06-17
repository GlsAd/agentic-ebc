import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CONCEPT_LABELS, COPY_CTA, COPY_DONE, RESTART_CTA } from '../content';
import { BrandFrame } from './ui/BrandFrame';
function buildShareText(c) {
    return [
        `THE AGENTIC EBC — ${c.concept_name}`,
        '',
        `${CONCEPT_LABELS.story}`,
        c.story,
        '',
        `${CONCEPT_LABELS.what_the_agent_handles}`,
        c.what_the_agent_handles,
        '',
        `${CONCEPT_LABELS.what_alex_becomes}`,
        c.what_alex_becomes,
        '',
        `${CONCEPT_LABELS.the_orchestration_moment}`,
        c.the_orchestration_moment
    ].join('\n');
}
export function ConceptCard({ concept, onRestart }) {
    const [copied, setCopied] = useState(false);
    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(buildShareText(concept));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        }
        catch {
            setCopied(false);
        }
    }
    return (_jsx(BrandFrame, { children: _jsxs(motion.div, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: 'easeOut' }, children: [_jsx("div", { className: "card", children: _jsxs("div", { className: "concept-hero", children: [_jsx("img", { className: "astro", src: "/brand/astro/astro-pose-2.png", alt: "" }), _jsxs("div", { children: [_jsx("div", { className: "concept-name-eyebrow", children: CONCEPT_LABELS.concept_name }), _jsx("div", { className: "concept-name", children: concept.concept_name })] })] }) }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "field-label", children: [_jsx("img", { src: "/brand/icons/sparkle.png", alt: "" }), CONCEPT_LABELS.story] }), _jsx("div", { className: "field-body story", children: concept.story })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "field-label", children: CONCEPT_LABELS.what_the_agent_handles }), _jsx("div", { className: "field-body", children: concept.what_the_agent_handles })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "field-label", children: CONCEPT_LABELS.what_alex_becomes }), _jsx("div", { className: "field-body", children: concept.what_alex_becomes })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "field-label", children: [_jsx("img", { src: "/brand/icons/agentforce-fuzzy.png", alt: "" }), CONCEPT_LABELS.the_orchestration_moment] }), _jsx("div", { className: "field-body", children: concept.the_orchestration_moment })] }), _jsxs("div", { className: "concept-actions", children: [_jsx("button", { className: "btn-primary", onClick: handleCopy, children: copied ? COPY_DONE : COPY_CTA }), _jsx("button", { className: "btn-link", onClick: onRestart, children: RESTART_CTA })] })] }) }));
}
