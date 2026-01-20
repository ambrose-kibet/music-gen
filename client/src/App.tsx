import { BrowserRouter as Router, Routes, Route } from "react-router";
import {
  HomeLayout,
  NotFoundPage,
  AuthPage,
  HomePage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AuthLayout,
  MySongsPage,
  MyAgentsPage,
  MyProfilePage,
  IntegrationsPage,
  CreateAgent,
  AgentsLayout,
  MyAgentPage,
  IntegrationsLayout,
  AudiusIntegrationPage,
  SongPage,
} from "./routes";
import AppProviders from "./providers";
function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="my-songs" element={<MySongsPage />} />
            <Route path="songs/:songId" element={<SongPage />} />
            <Route path="my-agents" element={<AgentsLayout />}>
              <Route index element={<MyAgentsPage />} />
              <Route path="create-agent" element={<CreateAgent />} />
              <Route path=":agentId" element={<MyAgentPage />} />
            </Route>
            <Route path="my-profile" element={<MyProfilePage />} />
            <Route path="integrations" element={<IntegrationsLayout />}>
              <Route index element={<IntegrationsPage />} />
              <Route path="audius" element={<AudiusIntegrationPage />} />
            </Route>
          </Route>
          <Route path="auth" element={<AuthLayout />}>
            <Route index element={<AuthPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;
