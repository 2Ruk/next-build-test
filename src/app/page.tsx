"use client";

import { useEffect, useState } from "react";
import { api, Board } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");

  const load = () => api.boards.list().then(setBoards);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    await api.boards.create(title.trim());
    setTitle("");
    load();
  };

  const remove = async (id: string) => {
    await api.boards.delete(id);
    load();
  };

  const colors = ["bg-accent-blue", "bg-accent-purple", "bg-accent-green", "bg-accent-orange", "bg-accent-pink"];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border-color px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center text-white font-bold text-sm">K</div>
          <h1 className="text-lg font-semibold text-text-primary">Kanban Board</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Create Board */}
        <div className="mb-8">
          <h2 className="text-text-secondary text-sm font-medium mb-3 uppercase tracking-wider">Create New Board</h2>
          <div className="flex gap-2">
            <input
              className="bg-bg-secondary border border-border-color rounded-lg px-4 py-2.5 flex-1 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-blue transition-colors"
              placeholder="Enter board name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <button
              onClick={create}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        {/* Board List */}
        <div>
          <h2 className="text-text-secondary text-sm font-medium mb-4 uppercase tracking-wider">Your Boards</h2>
          {boards.length === 0 ? (
            <div className="bg-bg-secondary border border-border-color rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-text-secondary text-sm">No boards yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((b, i) => (
                <div key={b.id} className="group bg-bg-secondary border border-border-color rounded-xl overflow-hidden hover:border-text-muted transition-all">
                  <div className={`h-1.5 ${colors[i % colors.length]}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/board/${b.id}`} className="text-text-primary font-medium hover:text-accent-blue transition-colors text-sm flex-1">
                        {b.title}
                      </Link>
                      <button
                        onClick={() => remove(b.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red text-xs transition-all p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <Link href={`/board/${b.id}`} className="text-text-muted text-xs mt-2 block hover:text-text-secondary transition-colors">
                      Open board →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
