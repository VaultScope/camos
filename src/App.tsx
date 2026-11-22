import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MobileNavProvider, Sidebar } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ExplainModeProvider } from './components/HelpTooltip';
import { routeLoaders } from './lib/routePrefetch';

// Route-split lazy pages for faster initial load and smaller chunks
const Dashboard = lazy(routeLoaders.dashboard);
const Customers = lazy(routeLoaders.customers);
const BillingRouter = lazy(routeLoaders.billing);
const Tickets = lazy(routeLoaders.tickets);
const Services = lazy(routeLoaders.services);
const Products = lazy(routeLoaders.products);
const ServiceForms = lazy(routeLoaders.forms);
const JobQueue = lazy(routeLoaders.jobs);
const Staff = lazy(routeLoaders.staff);
const Coupons = lazy(routeLoaders.coupons);
const Partners = lazy(routeLoaders.partners);
const Launchpad = lazy(routeLoaders.launchpad);
const Login = lazy(routeLoaders.login);
const EmailLogs = lazy(routeLoaders.emailLogs);
const ActivityLog = lazy(routeLoaders.activity);
const Notifications = lazy(routeLoaders.notifications);
const Settings = lazy(routeLoaders.settings);
const Reports = lazy(routeLoaders.reports);
const EmailTemplates = lazy(routeLoaders.emailTemplates);
const InternalTools = lazy(routeLoaders.internalTools);
const BlogList = lazy(routeLoaders.blogList);
const BlogEdit = lazy(routeLoaders.blogEdit);

function RouteSkeleton() {
  return (
    <div className="lg:ml-64 min-h-dvh flex flex-col animate-ui-fade">
      <div className="h-14 border-b border-border bg-background/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="h-4 w-36 rounded-full bg-foreground/[0.06] animate-pulse" />
        <div className="h-8 w-32 rounded-xl bg-foreground/[0.06] animate-pulse" />
      </div>
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 max-w-[1600px] w-full mx-auto space-y-5">
        <div className="h-7 w-48 rounded-xl bg-foreground/[0.06] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card animate-pulse" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ExplainModeProvider>
          <Router>
            <Routes>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<LoginSkeleton />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <AuthGuard>
                    <MobileNavProvider>
                      <div className="min-h-dvh bg-background text-foreground flex">
                        <Sidebar />
                        <main className="flex-1 min-w-0 bg-foreground/[0.015]">
                          <Suspense fallback={<RouteSkeleton />}>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/launchpad" element={<Launchpad />} />
                              <Route path="/customers/*" element={<Customers />} />
                              <Route path="/billing/*" element={<BillingRouter />} />
                              <Route path="/coupons" element={<Coupons />} />
                              <Route path="/partners" element={<Partners />} />
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
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </Suspense>
                        </main>
                      </div>
                    </MobileNavProvider>
                  </AuthGuard>
                }
              />
            </Routes>
          </Router>
        </ExplainModeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
