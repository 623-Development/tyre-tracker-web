import { ClerkProvider, RedirectToSignIn, useAuth } from "@clerk/react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthInterceptor } from "@/lib/auth-interceptor";
import Layout from "@/components/layout";
import SignInPage from "@/pages/sign-in";
import DashboardPage from "@/pages/dashboard";
import SessionsPage from "@/pages/sessions";
import SessionDetailPage from "@/pages/session-detail";
import CarsPage from "@/pages/cars";
import CompoundsPage from "@/pages/compounds";
import SetupsPage from "@/pages/setups";
import SettingsPage from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoutes() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f]">
        <div className="w-6 h-6 border-2 border-[#ef3e36] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/sessions" component={SessionsPage} />
        <Route path="/sessions/:id" component={SessionDetailPage} />
        <Route path="/cars" component={CarsPage} />
        <Route path="/compounds" component={CompoundsPage} />
        <Route path="/setups" component={SetupsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={() => <Redirect to="/dashboard" />} />
      </Switch>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignInPage} />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <AuthInterceptor />
        <WouterRouter base={base}>
          <AppRoutes />
        </WouterRouter>
        <Toaster theme="dark" position="bottom-right" richColors />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
