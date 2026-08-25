"use client";

import { useState, type FormEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ProposalChange = { fieldId: string; label: string; page: string; currentValue: string; proposedValue: string; expectedValue: string };
type Proposal = { kind: "change" | "replace" | "undo"; summary: string; changes?: ProposalChange[]; revisionId?: string };

export function WebsiteAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [lastRequest, setLastRequest] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const ask = async (event?: FormEvent<HTMLFormElement>, requestedMessage?: string) => {
    event?.preventDefault();
    const message = (requestedMessage ?? draft).trim();
    if (!message || busy) return;
    setBusy(true); setStatus(""); setProposal(null); setDraft(""); setLastRequest(message);
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
    setProposal(null); setStatus(body.data?.message ?? "Change applied."); window.dispatchEvent(new Event("assistant-history-updated"));
  };

  return <section className="website-assistant" aria-labelledby="website-assistant-title">
    <div className="website-assistant__intro"><p className="eyebrow">Website Assistant</p><h2 id="website-assistant-title">Website Copy Assistant</h2><p>Ask to update wording that already exists on your website. The assistant prepares a preview first; nothing changes until you apply it.</p><p className="website-assistant__note">Colours and fonts are managed in the sections below.</p></div>
    <div className="website-assistant__workspace">
      <div className="website-assistant__messages" aria-live="polite">{messages.length ? messages.map((message, index) => <div className={`website-assistant__message is-${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "user" ? "You" : "Assistant"}</span><p>{message.content}</p></div>) : <p className="website-assistant__empty">Describe a wording change, such as “Make the About introduction shorter.”</p>}</div>
      <form className="website-assistant__form" onSubmit={ask}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What copy would you like to change?" maxLength={2000} rows={3} disabled={busy} /><button type="submit" disabled={busy || !draft.trim()}>{busy ? "Working…" : "Send"}</button></form>
      {proposal ? <div className="website-assistant__proposal"><p className="eyebrow">Preview change</p><h3>{proposal.summary}</h3>{proposal.changes?.map((change) => <div className="website-assistant__diff" key={change.fieldId}><span>{change.page} · {change.label}</span><del>{change.currentValue}</del><strong>{change.proposedValue}</strong></div>)}<div className="website-assistant__proposal-actions"><button type="button" onClick={() => void apply()} disabled={busy}>Apply</button><button type="button" onClick={() => void ask(undefined, lastRequest)} disabled={busy || !lastRequest}>Try again</button><button type="button" onClick={() => setProposal(null)} disabled={busy}>Cancel</button></div></div> : null}
      {status ? <p className="website-assistant__status" role="status">{status}</p> : null}
    </div>
  </section>;
}
