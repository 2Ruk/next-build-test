"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Board, Card, Column } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

const COLUMN_COLORS: Record<string, string> = {
  "to do": "bg-accent-blue",
  "in progress": "bg-accent-orange",
  "done": "bg-accent-green",
  "review": "bg-accent-purple",
  "blocked": "bg-accent-red",
};

function getColumnAccent(title: string, index: number) {
  const fallback = ["bg-accent-blue", "bg-accent-purple", "bg-accent-green", "bg-accent-orange", "bg-accent-pink"];
  return COLUMN_COLORS[title.toLowerCase()] || fallback[index % fallback.length];
}

function CardItem({ card, onDelete, onUpdate }: { card: Card; onDelete: () => void; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const save = async () => {
    if (title.trim() && title !== card.title) await api.cards.update(card.id, { title: title.trim() });
    setEditing(false);
    onUpdate();
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("cardId", card.id);
        (e.target as HTMLElement).style.opacity = "0.5";
      }}
      onDragEnd={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
      className="bg-bg-primary border border-border-color rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-text-muted transition-all group"
    >
      {editing ? (
        <input
          autoFocus
          className="w-full text-sm text-text-primary bg-transparent border-b border-accent-blue outline-none pb-0.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
      ) : (
        <div className="flex justify-between items-start gap-2">
          <span className="text-sm text-text-primary cursor-pointer leading-snug" onClick={() => setEditing(true)}>
            {card.title}
          </span>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red text-xs transition-all shrink-0 mt-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function ColumnView({ col, index, onUpdate }: { col: Column; index: number; onUpdate: () => void }) {
  const [newCard, setNewCard] = useState("");
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const accent = getColumnAccent(col.title, index);

  const addCard = async () => {
    if (!newCard.trim()) return;
    await api.cards.create(col.id, newCard.trim());
    setNewCard("");
    setAdding(false);
    onUpdate();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;
    await api.cards.move(cardId, col.id, col.cards.length);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await api.columns.delete(id);
    onUpdate();
  };

  return (
    <div
      className={`bg-bg-secondary rounded-xl min-w-[280px] max-w-[280px] flex flex-col max-h-[calc(100vh-120px)] transition-all ${dragOver ? "ring-2 ring-accent-blue/50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          <h3 className="font-semibold text-sm text-text-primary flex-1">{col.title}</h3>
          <span className="text-xs text-text-muted bg-bg-primary px-1.5 py-0.5 rounded">{col.cards.length}</span>
          <button onClick={() => handleDelete(col.id)} className="text-text-muted hover:text-accent-red text-xs transition-colors">✕</button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-2">
        {col.cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={async () => { await api.cards.delete(card.id); onUpdate(); }}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {/* Add Card */}
      <div className="p-3 pt-1">
        {adding ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              className="w-full text-sm bg-bg-primary border border-border-color rounded-lg p-2.5 text-text-primary placeholder-text-muted resize-none outline-none focus:border-accent-blue transition-colors"
              rows={2}
              placeholder="Enter card title..."
              value={newCard}
              onChange={(e) => setNewCard(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addCard(); } }}
            />
            <div className="flex gap-2">
              <button onClick={addCard} className="bg-accent-blue hover:bg-accent-blue/80 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors">
                Add Card
              </button>
              <button onClick={() => { setAdding(false); setNewCard(""); }} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-left text-sm text-text-muted hover:text-text-secondary hover:bg-bg-hover rounded-lg px-2 py-1.5 transition-colors"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [colTitle, setColTitle] = useState("");
  const [addingCol, setAddingCol] = useState(false);

  const load = useCallback(() => { api.boards.get(id).then(setBoard); }, [id]);
  useEffect(() => { load(); }, [load]);

  const addColumn = async () => {
    if (!colTitle.trim()) return;
    await api.columns.create(id, colTitle.trim());
    setColTitle("");
    setAddingCol(false);
    load();
  };

  if (!board) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-border-color shrink-0">
        <button
          onClick={() => router.push("/")}
          className="text-text-muted hover:text-text-primary text-sm transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="w-px h-5 bg-border-color" />
        <h1 className="text-base font-semibold text-text-primary">{board.title}</h1>
        <span className="text-xs text-text-muted">{board.columns?.length || 0} columns</span>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-4 items-start h-full">
          {board.columns?.map((col, i) => (
            <ColumnView key={col.id} col={col} index={i} onUpdate={load} />
          ))}

          {/* Add Column */}
          <div className="min-w-[280px] max-w-[280px]">
            {addingCol ? (
              <div className="bg-bg-secondary rounded-xl p-3 space-y-2">
                <input
                  autoFocus
                  className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-blue transition-colors"
                  placeholder="Column title..."
                  value={colTitle}
                  onChange={(e) => setColTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addColumn()}
                />
                <div className="flex gap-2">
                  <button onClick={addColumn} className="bg-accent-blue hover:bg-accent-blue/80 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors">
                    Add Column
                  </button>
                  <button onClick={() => { setAddingCol(false); setColTitle(""); }} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCol(true)}
                className="w-full bg-bg-secondary/50 hover:bg-bg-secondary border border-dashed border-border-color hover:border-text-muted rounded-xl p-3 text-sm text-text-muted hover:text-text-secondary transition-all text-left"
              >
                + Add Column
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
