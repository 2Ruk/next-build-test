export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  order: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns?: Column[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export const api = {
  boards: {
    list: () => fetcher<Board[]>("/boards"),
    get: (id: string) => fetcher<Board>(`/boards/${id}`),
    create: (title: string) => fetcher<Board>("/boards", { method: "POST", body: JSON.stringify({ title }) }),
    delete: (id: string) => fetcher<{ success: boolean }>(`/boards/${id}`, { method: "DELETE" }),
  },
  columns: {
    create: (boardId: string, title: string) =>
      fetcher<Column>(`/boards/${boardId}/columns`, { method: "POST", body: JSON.stringify({ title }) }),
    delete: (id: string) => fetcher<{ success: boolean }>(`/columns/${id}`, { method: "DELETE" }),
  },
  cards: {
    create: (columnId: string, title: string, description?: string) =>
      fetcher<Card>(`/columns/${columnId}/cards`, { method: "POST", body: JSON.stringify({ title, description }) }),
    update: (id: string, data: Partial<Pick<Card, "title" | "description">>) =>
      fetcher<Card>(`/cards/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetcher<{ success: boolean }>(`/cards/${id}`, { method: "DELETE" }),
    move: (id: string, columnId: string, order: number) =>
      fetcher<Card>(`/cards/${id}/move`, { method: "PATCH", body: JSON.stringify({ columnId, order }) }),
  },
};
