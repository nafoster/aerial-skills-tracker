"use client";

import React from "react";
import Navbar from "../components/navbar";
import SkillTable from "../components/SkillTable";
import { skillColumns } from "../data/skillColumns";
import { initialRows as fallbackRows } from "../data/skills";

export default function Home() {
  const [selectedApparatus, setSelectedApparatus] = React.useState("");
  const [isAdmin, setIsAdmin] = React.useState(false);

  // check admin cookie on load
  React.useEffect(() => {
    fetch(`/api/admin?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setIsAdmin(Boolean(j?.isAdmin)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar
        selectedApparatus={selectedApparatus}
        onSelectApparatus={setSelectedApparatus}
        isAdmin={isAdmin}
        onAdminChange={setIsAdmin}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <SkillTable
          columnsConfig={skillColumns}
          initialRows={fallbackRows}
          selectedApparatus={selectedApparatus}
          readOnly={!isAdmin}
        />
      </main>
    </div>
  );
}
