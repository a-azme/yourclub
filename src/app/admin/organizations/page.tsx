"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Org = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fests: { count: number }[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function OrganizationsPage() {
  const [supabase] = useState(() => createClient());
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("organizations")
      .select("id, name, slug, description, fests(count)")
      .order("name");

    if (loadError) {
      setError(loadError.message);
    } else {
      setOrgs((data as unknown as Org[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  function startEdit(org: Org) {
    setEditingId(org.id);
    setName(org.name);
    setDescription(org.description ?? "");
    setError(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setError("Organization name must be at least 3 characters.");
      return;
    }

    setSaving(true);

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("organizations")
        .update({ name: trimmed, description: description.trim() || null })
        .eq("id", editingId)
        .select("id");

      if (updateError || !data || data.length === 0) {
        setError(updateError?.message ?? "You are not allowed to update this organization.");
      } else {
        setMessage("Organization updated.");
        resetForm();
        await load();
      }
    } else {
      const { error: insertError } = await supabase.from("organizations").insert({
        name: trimmed,
        slug: slugify(trimmed),
        description: description.trim() || null,
      });

      if (insertError) {
        setError(
          insertError.code === "23505"
            ? "An organization with a similar name already exists."
            : insertError.message
        );
      } else {
        setMessage("Organization added.");
        resetForm();
        await load();
      }
    }

    setSaving(false);
  }

  async function handleDelete(org: Org) {
    const festCount = org.fests?.[0]?.count ?? 0;
    const ok = window.confirm(
      `Delete "${org.name}"?\n\nThis will also permanently delete its ${festCount} fest(s), all their events and all registrations. This cannot be undone.`
    );
    if (!ok) return;

    setError(null);
    setMessage(null);
    setDeletingId(org.id);

    const { data, error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", org.id)
      .select("id");

    if (deleteError || !data || data.length === 0) {
      setError(deleteError?.message ?? "You are not allowed to delete this organization.");
    } else {
      setMessage(`"${org.name}" was deleted.`);
      if (editingId === org.id) resetForm();
      await load();
    }
    setDeletingId(null);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add the clubs that host fests. They appear in the organization list when you create a fest.
      </p>

      {/* Add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        noValidate
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {editingId ? "Edit organization" : "Add organization"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Cancel edit
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="org-name" className="mb-1.5 block text-sm font-medium text-slate-900">
              Name
            </label>
            <input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DRMC Photography Club"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <div>
            <label htmlFor="org-desc" className="mb-1.5 block text-sm font-medium text-slate-900">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="org-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this club do?"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {editingId ? "Save changes" : "Add organization"}
        </button>
      </form>

      {/* List */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-slate-900">
          All organizations {!loading && <span className="text-slate-400">({orgs.length})</span>}
        </h2>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading...
          </div>
        ) : orgs.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No organizations yet. Add your first one above.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orgs.map((org) => {
              const festCount = org.fests?.[0]?.count ?? 0;
              return (
                <li
                  key={org.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{org.name}</p>
                      {org.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                          {org.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {festCount} {festCount === 1 ? "fest" : "fests"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(org)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(org)}
                      disabled={deletingId === org.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === org.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}