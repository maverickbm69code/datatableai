// Renders an article document (Tiptap JSON) with the Datable design system. The tree is turned
// into React elements one node at a time: there is no innerHTML anywhere, and unknown node or
// mark types are ignored, so stored content can never inject markup.
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Reveal } from "@/components/motion/reveal";
import { extractHeadings } from "@/lib/articles/content";
import type { ArticleContent, DocNode } from "@/lib/articles/types";
import { NUMBER_LOCALE, useLang, type Lang } from "@/lib/i18n";
import { EASE_OUT, REVEAL_VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Ctx = { lang: Lang; headingIds: string[]; cursor: { value: number } };

const CALLOUT = {
  fr: { conseil: "Conseil", attention: "Point d'attention", info: "À savoir" },
  en: { conseil: "Tip", attention: "Watch out", info: "Good to know" },
} as const;

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary";
  if (href.startsWith("/ressources")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function renderText(node: DocNode, key: number): ReactNode {
  let out: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") out = <strong className="font-semibold text-foreground">{out}</strong>;
    else if (mark.type === "italic") out = <em>{out}</em>;
    else if (mark.type === "underline") out = <u className="underline-offset-4">{out}</u>;
    else if (mark.type === "strike") out = <s>{out}</s>;
    else if (mark.type === "code")
      out = <code className="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-foreground">{out}</code>;
    else if (mark.type === "link" && typeof mark.attrs?.href === "string") out = <InlineLink href={mark.attrs.href}>{out}</InlineLink>;
  }
  return <span key={key} className="contents">{out}</span>;
}

function renderChildren(node: DocNode, ctx: Ctx): ReactNode[] {
  return (node.content ?? []).map((child, index) => renderNode(child, ctx, index));
}

function BarChartBlock({ node, lang }: { node: DocNode; lang: Lang }) {
  const reduced = useReducedMotion();
  const title = String(node.attrs?.title ?? "");
  const unit = String(node.attrs?.unit ?? "");
  const rows = (Array.isArray(node.attrs?.data) ? node.attrs?.data : []) as { label: string; value: number }[];
  const max = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
  const format = (value: number) =>
    `${new Intl.NumberFormat(NUMBER_LOCALE[lang], { maximumFractionDigits: 2 }).format(value)}${unit ? ` ${unit}` : ""}`;

  return (
    <figure className="card-surface mt-8 p-6">
      {title ? (
        <figcaption className="font-display text-[17px] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </figcaption>
      ) : null}
      <ul className={cn("flex flex-col gap-4", title && "mt-5")}>
        {rows.map((row, index) => (
          <li key={index} className="grid grid-cols-[minmax(0,8rem)_1fr_5rem] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_5.5rem]">
            <span className="text-[13.5px] leading-tight text-muted-foreground">{row.label}</span>
            <span className="relative h-2.5 overflow-hidden rounded-full bg-primary-soft-strong/60" aria-hidden="true">
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary"
                style={{ width: `${Math.max(2, (Math.abs(row.value) / max) * 100)}%` }}
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.8, delay: index * 0.07, ease: EASE_OUT }}
              />
            </span>
            <span className="tnum text-right font-mono text-[13px] font-medium text-foreground">{format(row.value)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function renderListItem(node: DocNode, ctx: Ctx, key: number, ordered: boolean): ReactNode {
  if (node.type !== "listItem") return null;
  return (
    <li
      key={key}
      className={cn(
        "relative pl-7 text-[17px] leading-[1.7] text-foreground/90 [&>p]:mt-0 [&>*+*]:mt-3 before:absolute before:left-0",
        ordered
          ? "[counter-increment:item] before:top-[0.45em] before:font-mono before:text-[12px] before:font-medium before:tracking-[0.1em] before:text-primary before:content-[counter(item,decimal-leading-zero)]"
          : "before:top-[0.72em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary before:content-['']",
      )}
    >
      {renderChildren(node, ctx)}
    </li>
  );
}

function renderNode(node: DocNode, ctx: Ctx, key: number, top = false): ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      return (
        <p key={key} className="mt-5 text-[17px] leading-[1.75] text-foreground/90">
          {renderChildren(node, ctx)}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      // Only top-level headings are in the table of contents, so only they get an anchor.
      const id = top ? ctx.headingIds[ctx.cursor.value++] : undefined;
      const Tag = level === 3 ? "h3" : "h2";
      return (
        <Tag
          key={key}
          id={id}
          className={cn(
            "scroll-mt-24 text-balance font-display text-foreground",
            level === 2
              ? "mt-14 text-[clamp(1.55rem,2.6vw,2rem)] font-bold leading-[1.12] tracking-[-0.035em]"
              : "mt-10 text-[1.3rem] font-semibold leading-snug tracking-[-0.025em]",
          )}
        >
          {renderChildren(node, ctx)}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="mt-5 flex flex-col gap-2.5">
          {(node.content ?? []).map((child, index) => renderListItem(child, ctx, index, false))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="mt-5 flex flex-col gap-3 [counter-reset:item]">
          {(node.content ?? []).map((child, index) => renderListItem(child, ctx, index, true))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="mt-8 border-l-2 border-primary pl-5 font-display text-[clamp(1.15rem,2vw,1.4rem)] font-semibold leading-snug tracking-[-0.025em] text-foreground [&>p]:mt-0 [&>p]:text-inherit [&>p+p]:mt-3"
        >
          {renderChildren(node, ctx)}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={key} className="my-10 border-0 border-t border-border" />;
    case "table": {
      const rows = node.content ?? [];
      const headRows = rows.length > 0 && (rows[0].content ?? []).every((cell) => cell.type === "tableHeader") ? 1 : 0;
      const renderRow = (row: DocNode, i: number) => (
        <tr key={i} className="border-b border-border last:border-b-0">
          {(row.content ?? []).map((cell, j) => {
            const Cell = cell.type === "tableHeader" ? "th" : "td";
            const colSpan = Number(cell.attrs?.colspan ?? 1);
            const rowSpan = Number(cell.attrs?.rowspan ?? 1);
            return (
              <Cell
                key={j}
                colSpan={colSpan > 1 ? colSpan : undefined}
                rowSpan={rowSpan > 1 ? rowSpan : undefined}
                scope={Cell === "th" ? "col" : undefined}
                className={cn(
                  "px-5 py-3.5 align-top [&>p]:mt-0 [&>p+p]:mt-2",
                  Cell === "th"
                    ? "font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground [&>p]:text-[inherit]"
                    : "text-[15px] leading-snug text-foreground/90 [&>p]:text-[inherit] [&>p]:leading-snug",
                )}
              >
                {renderChildren(cell, ctx)}
              </Cell>
            );
          })}
        </tr>
      );
      return (
        <div key={key} className="card-surface mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left">
              {headRows ? <thead>{rows.slice(0, headRows).map(renderRow)}</thead> : null}
              <tbody>{rows.slice(headRows).map((row, i) => renderRow(row, i + headRows))}</tbody>
            </table>
          </div>
        </div>
      );
    }
    case "callout": {
      const variant = (["conseil", "attention", "info"].includes(String(node.attrs?.variant))
        ? node.attrs?.variant
        : "conseil") as "conseil" | "attention" | "info";
      const Icon = variant === "conseil" ? Lightbulb : variant === "attention" ? AlertTriangle : Info;
      return (
        <aside
          key={key}
          role="note"
          className={cn(
            "relative mt-8 overflow-hidden rounded-lg border p-5 pl-6 sm:p-6 sm:pl-7",
            variant === "attention" ? "border-destructive/30 bg-destructive/5" : "border-cta-border bg-cta-soft",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("absolute inset-y-0 left-0 w-[3px]", variant === "attention" ? "bg-destructive" : "bg-primary")}
          />
          <p
            className={cn(
              "flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
              variant === "attention" ? "text-destructive" : "text-primary",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {CALLOUT[ctx.lang][variant]}
          </p>
          <div className="mt-2 [&>*:first-child]:mt-0 [&_p]:text-[16px] [&_p]:leading-[1.65] [&_li]:text-[16px] [&_ul]:mt-3 [&_ol]:mt-3 [&>p+*]:mt-3">
            {renderChildren(node, ctx)}
          </div>
        </aside>
      );
    }
    case "keyFigures": {
      const count = (node.content ?? []).length;
      return (
        <div
          key={key}
          className={cn("mt-8 grid gap-4", count === 1 ? "sm:grid-cols-1" : count === 2 || count === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3")}
        >
          {(node.content ?? []).map((figure, index) => {
            const [value, ...label] = figure.content ?? [];
            return (
              <Reveal key={index} delay={index * 0.08} y={12}>
                <div className="card-surface h-full p-5 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-card-hover">
                  <p className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] text-foreground tnum">
                    {renderChildren({ type: "paragraph", content: value?.content }, ctx)}
                  </p>
                  <div className="mt-3 text-[13.5px] leading-snug text-muted-foreground [&>p]:mt-0 [&>p]:text-[inherit] [&>p]:leading-snug">
                    {label.map((item, i) => renderNode(item, ctx, i))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      );
    }
    case "barChart":
      return <BarChartBlock key={key} node={node} lang={ctx.lang} />;
    default:
      return null;
  }
}

type ArticleContentProps = { content: ArticleContent; className?: string };

export function ArticleContentView({ content, className }: ArticleContentProps) {
  const lang = useLang();
  const ctx: Ctx = {
    lang,
    headingIds: extractHeadings(content).map((item) => item.id),
    cursor: { value: 0 },
  };
  return (
    <div className={cn("[&>*:first-child]:mt-0", className)}>
      {(content.content ?? []).map((node, index) => renderNode(node, ctx, index, true))}
    </div>
  );
}
