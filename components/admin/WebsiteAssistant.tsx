"use client";

import { useEffect, useState, type FormEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ProposalChange = { fieldId: string; label: string; page: string; currentValue: string; proposedValue: string; expectedValue: string };
type Proposal = { kind: "change" | "replace" | "undo"; summary: string; changes?: ProposalChange[]; revisionId?: string };
type Revision = { id: string; fieldId: string; action: string; previousValue: string; newValue: string; summary: string; createdAt: string };

const suggestions = ["Change my homepage heading", "Rewrite my About introduction to sound warmer", "What is my current accent colour?", "Show me what I changed recently"];

export function WebsiteAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [history, setHistory] = useState<Revision[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const loadHistory = async () => {
    const response = await fetch("/api/admin/assistant/history?limit=8");
    if (response.ok) { const body = await response.json() as { data?: Revision[] }; setHistory(body.data ?? []); }
  };
  useEffect(() => { const timer = window.setTimeout(() => void loadHistory(), 0); return () => window.clearTimeout(timer); }, []);

  const ask = async (event?: FormEvent<HTMLFormElement>, preset?: string) => {
    event?.preventDefault();
    const message = (preset ?? draft).trim();
    if (!message || busy) return;
    setBusy(true); setStatus(""); setProposal(null); setDraft("");
    const nextMessages = [...messages, { role: "user" as const, content: message }]; setMessages(nextMessages);
    const response = await fetch("/api/admin/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, conversation: messages.slice(-8) }) });
    const body = await response.json().catch(() => ({})) as { data?: { message: string; proposal?: Proposal }; error?: string };
    setBusy(false);
    if (!response.ok) { setStatus(body.error ?? "The assistant could not respond."); return; }
    setMessages([...nextMessages, { role: "assistant", content: body.data?.message ?? "I couldn't prepare a response." }]); setProposal(body.data?.proposal ?? null);
  };

  const apply = async () => {
    if (!proposal || busy) return;
    setBusy(true); setStatus("Saving change…");
    const response = await fetch("/api/admin/assistant/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(proposal.revisionId ? { revisionId: proposal.revisionId } : { changes: proposal.changes?.map((change) => ({ fieldId: change.fieldId, value: change.proposedValue, expectedValue: change.expectedValue, summary: proposal.summary, action: proposal.kind === "replace" ? "replace" : "update" })) }) });
    const body = await response.json().catch(() => ({})) as { data?: { message: string }; error?: string };
    setBusy(false);
    if (!response.ok) { setStatus(body.error ?? "That change could not be applied."); return; }
    setProposal(null); setStatus(body.data?.message ?? "Change applied."); await loadHistory();
  };

  const undo = async (revisionId: string) => {
    setBusy(true); setStatus("Undoing change…");
    const response = await fetch("/api/admin/assistant/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ revisionId }) });
    const body = await response.json().catch(() => ({})) as { data?: { message: string }; error?: string };
    setBusy(false); setStatus(response.ok ? (body.data?.message ?? "Change undone.") : (body.error ?? "That change could not be undone.")); if (response.ok) await loadHistory();
  };

  return <section className="website-assistant" aria-labelledby="website-assistant-title">
    <div className="website-assistant__intro"><p className="eyebrow">Website Assistant</p><h2 id="website-assistant-title">Make a small change.</h2><p>Ask in plain English. I’ll show you the exact change first, and nothing is published until you approve it.</p><div className="website-assistant__suggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(undefined, suggestion)} disabled={busy}>{suggestion}</button>)}</div></div>
    <div className="website-assistant__workspace">
      <div className="website-assistant__messages" aria-live="polite">{messages.length ? messages.map((message, index) => <div className={`website-assistant__message is-${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "user" ? "You" : "Assistant"}</span><p>{message.content}</p></div>) : <p className="website-assistant__empty">What would you like to change?</p>}</div>
      <form className="website-assistant__form" onSubmit={ask}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What would you like to change?" maxLength={2000} rows={3} disabled={busy} /><button type="submit" disabled={busy || !draft.trim()}>{busy ? "Working…" : "Ask assistant"}</button></form>
      {proposal ? <div className="website-assistant__proposal"><p className="eyebrow">Preview change</p><h3>{proposal.summary}</h3>{proposal.changes?.map((change) => <div className="website-assistant__diff" key={change.fieldId}><span>{change.page} · {change.label}</span><del>{change.currentValue}</del><strong>{change.proposedValue}</strong></div>)}<div className="website-assistant__proposal-actions"><button type="button" onClick={() => void apply()} disabled={busy}>Apply change</button><button type="button" onClick={() => setProposal(null)} disabled={busy}>Cancel</button></div></div> : null}
      {status ? <p className="website-assistant__status" role="status">{status}</p> : null}
    </div>
    <div className="website-assistant__history"><p className="eyebrow">Change history</p><h3>Recent changes</h3>{history.length ? history.map((item) => <article key={item.id}><div><strong>{item.summary}</strong><span>{new Date(item.createdAt).toLocaleString()}</span></div>{item.action !== "undo" ? <button type="button" onClick={() => void undo(item.id)} disabled={busy}>Undo</button> : <em>Undone</em>}</article>) : <p>No assistant changes yet.</p>}</div>
  </section>;
}
