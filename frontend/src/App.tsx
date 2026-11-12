import React, { useState } from "react";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { AuthView } from "./features/auth/AuthView";
import { Navbar } from "./components/Navbar";
import type { NavTab } from "./components/Navbar";
import { DashboardView } from "./features/dashboard/DashboardView";
import { PersonalTasksView } from "./features/personal-tasks/PersonalTasksView";

const MainApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        Loading application...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc" }}>
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />
      <main>
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "personal" && <PersonalTasksView />}
        {activeTab === "projects" && (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
            Projects Component Loading...
          </div>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
