"use client";

import { useEffect, useState } from "react";
import { PixelHuman } from "./WalkingCharacters";
import {
  deriveCharacterColors,
  SKIN_PRESETS,
  HAIR_PRESETS,
  EYE_PRESETS,
  SHIRT_PRESETS,
  PANTS_PRESETS,
  VALID_HAIRSTYLES,
  HAIRSTYLE_LABELS,
  VALID_ACCESSORIES,
  ACCESSORY_LABELS,
  type HairStyle,
  type Accessory,
} from "@/lib/colors";

function getClientId(): string {
  const KEY = "tinatown-char-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function SwatchRow({
  label,
  presets,
  value,
  onChange,
}: {
  label: string;
  presets: string[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="char-builder__field">
      <label className="char-builder__label">{label}</label>
      <div className="char-builder__swatches">
        {presets.map((color) => (
          <button
            key={color}
            className={`char-builder__swatch${
              color === value ? " char-builder__swatch--active" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={color}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

function OptionRow<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="char-builder__field">
      <label className="char-builder__label">{label}</label>
      <div className="char-builder__style-selector">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`char-builder__style-btn${opt === value ? " char-builder__style-btn--active" : ""}`}
            onClick={() => onChange(opt)}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

type Status = "idle" | "saving" | "saved" | "error";

export function CharacterBuilder() {
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [hairStyle, setHairStyle] = useState<HairStyle>("longo");
  const [accessory, setAccessory] = useState<Accessory>("nenhum");
  const [skin, setSkin] = useState(SKIN_PRESETS[0]);
  const [hair, setHair] = useState(HAIR_PRESETS[0]);
  const [eye, setEye] = useState(EYE_PRESETS[0]);
  const [shirt, setShirt] = useState(SHIRT_PRESETS[0]);
  const [pants, setPants] = useState(PANTS_PRESETS[0]);
  const [isEdit, setIsEdit] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [frame, setFrame] = useState<0 | 1>(0);
  const [loaded, setLoaded] = useState(false);

  const markDirty = () => { if (status === "saved") setStatus("idle"); };

  /* walk animation for preview */
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 200);
    return () => clearInterval(t);
  }, []);

  /* load clientId and check for existing character */
  useEffect(() => {
    const id = getClientId();
    setClientId(id);

    fetch(`/api/characters?clientId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mine = (data.characters || []).find((c: any) => c.id === id);
        if (mine) {
          setName(mine.name);
          setHairStyle(mine.hairStyle || "longo");
          setAccessory(mine.accessory || "nenhum");
          setSkin(mine.skin);
          setHair(mine.hair);
          setEye(mine.eye || EYE_PRESETS[0]);
          setShirt(mine.shirt);
          setPants(mine.pants);
          setIsEdit(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const colors = deriveCharacterColors({ skin, hair, shirt, pants, eye });

  async function handleSubmit() {
    if (!name.trim() || name.trim().length > 12) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          name: name.trim(),
          style: "feminino",
          hairStyle,
          accessory,
          skin,
          hair,
          eye,
          shirt,
          pants,
        }),
      });
      if (res.ok) {
        setStatus("saved");
        setIsEdit(true);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch("/api/characters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        setName("");
        setHairStyle("longo");
        setAccessory("nenhum");
        setSkin(SKIN_PRESETS[0]);
        setHair(HAIR_PRESETS[0]);
        setEye(EYE_PRESETS[0]);
        setShirt(SHIRT_PRESETS[0]);
        setPants(PANTS_PRESETS[0]);
        setIsEdit(false);
        setStatus("idle");
      }
    } catch {
      /* silently ignore */
    }
  }

  if (!loaded) {
    return <p className="helper-text">Carregando...</p>;
  }

  const canSave = name.trim().length >= 1 && name.trim().length <= 12;

  return (
    <div className="char-builder">
      {/* ── preview panel ── */}
      <div className="char-builder__preview">
        <div className="char-builder__sprite">
          <PixelHuman
            frame={frame}
            colors={colors}
            style="feminino"
            hairStyle={hairStyle}
            accessory={accessory}
          />
        </div>
        <span className="char-builder__preview-name">
          {name.trim() || "..."}
        </span>
      </div>

      {/* ── form ── */}
      <div className="char-builder__form">
        {/* name */}
        <div className="char-builder__field">
          <label className="char-builder__label" htmlFor="char-name">
            Nome
          </label>
          <input
            id="char-name"
            type="text"
            className="char-builder__input"
            value={name}
            onChange={(e) => { setName(e.target.value); markDirty(); }}
            maxLength={12}
            placeholder="Seu nome"
          />
        </div>

        <SwatchRow label="Pele" presets={SKIN_PRESETS} value={skin} onChange={(c) => { setSkin(c); markDirty(); }} />
        <SwatchRow label="Olhos" presets={EYE_PRESETS} value={eye} onChange={(c) => { setEye(c); markDirty(); }} />

        {/* hair style */}
        <OptionRow
          label="Cabelo"
          options={VALID_HAIRSTYLES}
          labels={HAIRSTYLE_LABELS}
          value={hairStyle}
          onChange={(v) => { setHairStyle(v); markDirty(); }}
        />
        <SwatchRow label="Cor do Cabelo" presets={HAIR_PRESETS} value={hair} onChange={(c) => { setHair(c); markDirty(); }} />

        <SwatchRow label="Camisa" presets={SHIRT_PRESETS} value={shirt} onChange={(c) => { setShirt(c); markDirty(); }} />
        <SwatchRow label="Calca" presets={PANTS_PRESETS} value={pants} onChange={(c) => { setPants(c); markDirty(); }} />

        {/* accessory */}
        <OptionRow
          label="Acessorio"
          options={VALID_ACCESSORIES}
          labels={ACCESSORY_LABELS}
          value={accessory}
          onChange={(v) => { setAccessory(v); markDirty(); }}
        />

        <div className="char-builder__actions">
          <button
            className="chip chip--link char-builder__btn"
            onClick={handleSubmit}
            disabled={!canSave || status === "saving"}
          >
            {status === "saving"
              ? "Salvando..."
              : isEdit
                ? "Atualizar Personagem"
                : "Criar Personagem"}
          </button>

          {isEdit && (
            <button
              className="chip char-builder__btn char-builder__btn--danger"
              onClick={handleDelete}
              type="button"
            >
              Excluir
            </button>
          )}
        </div>

        {status === "saved" && (
          <p className="char-builder__status">
            ✓ Personagem enviado para aprovacao!
          </p>
        )}
        {status === "error" && (
          <p className="char-builder__status char-builder__status--error">
            Servico indisponivel no momento. Tente novamente mais tarde.
          </p>
        )}
      </div>
    </div>
  );
}
