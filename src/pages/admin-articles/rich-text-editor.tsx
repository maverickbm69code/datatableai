import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  AlertTriangle,
  BarChart3,
  Bold,
  Heading2,
  Heading3,
  Info,
  Italic,
  LayoutGrid,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Table2,
  Undo2,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ArticleContent } from "@/lib/articles/types";
import { cn } from "@/lib/utils";

import "./editor.css";
import { BarChart, Callout, KeyFigure, KeyFigures } from "./extensions";

type ChartData = { title: string; unit: string; data: { label: string; value: number }[] };

function parseRows(text: string): { rows: ChartData["data"]; error?: string } {
  const rows: ChartData["data"] = [];
  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const [label, raw] = line.split(";").map((part) => part.trim());
    const value = Number((raw ?? "").replace(",", ".").replace(/\s/g, ""));
    if (!label || raw === undefined || raw === "" || !Number.isFinite(value)) {
      return { rows, error: `Ligne invalide : « ${line} ». Format attendu : libellé ; valeur` };
    }
    rows.push({ label, value });
  }
  if (rows.length === 0) return { rows, error: "Ajoutez au moins une ligne." };
  if (rows.length > 12) return { rows, error: "12 lignes maximum." };
  return { rows };
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] text-foreground transition-colors hover:bg-muted disabled:opacity-40",
        active && "bg-primary/15 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;
}

function Toolbar({ editor, onChart }: { editor: Editor; onChart: () => void }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  // Re-render the toolbar when the selection or the content changes.
  useEditorState({
    editor,
    selector: ({ editor: e }) => ({ s: e.state.selection.from, t: e.state.selection.to, d: e.state.doc.content.size }),
  });

  const chain = () => editor.chain().focus();
  const inTable = editor.isActive("table");

  function openLink() {
    setHref((editor.getAttributes("link").href as string | undefined) ?? "https://");
    setLinkOpen(true);
  }

  function applyLink() {
    const value = href.trim();
    if (!value || value === "https://") chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: value }).run();
    setLinkOpen(false);
  }

  return (
    <div className="border-b border-border bg-muted/30 p-2" role="toolbar" aria-label="Mise en forme">
      <div className="flex flex-wrap items-center gap-0.5">
        <ToolButton label="Annuler" onClick={() => chain().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Rétablir" onClick={() => chain().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolButton>
        <Separator />
        <ToolButton label="Titre de niveau 2" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Titre de niveau 3" active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <Separator />
        <ToolButton label="Gras" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Italique" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Lien" active={editor.isActive("link")} onClick={openLink}>
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <Separator />
        <ToolButton label="Liste à puces" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Citation" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Séparateur" onClick={() => chain().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolButton>
        <Separator />
        <ToolButton label="Encadré conseil" active={editor.isActive("callout", { variant: "conseil" })} onClick={() => toggleCallout(editor, "conseil")}>
          <Lightbulb className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Encadré attention" active={editor.isActive("callout", { variant: "attention" })} onClick={() => toggleCallout(editor, "attention")}>
          <AlertTriangle className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Encadré info" active={editor.isActive("callout", { variant: "info" })} onClick={() => toggleCallout(editor, "info")}>
          <Info className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Bloc de chiffres clés (3)"
          onClick={() =>
            chain()
              .insertContent({
                type: "keyFigures",
                content: [0, 1, 2].map(() => ({
                  type: "keyFigure",
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "00" }] },
                    { type: "paragraph", content: [{ type: "text", text: "Libellé du chiffre clé" }] },
                  ],
                })),
              })
              .run()
          }
        >
          <LayoutGrid className="h-4 w-4" />
        </ToolButton>
        <ToolButton label={editor.isActive("barChart") ? "Modifier le graphique" : "Insérer un graphique"} active={editor.isActive("barChart")} onClick={onChart}>
          <BarChart3 className="h-4 w-4" />
        </ToolButton>
        <Separator />
        <ToolButton label="Insérer un tableau" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <Table2 className="h-4 w-4" />
        </ToolButton>
      </div>

      {inTable ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-border pt-2 text-[12px]">
          <span className="mr-1 font-mono uppercase tracking-[0.12em] text-muted-foreground">Tableau</span>
          {[
            ["Colonne avant", () => chain().addColumnBefore().run()],
            ["Colonne après", () => chain().addColumnAfter().run()],
            ["Supprimer la colonne", () => chain().deleteColumn().run()],
            ["Ligne avant", () => chain().addRowBefore().run()],
            ["Ligne après", () => chain().addRowAfter().run()],
            ["Supprimer la ligne", () => chain().deleteRow().run()],
            ["Ligne d'en-tête", () => chain().toggleHeaderRow().run()],
            ["Supprimer le tableau", () => chain().deleteTable().run()],
          ].map(([label, run]) => (
            <button
              key={label as string}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={run as () => void}
              className="rounded-md border border-border px-2 py-1 text-foreground transition-colors hover:bg-muted"
            >
              {label as string}
            </button>
          ))}
        </div>
      ) : null}

      {linkOpen ? (
        <form
          className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
        >
          <Input
            aria-label="Adresse du lien"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://… ou /ressources/mon-article"
            className="h-9 max-w-md flex-1"
            autoFocus
          />
          <Button type="submit" size="sm">Appliquer</Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setLinkOpen(false)}>Annuler</Button>
        </form>
      ) : null}
    </div>
  );
}

function toggleCallout(editor: Editor, variant: string) {
  const chain = editor.chain().focus();
  if (editor.isActive("callout", { variant })) chain.lift("callout").run();
  else if (editor.isActive("callout")) chain.updateAttributes("callout", { variant }).run();
  else chain.wrapIn("callout", { variant }).run();
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: ArticleContent;
  onChange: (doc: ArticleContent) => void;
}) {
  const [chartOpen, setChartOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartUnit, setChartUnit] = useState("");
  const [chartText, setChartText] = useState("");
  const [chartError, setChartError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: { openOnClick: false, autolink: false },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      KeyFigures,
      KeyFigure,
      BarChart,
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as ArticleContent),
    editorProps: {
      attributes: { "aria-label": "Contenu de l'article", role: "textbox", "aria-multiline": "true" },
    },
  });

  if (!editor) return null;

  function openChart() {
    const current = editor!.isActive("barChart") ? (editor!.getAttributes("barChart") as ChartData) : null;
    setChartTitle(current?.title ?? "");
    setChartUnit(current?.unit ?? "");
    setChartText((current?.data ?? []).map((row) => `${row.label} ; ${row.value}`).join("\n"));
    setChartError(null);
    setChartOpen(true);
  }

  function saveChart() {
    const { rows, error } = parseRows(chartText);
    if (error) {
      setChartError(error);
      return;
    }
    const attrs: ChartData = { title: chartTitle.trim(), unit: chartUnit.trim(), data: rows };
    if (editor!.isActive("barChart")) editor!.chain().focus().updateAttributes("barChart", attrs).run();
    else editor!.chain().focus().insertContent({ type: "barChart", attrs }).run();
    setChartOpen(false);
  }

  return (
    <div className="dt-editor overflow-hidden rounded-xl border border-border bg-card">
      <Toolbar editor={editor} onChart={openChart} />
      <EditorContent editor={editor} />

      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Graphique en barres</DialogTitle>
            <DialogDescription>
              Une ligne par barre, au format « libellé ; valeur ». Utilisez uniquement des chiffres réels et sourcés.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input aria-label="Titre du graphique" placeholder="Titre du graphique" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} maxLength={120} />
            <Input aria-label="Unité" placeholder="Unité (%, €, …)" value={chartUnit} onChange={(e) => setChartUnit(e.target.value)} maxLength={12} />
            <Textarea
              aria-label="Données du graphique"
              rows={7}
              value={chartText}
              onChange={(e) => setChartText(e.target.value)}
              placeholder={"Entrées ; 12\nPlats ; 38\nDesserts ; 9"}
            />
            {chartError ? <p role="alert" className="text-[13px] text-destructive">{chartError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setChartOpen(false)}>Annuler</Button>
            <Button onClick={saveChart}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
