import { useEffect, useState } from "react";
import { useAuth } from "@lapor-bot/shared";
import type { EnrichedReport } from "@lapor-bot/shared";
import type { ThemeName } from "@lapor-bot/design-system";
import {
  DashboardPage,
  LoginPage,
  PersonalPage,
  ProfileSetup,
  CommandsPage,
} from "@lapor-bot/ui";

type Page = "dashboard" | "login" | "personal" | "profile-setup" | "commands";

function getInitialTheme(): ThemeName {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function App() {
  const { user: authUser, token, logout } = useAuth();
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);
  const [page, setPage] = useState<Page>(() => {
    // AuthProvider loads the persisted session synchronously from
    // localStorage on first render, so on a page refresh we can decide
    // the initial route right away - keeping the user on their profile
    // instead of bouncing back to the leaderboard.
    if (authUser && token) {
      const isPhoneLike = !authUser.name || /^[\d+]/.test(authUser.name);
      return isPhoneLike ? "profile-setup" : "personal";
    }
    return "dashboard";
  });
  const [personalUser, setPersonalUser] = useState<EnrichedReport | null>(
    authUser && token ? authUser : null,
  );
  const [prevToken, setPrevToken] = useState(token);

  // Sync personalUser with auth state on token change (login / logout).
  // Render-phase adjustment (not an effect) avoids setState-in-effect and
  // re-renders immediately with the derived value.
  if (token !== prevToken) {
    setPrevToken(token);
    if (authUser && token) {
      setPersonalUser(authUser);
    } else {
      setPersonalUser(null);
      if (page === "personal" || page === "profile-setup") {
        setPage("dashboard");
      }
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("lapor-bot-theme", theme);
    } catch {
      // Storage unavailable (private mode) - theme stays un-persisted.
    }
  }, [theme]);

  return (
    <div>
      {page === "commands" && (
        <CommandsPage onBack={() => setPage("dashboard")} />
      )}

      {page === "dashboard" && (
        <DashboardPage
          theme={theme}
          onThemeChange={setTheme}
          onNavigate={(route) => setPage(route)}
          personalUser={personalUser}
        />
      )}

      {page === "login" && (
        <LoginPage
          onLoginSuccess={(user) => {
            setPersonalUser(user);
            const isPhoneLike = !user.name || /^[\d+]/.test(user.name);
            setPage(isPhoneLike ? "profile-setup" : "personal");
          }}
          onBack={() => setPage("dashboard")}
        />
      )}

      {page === "personal" && personalUser && (
        <PersonalPage
          user={personalUser}
          onBack={() => setPage("dashboard")}
          onLogout={() => {
            logout();
            setPersonalUser(null);
            setPage("dashboard");
          }}
          onUserRefresh={(refreshed) => setPersonalUser(refreshed)}
        />
      )}

      {page === "profile-setup" && personalUser && (
        <ProfileSetup
          user={personalUser}
          onComplete={(refreshedUser) => {
            setPersonalUser(refreshedUser);
            setPage("personal");
          }}
          onBack={() => {
            logout();
            setPersonalUser(null);
            setPage("login");
          }}
        />
      )}
    </div>
  );
}

export default App;
