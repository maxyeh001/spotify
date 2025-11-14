"use client";

import { useState } from "react";

export default function ImportPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogs([]);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/import", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLogs(data.logs || []);
    setIsLoading(false);
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Bulk Import</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2">CSV File</label>
          <input name="csv" type="file" accept=".csv" required className="text-black" />
        </div>

        <div>
          <label className="block mb-2">Upload Audio Files (song files)</label>
          <input
            name="songs"
            type="file"
            accept="audio/mp3"
            multiple
            className="text-black"
          />
        </div>

        <div>
          <label className="block mb-2">Upload Images (cover art)</label>
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="text-black"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 px-4 py-2 rounded"
        >
          {isLoading ? "Importing..." : "Start Import"}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Logs</h2>
        <div className="bg-neutral-900 p-4 rounded max-h-[400px] overflow-y-auto whitespace-pre-wrap">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
