import { useState } from 'react';
import { Page } from '../components/Layout';
import { Play, RotateCcw, XCircle } from 'lucide-react';

export default function JobQueue() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApi, setFilterApi] = useState('all');

  const [selectedJob, setSelectedJob] = useState<any>(null);

  const jobs = [
    { 
      id: 'job_9a31f', task: 'Deploy CX11 (fsn1)', api: 'Hetzner Cloud', customer: 'Vault Scope', status: 'Completed', err: null,
      requestPayload: '{\n  "name": "vs-vps-8f39a1",\n  "server_type": "cx11",\n  "location": "fsn1",\n  "image": "ubuntu-24.04"\n}',
      responsePayload: '{\n  "server": {\n    "id": 429183,\n    "status": "initializing",\n    "created": "2026-08-24T02:40:00Z"\n  }\n}'
    },
    { 
      id: 'job_9a320', task: 'Create Customer Mailbox', api: 'Mailcow', customer: 'Vault Scope', status: 'Completed', err: null,
      requestPayload: '{\n  "local_part": "admin",\n  "domain": "vaultscope.de",\n  "quota": 3072\n}',
      responsePayload: '{\n  "type": "success",\n  "msg": "mailbox_created"\n}'
    },
    { 
      id: 'job_9a321', task: 'Deploy Advance-1 (rbx)', api: 'OVH', customer: 'John Doe', status: 'Failed', err: 'OVH API: 403 Invalid Application Key',
      requestPayload: '{\n  "planId": "advance-1-gen2",\n  "datacenter": "rbx"\n}',
      responsePayload: '{\n  "errorCode": "INVALID_SIGNATURE",\n  "httpCode": "403 Forbidden",\n  "message": "Invalid application key"\n}'
    },
    { 
      id: 'job_9a322', task: 'Subscribe to Newsletter List', api: 'Listmonk', customer: 'Jane Smith', status: 'In Progress', err: null,
      requestPayload: '{\n  "email": "jane@smith.com",\n  "name": "Jane Smith",\n  "list_ids": [2]\n}',
      responsePayload: null
    },
  ];

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      j.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || j.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesApi = filterApi === 'all' || j.api.toLowerCase().includes(filterApi.toLowerCase());

    return matchesSearch && matchesStatus && matchesApi;
  });

  return (
    <Page title="Provisioning & Automation Queue">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Real-time log of upstream API calls (Hetzner, OVH, Mailcow, Listmonk).</p>
        <button className="flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors cursor-pointer">
          <Play className="w-4 h-4" /> Pause Queue
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Search by Job ID, Task Description, or Customer..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          >
            <option value="all">Any Status</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
            <option value="failed">Failed</option>
          </select>
          <select 
            value={filterApi}
            onChange={e => setFilterApi(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          >
            <option value="all">Any Target API</option>
            <option value="hetzner">Hetzner (Cloud/Robot)</option>
            <option value="ovh">OVH</option>
            <option value="mailcow">Mailcow</option>
            <option value="listmonk">Listmonk</option>
          </select>
        </div>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
          <div>Job ID</div>
          <div className="col-span-2">Task Description</div>
          <div>Target API</div>
          <div>Customer</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {filteredJobs.map((j, i) => (
          <div key={i} onClick={() => setSelectedJob(j)} className="p-4 text-sm grid grid-cols-7 items-start hover:bg-foreground/[0.02] cursor-pointer">
            <div className="font-mono text-xs text-muted-foreground pt-1">{j.id}</div>
            <div className="col-span-2 flex flex-col pt-1 pr-4">
              <span className="font-medium">{j.task}</span>
              {j.err && <span className="text-xs text-red-500 mt-1 truncate">{j.err}</span>}
            </div>
            <div className="text-xs text-muted-foreground pt-1">{j.api}</div>
            <div className="pt-1">{j.customer}</div>
            <div className="pt-1">
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${j.status === 'Completed' ? 'text-green-500 bg-green-500/5' : j.status === 'Failed' ? 'text-red-500 bg-red-500/5' : 'text-yellow-500 bg-yellow-500/5'}`}>
                {j.status}
              </span>
            </div>
            <div className="text-right flex gap-2 justify-end">
              {j.status === 'Failed' && (
                <>
                  <button onClick={(e) => e.stopPropagation()} className="p-1.5 border border-border hover:bg-foreground/5 text-muted-foreground cursor-pointer" title="Retry Job"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={(e) => e.stopPropagation()} className="p-1.5 border border-border hover:bg-red-500/10 text-red-500 cursor-pointer" title="Cancel Job"><XCircle className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No jobs match your filters.
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-medium font-mono mb-1">{selectedJob.id}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{selectedJob.task}</span>
                  <span>&bull;</span>
                  <span>{selectedJob.api}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${selectedJob.status === 'Completed' ? 'text-green-500 bg-green-500/5' : selectedJob.status === 'Failed' ? 'text-red-500 bg-red-500/5' : 'text-yellow-500 bg-yellow-500/5'}`}>
                  {selectedJob.status}
                </span>
                <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {selectedJob.err && (
              <div className="mb-6 p-4 border border-red-500/30 bg-red-500/5">
                <h3 className="text-xs font-medium text-red-500 uppercase tracking-wider mb-2">Error Message</h3>
                <p className="text-sm text-foreground font-mono">{selectedJob.err}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Request Payload</h3>
                <pre className="bg-foreground/5 p-4 border border-border text-xs font-mono overflow-x-auto whitespace-pre-wrap h-64">
                  {selectedJob.requestPayload}
                </pre>
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Response Payload</h3>
                <pre className="bg-foreground/5 p-4 border border-border text-xs font-mono overflow-x-auto whitespace-pre-wrap h-64">
                  {selectedJob.responsePayload || 'No response received yet...'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              {selectedJob.status === 'Failed' && (
                <button className="px-4 py-2 text-sm border border-border text-foreground hover:bg-foreground/5 flex items-center gap-2 cursor-pointer transition-colors">
                  <RotateCcw className="w-4 h-4" /> Retry Request
                </button>
              )}
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
