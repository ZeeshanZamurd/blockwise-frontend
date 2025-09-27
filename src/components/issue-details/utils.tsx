
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'not started': return 'bg-gray-100 text-gray-800';
    case 'in review': return 'bg-yellow-100 text-yellow-800';
    case 'in progress': return 'bg-blue-100 text-blue-800';
    case 'closed': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-orange-100 text-orange-800';
    // Legacy support
    case 'new': return 'bg-gray-100 text-gray-800';
    case 'open': return 'bg-gray-100 text-gray-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const handleShare = (issue: { id: string; title: string; status: string; priority: string; category: string; dateCreated?: string; date?: string; summary: string; }) => {
  const subject = `[Issue] ${issue.id} — ${issue.title}`;
  const created = issue.dateCreated || issue.date || '';
  const body = [
    `Title: ${issue.title}`,
    `ID: ${issue.id}`,
    `Status: ${issue.status}`,
    `Priority: ${issue.priority}`,
    `Category: ${issue.category}`,
    created ? `Created: ${created}` : '',
    '',
    'Summary:',
    issue.summary,
    '',
    `Link: ${window.location.href}`
  ].filter(Boolean).join('%0A');
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
};
