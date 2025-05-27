export const API_URL = import.meta.env.VITE_API_URL;
export const MEMORY_URL = import.meta.env.VITE_MEMORY_URL;

export async function saveMemory(data: any) {
  const res = await fetch(MEMORY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Save error ${res.status}`);
  return res.json();
}

export async function queryRag(question: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`RAG error ${res.status}`);
  return res.json();
}
