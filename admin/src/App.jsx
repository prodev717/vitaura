import React, { useState, useEffect } from "react";
import {
  HiOutlineOfficeBuilding,
  HiOutlineLightBulb,
  HiOutlineTrash,
  HiOutlineDocumentDuplicate,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { MdWaterDrop } from "react-icons/md";

// Department data
const DEPARTMENTS = [
  {
    key: "potholes",
    label: "Public Works (PWD)",
    icon: <HiOutlineOfficeBuilding className="h-5 w-5" />,
  },
  {
    key: "DamagedElectricalPoles",
    label: "Electricity Board",
    icon: <HiOutlineLightBulb className="h-5 w-5" />,
  },
  {
    key: "garbage",
    label: "Sanitation",
    icon: <HiOutlineTrash className="h-5 w-5" />,
  },
  {
    key: "WaterLogging",
    label: "Drainage Dept.",
    icon: <MdWaterDrop className="h-5 w-5" />,
  },
  {
    key: "FallenTrees",
    label: "Horticulture",
    icon: <HiOutlineDocumentDuplicate className="h-5 w-5" />,
  },
];
const ADMIN_BODY = {
  key: "admin",
  label: "Administrative Body",
  icon: <HiOutlineUserGroup className="h-5 w-5" />,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// 4 status types, civic color cues
const STATUS_MAP = {
  pending: {
    text: "Pending",
    style: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  resolved: {
    text: "Resolved",
    style: "bg-green-100 text-green-800 border border-green-300",
  },
  "in progress": {
    text: "In Progress",
    style: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  rejected: {
    text: "Rejected",
    style: "bg-red-100 text-red-800 border border-red-300",
  },
};

function StatusChip({ status }) {
  const st = status ? status.toLowerCase() : "pending";
  const { text, style } = STATUS_MAP[st] || STATUS_MAP.pending;
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style}`}>
      {text}
    </span>
  );
}

function PriorityChip({ level }) {
  let color =
    level >= 8
      ? "text-red-700 bg-red-50 border border-red-200"
      : level >= 5
      ? "text-yellow-700 bg-yellow-50 border border-yellow-200"
      : "text-green-700 bg-green-50 border border-green-200";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${color}`}>
      {level}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="px-4 py-1 border rounded text-center mx-1 bg-white/95">
      <span className="block font-bold text-lg">{value}</span>
      <span className="block text-xs text-gray-500">{label}</span>
    </div>
  );
}

// Fetch issues (adapt to your backend as needed!)
async function fetchIssues() {
  const res = await fetch("/api/issues");
  if (!res.ok) return { issues: [] };
  return res.json();
}

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState(DEPARTMENTS[0].key);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues().then((data) => {
      setIssues(data.issues || []);
      setLoading(false);
    });
  }, []);

  function filteredIssues() {
    if (selectedTab === ADMIN_BODY.key) {
      return issues.filter(
        (i) =>
          !DEPARTMENTS.some((d) =>
            i.final_department
              ?.replace(/\s/g, "")
              .toLowerCase()
              .includes(d.key.toLowerCase())
          )
      );
    }
    return issues.filter(
      (i) =>
        i.final_department &&
        i.final_department
          .replace(/\s/g, "")
          .toLowerCase()
          .includes(selectedTab.toLowerCase())
    );
  }

  const stats = {
    total: filteredIssues().length,
    pending: filteredIssues().filter((i) => (i.status || "pending").toLowerCase() === "pending").length,
    resolved: filteredIssues().filter((i) => (i.status || "").toLowerCase() === "resolved").length,
    rejected: filteredIssues().filter((i) => (i.status || "").toLowerCase() === "rejected").length,
    progress: filteredIssues().filter((i) => (i.status || "").toLowerCase() === "in progress").length,
    high: filteredIssues().filter((i) => i.priority_level >= 8).length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 border-r bg-white p-5 flex flex-col">
        <div className="mb-9">
          <span className="font-bold text-lg text-blue-800 tracking-tight">
            Civic Issue Admin
          </span>
        </div>
        <div className="flex-1">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.key}
              onClick={() => setSelectedTab(dept.key)}
              className={classNames(
                "flex items-center gap-3 w-full text-left px-4 py-2 my-1 rounded",
                selectedTab === dept.key
                  ? "bg-blue-700 text-white font-semibold"
                  : "text-gray-700 hover:bg-blue-50"
              )}
            >
              {dept.icon}
              {dept.label}
            </button>
          ))}
        </div>
        {/* Admin Body tab at the bottom with separator */}
        <div>
          <div className="w-full border-t my-4" />
          <button
            onClick={() => setSelectedTab(ADMIN_BODY.key)}
            className={classNames(
              "flex items-center gap-3 w-full text-left px-4 py-2 mt-1 rounded",
              selectedTab === ADMIN_BODY.key
                ? "bg-blue-700 text-white font-semibold"
                : "text-gray-700 hover:bg-blue-50"
            )}
          >
            {ADMIN_BODY.icon}
            {ADMIN_BODY.label}
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-400">Municipal Issue AI Panel</div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        {/* Header & stats */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-1 tracking-tight">
              {selectedTab === ADMIN_BODY.key
                ? ADMIN_BODY.label
                : DEPARTMENTS.find((d) => d.key === selectedTab)?.label}
            </h1>
            <div className="flex gap-2 mt-2">
              <Stat label="Total" value={stats.total} />
              <Stat label="Pending" value={stats.pending} />
              <Stat label="In Progress" value={stats.progress} />
              <Stat label="Resolved" value={stats.resolved} />
              <Stat label="Rejected" value={stats.rejected} />
              <Stat label="High Priority" value={stats.high} />
            </div>
          </div>
        </header>
        {/* Issues Table */}
        <div className="rounded border bg-white overflow-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-100">
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Priority
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Justification
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredIssues().length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-blue-300 font-semibold"
                  >
                    No issues found under this category.
                  </td>
                </tr>
              )}
              {filteredIssues().map((issue, idx) => (
                <tr key={idx} className="border-t border-gray-100 hover:bg-blue-50">
                  <td className="px-4 py-2">
                    {issue.image_url ? (
                      <img
                        src={issue.image_url}
                        className="rounded w-12 h-12 object-cover border"
                        alt="Issue"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                    )}
                  </td>
                  <td className="px-4 py-2 max-w-xs">{issue.description}</td>
                  <td className="px-4 py-2">{issue.location}</td>
                  <td className="px-4 py-2">
                    <PriorityChip level={issue.priority_level} />
                  </td>
                  <td className="px-4 py-2 max-w-xs">{issue.justification}</td>
                  <td className="px-4 py-2">
                    <StatusChip status={issue.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
