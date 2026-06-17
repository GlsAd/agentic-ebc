import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchConcept, fetchTouchpoint } from './lib/api';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TouchpointScreen } from './components/TouchpointScreen';
import { ConceptCard } from './components/ConceptCard';
import { LoadingScene } from './components/ui/LoadingScene';
import { BrandFrame } from './components/ui/BrandFrame';
import { CONCEPT_LOADING, ERROR_MESSAGE, RETRY_CTA } from './content';
const TP_INDEX = { tp1: 0, tp2: 1, tp3: 2 };
export default function App() {
    const [stage, setStage] = useState('welcome');
    const [transcript, setTranscript] = useState([]);
    const [currentScene, setCurrentScene] = useState('');
    const [concept, setConcept] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [retryHandler, setRetryHandler] = useState(null);
    function fail(handler) {
        setError(ERROR_MESSAGE);
        setRetryHandler(() => handler);
        setStage('error');
        setLoading(false);
    }
    async function loadTouchpoint(idx, nextTranscript) {
        setLoading(true);
        setError(null);
        try {
            const { scene } = await fetchTouchpoint(idx, nextTranscript);
            const updated = [...nextTranscript, { role: 'model', content: scene }];
            setTranscript(updated);
            setCurrentScene(scene);
            const stageKey = ['tp1', 'tp2', 'tp3'][idx];
            setStage(stageKey);
        }
        catch {
            fail(() => loadTouchpoint(idx, nextTranscript));
            return;
        }
        setLoading(false);
    }
    async function loadConcept(nextTranscript) {
        setStage('composing');
        setLoading(true);
        setError(null);
        try {
            const result = await fetchConcept(nextTranscript);
            setConcept(result);
            setStage('concept');
        }
        catch {
            fail(() => loadConcept(nextTranscript));
            return;
        }
        setLoading(false);
    }
    function handleBegin() {
        void loadTouchpoint(0, []);
    }
    function handleAnswer(answer) {
        if (stage !== 'tp1' && stage !== 'tp2' && stage !== 'tp3')
            return;
        const idx = TP_INDEX[stage];
        const next = [...transcript, { role: 'user', content: answer }];
        setTranscript(next);
        if (idx < 2) {
            void loadTouchpoint((idx + 1), next);
        }
        else {
            void loadConcept(next);
        }
    }
    function handleRestart() {
        setTranscript([]);
        setCurrentScene('');
        setConcept(null);
        setError(null);
        setStage('welcome');
    }
    return (_jsxs(AnimatePresence, { mode: "wait", children: [stage === 'welcome' && (_jsx(motion.div, { children: _jsx(WelcomeScreen, { onBegin: handleBegin, loading: loading }) }, "welcome")), (stage === 'tp1' || stage === 'tp2' || stage === 'tp3') && (_jsx(motion.div, { children: _jsx(TouchpointScreen, { index: TP_INDEX[stage], scene: currentScene, onSubmit: handleAnswer, submitting: loading }) }, stage)), stage === 'composing' && (_jsx(motion.div, { children: _jsx(BrandFrame, { children: _jsx(LoadingScene, { lines: [CONCEPT_LOADING] }) }) }, "composing")), stage === 'concept' && concept && (_jsx(motion.div, { children: _jsx(ConceptCard, { concept: concept, onRestart: handleRestart }) }, "concept")), stage === 'error' && (_jsx(motion.div, { children: _jsx(BrandFrame, { children: _jsxs("div", { className: "error-wrap", children: [_jsx("p", { className: "lead", children: error }), _jsx("button", { className: "btn-primary", onClick: () => {
                                    if (retryHandler)
                                        retryHandler();
                                }, children: RETRY_CTA }), _jsx("button", { className: "btn-link", onClick: handleRestart, children: "Start over" })] }) }) }, "error"))] }));
}
