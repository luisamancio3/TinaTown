import dynamic from "next/dynamic";

const CharacterBuilder = dynamic(
  () =>
    import("@/components/CharacterBuilder").then((m) => m.CharacterBuilder),
  { ssr: false }
);

export default function PersonagemPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <span className="hero__badge">PERSONAGEM</span>
        <h1>Crie seu Personagem</h1>
        <p>Monte seu avatar pixel art e caminhe com a turma.</p>
      </section>
      <section className="panel">
        <div className="panel__head">
          <h2>Editor</h2>
        </div>
        <CharacterBuilder />
      </section>
    </main>
  );
}
