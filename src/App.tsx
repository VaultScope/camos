import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import BillingAutomation from './pages/BillingAutomation';
import Tickets from './pages/Tickets';
import Services from './pages/Services';
import Products from './pages/Products';
import ServiceForms from './pages/ServiceForms';
import JobQueue from './pages/JobQueue';
import Connectors from './pages/Connectors';
import Staff from './pages/Staff';
import Coupons from './pages/Coupons';
import Launchpad from './pages/Launchpad';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import EmailLogs from './pages/EmailLogs';
import ConfigOptions from './pages/ConfigOptions';
import ActivityLog from './pages/ActivityLog';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import EmailTemplates from './pages/EmailTemplates';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={
          <AuthGuard>
            <div className="min-h-screen bg-background text-foreground flex">
              <Sidebar />
              <main className="flex-1 bg-foreground/[0.01]">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/launchpad" element={<Launchpad />} />
                  <Route path="/customers/*" element={<Customers />} />
                  <Route path="/billing/*" element={<BillingAutomation />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/tickets/*" element={<Tickets />} />
                  <Route path="/services/*" element={<Services />} />
                  <Route path="/products/*" element={<Products />} />
                  <Route path="/forms" element={<ServiceForms />} />
                  <Route path="/config-options" element={<ConfigOptions />} />
                  <Route path="/jobs" element={<JobQueue />} />
                  <Route path="/email-logs" element={<EmailLogs />} />
                  <Route path="/connectors/*" element={<Connectors />} />
                  <Route path="/staff/*" element={<Staff />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/email-templates" element={<EmailTemplates />} />
                </Routes>
              </main>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}
