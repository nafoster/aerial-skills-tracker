"use client";

import React from "react";
import Navbar from "../components/navbar";
import SkillTable from "../components/SkillTable";
import { initialRows } from "../data/skills";
import { skillColumns } from "../data/skillColumns";

export default function Home() {
  const [selectedApparatus, setSelectedApparatus] = React.useState("");

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar
        selectedApparatus={selectedApparatus}
        onSelectApparatus={setSelectedApparatus}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <SkillTable
          columnsConfig={skillColumns}
          initialRows={initialRows}
          selectedApparatus={selectedApparatus}
        />
      </main>
    </div>
  );
}
