/** Small helpers shared by the admin panels. */

export const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const matches = (row, query, fields) => {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => String(row[field] ?? '').toLowerCase().includes(needle));
};

export function downloadCsv(filename, rows, columns) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const body = [
    columns.map((column) => escape(column.label)).join(','),
    ...rows.map((row) =>
      columns
        .map((column) => escape(typeof column.value === 'function' ? column.value(row) : row[column.key]))
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const statusTone = (status) => {
  const key = String(status || '').toLowerCase();
  if (['verified', 'hired', 'handled'].includes(key)) return 'ok';
  if (['rejected', 'declined', 'spam'].includes(key)) return 'bad';
  if (['pending', 'new'].includes(key)) return 'new';
  if (['submitted', 'under_review', 'shortlisted', 'shortlist', 'contacted', 'in_progress', 'in progress'].includes(key)) {
    return 'info';
  }
  return 'muted';
};
