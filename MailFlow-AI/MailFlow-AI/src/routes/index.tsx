import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Inbox, Sparkles, ShieldAlert, Star, BarChart3, Settings, Plus, Search, RefreshCw,
  Archive, Trash2, Paperclip, ThumbsUp, ThumbsDown, Send, X, Mail, KeyRound, MailOpen,
} from "lucide-react";
import { seedEmails, type Email, type Tag } from "@/lib/emails";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MailFlow AI — Smart Email Assistant" },
      { name: "description", content: "AI email reader that sorts desired from undesired mail and drafts smart replies." },
      { property: "og:title", content: "MailFlow AI — Smart Email Assistant" },
      { property: "og:description", content: "AI email reader that sorts desired from undesired mail and drafts smart replies." },
    ],
  }),
  component: App,
});

type Folder = "all" | "desired" | "undesired" | "starred" | "analytics" | "settings";
type Filter = "All" | "High Priority" | "Newsletters" | "Spam" | "Unread";

const tagStyle: Record<Tag, string> = {
  Desired: "bg-success/15 text-success",
  "Action Required": "bg-warning/15 text-warning",
  Promotional: "bg-info/15 text-info",
  "Spam Alert": "bg-destructive/15 text-destructive",
  Newsletter: "bg-muted text-muted-foreground",
};

function initials(n: string) {
  return n.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function App() {
  const [emails, setEmails] = useState<Email[]>(seedEmails);
  const [folder, setFolder] = useState<Folder>("all");
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [account, setAccount] = useState("you@mailflow.ai");
  const [refreshing, setRefreshing] = useState(false);

  const update = (id: string, patch: Partial<Email>) =>
    setEmails((e) => e.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id: string) => {
    setEmails((e) => e.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const list = useMemo(() => {
    return emails.filter((m) => {
      if (folder === "desired" && m.category !== "desired") return false;
      if (folder === "undesired" && m.category !== "undesired") return false;
      if (folder === "starred" && !m.starred) return false;
      if (filter === "High Priority" && !m.priority) return false;
      if (filter === "Newsletters" && !m.tags.includes("Newsletter")) return false;
      if (filter === "Spam" && m.category !== "undesired") return false;
      if (filter === "Unread" && !m.unread) return false;
      const q = query.toLowerCase();
      return !q || `${m.from} ${m.subject} ${m.body}`.toLowerCase().includes(q);
    });
  }, [emails, folder, filter, query]);

  const selected = emails.find((m) => m.id === selectedId) ?? null;
  const count = (f: (m: Email) => boolean) => emails.filter(f).length;

  const nav: { id: Folder; label: string; icon: typeof Inbox; badge?: number }[] = [
    { id: "all", label: "All Inbox", icon: Inbox, badge: count((m) => m.unread) },
    { id: "desired", label: "Desired", icon: Sparkles, badge: count((m) => m.category === "desired" && m.priority) },
    { id: "undesired", label: "Undesired", icon: ShieldAlert, badge: count((m) => m.category === "undesired") },
    { id: "starred", label: "Starred", icon: Star, badge: count((m) => m.starred) },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r p-4 md:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <h1 className="text-lg font-semibold">MailFlow AI</h1>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-xl border bg-card p-3">
          <div className="grid size-9 place-items-center rounded-full bg-accent font-medium">A</div>
          <div className="min-w-0">
            <p className="font-medium">Andrés</p>
            <p className="truncate text-xs text-muted-foreground">{account}</p>
          </div>
        </div>
        <button
          onClick={() => setConnectOpen(true)}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" /> Connect / Switch account
        </button>
        <nav className="mt-6 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => { setFolder(n.id); setSelectedId(null); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition",
                folder === n.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <n.icon className={cn("size-4", folder === n.id && "text-primary")} />
              <span className="flex-1 text-left">{n.label}</span>
              {!!n.badge && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">{n.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-primary/10 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-primary">AI filter active</p>
          Trained on {emails.length} messages this week.
        </div>
      </aside>

      {folder === "analytics" ? (
        <Analytics emails={emails} />
      ) : folder === "settings" ? (
        <SettingsView onConnect={() => setConnectOpen(true)} account={account} />
      ) : (
        <>
          {/* List */}
          <section className={cn("flex w-full flex-col border-r lg:w-[420px] lg:shrink-0", selected && "hidden lg:flex")}>
            <div className="space-y-3 border-b p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search mail…"
                    className="w-full rounded-lg border bg-input py-2 pl-9 pr-3 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  aria-label="Refresh"
                  onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
                  className="grid size-9 place-items-center rounded-lg border hover:bg-accent"
                >
                  <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["All", "High Priority", "Newsletters", "Spam", "Unread"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      filter === f ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto p-2">
              {list.length === 0 && (
                <div className="grid h-full place-items-center text-center text-muted-foreground">
                  <div><MailOpen className="mx-auto mb-2 size-8" />Nothing here. Inbox zero ✨</div>
                </div>
              )}
              {list.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { setSelectedId(m.id); update(m.id, { unread: false }); }}
                  className={cn(
                    "group relative mb-1 cursor-pointer rounded-xl border border-transparent p-3 transition animate-in fade-in slide-in-from-bottom-1",
                    selectedId === m.id ? "border-border bg-card" : "hover:bg-card/60",
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      m.category === "desired" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
                    )}>
                      {initials(m.from)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {m.unread && <span className="size-2 rounded-full bg-primary" />}
                        <p className={cn("flex-1 truncate", m.unread ? "font-semibold" : "text-muted-foreground")}>{m.from}</p>
                        <span className="text-xs text-muted-foreground group-hover:opacity-0">{m.time}</span>
                      </div>
                      <p className="truncate font-medium">{m.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.body.replace(/\n/g, " ")}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.tags.map((t) => (
                          <span key={t} className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", tagStyle[t])}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-0.5 rounded-lg border bg-popover p-0.5 opacity-0 shadow-lg transition group-hover:opacity-100">
                    <IconBtn label="Star" onClick={() => update(m.id, { starred: !m.starred })}>
                      <Star className={cn("size-3.5", m.starred && "fill-warning text-warning")} />
                    </IconBtn>
                    <IconBtn label="Archive" onClick={() => remove(m.id)}><Archive className="size-3.5" /></IconBtn>
                    <IconBtn label="Delete" onClick={() => remove(m.id)}><Trash2 className="size-3.5" /></IconBtn>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reader */}
          <section className={cn("flex-1 overflow-hidden", !selected && "hidden lg:block")}>
            {selected ? (
              <Reader key={selected.id} email={selected} onBack={() => setSelectedId(null)} update={update} remove={remove} />
            ) : (
              <div className="grid h-full place-items-center text-center text-muted-foreground">
                <div>
                  <div className="glass mx-auto mb-4 grid size-16 place-items-center rounded-2xl border">
                    <Mail className="size-7 text-primary" />
                  </div>
                  <p className="font-display text-base text-foreground">Select an email to read</p>
                  <p className="text-xs">AI insights and smart replies appear here.</p>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {connectOpen && (
        <ConnectModal
          onClose={() => setConnectOpen(false)}
          onConnect={(a) => { setAccount(a); setConnectOpen(false); }}
        />
      )}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Reader({ email: m, onBack, update, remove }: {
  email: Email; onBack: () => void;
  update: (id: string, p: Partial<Email>) => void; remove: (id: string) => void;
}) {
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const desired = m.category === "desired";

  return (
    <div className="thin-scroll h-full overflow-y-auto p-6 animate-in fade-in slide-in-from-right-2">
      <button onClick={onBack} className="mb-4 text-xs text-muted-foreground lg:hidden">← Back</button>
      <div className={cn(
        "mb-6 flex items-center gap-3 rounded-xl border p-3",
        desired ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10",
      )}>
        {desired ? <Sparkles className="size-4 text-primary" /> : <ShieldAlert className="size-4 text-destructive" />}
        <p className="flex-1">
          <span className="font-semibold">{desired ? "AI Assessment: " : "Undesired: "}</span>
          {m.reason.replace(/^Undesired:\s*/, "")}
        </p>
        <button
          onClick={() => update(m.id, desired
            ? { category: "undesired", priority: false, reason: "Undesired: Marked manually", tags: ["Spam Alert"] }
            : { category: "desired", reason: "Desired Email — Marked manually", tags: ["Desired"] })}
          className="flex items-center gap-1.5 rounded-lg border bg-background/50 px-2.5 py-1 text-xs hover:bg-accent"
        >
          {desired ? <ThumbsDown className="size-3.5" /> : <ThumbsUp className="size-3.5" />}
          Mark as {desired ? "Undesired" : "Desired"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold">{m.subject}</h2>
        <div className="flex gap-1">
          <IconBtn label="Star" onClick={() => update(m.id, { starred: !m.starred })}>
            <Star className={cn("size-4", m.starred && "fill-warning text-warning")} />
          </IconBtn>
          <IconBtn label="Archive" onClick={() => remove(m.id)}><Archive className="size-4" /></IconBtn>
          <IconBtn label="Delete" onClick={() => remove(m.id)}><Trash2 className="size-4" /></IconBtn>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 border-b pb-4">
        <div className="grid size-10 place-items-center rounded-full bg-accent font-semibold">{initials(m.from)}</div>
        <div className="flex-1">
          <p className="font-medium">{m.from} <span className="font-normal text-muted-foreground">&lt;{m.fromEmail}&gt;</span></p>
          <p className="text-xs text-muted-foreground">to {m.to}</p>
        </div>
        <span className="text-xs text-muted-foreground">{m.time}</span>
      </div>

      <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed">{m.body}</p>

      {m.attachments && (
        <div className="mt-6 flex flex-wrap gap-2">
          {m.attachments.map((a) => (
            <div key={a.name} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2">
              <Paperclip className="size-4 text-primary" />
              <div><p className="text-xs font-medium">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.size}</p></div>
            </div>
          ))}
        </div>
      )}

      {desired && m.replies && (
        <div className="glass mt-8 max-w-2xl rounded-2xl border p-4">
          <p className="mb-3 flex items-center gap-2 font-medium"><Sparkles className="size-4 text-primary" /> AI Suggested Quick Replies</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {m.replies.map((r) => (
              <button
                key={r.label}
                onClick={() => { setReply(r.text); setSent(false); }}
                className="rounded-full border px-3 py-1.5 text-xs transition hover:border-primary hover:text-primary"
              >
                {r.label}
              </button>
            ))}
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="Pick a suggestion or write your reply…"
            className="w-full resize-none rounded-xl border bg-input p-3 outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {sent && <span className="text-xs text-success animate-in fade-in">Reply sent ✓</span>}
            <button
              disabled={!reply.trim()}
              onClick={() => { setSent(true); setReply(""); }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="size-4" /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: (a: string) => void }) {
  const [tab, setTab] = useState<"oauth" | "api" | "creds">("oauth");
  const [email, setEmail] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Connect email account</h3>
          <IconBtn label="Close" onClick={onClose}><X className="size-4" /></IconBtn>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-xs">
          {([["oauth", "OAuth"], ["api", "API Key"], ["creds", "Credentials"]] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("rounded-md py-1.5", tab === id ? "bg-card text-foreground" : "text-muted-foreground")}>{l}</button>
          ))}
        </div>
        {tab === "oauth" && (
          <div className="space-y-2">
            {["Gmail", "Outlook"].map((p) => (
              <button key={p} onClick={() => onConnect(`andres@${p === "Gmail" ? "gmail.com" : "outlook.com"}`)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:border-primary">
                <Mail className="size-4 text-primary" /> Continue with {p}
              </button>
            ))}
          </div>
        )}
        {tab !== "oauth" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onConnect(email || "you@mailflow.ai"); }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border bg-input px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="password" placeholder={tab === "api" ? "API key" : "Password / app password"} className="w-full rounded-lg border bg-input py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground hover:opacity-90">Connect</button>
          </form>
        )}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Demo only — no real connection is made.</p>
      </div>
    </div>
  );
}

function Analytics({ emails }: { emails: Email[] }) {
  const d = emails.filter((m) => m.category === "desired").length;
  const u = emails.length - d;
  const stats = [
    { l: "Total messages", v: emails.length },
    { l: "Desired", v: d },
    { l: "Filtered out", v: u },
    { l: "Action required", v: emails.filter((m) => m.tags.includes("Action Required")).length },
  ];
  const pct = emails.length ? Math.round((d / emails.length) * 100) : 0;
  return (
    <section className="flex-1 overflow-y-auto p-8 animate-in fade-in">
      <h2 className="text-2xl font-semibold">Analytics</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-5">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <p className="mb-3 text-xs text-muted-foreground">Desired vs undesired</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-destructive/40">
          <div className="bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{pct}% of your mail is worth reading.</p>
      </div>
    </section>
  );
}

function SettingsView({ onConnect, account }: { onConnect: () => void; account: string }) {
  return (
    <section className="flex-1 overflow-y-auto p-8 animate-in fade-in">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <div className="mt-6 max-w-lg space-y-3">
        <div className="flex items-center justify-between rounded-2xl border bg-card p-5">
          <div><p className="font-medium">Connected account</p><p className="text-xs text-muted-foreground">{account}</p></div>
          <button onClick={onConnect} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent">Switch</button>
        </div>
        {["Auto-sort promotions", "Phishing protection", "Smart reply suggestions"].map((s) => (
          <label key={s} className="flex items-center justify-between rounded-2xl border bg-card p-5">
            <span>{s}</span>
            <input type="checkbox" defaultChecked className="size-4 accent-primary" />
          </label>
        ))}
      </div>
    </section>
  );
}
