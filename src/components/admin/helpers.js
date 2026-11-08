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
  if (['verified', 'Hired', 'Handled'].includes(status)) return 'ok';
  if (['rejected', 'Declined'].includes(status)) return 'bad';
  if (['pending', 'New'].includes(status)) return 'new';
  if (['Shortlisted', 'Contacted', 'In progress'].includes(status)) return 'info';
  return 'muted';
};

/** Clearly-labelled sample rows, so an empty panel can still show its layout. */
export const sampleRows = () => {
  const t = Date.now();
  const at = (offset) => new Date(t - offset).toISOString();
  return {
    accounts: [
      {
        id: 'sample-acc-1',
        event: 'signup',
        name: 'Sample Employer',
        email: 'sample.employer@example.com',
        role: 'employer',
        company: 'Sample Contracting Co.',
        mode: 'local',
        sample: true,
        createdAt: at(1000 * 60 * 42),
      },
      {
        id: 'sample-acc-2',
        event: 'signup',
        name: 'Sample Worker',
        email: 'sample.worker@example.com',
        role: 'worker',
        company: 'Electrician',
        mode: 'local',
        sample: true,
        createdAt: at(1000 * 60 * 90),
      },
    ],
    applications: [
      {
        id: 'sample-app-1',
        jobId: 'GG-1002',
        jobTitle: 'Electrician',
        company: 'Demo Contracting Group',
        city: 'Jeddah',
        name: 'Sample Worker',
        email: 'sample.worker@example.com',
        phone: '+974 0000 0000',
        note: 'Six years of site experience in commercial wiring.',
        cv: { name: 'sample-cv.pdf', size: 180000 },
        status: 'Submitted',
        sample: true,
        createdAt: at(1000 * 60 * 55),
      },
    ],
    alerts: [
      {
        id: 'sample-alert-1',
        email: 'sample.worker@example.com',
        filters: { q: 'Electrician', city: 'Jeddah', type: 'Full-time' },
        sample: true,
        createdAt: at(1000 * 60 * 20),
      },
    ],
    messages: [
      {
        id: 'sample-msg-1',
        name: 'Sample Project Manager',
        email: 'sample.pm@example.com',
        phone: '+974 0000 0000',
        company: 'Sample Developments',
        city: 'Riyadh',
        inquiry: 'Hire Workers',
        industry: 'construction-infrastructure',
        workers: '25',
        message: 'Sample enquiry used to preview the inbox layout.',
        status: 'New',
        sample: true,
        createdAt: at(1000 * 60 * 12),
      },
    ],
    jobs: [
      {
        id: 'sample-job-1',
        title: 'Sample Verified Vacancy',
        company: 'Sample Contracting Co.',
        city: 'Riyadh',
        industry: 'construction-infrastructure',
        type: 'Full-time',
        experience: '3–5 years',
        salary: { min: 1800, max: 2400 },
        description: 'Sample posting used to preview how a verified vacancy appears on the jobs page.',
        requirements: ['Sample requirement'],
        status: 'pending',
        source: 'admin',
        posted: new Date().toISOString().slice(0, 10),
        sample: true,
        createdAt: at(1000 * 60 * 5),
      },
    ],
  };
};
