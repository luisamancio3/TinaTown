"use client";

import { useCallback, useEffect, useState } from "react";
import { PixelHuman } from "@/components/WalkingCharacters";
import {
  deriveCharacterColors,
  HAIRSTYLE_LABELS,
  ACCESSORY_LABELS,
  type HairStyle,
  type Accessory,
} from "@/lib/colors";

type CharEntry = {
  id: string;
  name: string;
  style: string;
  hairStyle: string;
  accessory: string;
  skin: string;
  hair: string;
  eye: string;
  shirt: string;
  pants: string;
  createdAt: number;
};

type CardAction = "approve" | "reject" | "remove";

function CharCard({
  char,
  actions,
  onAction,
}: {
  char: CharEntry;
  actions: { label: string; action: CardAction; className: string }[];
  onAction: (id: string, action: CardAction) => void;
}) {
  const [frame, setFrame] = useState<0 | 1>(0);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 200);
    return () => clearInterval(t);
  }, []);

  const colors = deriveCharacterColors({
    skin: char.skin,
    hair: char.hair,
    shirt: char.shirt,
    pants: char.pants,
    eye: char.eye,
  });

  const date = new Date(char.createdAt);
  const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;

  return (
    <div className="admin-card">
      <div className="admin-card__sprite">
        <PixelHuman
          frame={frame}
          colors={colors}
          style="feminino"
          hairStyle={char.hairStyle as HairStyle}
          accessory={char.accessory as Accessory}
        />
      </div>

      <div className="admin-card__info">
        <h3 className="admin-card__name">{char.name}</h3>
        <p className="admin-card__detail">
          {HAIRSTYLE_LABELS[char.hairStyle as HairStyle] || char.hairStyle} &middot;{" "}
          {ACCESSORY_LABELS[char.accessory as Accessory] || char.accessory}
        </p>
        <p className="admin-card__date">{dateStr}</p>
      </div>

      <div className="admin-card__actions">
        {actions.map((a) => (
          <button
            key={a.action}
            className={a.className}
            disabled={acting}
            onClick={() => {
              setActing(true);
              onAction(char.id, a.action);
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Tab = "pending" | "approved";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [pending, setPending] = useState<CharEntry[]>([]);
  const [approved, setApproved] = useState<CharEntry[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);

  /* restore secret from sessionStorage */
  useEffect(() => {
    const stored = sessionStorage.getItem("admin-secret");
    if (stored) setSecret(stored);
  }, []);

  const fetchAll = useCallback(async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/characters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setError("Senha incorreta");
        setSecret("");
        sessionStorage.removeItem("admin-secret");
        setPending([]);
        setApproved([]);
        return;
      }
      const data = await res.json();
      setPending(data.pending || []);
      setApproved(data.approved || []);
    } catch {
      setError("Erro ao carregar personagens");
    } finally {
      setLoading(false);
    }
  }, []);

  /* auto-fetch when secret is set */
  useEffect(() => {
    if (secret) fetchAll(secret);
  }, [secret, fetchAll]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputSecret.trim()) return;
    const token = inputSecret.trim();
    sessionStorage.setItem("admin-secret", token);
    setSecret(token);
    setInputSecret("");
  }

  async function handleAction(clientId: string, action: CardAction) {
    try {
      const res = await fetch("/api/admin/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ clientId, action }),
      });

      if (res.ok) {
        if (action === "approve") {
          const char = pending.find((c) => c.id === clientId);
          setPending((prev) => prev.filter((c) => c.id !== clientId));
          if (char) setApproved((prev) => [char, ...prev]);
        } else if (action === "reject") {
          setPending((prev) => prev.filter((c) => c.id !== clientId));
        } else if (action === "remove") {
          setApproved((prev) => prev.filter((c) => c.id !== clientId));
        }
      }
    } catch {
      /* silently ignore */
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-secret");
    setSecret("");
    setPending([]);
    setApproved([]);
  }

  async function handleExport() {
    setBackupBusy(true);
    setBackupMsg("");
    try {
      const res = await fetch("/api/admin/backup", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) {
        setBackupMsg("Erro ao exportar backup");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tinatown-personagens-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg("Backup exportado");
    } catch {
      setBackupMsg("Erro ao exportar backup");
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleBackupAction(
    action: "backup-now" | "restore-github" | "restore-archive",
  ) {
    setBackupBusy(true);
    setBackupMsg("");
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setBackupMsg(data.reason || data.error || "Erro na operacao");
        return;
      }
      if (action === "backup-now") {
        setBackupMsg("Backup salvo no GitHub");
      } else {
        setBackupMsg(`Restaurados: ${data.restored ?? 0} personagens`);
        fetchAll(secret);
      }
    } catch {
      setBackupMsg("Erro na operacao");
    } finally {
      setBackupBusy(false);
    }
  }

  /* ── not logged in ── */
  if (!secret) {
    return (
      <main className="page-wrap">
        <div className="panel admin-login">
          <h1>Admin</h1>
          <p className="admin-login__hint">
            Digite a senha de administrador para continuar.
          </p>
          <form onSubmit={handleLogin} className="admin-login__form">
            <input
              type="password"
              value={inputSecret}
              onChange={(e) => setInputSecret(e.target.value)}
              placeholder="Senha"
              autoFocus
            />
            <button type="submit" className="btn btn--primary">
              Entrar
            </button>
          </form>
          {error && <p className="admin-login__error">{error}</p>}
        </div>
      </main>
    );
  }

  const list = tab === "pending" ? pending : approved;

  /* ── logged in ── */
  return (
    <main className="page-wrap">
      <div className="panel">
        <div className="panel__head">
          <h1>Admin</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="chip chip--link"
              onClick={() => fetchAll(secret)}
              disabled={loading}
            >
              {loading ? "..." : "Atualizar"}
            </button>
            <button className="chip" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${tab === "pending" ? " admin-tab--active" : ""}`}
            onClick={() => setTab("pending")}
          >
            Pendentes ({pending.length})
          </button>
          <button
            className={`admin-tab${tab === "approved" ? " admin-tab--active" : ""}`}
            onClick={() => setTab("approved")}
          >
            Aprovados ({approved.length})
          </button>
        </div>

        {/* backup toolbar */}
        <div className="admin-backup">
          <span className="clips-filters__label">Backup</span>
          <button className="chip chip--filter" disabled={backupBusy} onClick={handleExport}>
            Exportar JSON
          </button>
          <button
            className="chip chip--filter"
            disabled={backupBusy}
            onClick={() => handleBackupAction("backup-now")}
          >
            Salvar no GitHub
          </button>
          <button
            className="chip chip--filter"
            disabled={backupBusy}
            onClick={() => handleBackupAction("restore-github")}
          >
            Restaurar do GitHub
          </button>
          <button
            className="chip chip--filter"
            disabled={backupBusy}
            onClick={() => handleBackupAction("restore-archive")}
          >
            Republicar arquivados
          </button>
          {backupMsg && <span className="admin-backup__msg">{backupMsg}</span>}
        </div>

        {error && <p className="admin-login__error">{error}</p>}

        {list.length === 0 && !loading && (
          <p className="helper-text">
            {tab === "pending"
              ? "Nenhum personagem pendente."
              : "Nenhum personagem aprovado."}
          </p>
        )}

        <div className="admin-grid">
          {list.map((char) => (
            <CharCard
              key={char.id}
              char={char}
              actions={
                tab === "pending"
                  ? [
                      { label: "Aprovar", action: "approve", className: "btn btn--approve" },
                      { label: "Rejeitar", action: "reject", className: "btn btn--danger" },
                    ]
                  : [
                      { label: "Remover", action: "remove", className: "btn btn--danger" },
                    ]
              }
              onAction={handleAction}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
