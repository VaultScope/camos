import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Settings2, Trash2, Edit2, List, Type, Key, Globe } from 'lucide-react';

export default function ConfigOptions() {
  const [options] = useState([
    { id: 'opt_1', name: 'Root Password', type: 'password', description: 'The root password for the provisioned server.', required: true, icon: Key },
    { id: 'opt_2', name: 'Datacenter Location', type: 'select', description: 'Preferred physical location for the deployment.', required: true, icon: Globe, choices: ['Falkenstein (FSN)', 'Nuremberg (NBG)', 'Helsinki (HEL)', 'Ashburn (ASH)'] },
    { id: 'opt_3', name: 'Additional IP', type: 'checkbox', description: 'Add a secondary IPv4 address.', required: false, icon: List, price: '+ €1.50/mo' },
    { id: 'opt_4', name: 'Pterodactyl Node', type: 'select', description: 'Node variable for game server deployment.', required: false, icon: Settings2, choices: ['Node 1 (EU)', 'Node 2 (US)'] },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Page title="Configurable Options (Service Elements)">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Define custom fields and configurable options for checkout forms (e.g. passwords, SSH keys, dropdowns).</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Option Element
        </button>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
          <div className="col-span-2">Option Name & Description</div>
          <div>Input Type</div>
          <div>Requirement</div>
          <div>Pricing Modifier</div>
          <div className="text-right">Actions</div>
        </div>
        
        {options.map(opt => (
          <div key={opt.id} className="p-4 text-sm grid grid-cols-6 items-start hover:bg-foreground/[0.02] transition-colors group">
            <div className="col-span-2 flex items-start gap-3">
              <opt.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium">{opt.name}</span>
                <span className="text-xs text-muted-foreground mt-1 leading-relaxed pr-4">{opt.description}</span>
                {opt.choices && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {opt.choices.map(c => <span key={c} className="text-[10px] bg-foreground/5 border border-border px-1.5 py-0.5 rounded text-muted-foreground">{c}</span>)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-foreground/5 border border-border text-xs text-muted-foreground rounded-sm font-mono capitalize">
                {opt.type === 'text' && <Type className="w-3 h-3" />}
                {opt.type === 'password' && <Key className="w-3 h-3" />}
                {opt.type === 'select' && <List className="w-3 h-3" />}
                {opt.type}
              </span>
            </div>
            
            <div>
              {opt.required ? (
                <span className="text-xs font-medium text-orange-400">Required</span>
              ) : (
                <span className="text-xs text-muted-foreground">Optional</span>
              )}
            </div>

            <div className="text-muted-foreground text-xs font-mono mt-0.5">
              {opt.price || 'Free (No Change)'}
            </div>
            
            <div className="text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 border border-border hover:bg-foreground/5 text-muted-foreground cursor-pointer transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium mb-6">Create Configurable Option</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Internal Name</label>
                <input type="text" placeholder="e.g. SSH Key, Root Password" className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer-Facing Description</label>
                <textarea rows={2} placeholder="Explain what this option is for..." className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Field Type</label>
                  <select className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                    <option value="text">Text Input</option>
                    <option value="password">Password Input</option>
                    <option value="textarea">Large Text Area (e.g. SSH Key)</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox (Toggle)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Requirement</label>
                  <select className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                    <option value="required">Required for Checkout</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">Save Element</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
