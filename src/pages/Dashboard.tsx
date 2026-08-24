import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Page } from '../components/Layout';

const mrrData = [
  { name: 'Jan', current: 18400, prev: 16200 },
  { name: 'Feb', current: 19100, prev: 16800 },
  { name: 'Mar', current: 20500, prev: 17200 },
  { name: 'Apr', current: 21200, prev: 17800 },
  { name: 'May', current: 22800, prev: 18100 },
  { name: 'Jun', current: 24500, prev: 18900 },
];

const nodesData = [
  { name: 'fsn1-dc14', usage: 82 },
  { name: 'fsn1-dc15', usage: 65 },
  { name: 'hel1-dc2', usage: 91 },
  { name: 'nbg1-dc3', usage: 45 },
  { name: 'ash-dc1', usage: 30 },
];

export default function Dashboard() {
  return (
    <Page title="Dashboard Overview">
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'MRR', value: '€24,500' },
          { label: 'Active Hetzner Servers', value: '142' },
          { label: 'Open Tickets', value: '7' },
          { label: 'Hetzner API Status', value: 'Operational', color: 'text-green-500' },
        ].map(stat => (
          <div key={stat.label} className="border border-border p-5 divide-y divide-border bg-background">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-2xl font-light ${stat.color || ''}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-6">Revenue Growth (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="current" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="Current Year" />
                <Area type="monotone" dataKey="prev" stroke="#666" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Previous Year" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-6">Datacenter Capacity (Cloud)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodesData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip 
                  cursor={{ fill: '#333', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Allocation']}
                />
                <Bar dataKey="usage" radius={[0, 2, 2, 0]}>
                  {
                    nodesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.usage > 90 ? '#ef4444' : entry.usage > 75 ? '#eab308' : '#ffffff'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Page>
  );
}
