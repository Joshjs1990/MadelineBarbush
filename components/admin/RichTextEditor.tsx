"use client";

import { useEffect, useRef, useState } from "react";
import { richTextHtml } from "@/lib/content/rich-text";

type Command = "bold" | "italic" | "createLink" | "unlink" | "formatBlock" | "insertUnorderedList" | "insertOrderedList" | "undo" | "redo";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const lastInternalValue = useRef<string | null>(null);
  const [active, setActive] = useState({ bold: false, italic: false, unorderedList: false, orderedList: false });

  const rememberSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !selection.anchorNode || !editor.contains(selection.anchorNode)) return;
    selectionRef.current = selection.getRangeAt(0).cloneRange();
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    editor.focus();
    if (selectionRef.current && editor.contains(selectionRef.current.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  const run = (command: Command, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    rememberSelection();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const toolbarButton = (label: string, command: Command, value?: string, isActive = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      className={isActive ? "is-active" : ""}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => run(command, value)}
    >
      {label === "Bold" ? <strong>B</strong> : label === "Italic" ? <em>I</em> : label}
    </button>
  );

  useEffect(() => {
    if (lastInternalValue.current === value) {
      lastInternalValue.current = null;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== richTextHtml(value)) editorRef.current.innerHTML = richTextHtml(value);
  }, [value]);

  useEffect(() => {
    const update = () => rememberSelection();
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  return <div className="admin-rich-editor-wrap">
    <div className="admin-rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
      {toolbarButton("Heading 2", "formatBlock", "h2")}
      {toolbarButton("Heading 3", "formatBlock", "h3")}
      <span aria-hidden="true" />
      {toolbarButton("Bold", "bold", undefined, active.bold)}
      {toolbarButton("Italic", "italic", undefined, active.italic)}
      <span aria-hidden="true" />
      {toolbarButton("Bulleted list", "insertUnorderedList", undefined, active.unorderedList)}
      {toolbarButton("Numbered list", "insertOrderedList", undefined, active.orderedList)}
      <span aria-hidden="true" />
      <button type="button" title="Add link" aria-label="Add link" onMouseDown={(event) => event.preventDefault()} onClick={() => { const url = window.prompt("Link URL:")?.trim(); if (url && /^(https?:\/\/|mailto:)/i.test(url)) run("createLink", url); }}>Link</button>
      {toolbarButton("Remove link", "unlink")}
      <span className="admin-rich-editor-toolbar__spacer" aria-hidden="true" />
      {toolbarButton("Undo", "undo")}
      {toolbarButton("Redo", "redo")}
    </div>
    <div
      ref={editorRef}
      className="admin-rich-editor"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Editable text"
      aria-multiline="true"
      spellCheck
      onInput={(event) => { lastInternalValue.current = event.currentTarget.innerHTML; onChange(event.currentTarget.innerHTML); }}
      onMouseUp={rememberSelection}
      onKeyUp={rememberSelection}
      onFocus={rememberSelection}
    />
  </div>;
}
