import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import clsx from "clsx";
import { getTeam } from "../api/team.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { RolePill } from "../components/ui/Pill.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "MANAGER", label: "Managers" },
  { key: "AGENT", label: "Agents" },
];

export function TeamPage() {
  const [team, setTeam] = useState(null);
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    getTeam().then(setTeam);
  }, []);

  const filtered = team?.filter((m) => tab === "ALL" || m.role === tab) ?? [];

  return (
    <div>
      <PageHeader breadcrumb="NovaWorks" title="Team" subtitle="Everyone at NovaWorks Technologies." />

      <div className="mb-6 inline-flex rounded-field border border-border bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "rounded-field px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              tab === t.key ? "bg-surface text-text border border-border" : "text-text-2 hover:text-text"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {team === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No one here" description="No team members match this filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member, i) => (
            <motion.div
              key={member.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="lg" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text">{member.name}</div>
                    <RolePill role={member.role} className="mt-1" />
                  </div>
                </div>
                {member.specialization && (
                  <div className="mt-3 text-xs text-text-2">{member.specialization}</div>
                )}
                {member.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-pill border border-border px-2 py-0.5 text-[11px] text-text-3"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
