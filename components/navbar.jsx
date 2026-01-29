"use client";

import React from "react";

export default function Navbar({ selectedApparatus, onSelectApparatus }) {
  const tabs = ["Trapeze", "Hoop", "Silks", "Pole"];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-200 bg-pink-100">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-lg font-semibold sm:text-xl">Aerial Skills</div>

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
                  : "text-gray-700 hover:bg-pink-200",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
