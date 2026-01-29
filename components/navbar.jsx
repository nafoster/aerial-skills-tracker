"use client";

import React from "react";

export default function Navbar({
  selectedApparatus,
  onSelectApparatus,
  isAdmin,
  onAdminChange,
}) {
  const tabs = ["Trapeze", "Hoop", "Silks", "Pole"];
  const [busy, setBusy] = React.useState(false);

async function unlock() {
  const password = window.prompt("Enter admin passcode to edit:");
  if (!password) return;

  setBusy(true);
  try {
    const res = await fetch("/api/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
  credentials: "include",
  body: JSON.stringify({ password }),
});

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Unlock failed (/api/auth):", res.status, text);
      alert("Unlock failed. Check console for details.");
      return;
    }

    // ✅ Verify cookie actually set (and avoid cached response)
const check = await fetch(`/api/admin?ts=${Date.now()}`, {
  cache: "no-store",
  credentials: "include",
});

    if (!check.ok) {
      const text = await check.text().catch(() => "");
      console.error("Admin check failed (/api/admin):", check.status, text);
      alert("Admin check failed. Check console for details.");
      return;
    }

    const json = await check.json();
    onAdminChange(Boolean(json?.isAdmin));
  } finally {
    setBusy(false);
  }
}


  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      onAdminChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-lg font-semibold sm:text-xl">Aerial Skills</div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectApparatus("")}
              className={[
                "rounded px-3 py-2 text-sm",
                selectedApparatus === ""
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
            >
              All
            </button>

            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectApparatus(tab)}
                className={[
                  "rounded px-3 py-2 text-sm",
                  selectedApparatus === tab
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </nav>

          {isAdmin ? (
            <button
              type="button"
              disabled={busy}
              onClick={logout}
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              title="You are in edit mode"
            >
              Editing ✓
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={unlock}
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              title="Unlock editing"
            >
              Unlock
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
