import { Page } from '../components/Layout';
import { Mail, Search, CheckCircle, XCircle } from 'lucide-react';
import { useApi } from '../lib/hooks';

export default function EmailLogs() {
  const { data: logs } = useApi<any[]>('/admin/email-logs');

  return (
    <Page title="Email Logs & Notifications">
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search email logs by recipient or subject..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border focus:outline-none focus:border-foreground"
          />
        </div>
        <select className="border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-foreground">
          <option value="all">All Mailboxes</option>
          <option value="noreply">noreply@vaultscope.de</option>
          <option value="support">support@vaultscope.de</option>
          <option value="abuse">abuse@vaultscope.de</option>
          <option value="dmca">dmca@vaultscope.de</option>
        </select>
        <select className="border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-foreground">
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="bounced">Bounced</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
          <div className="col-span-2">Recipient</div>
          <div className="col-span-3">Subject / Mailbox</div>
          <div>Status</div>
          <div className="text-right">Time</div>
        </div>
        
        {(logs ?? []).map(log => (
          <div key={log.id} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02] cursor-pointer">
            <div className="col-span-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{log.to}</span>
            </div>
            <div className="col-span-3 flex flex-col">
              <span className="font-medium">{log.subject}</span>
              <span className="text-xs text-muted-foreground">From: {log.mailbox}</span>
            </div>
            <div>
              <span className={`flex items-center gap-1 ${log.status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}>
                {log.status === 'Delivered' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {log.status}
              </span>
            </div>
            <div className="text-right text-muted-foreground text-xs">{log.time}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}
