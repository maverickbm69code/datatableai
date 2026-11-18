// « Gestion des articles » : list and editor of the « Ressources & Conseils » section.
// Rendered inside the existing admin (same login, same session token). Every operation goes
// through the `admin-articles` backend function, which re-checks the admin session.
import { Eye, FilePlus2, Loader2, Pencil, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ArticleContentView } from "@/components/resources/article-content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminDeleteArticle,
  adminGetArticle,
  adminListArticles,
  adminPublishArticle,
  adminSaveArticle,
  adminUnpublishArticle,
  type RebuildStatus,
} from "@/lib/articles/api";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  DEFAULT_ICON_BY_CATEGORY,
  ICONS,
  ICON_KEYS,
  type CategoryKey,
} from "@/lib/articles/categories";
import { readingMinutes, slugify } from "@/lib/articles/content";
import { formatArticleDate } from "@/lib/articles/format";
import type { AdminArticleRow, ArticleContent, ArticleDraftInput } from "@/lib/articles/types";
import { LangOverride, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { RichTextEditor } from "./rich-text-editor";

const EMPTY_DOC: ArticleContent = { type: "doc", content: [{ type: "paragraph" }] };

type Form = {
  id?: string;
  status: "draft" | "published";
  slug: string;
  slugTouched: boolean;
  lang: Lang;
  category: CategoryKey;
  icon: string;
  title: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  author_name: string;
  author_role: string;
  translation_of: string;
  mark_modified: boolean;
  content: ArticleContent;
};

const NEW_FORM: Form = {
  status: "draft",
  slug: "",
  slugTouched: false,
  lang: "fr",
  category: "rentabilite",
  icon: "",
  title: "",
  excerpt: "",
  seo_title: "",
  seo_description: "",
  author_name: "Maverick Bouillot",
  author_role: "",
  translation_of: "",
  mark_modified: false,
  content: EMPTY_DOC,
};

const REBUILD_MESSAGES: Record<RebuildStatus, string> = {
  triggered: "Mise à jour du site lancée : la page publique sera à jour dans quelques minutes.",
  not_configured:
    "Aucun déploiement automatique n'est configuré (secret NETLIFY_BUILD_HOOK_URL absent) : le changement sera visible au prochain déploiement du site.",
  failed: "L'enregistrement a réussi mais le déploiement automatique a échoué : relancez un déploiement depuis Netlify.",
  not_needed: "",
};

const labelClass = "mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-[14.5px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = { token: string; onExpired: () => void };

export default function ArticleManager({ token, onExpired }: Props) {
  const [rows, setRows] = useState<AdminArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handle = useCallback(
    (result: { ok: boolean; error?: string; expired?: boolean }) => {
      if (result.expired) {
        onExpired();
        return false;
      }
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error ?? "Opération impossible pour le moment." });
        return false;
      }
      return true;
    },
    [onExpired],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await adminListArticles(token);
    setLoading(false);
    if (handle(result)) setRows(result.articles ?? []);
  }, [token, handle]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const minutes = useMemo(() => (form ? readingMinutes(form.content) : 0), [form]);
  const translationChoices = useMemo(
    () => rows.filter((row) => row.id !== form?.id && row.lang !== form?.lang),
    [rows, form?.id, form?.lang],
  );

  function update(patch: Partial<Form>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setMessage(null);
  }

  async function openArticle(id: string) {
    setBusy(true);
    setMessage(null);
    const result = await adminGetArticle(token, id);
    setBusy(false);
    if (!handle(result) || !result.article) return;
    const a = result.article;
    setPreview(false);
    setForm({
      id: a.id,
      status: a.status,
      slug: a.slug,
      slugTouched: true,
      lang: a.lang,
      category: a.category,
      icon: a.icon ?? "",
      title: a.title,
      excerpt: a.excerpt,
      seo_title: a.seo_title ?? "",
      seo_description: a.seo_description ?? "",
      author_name: a.author_name,
      author_role: a.author_role ?? "",
      translation_of: a.translation_of ?? "",
      mark_modified: false,
      content: a.content,
    });
  }

  function toInput(current: Form): ArticleDraftInput {
    return {
      id: current.id,
      slug: current.slug.trim(),
      lang: current.lang,
      category: current.category,
      icon: current.icon || null,
      title: current.title.trim(),
      excerpt: current.excerpt.trim(),
      seo_title: current.seo_title.trim() || null,
      seo_description: current.seo_description.trim() || null,
      author_name: current.author_name.trim() || "Maverick Bouillot",
      author_role: current.author_role.trim() || null,
      content: current.content,
      translation_of: current.translation_of || null,
      mark_modified: current.mark_modified,
    };
  }

  /** Saves the form; returns the saved article id, or null on failure. */
  async function save(): Promise<string | null> {
    if (!form) return null;
    if (!form.title.trim()) {
      setMessage({ kind: "error", text: "Le titre est obligatoire." });
      return null;
    }
    if (!form.slug.trim()) {
      setMessage({ kind: "error", text: "L'URL de l'article est obligatoire." });
      return null;
    }
    const result = await adminSaveArticle(token, toInput(form));
    if (!handle(result) || !result.article) return null;
    const saved = result.article;
    setForm((current) =>
      current ? { ...current, id: saved.id, status: saved.status, slug: saved.slug, mark_modified: false } : current,
    );
    if (result.rebuild && result.rebuild !== "not_needed") {
      setMessage({ kind: result.rebuild === "failed" ? "error" : "ok", text: REBUILD_MESSAGES[result.rebuild] });
    }
    return saved.id;
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  const onSave = () =>
    run(async () => {
      const id = await save();
      if (id) {
        setMessage((current) => current ?? { kind: "ok", text: form?.status === "published" ? "Modifications enregistrées." : "Brouillon enregistré." });
        void refresh();
      }
    });

  const onPublish = () =>
    run(async () => {
      const id = await save();
      if (!id) return;
      const result = await adminPublishArticle(token, id);
      if (!handle(result)) return;
      setForm((current) => (current ? { ...current, status: "published" } : current));
      setMessage({
        kind: result.rebuild === "failed" ? "error" : "ok",
        text: `Article publié. ${REBUILD_MESSAGES[result.rebuild ?? "not_needed"]}`.trim(),
      });
      void refresh();
    });

  const onUnpublish = () =>
    run(async () => {
      if (!form?.id) return;
      const result = await adminUnpublishArticle(token, form.id);
      if (!handle(result)) return;
      setForm((current) => (current ? { ...current, status: "draft" } : current));
      setMessage({
        kind: result.rebuild === "failed" ? "error" : "ok",
        text: `Article repassé en brouillon. ${REBUILD_MESSAGES[result.rebuild ?? "not_needed"]}`.trim(),
      });
      void refresh();
    });

  const onDelete = () =>
    run(async () => {
      if (!form?.id) return;
      const result = await adminDeleteArticle(token, form.id);
      if (!handle(result)) return;
      setForm(null);
      setMessage({ kind: "ok", text: `Article supprimé. ${REBUILD_MESSAGES[result.rebuild ?? "not_needed"]}`.trim() });
      void refresh();
    });

  // ------------------------------------------------------------------ list
  if (!form) {
    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-bold leading-tight tracking-[-0.035em] text-foreground">
              Gestion des articles
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {rows.length} article{rows.length > 1 ? "s" : ""}. Seuls les articles publiés sont visibles et indexables.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Actualiser
            </Button>
            <Button onClick={() => { setForm({ ...NEW_FORM }); setPreview(false); setMessage(null); }}>
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              Nouvel article
            </Button>
          </div>
        </div>

        {message ? (
          <p role={message.kind === "error" ? "alert" : "status"} className={cn("mt-6 text-[13.5px]", message.kind === "error" ? "text-destructive" : "text-muted-foreground")}>
            {message.text}
          </p>
        ) : null}

        <div className="card-surface mt-8 overflow-hidden">
          {rows.length === 0 ? (
            <p className="px-6 py-12 text-center text-[15px] text-muted-foreground">
              {loading ? "Chargement…" : "Aucun article pour le moment. Créez le premier avec « Nouvel article »."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Liste des articles</caption>
                <thead>
                  <tr className="border-b border-border">
                    {["Titre", "Langue", "Catégorie", "Statut", "Mis à jour", ""].map((heading, index) => (
                      <th key={index} scope="col" className="px-6 py-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {heading || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-4 text-[14.5px] text-foreground">
                        {row.title}
                        <span className="mt-1 block font-mono text-[11.5px] text-muted-foreground">/ressources/{row.slug}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[13px] uppercase text-muted-foreground">{row.lang}</td>
                      <td className="px-6 py-4 text-[14px] text-muted-foreground">{CATEGORY_LABELS.fr[row.category]}</td>
                      <td className="px-6 py-4">
                        <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em]", row.status === "published" ? "border-primary/40 text-primary" : "border-border text-muted-foreground")}>
                          {row.status === "published" ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td className="tnum px-6 py-4 font-mono text-[13px] text-muted-foreground">{formatArticleDate(row.updated_at, "fr")}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="secondary" onClick={() => void openArticle(row.id)} disabled={busy}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Modifier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- editor
  const published = form.status === "published";
  const IconChoice = ICONS[form.icon || DEFAULT_ICON_BY_CATEGORY[form.category]]?.icon;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button type="button" onClick={() => { setForm(null); setMessage(null); void refresh(); }} className="mb-4 text-[13.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            ← Retour à la liste
          </button>
          <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.035em] text-foreground">
            {form.id ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
            {published ? "Publié" : "Brouillon"} · {minutes} min de lecture (calcul automatique)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setPreview((value) => !value)}>
            {preview ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {preview ? "Revenir à l'édition" : "Aperçu"}
          </Button>
          <Button variant="secondary" onClick={onSave} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {published ? "Enregistrer" : "Enregistrer le brouillon"}
          </Button>
          {published ? (
            <Button variant="secondary" onClick={onUnpublish} disabled={busy}>Dépublier</Button>
          ) : (
            <Button onClick={onPublish} disabled={busy}>Publier</Button>
          )}
        </div>
      </div>

      {message ? (
        <p role={message.kind === "error" ? "alert" : "status"} className={cn("mt-6 text-[13.5px]", message.kind === "error" ? "text-destructive" : "text-muted-foreground")}>
          {message.text}
        </p>
      ) : null}

      {preview ? (
        <div className="card-surface mt-8 p-6 md:p-10">
          <LangOverride lang={form.lang}>
            <p className="eyebrow">{CATEGORY_LABELS[form.lang][form.category]}</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.04em] text-foreground">{form.title || "Titre de l'article"}</h2>
            <p className="mt-5 max-w-[40rem] text-[17px] leading-relaxed text-muted-foreground">{form.excerpt}</p>
            <div className="mt-8 max-w-[44rem]">
              <ArticleContentView content={form.content} />
            </div>
          </LangOverride>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            <div>
              <label htmlFor="a-title" className={labelClass}>Titre (H1)</label>
              <Input
                id="a-title"
                value={form.title}
                maxLength={160}
                onChange={(event) => {
                  const title = event.target.value;
                  update({ title, ...(form.slugTouched || published ? {} : { slug: slugify(title) }) });
                }}
              />
            </div>
            <div>
              <label htmlFor="a-excerpt" className={labelClass}>Introduction (chapô)</label>
              <Textarea id="a-excerpt" rows={3} maxLength={400} value={form.excerpt} onChange={(event) => update({ excerpt: event.target.value })} />
            </div>
            <div>
              <span className={labelClass}>Contenu</span>
              <RichTextEditor value={form.content} onChange={(content) => update({ content })} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card-surface space-y-5 p-5">
              <div>
                <label htmlFor="a-slug" className={labelClass}>URL personnalisée</label>
                <Input id="a-slug" value={form.slug} maxLength={90} onChange={(event) => update({ slug: slugify(event.target.value), slugTouched: true })} />
                <p className="mt-2 break-all font-mono text-[11.5px] text-muted-foreground">datableia.com/ressources/{form.slug || "…"}</p>
                {published ? (
                  <p className="mt-2 text-[12.5px] text-muted-foreground">
                    Article publié : changer l'URL donne une erreur 404 à l'ancienne adresse (pas de redirection automatique).
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="a-lang" className={labelClass}>Langue</label>
                <select id="a-lang" className={selectClass} value={form.lang} onChange={(event) => update({ lang: event.target.value as Lang, translation_of: "" })}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label htmlFor="a-translation" className={labelClass}>Traduction de</label>
                <select id="a-translation" className={selectClass} value={form.translation_of} onChange={(event) => update({ translation_of: event.target.value })}>
                  <option value="">Aucune (article indépendant)</option>
                  {translationChoices.map((row) => (
                    <option key={row.id} value={row.id}>{row.title} ({row.lang.toUpperCase()})</option>
                  ))}
                </select>
                <p className="mt-2 text-[12.5px] text-muted-foreground">Les liens hreflang ne sont écrits que si les deux versions sont publiées.</p>
              </div>
              <div>
                <label htmlFor="a-category" className={labelClass}>Catégorie</label>
                <select id="a-category" className={selectClass} value={form.category} onChange={(event) => update({ category: event.target.value as CategoryKey })}>
                  {CATEGORY_KEYS.map((key) => (
                    <option key={key} value={key}>{CATEGORY_LABELS.fr[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="a-icon" className={labelClass}>Icône de la carte</label>
                <div className="flex items-center gap-3">
                  {IconChoice ? <IconChoice className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /> : null}
                  <select id="a-icon" className={selectClass} value={form.icon} onChange={(event) => update({ icon: event.target.value })}>
                    <option value="">Par défaut selon la catégorie</option>
                    {ICON_KEYS.map((key) => (
                      <option key={key} value={key}>{ICONS[key].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card-surface space-y-5 p-5">
              <p className="font-display text-[15px] font-bold text-foreground">Référencement (SEO)</p>
              <div>
                <label htmlFor="a-seo-title" className={labelClass}>Titre SEO</label>
                <Input id="a-seo-title" value={form.seo_title} maxLength={70} onChange={(event) => update({ seo_title: event.target.value })} placeholder={form.title ? `${form.title} | Datable` : ""} />
                <p className="mt-2 font-mono text-[11.5px] text-muted-foreground">{form.seo_title.length}/70 · vide = titre + « | Datable »</p>
              </div>
              <div>
                <label htmlFor="a-seo-desc" className={labelClass}>Meta description</label>
                <Textarea id="a-seo-desc" rows={4} maxLength={170} value={form.seo_description} onChange={(event) => update({ seo_description: event.target.value })} placeholder="Vide = introduction de l'article" />
                <p className="mt-2 font-mono text-[11.5px] text-muted-foreground">{form.seo_description.length}/170</p>
              </div>
            </div>

            <div className="card-surface space-y-5 p-5">
              <p className="font-display text-[15px] font-bold text-foreground">Auteur</p>
              <div>
                <label htmlFor="a-author" className={labelClass}>Nom</label>
                <Input id="a-author" value={form.author_name} maxLength={80} onChange={(event) => update({ author_name: event.target.value })} />
              </div>
              <div>
                <label htmlFor="a-role" className={labelClass}>Fonction (optionnel)</label>
                <Input id="a-role" value={form.author_role} maxLength={80} onChange={(event) => update({ author_role: event.target.value })} />
              </div>
              {published ? (
                <label className="flex items-start gap-3 text-[13.5px] text-foreground">
                  <input type="checkbox" className="mt-1" checked={form.mark_modified} onChange={(event) => update({ mark_modified: event.target.checked })} />
                  <span>Afficher « Mis à jour le » avec la date du jour à l'enregistrement</span>
                </label>
              ) : null}
            </div>

            {form.id ? (
              <Button variant="secondary" className="w-full text-destructive" onClick={() => setConfirmDelete(true)} disabled={busy}>
                Supprimer l'article
              </Button>
            ) : null}
          </aside>
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. {published ? "L'article publié disparaîtra du site au prochain déploiement." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmDelete(false); void onDelete(); }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
