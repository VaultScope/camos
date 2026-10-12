import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ExplainModeProvider } from './components/HelpTooltip';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import BillingRouter from './pages/BillingRouter';
import Tickets from './pages/Tickets';
import Services from './pages/Services';
import Products from './pages/Products';
import ServiceForms from './pages/ServiceForms';
import JobQueue from './pages/JobQueue';
import Staff from './pages/Staff';
import Coupons from './pages/CouponsNew';
import Launchpad from './pages/Launchpad';
import Login from './pages/Login';
import EmailLogs from './pages/EmailLogs';
import ActivityLog from './pages/ActivityLog';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import EmailTemplates from './pages/EmailTemplates';
import InternalTools from './pages/InternalTools';
import BlogList from './pages/blog/BlogList';
import BlogEdit from './pages/blog/BlogEdit';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ExplainModeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={
                <AuthGuard>
                  <div className="min-h-screen bg-background text-foreground flex">
                    <Sidebar />
                    <main className="flex-1 bg-foreground/[0.01]">
                      <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/launchpad" element={<Launchpad />} />
                    <Route path="/customers/*" element={<Customers />} />
                    <Route path="/billing/*" element={<BillingRouter />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/tickets/*" element={<Tickets />} />
                    <Route path="/services/*" element={<Services />} />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogEdit />} />
                    <Route path="/products/*" element={<Products />} />
                    <Route path="/forms" element={<ServiceForms />} />
                    <Route path="/jobs" element={<JobQueue />} />
                    <Route path="/email-logs" element={<EmailLogs />} />
                    <Route path="/staff/*" element={<Staff />} />
                    <Route path="/activity" element={<ActivityLog />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/internal-tools" element={<InternalTools />} />
                      </Routes>
                    </main>
                  </div>
                </AuthGuard>
              } />
            </Routes>
          </Router>
        </ExplainModeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
