(function () {
  const SESSION_KEY = "meld.cloud.session";
  const config = window.MELD_CLOUD_CONFIG || {};
  const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const anonKey = String(config.supabaseAnonKey || "");

  function configured() {
    return Boolean(
      baseUrl.startsWith("https://") &&
        anonKey.length > 20 &&
        !baseUrl.includes("YOUR_") &&
        !anonKey.includes("YOUR_")
    );
  }

  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeSession(session) {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // The in-memory session still works for the current page.
    }
  }

  function normalizeSession(data) {
    if (!data?.access_token || !data?.user) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || "",
      expires_at: Date.now() + Math.max(30, Number(data.expires_in) || 3600) * 1000,
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
    };
  }

  async function parseResponse(response) {
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!response.ok) {
      const message =
        data?.msg ||
        data?.message ||
        data?.error_description ||
        data?.error ||
        `云端请求失败 (${response.status})`;
      throw new Error(message);
    }
    return data;
  }

  function authHeaders(token) {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      "Content-Type": "application/json",
    };
  }

  async function authRequest(path, options = {}) {
    if (!configured()) throw new Error("尚未配置 Supabase");
    return parseResponse(
      await fetch(`${baseUrl}/auth/v1${path}`, {
        ...options,
        headers: {
          ...authHeaders(),
          ...(options.headers || {}),
        },
      })
    );
  }

  async function signIn(email, password) {
    const data = await authRequest("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const session = normalizeSession(data);
    if (!session) throw new Error("登录响应中没有有效会话");
    writeSession(session);
    return session;
  }

  async function signUp(email, password) {
    const data = await authRequest("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const session = normalizeSession(data);
    if (session) writeSession(session);
    return { session, needsConfirmation: !session, user: data.user };
  }

  async function refreshSession(session) {
    if (!session?.refresh_token) return null;
    const data = await authRequest("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const refreshed = normalizeSession(data);
    if (refreshed) writeSession(refreshed);
    return refreshed;
  }

  async function restoreSession() {
    let session = readSession();
    if (!session) return null;
    if (session.expires_at && session.expires_at < Date.now() + 60_000) {
      try {
        session = await refreshSession(session);
      } catch {
        session = null;
      }
    }
    if (!session) writeSession(null);
    return session;
  }

  async function signOut() {
    const session = readSession();
    writeSession(null);
    if (!configured() || !session?.access_token) return;
    try {
      await fetch(`${baseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: authHeaders(session.access_token),
      });
    } catch {
      // Local session is already removed.
    }
  }

  async function restRequest(path, options = {}, session = readSession()) {
    if (!configured()) throw new Error("尚未配置 Supabase");
    if (!session?.access_token) throw new Error("请先登录云端账户");
    return parseResponse(
      await fetch(`${baseUrl}/rest/v1${path}`, {
        ...options,
        headers: {
          ...authHeaders(session.access_token),
          ...(options.headers || {}),
        },
      })
    );
  }

  async function fetchProjects() {
    const rows = await restRequest("/projects?select=payload&order=updated_at.desc");
    return (Array.isArray(rows) ? rows : [])
      .map((row) => row.payload)
      .filter((project) => project?.id);
  }

  async function upsertProjects(projects, session = readSession()) {
    if (!projects.length) return [];
    const rows = projects.map((project) => ({
      id: project.id,
      user_id: session.user.id,
      payload: project,
      updated_at: new Date(project.updatedAt || Date.now()).toISOString(),
    }));
    return restRequest(
      "/projects?on_conflict=id",
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(rows),
      },
      session
    );
  }

  async function deleteProject(id) {
    if (!id) return [];
    return restRequest(`/projects?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }

  async function fetchPatches() {
    const rows = await restRequest("/patches?select=payload&order=updated_at.desc");
    return (Array.isArray(rows) ? rows : [])
      .map((row) => row.payload)
      .filter((patch) => patch?.id);
  }

  async function upsertPatches(patches, session = readSession()) {
    if (!patches.length) return [];
    const rows = patches.map((patch) => ({
      id: patch.id,
      user_id: session.user.id,
      payload: patch,
      updated_at: new Date(patch.createdAt || Date.now()).toISOString(),
    }));
    return restRequest(
      "/patches?on_conflict=id",
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(rows),
      },
      session
    );
  }

  async function deletePatch(id) {
    if (!id) return [];
    return restRequest(`/patches?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }

  window.MeldCloud = {
    configured,
    signIn,
    signUp,
    restoreSession,
    signOut,
    fetchProjects,
    upsertProjects,
    deleteProject,
    fetchPatches,
    upsertPatches,
    deletePatch,
  };
})();
