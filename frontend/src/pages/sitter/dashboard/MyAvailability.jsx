import React, { useEffect, useState } from "react";

const MyAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    start_ts: "",
    end_ts: "",
    status: "open",
  });

  // TODO: replace with your real API base + auth token logic
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  const token = localStorage.getItem("access"); // if you store JWT here

  const fetchMySlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/availability/?mine=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSlots(data);
    } catch (e) {
      console.error("Failed to load availability:", e);
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/availability/slots/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Create failed");
      setForm({ start_ts: "", end_ts: "", status: "open" });
      fetchMySlots();
    } catch (e) {
      console.error(e);
      alert("Could not create slot. Are you logged in as a sitter?");
    }
  };

  useEffect(() => {
    fetchMySlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4 text-primary">Your Availability</h2>

      <form onSubmit={createSlot} className="grid gap-4 md:grid-cols-4 mb-8">
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={form.start_ts}
          onChange={(e) => setForm({ ...form, start_ts: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={form.end_ts}
          onChange={(e) => setForm({ ...form, end_ts: e.target.value })}
          required
        />
        <select
          className="border rounded px-3 py-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="open">Open</option>
          <option value="booked">Booked</option>
          <option value="blocked">Blocked</option>
        </select>
        <button
          type="submit"
          className="rounded-2xl px-6 py-2 border-2 border-primary text-white bg-primary font-semibold"
        >
          Add Slot
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : slots.length === 0 ? (
        <p className="text-gray-600">No availability yet. Add your first slot above.</p>
      ) : (
        <ul className="space-y-3">
          {slots.map((s) => (
            <li key={s.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {new Date(s.start_ts).toLocaleString()} → {new Date(s.end_ts).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Status: {s.status}</div>
              </div>
              {/* TODO: add edit/delete buttons */}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MyAvailability;
