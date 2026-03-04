"use client";

import { useCallback, useEffect, useState } from "react";
import { PixelHuman } from "@/components/WalkingCharacters";
import {
  deriveCharacterColors,
  HAIRSTYLE_LABELS,
  ACCESSORY_LABELS,
  type CharacterStyle,
  type HairStyle,
  type Accessory,
} from "@/lib/colors";

type PendingChar = {
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

function CharCard({
  char,
  onAction,
}: {
  char: PendingChar;
  onAction: (id: string, action: "approve" | "reject") => void;
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
          style={char.style as CharacterStyle}
          hairStyle={char.hairStyle as HairStyle}
          accessory={char.accessory as Accessory}
        />
      </div>

      <div className="admin-card__info">
        <h3 className="admin-card__name">{char.name}</h3>
        <p className="admin-card__detail">
          {char.style === "feminino" ? "Feminino" : "Masculino"} &middot;{" "}
          {HAIRSTYLE_LABELS[char.hairStyle as HairStyle] || char.hairStyle} &middot;{" "}
          {ACCESSORY_LABELS[char.accessory as Accessory] || char.accessory}
        </p>
        <p className="admin-card__date">{dateStr}</p>
      </div>

      <div className="admin-card__actions">
        <button
          className="btn btn--approve"
          disabled={acting}
          onClick={() => {
            setActing(true);
            onAction(char.id, "approve");
          }}
        >
          Aprovar
        </button>
        <button
          className="btn btn--danger"
          disabled={acting}
          onClick={() => {
            setActing(true);
            onAction(char.id, "reject");
          }}
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [pending, setPending] = useState<PendingChar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* restore secret from sessionStorage */
  useEffect(() => {
    const stored = sessionStorage.getItem("admin-secret");
    if (stored) setSecret(stored);
  }, []);

  const fetchPending = useCallback(async (token: string) => {
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
        return;
      }
      const data = await res.json();
      setPending(data.pending || []);
    } catch {
      setError("Erro ao carregar personagens");
    } finally {
      setLoading(false);
    }
  }, []);

  /* auto-fetch when secret is set */
  useEffect(() => {
    if (secret) fetchPending(secret);
  }, [secret, fetchPending]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputSecret.trim()) return;
    const token = inputSecret.trim();
    sessionStorage.setItem("admin-secret", token);
    setSecret(token);
    setInputSecret("");
  }

  async function handleAction(clientId: string, action: "approve" | "reject") {
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
        /* remove from local list */
        setPending((prev) => prev.filter((c) => c.id !== clientId));
      }
    } catch {
      /* silently ignore */
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-secret");
    setSecret("");
    setPending([]);
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

  /* ── logged in ── */
  return (
    <main className="page-wrap">
      <div className="panel">
        <div className="panel__head">
          <h1>Personagens Pendentes ({pending.length})</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="chip chip--link"
              onClick={() => fetchPending(secret)}
              disabled={loading}
            >
              {loading ? "..." : "Atualizar"}
            </button>
            <button className="chip" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {error && <p className="admin-login__error">{error}</p>}

        {pending.length === 0 && !loading && (
          <p className="helper-text">Nenhum personagem pendente.</p>
        )}

        <div className="admin-grid">
          {pending.map((char) => (
            <CharCard key={char.id} char={char} onAction={handleAction} />
          ))}
        </div>
      </div>
    </main>
  );
}
