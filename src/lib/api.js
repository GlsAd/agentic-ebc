async function postChat(body) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({ error: 'Bad response' }));
    if (!res.ok) {
        const msg = (data && typeof data === 'object' && 'error' in data)
            ? String(data.error)
            : `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}
export async function fetchTouchpoint(touchpointIndex, transcript) {
    const data = await postChat({ mode: 'touchpoint', touchpointIndex, transcript });
    return data;
}
export async function fetchConcept(transcript) {
    const data = await postChat({ mode: 'concept', transcript });
    return data;
}
