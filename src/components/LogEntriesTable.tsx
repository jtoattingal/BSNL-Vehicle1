import React from 'react';
import { LogEntry } from '../types';
import { formatDateIndian, isMonthClosed } from '../constants';

interface LogEntriesTableProps {
  entries: LogEntry[];
  onEdit?: (entry: LogEntry) => void;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  closedMonths?: string[];
}

export const LogEntriesTable: React.FC<LogEntriesTableProps> = ({
  entries,
  onEdit,
  isAdmin = false,
  onDelete,
  closedMonths = [],
}) => {
  const headerClass =
    'text-left px-3 py-2.5 text-[#5A6A82] text-xs font-semibold uppercase tracking-wider whitespace-nowrap border-b border-[#D4DEF0] bg-[#F5F8FD]';
  const cellClass = 'px-3 py-2.5 text-[#1A2A4A] text-sm border-b border-[#EEF2F9] align-top';

  if (entries.length === 0) {
    return (
      <div
        className="text-center py-14 text-[#8A99AE]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="text-4xl mb-2">📋</div>
        <div className="font-medium text-[#5A6A82]">No entries recorded</div>
        <div className="text-sm">Add a new log entry to get started (records start from 01.08.2026).</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr>
            <th className={headerClass}>Date</th>
            <th className={headerClass}>Start</th>
            <th className={headerClass}>OMR</th>
            <th className={headerClass}>Places Visited</th>
            <th className={headerClass}>Purpose / Details</th>
            <th className={headerClass}>End</th>
            <th className={headerClass}>CMR</th>
            <th className={headerClass}>KM</th>
            <th className={headerClass}>Remarks</th>
            {(isAdmin || onEdit) && <th className={headerClass}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const entryClosed = isMonthClosed(entry.date, closedMonths);
            return (
              <tr
                key={entry.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFE]'}
              >
                <td className={cellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap font-medium">
                      {formatDateIndian(entry.date)}
                    </span>
                    {entryClosed && (
                      <span
                        title="Month closed and locked. No edits allowed."
                        className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded"
                      >
                        🔒 Closed
                      </span>
                    )}
                  </div>
                  <div className="text-[#8A99AE] text-xs">{entry.startTime}</div>
                </td>
                <td className={cellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div>{entry.startStation}</div>
                  <div className="text-[#8A99AE] text-xs">→ {entry.endStation}</div>
                </td>
                <td className={cellClass}>
                  <div
                    className="font-mono text-xs text-[#003087]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.logbookOMR}
                  </div>
                  <div
                    className="text-[#8A99AE] text-xs font-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    act: {entry.actualOMR}
                  </div>
                </td>
                <td
                  className={`${cellClass} max-w-[160px]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="text-xs leading-relaxed">{entry.placesVisited}</div>
                </td>
                <td
                  className={`${cellClass} max-w-[180px]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="text-xs leading-relaxed">{entry.purpose}</div>
                </td>
                <td className={cellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {entry.endStation}
                </td>
                <td className={cellClass}>
                  <div
                    className="font-mono text-xs text-[#003087]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.logbookCMR}
                  </div>
                  <div
                    className="text-[#8A99AE] text-xs font-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    act: {entry.actualCMR}
                  </div>
                </td>
                <td className={cellClass}>
                  <span
                    className="text-[#003087] font-bold font-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.km}
                  </span>
                </td>
                <td
                  className={`${cellClass} text-xs text-[#8A99AE]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {entry.remarks || '—'}
                </td>
                {(isAdmin || onEdit) && (
                  <td className={cellClass}>
                    {entryClosed && !isAdmin ? (
                      <span className="text-[11px] text-[#8A99AE] italic flex items-center gap-1">
                        🔒 Locked
                      </span>
                    ) : (
                      <div className="flex gap-2 items-center">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(entry)}
                            className="text-[#0055C8] text-xs hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        {isAdmin && onDelete && (
                          <button
                            onClick={() => onDelete(entry.id)}
                            className="text-red-500 text-xs hover:underline font-medium cursor-pointer"
                          >
                            Del
                          </button>
                        )}
                        {entryClosed && isAdmin && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
