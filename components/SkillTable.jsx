"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

const STORAGE_KEY = "skills-table-v1";

/**
 * Enforces numeric bounds. Returns:
 * - "" if user clears the field
 * - a clamped integer between min and max otherwise
 */
function clampInt(value, min, max) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  const rounded = Math.round(n);
  return Math.min(max, Math.max(min, rounded));
}

function getWidthClass(columnId) {
  switch (columnId) {
    case "apparatus":
      return "min-w-[120px]";
    case "skill":
      return "min-w-[220px]";
    case "level":
      return "min-w-[150px]";
    case "focus":
      return "min-w-[190px]";
    case "confidence":
      return "min-w-[140px]";
    case "difficulty":
      return "min-w-[140px]";
    case "status":
      return "min-w-[160px]";
    case "notes":
      return "min-w-[280px]";
    default:
      return "min-w-[140px]";
  }
}

function ColumnFilterInline({ column }) {
  const value = column.getFilterValue() ?? "";
  return (
    <input
      className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-[11px] sm:text-xs"
      placeholder="Filter…"
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value)}
    />
  );
}

function MobileFilterDrawer({ open, onClose, table }) {
  const leafCols = table.getAllLeafColumns();

  function clearAll() {
    table.resetColumnFilters();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] sm:hidden">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close filters"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-sm font-semibold">Filters</div>
          <button
            className="rounded border border-gray-300 px-2 py-1 text-xs"
            onClick={onClose}
          >
            Done
          </button>
        </div>

        <div className="space-y-4 overflow-auto px-4 py-4">
          {leafCols.map((col) => {
            const value = col.getFilterValue() ?? "";
            const label =
              typeof col.columnDef.header === "string"
                ? col.columnDef.header
                : col.id;

            return (
              <div key={col.id}>
                <label className="block text-xs font-semibold text-gray-700">
                  {label}
                </label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Type to filter…"
                  value={value}
                  onChange={(e) => col.setFilterValue(e.target.value)}
                />
              </div>
            );
          })}

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              onClick={clearAll}
            >
              Clear all
            </button>
            <button
              className="flex-1 rounded bg-black px-3 py-2 text-sm text-white"
              onClick={onClose}
            >
              Apply
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Tip: Filters match text inside each column.
          </p>
        </div>
      </div>
    </div>
  );
}

function CellEditor({ value, onChange, columnType, options, min, max }) {
  const base =
    "w-full rounded-lg border border-pink-200 bg-white px-2 py-1 text-xs sm:text-sm text-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400";

  if (columnType === "select") {
    return (
      <select
        className={base}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (columnType === "number") {
    return (
      <input
        className={base}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value ?? ""}
        onChange={(e) => {
          const next = clampInt(e.target.value, min ?? 1, max ?? 5);
          onChange(next);
        }}
      />
    );
  }

  return (
    <input
      className={base}
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function SkillTable({
  columnsConfig,
  initialRows,
  selectedApparatus = "",
  readOnly = true,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState("idle"); // idle | saving | saved | error
const savedTimerRef = React.useRef(null);

  const effectiveColumnsConfig = React.useMemo(() => {
    if (Array.isArray(columnsConfig) && columnsConfig.length) return columnsConfig;

    return [
      {
        key: "apparatus",
        header: "Apparatus",
        type: "select",
        options: ["Hoop", "Trapeze", "Silks", "Pole"],
      },
      { key: "skill", header: "Skill", type: "text" },
      {
        key: "level",
        header: "Level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
      },
      {
        key: "focus",
        header: "Focus",
        type: "select",
        options: [
          "Technique",
          "Core",
          "Core/Balance",
          "Balance",
          "Strength",
          "Flexibility/Lines",
          "Legs/Strength",
          "Roll",
          "Balance/Hips",
          "Drop",
        ],
      },
      { key: "confidence", header: "Confidence (1–5)", type: "number", min: 1, max: 5 },
      { key: "difficulty", header: "Difficulty (1–5)", type: "number", min: 1, max: 5 },
      {
        key: "status",
        header: "Status",
        type: "select",
        options: ["Not Started", "Learning", "Can Perform", "Mastered"],
      },
      { key: "notes", header: "Notes / Progress", type: "text" },
    ];
  }, [columnsConfig]);

  // Load saved table data from localStorage (client-side), else fall back to initialRows
  const [data, setData] = React.useState(() => {
    if (typeof window === "undefined") return initialRows ?? [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
      return initialRows ?? [];
    } catch {
      return initialRows ?? [];
    }
  });

  // Load saved table data from Supabase (public read)
  React.useEffect(() => {
    fetch(`/api/skills?ts=${Date.now()}`, { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((rows) => {
  // Only replace local state if Supabase actually has rows
  if (Array.isArray(rows) && rows.length > 0) {
    setData(rows);
  }
})
      .catch(() => {
        // fall back silently to localStorage/initialRows
      });
  }, []);

  const [columnFilters, setColumnFilters] = React.useState([]);
  

  // Persist to localStorage whenever data changes
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }, [data]);

// Save edits to Supabase (admin-only write). Debounced to avoid saving on every keystroke.
React.useEffect(() => {
  if (readOnly) return;

  setSaveStatus("saving");

  const id = setTimeout(async () => {
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      setSaveStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (e) {
      console.error("Save failed:", e);
      setSaveStatus("error");
    }
  }, 500);

  return () => clearTimeout(id);
}, [data, readOnly]);


  // Build TanStack columns from config
  const columns = React.useMemo(() => {
    return effectiveColumnsConfig.map((col) => {
      return {
        accessorKey: col.key,
        header: () => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold sm:text-sm">{col.header}</span>
          </div>
        ),
        cell: ({ getValue, row }) => {
          const rowIndex = row.index;
          const currentValue = getValue();

          // Viewers see plain text only
          if (readOnly) {
            return (
              <div className="text-xs sm:text-sm text-gray-800">
                {String(currentValue ?? "")}
              </div>
            );
          }

          // Admin can edit
          return (
            <CellEditor
              value={currentValue}
              columnType={col.type}
              options={col.options}
              min={col.min}
              max={col.max}
              onChange={(newValue) => {
                setData((prev) => {
                  const copy = [...prev];
                  copy[rowIndex] = { ...copy[rowIndex], [col.key]: newValue };
                  return copy;
                });
              }}
            />
          );
        },
        enableColumnFilter: true,
        filterFn: "includesString",
      };
    });
  }, [effectiveColumnsConfig, readOnly]);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Navbar apparatus filter
  React.useEffect(() => {
    const apparatusCol = table.getColumn("apparatus");
    if (!apparatusCol) return;
    apparatusCol.setFilterValue(selectedApparatus || "");
  }, [selectedApparatus, table]);

  function addRow() {
    const blank = {};
    for (const col of effectiveColumnsConfig) {
      blank[col.key] = col.type === "number" ? "" : "";
    }
    setData((prev) => [...prev, blank]);
  }

  function deleteRow(rowIndex) {
    setData((prev) => prev.filter((_, i) => i !== rowIndex));
  }

  function resetTable() {
    setData(initialRows ?? []);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full">
      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        table={table}
      />

      {/* Toolbar */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={readOnly}
            className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={addRow}
          >
            + Add row
          </button>

                    {/*<button
            disabled={readOnly}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={resetTable}
          >
            Reset
          </button>*/}


          <button
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 sm:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
          </button>

          {!readOnly && (
  <span
    className={[
      "rounded border px-2 py-1 text-xs",
      saveStatus === "saving"
        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
        : saveStatus === "saved"
        ? "bg-green-50 text-green-800 border-green-200"
        : saveStatus === "error"
        ? "bg-red-50 text-red-800 border-red-200"
        : "bg-gray-50 text-gray-700 border-gray-200",
    ].join(" ")}
  >
    {saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
      ? "Saved"
      : saveStatus === "error"
      ? "Save failed"
      : "—"}
  </span>
)}

        </div>

        {/*<div className="text-xs text-gray-600 sm:text-sm">
          Edits save automatically to this browser (localStorage) and persist after refresh.
        </div>*/}
      </div>

      {/* Table wrapper */}
      <div className="rounded border border-gray-200">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-max w-full border-collapse">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => {
                    const colId = header.column.id;
                    const isFirstCol = colId === "apparatus";

                    return (
                      <th
                        key={header.id}
                        className={[
                          "sticky top-0 z-20 bg-gray-50 align-top",
                          "px-2 py-2 sm:px-3 sm:py-3",
                          "text-left",
                          getWidthClass(colId),
                          isFirstCol ? "sticky left-0 z-30 border-r border-gray-200" : "",
                        ].join(" ")}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}

                        <div className="hidden sm:block">
                          {header.column.getCanFilter() ? (
                            <ColumnFilterInline column={header.column} />
                          ) : null}
                        </div>
                      </th>
                    );
                  })}

                  <th className="sticky top-0 z-20 bg-gray-50 px-2 py-2 text-left text-xs font-semibold sm:px-3 sm:py-3 sm:text-sm min-w-[90px]">
                    Actions
                  </th>
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => {
                const isEven = rowIndex % 2 === 0;
                const rowBg = isEven ? "bg-white" : "bg-gray-50";

                return (
                  <tr key={row.id} className={`border-b border-gray-100 ${rowBg}`}>
                    {row.getVisibleCells().map((cell) => {
                      const colId = cell.column.id;
                      const isFirstCol = colId === "apparatus";

                      return (
                        <td
                          key={cell.id}
                          className={[
                            "px-2 py-2 align-top sm:px-3",
                            isFirstCol
                              ? `sticky left-0 z-10 ${rowBg} border-r border-gray-200`
                              : rowBg,
                          ].join(" ")}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}

                    <td className={`px-2 py-2 sm:px-3 ${rowBg}`}>
                                            <button
                        disabled={readOnly}
                        className="rounded border border-gray-300 px-2 py-1 text-[11px] sm:text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => deleteRow(row.index)}
                      >
                        Delete
                      </button>

                    </td>
                  </tr>
                );
              })}

              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-sm text-gray-500"
                    colSpan={effectiveColumnsConfig.length + 1}
                  >
                    No rows match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 sm:hidden">
          Tap <span className="font-semibold">Filters</span> to filter columns on mobile.
        </div>
      </div>
    </div>
  );
}
