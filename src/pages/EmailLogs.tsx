import { useState } from 'react';
import { Page } from '../components/Layout';
import { Mail, Search, CheckCircle, XCircle, Clock, Send, AlertTriangle } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export default function EmailLogs() {
  const { data: logs, loading, error, refetch } = useApi<any[]>('/admin/email-logs');
  const [search, setSearch] = useState('');
  const [mailboxFilter, setMailboxFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testSubject, setTestSubject] = useState('VaultScope Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification dispatched from CAMOS to verify outbound SMTP delivery.');
  const [sendingTest, setSendingTest] = useState(false);
  const toast = useToast();

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo.trim() || sendingTest) return;
    setSendingTest(true);
    try {
      await api.post('/admin/email-logs/send-test', {
        to: testTo.trim(),
        subject: testSubject.trim(),
        body: testBody.trim(),
      });
      toast.success(`Test email sent to ${testTo.trim()}`);
      setIsTestModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to send test email: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSendingTest(false);
    }
  };

  const items = logs ?? [];
  const filtered = items.filter(log => {
    const to = (log.to || log.recipient || '').toLowerCase();
    const subject = (log.subject || '').toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = to.includes(query) || subject.includes(query);

    const mailbox = (log.mailbox || '').toLowerCase();
    const matchesMailbox = mailboxFilter === 'all' || mailbox.includes(mailboxFilter.toLowerCase());

    const status = (log.status || '').toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      status === statusFilter.toLowerCase();

    return matchesSearch && matchesMailbox && matchesStatus;
  });

  return (
    <Page title="Email Logs & Notifications">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Audit history and delivery logs for automated platform emails, customer notifications, and staff dispatches.
        </p>
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" /> Send Test Email
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email logs by recipient or subject..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border focus:outline-none focus:border-foreground"
          />
        </div>
        <select
          value={mailboxFilter}
          onChange={e => setMailboxFilter(e.target.value)}
          className="border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-foreground"
        >
          <option value="all">All Mailboxes</option>
          <option value="noreply">noreply@vaultscope.de</option>
          <option value="support">support@vaultscope.de</option>
          <option value="abuse">abuse@vaultscope.de</option>
          <option value="security">security@vaultscope.de</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
          <option value="bounced">Bounced</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading email audit logs...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load email logs: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
            <div className="col-span-2">Recipient</div>
            <div className="col-span-3">Subject / Mailbox</div>
            <div>Status</div>
            <div className="text-right">Time</div>
          </div>

          {filtered.map(log => {
            const recipient = log.to || log.recipient || '—';
            const mailbox = log.mailbox || 'noreply@vaultscope.de';
            const statusLower = (log.status || '').toLowerCase();
            const isDelivered = statusLower === 'delivered';
            const isFailed = statusLower === 'failed' || statusLower === 'bounced';
            const timeStr = log.time || (log.sent_at ? new Date(log.sent_at).toLocaleString() : '—');

            return (
              <div key={log.id} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02]">
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate font-mono text-xs">{recipient}</span>
                </div>
                <div className="col-span-3 flex flex-col min-w-0 pr-4">
                  <span className="font-medium truncate">{log.subject}</span>
                  <span className="text-xs text-muted-foreground truncate">From: {mailbox}</span>
                  {log.error && (
                    <span className="text-[11px] text-red-400 mt-0.5 truncate flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {log.error}
                    </span>
                  )}
                </div>
                <div>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      isDelivered ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-yellow-500'
                    }`}
                  >
                    {isDelivered ? (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : isFailed ? (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="capitalize">{log.status}</span>
                  </span>
                </div>
                <div className="text-right text-muted-foreground text-xs font-mono">{timeStr}</div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No outbound email logs recorded yet.' : 'No email logs match your filters.'}
            </div>
          )}
        </div>
      )}

      {isTestModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border shadow-xl w-full max-w-lg p-6">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-muted-foreground" /> Send Outbound Test Email
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Dispatches a test message via VaultScope SMTP relay and immediately registers an entry in the audit log.
            </p>
            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={testTo}
                  onChange={e => setTestTo(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={e => setTestSubject(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={testBody}
                  onChange={e => setTestBody(e.target.value)}
                  className="w-full bg-background border border-border p-2 text-sm focus:outline-none focus:border-foreground resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 text-sm border border-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest || !testTo.trim()}
                  className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {sendingTest ? 'Sending...' : 'Dispatch Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}
