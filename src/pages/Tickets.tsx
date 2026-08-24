import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Mail, AlertTriangle, ShieldAlert, CheckCircle, ArrowLeft, Send, Lock, User, Server, Plus, Edit2, X, Users } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Vault Scope', email: 'hello@vaultscope.de', services: ['VPS - 4GB RAM (FRA-1)', 'Dedicated Server #42'] },
  { id: 'CUST-002', name: 'John Doe', email: 'john@example.com', services: ['Advance-1 (RBX)', 'Shared Hosting Basic'] },
  { id: 'CUST-003', name: 'Jane Smith', email: 'jane@smith.com', services: ['VPS - 2GB RAM (FSN1)'] },
  { id: 'CUST-004', name: 'System / External', email: 'security@some-isp.com', services: ['Unknown (IP: 192.168.1.5)'] },
  { id: 'CUST-005', name: 'Media Corp LLC', email: 'legal@mediacorp.com', services: ['None'] }
];

function TicketsDepartments() {
  return (
    <Page title="Support Departments">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Manage ticket departments and their associated email pipelines.</p>
        <button className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
          <div className="col-span-2">Department Name</div>
          <div>Associated Mailbox</div>
          <div className="text-right">Default Assignee</div>
        </div>
        {[
          { name: 'General Support', email: 'support@vaultscope.de', assignee: 'Unassigned', icon: Mail },
          { name: 'Abuse Desk', email: 'abuse@vaultscope.de', assignee: 'Admin User', icon: AlertTriangle },
          { name: 'DMCA Takedowns', email: 'dmca@vaultscope.de', assignee: 'Legal Team', icon: ShieldAlert },
          { name: 'Sales & Billing', email: 'sales@vaultscope.de', assignee: 'Unassigned', icon: Users },
        ].map(d => (
          <div key={d.name} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-center gap-3 font-medium">
              <d.icon className="w-4 h-4 text-muted-foreground" /> {d.name}
            </div>
            <div className="text-muted-foreground font-mono text-xs">{d.email}</div>
            <div className="text-right text-muted-foreground">{d.assignee}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}

function TicketsNew({ onSave }: { onSave: (t: any) => void }) {
  const navigate = useNavigate();
  const [newTicket, setNewTicket] = useState({
    subject: '', customerId: '', customerName: '', customerEmail: '', category: 'support', priority: 'Normal', relatedService: ''
  });

  const handleCustomerSelect = (custId: string) => {
    const cust = MOCK_CUSTOMERS.find(c => c.id === custId);
    if (!cust) return;
    setNewTicket(prev => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      relatedService: cust.services[0] || 'None'
    }));
  };

  const handleCreateTicket = () => {
    const prefix = newTicket.category === 'support' ? 'TKT' : newTicket.category === 'abuse' ? 'ABU' : 'DMC';
    const id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      id,
      category: newTicket.category,
      subject: newTicket.subject,
      customer: newTicket.customerName,
      customerId: newTicket.customerId,
      customerEmail: newTicket.customerEmail,
      status: 'Open',
      priority: newTicket.priority,
      assignee: 'Unassigned',
      time: 'Just now',
      mailbox: `${newTicket.category}@vaultscope.de`,
      relatedService: newTicket.relatedService || 'None',
      ip: 'N/A (Manually Created)',
      thread: [
        { id: Date.now(), author: 'Admin User', role: 'staff', time: 'Just now', content: 'Ticket manually created by staff.', internal: true }
      ]
    };
    onSave(created);
    navigate('/tickets');
  };

  return (
    <Page title="Manually Create Ticket">
      <div className="bg-background border border-border p-6 w-full max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Department / Category</label>
              <select 
                value={newTicket.category} 
                onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="support">Support</option>
                <option value="abuse">Abuse</option>
                <option value="dmca">DMCA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Priority</label>
              <select 
                value={newTicket.priority} 
                onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Subject</label>
            <input 
              type="text" 
              value={newTicket.subject} 
              onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              placeholder="Ticket subject..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer</label>
            <select 
              value={newTicket.customerId}
              onChange={e => handleCustomerSelect(e.target.value)}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="" disabled>Select a customer...</option>
              {MOCK_CUSTOMERS.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          {newTicket.customerId && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Related Service</label>
              <select 
                value={newTicket.relatedService}
                onChange={e => setNewTicket({...newTicket, relatedService: e.target.value})}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              >
                <optgroup label="Provisioned Services">
                  {MOCK_CUSTOMERS.find(c => c.id === newTicket.customerId)?.services.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
                <optgroup label="General Categories">
                  <option value="User Account">User Account</option>
                  <option value="Billing / Invoices">Billing / Invoices</option>
                  <option value="General Inquiry">General Inquiry</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
          <Link to="/tickets" className="px-4 py-2 text-sm border border-transparent text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Cancel
          </Link>
          <button 
            onClick={handleCreateTicket} 
            disabled={!newTicket.subject || !newTicket.customerId}
            className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </Page>
  );
}

function TicketsList({ tickets, setTickets }: { tickets: any[], setTickets: (t: any[]) => void }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTicketData, setEditTicketData] = useState({
    subject: '', customerId: '', customerName: '', customerEmail: '', relatedService: ''
  });

  const filteredTickets = tickets.filter(t => {
    const matchesTab = activeTab === 'all' || t.category === activeTab;
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesAssignee = filterAssignee === 'all' || t.assignee.toLowerCase() === filterAssignee.toLowerCase();

    return matchesTab && matchesSearch && matchesStatus && matchesAssignee;
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedTicket = {
          ...t,
          thread: [
            ...t.thread,
            { id: Date.now(), author: 'Admin User', role: 'staff', time: 'Just now', content: replyText, internal: isInternal }
          ]
        };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });
    
    setTickets(updatedTickets);
    setReplyText('');
    setIsInternal(false);
  };

  const handleStatusChange = (newStatus: string) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedTicket = { ...t, status: newStatus };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });
    setTickets(updatedTickets);
  };

  const handleCustomerSelect = (custId: string) => {
    const cust = MOCK_CUSTOMERS.find(c => c.id === custId);
    if (!cust) return;
    setEditTicketData(prev => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      relatedService: cust.services[0] || 'None'
    }));
  };

  const openEditModal = () => {
    setEditTicketData({
      subject: selectedTicket.subject,
      customerId: selectedTicket.customerId || '',
      customerName: selectedTicket.customer,
      customerEmail: selectedTicket.customerEmail,
      relatedService: selectedTicket.relatedService
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedTicket = { 
          ...t, 
          subject: editTicketData.subject,
          customerId: editTicketData.customerId,
          customer: editTicketData.customerName,
          customerEmail: editTicketData.customerEmail,
          relatedService: editTicketData.relatedService
        };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });
    setTickets(updatedTickets);
    setIsEditModalOpen(false);
  };

  const renderDetailView = () => (
    <Page title={`Ticket: ${selectedTicket.subject}`}>
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inbox
        </button>
        
        <div className="flex gap-3">
          <select 
            value={selectedTicket.priority} 
            onChange={(e) => {
              const updatedTickets = tickets.map(t => {
                if (t.id === selectedTicket.id) {
                  const updatedTicket = { ...t, priority: e.target.value };
                  setSelectedTicket(updatedTicket);
                  return updatedTicket;
                }
                return t;
              });
              setTickets(updatedTickets);
            }} 
            className="border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="Low">Low Priority</option>
            <option value="Normal">Normal Priority</option>
            <option value="High">High Priority</option>
            <option value="Critical">Critical</option>
          </select>
          
          <select 
            value={selectedTicket.status} 
            onChange={(e) => handleStatusChange(e.target.value)} 
            className="border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on Customer">Waiting on Customer</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-1 overflow-y-auto border border-border bg-background p-6 space-y-6">
            {selectedTicket.thread.map((msg: any) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'customer' ? 'items-start' : 'items-end'}`}>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                  <span className="font-medium text-foreground">{msg.author}</span>
                  <span>{msg.time}</span>
                  {msg.internal && (
                    <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-sm">
                      <Lock className="w-3 h-3" /> Internal Note
                    </span>
                  )}
                </div>
                <div className={`p-4 text-sm max-w-[85%] whitespace-pre-wrap ${
                  msg.internal 
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-900 dark:text-yellow-100' 
                    : msg.role === 'customer' 
                      ? 'bg-foreground/5 border border-border' 
                      : 'bg-foreground text-background'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border border-border bg-background p-4">
            <textarea 
              rows={4}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={isInternal ? "Write an internal note (customer will not see this)..." : "Write your reply to the customer..."}
              className="w-full bg-transparent resize-none focus:outline-none text-sm mb-3"
            />
            <div className="flex justify-between items-center border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                <span className={`${isInternal ? 'text-yellow-500 font-medium' : 'text-muted-foreground'}`}>Internal Note (Hidden from Customer)</span>
              </label>
              <button 
                onClick={handleSendReply}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${isInternal ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-foreground text-background hover:bg-foreground/90'}`}
              >
                <Send className="w-4 h-4" /> {isInternal ? 'Add Note' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-border bg-background p-5">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Customer Information
              </h3>
              <button onClick={openEditModal} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Name</div>
                <div>{selectedTicket.customer}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Email</div>
                <div>{selectedTicket.customerEmail}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Original IP Address</div>
                <div className="font-mono">{selectedTicket.ip}</div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-background p-5">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" /> Ticket Meta
              </h3>
              <button onClick={openEditModal} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Ticket ID</div>
                <div className="font-mono">{selectedTicket.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Subject</div>
                <div>{selectedTicket.subject}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Received At</div>
                <div>{selectedTicket.mailbox}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Related Service</div>
                <div>{selectedTicket.relatedService}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-0.5">Assignee</div>
                <select 
                  value={selectedTicket.assignee}
                  onChange={(e) => {
                    const updatedTickets = tickets.map(t => {
                      if (t.id === selectedTicket.id) {
                        const updatedTicket = { ...t, assignee: e.target.value };
                        setSelectedTicket(updatedTicket);
                        return updatedTicket;
                      }
                      return t;
                    });
                    setTickets(updatedTickets);
                  }}
                  className="w-full border border-border bg-transparent p-1.5 text-sm focus:outline-none focus:border-foreground mt-1"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Admin User">Admin User</option>
                  <option value="Legal Team">Legal Team</option>
                  <option value="Support Tier 1">Support Tier 1</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-muted-foreground" /> Edit Ticket Details
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Subject</label>
                <input type="text" value={editTicketData.subject} onChange={e => setEditTicketData({...editTicketData, subject: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer</label>
                <select value={editTicketData.customerId} onChange={e => handleCustomerSelect(e.target.value)} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                  <option value="" disabled>Select a customer...</option>
                  {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              
              {editTicketData.customerId && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Related Service</label>
                  <select value={editTicketData.relatedService} onChange={e => setEditTicketData({...editTicketData, relatedService: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                    <optgroup label="Provisioned Services">
                      {MOCK_CUSTOMERS.find(c => c.id === editTicketData.customerId)?.services.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="General Categories">
                      <option value="User Account">User Account</option>
                      <option value="Billing / Invoices">Billing / Invoices</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </optgroup>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm border border-transparent text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );

  const renderListView = () => (
    <Page title="Support & Abuse Desk">
      <div className="flex gap-4 mb-4 border-b border-border overflow-x-auto">
        <button onClick={() => setActiveTab('all')} className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>All Inboxes</button>
        <button onClick={() => setActiveTab('support')} className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'support' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}>General Support</button>
        <button onClick={() => setActiveTab('abuse')} className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'abuse' ? 'text-red-400 border-b-2 border-red-400' : 'text-muted-foreground hover:text-foreground'}`}><AlertTriangle className="w-3 h-3"/> Abuse Reports</button>
        <button onClick={() => setActiveTab('dmca')} className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'dmca' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-muted-foreground hover:text-foreground'}`}><ShieldAlert className="w-3 h-3"/> DMCA Takedowns</button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input type="text" placeholder="Search tickets by ID, Subject, or Customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
        </div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground">
            <option value="all">Any Status</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="waiting on customer">Waiting on Customer</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground">
            <option value="all">Any Assignee</option>
            <option value="unassigned">Unassigned</option>
            <option value="admin user">Admin User</option>
            <option value="legal team">Legal Team</option>
          </select>
        </div>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-8 text-muted-foreground">
          <div className="col-span-3">Subject</div>
          <div className="col-span-2">Customer / Mailbox</div>
          <div>Assignee</div>
          <div>Status</div>
          <div className="text-right">Last Updated</div>
        </div>
        {filteredTickets.map(t => (
          <div key={t.id} onClick={() => setSelectedTicket(t)} className="p-4 text-sm grid grid-cols-8 items-center hover:bg-foreground/[0.02] cursor-pointer">
            <div className="col-span-3 flex flex-col">
              <span className="font-medium">{t.subject}</span>
              <span className="font-mono text-xs text-muted-foreground">{t.id} &bull; {t.priority} Priority</span>
            </div>
            <div className="col-span-2 flex flex-col">
              <span>{t.customer}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {t.mailbox}</span>
            </div>
            <div className="text-muted-foreground text-xs">{t.assignee}</div>
            <div>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${t.status === 'Open' ? 'text-red-400 bg-red-400/5' : t.status === 'Closed' ? 'text-muted-foreground bg-foreground/5' : 'text-yellow-400 bg-yellow-400/5'}`}>
                {t.status}
              </span>
            </div>
            <div className="text-right text-muted-foreground text-xs">{t.time}</div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
            <CheckCircle className="w-8 h-8 mb-2 text-foreground/20" />
            No tickets match your filters.
          </div>
        )}
      </div>
    </Page>
  );

  return selectedTicket ? renderDetailView() : renderListView();
}

export default function TicketsRouter() {
  const [tickets, setTickets] = useState([
    { 
      id: 'TKT-1042', category: 'support', subject: 'Network latency on FRA-1 node', customer: 'Vault Scope', customerId: 'CUST-001', customerEmail: 'hello@vaultscope.de', status: 'Open', priority: 'High', assignee: 'Unassigned', time: '10 min ago', mailbox: 'support@vaultscope.de', relatedService: 'VPS - 4GB RAM (FRA-1)', ip: '192.0.2.14',
      thread: [
        { id: 1, author: 'Vault Scope', role: 'customer', time: '10 min ago', content: 'Hello, we are experiencing severe network drops to our VPS in Frankfurt. Ping times are over 500ms and sometimes request timeout completely. Please investigate.', internal: false }
      ]
    },
    { 
      id: 'ABU-0091', category: 'abuse', subject: 'Port scanning from IP 192.168.1.5', customer: 'System / External', customerId: 'CUST-004', customerEmail: 'security@some-isp.com', status: 'Open', priority: 'Critical', assignee: 'Admin User', time: '5 mins ago', mailbox: 'abuse@vaultscope.de', relatedService: 'Unknown (IP: 192.168.1.5)', ip: '198.51.100.22',
      thread: [
        { id: 1, author: 'External ISP Security', role: 'customer', time: '5 mins ago', content: 'We detected automated port scanning originating from your network (192.168.1.5) targeting our infrastructure. Logs attached below...', internal: false }
      ]
    },
    { 
      id: 'DMC-0022', category: 'dmca', subject: 'Copyright infringement notice', customer: 'Media Corp LLC', customerId: 'CUST-005', customerEmail: 'legal@mediacorp.com', status: 'Closed', priority: 'Normal', assignee: 'Legal Team', time: '1 day ago', mailbox: 'dmca@vaultscope.de', relatedService: 'Dedicated Server #42', ip: '203.0.113.88',
      thread: [
        { id: 1, author: 'Media Corp LLC', role: 'customer', time: '1 day ago', content: 'Under penalty of perjury, I state that the files hosted at your IP infringe upon our copyright...', internal: false },
        { id: 2, author: 'Admin User', role: 'staff', time: '23 hours ago', content: 'We have forwarded this notice to the customer and given them 24 hours to remove the content.', internal: false },
        { id: 3, author: 'Admin User', role: 'staff', time: '22 hours ago', content: 'Customer has verified removal. Closing ticket.', internal: true }
      ]
    }
  ]);

  return (
    <Routes>
      <Route path="/" element={<TicketsList tickets={tickets} setTickets={setTickets} />} />
      <Route path="new" element={<TicketsNew onSave={(t) => setTickets([t, ...tickets])} />} />
      <Route path="departments" element={<TicketsDepartments />} />
    </Routes>
  );
}
