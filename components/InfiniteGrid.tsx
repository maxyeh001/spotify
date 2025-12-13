"use client";

import { useEffect, useRef, useState } from "react";

type Props<T> = {
  fetchUrl: string; // /api/...
  renderItem: (item: T, allItems: T[]) => React.ReactNode;
};

export function InfiniteGrid<T>({ fetchUrl, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = async () => {
    if (loading || done) return;
    setLoading(true);

    const res = await fetch(`${fetchUrl}?offset=${offset}&limit=24`);
    const data = await res.json();

    const newItems: T[] = data.items ?? [];
    setItems((prev) => [...prev, ...newItems]);

    const nextOffset = data.nextOffset ?? offset + newItems.length;
    setOffset(nextOffset);

    if (!newItems.length) setDone(true);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, offset, loading, done]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {items.map((it, idx) => (
          <div key={idx}>{renderItem(it, items)}</div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {loading && <div className="text-neutral-400 text-sm mt-4">Loading…</div>}
      {done && <div className="text-neutral-500 text-sm mt-4">That’s everything.</div>}
    </>
  );
}
