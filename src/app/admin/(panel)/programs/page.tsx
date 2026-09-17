"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Loader2, Trash2 } from "lucide-react";

type Program = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: null as string | null,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/programs");
    const data = await res.json();
    setPrograms(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", imageUrl: null });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا البرنامج؟")) return;
    await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={28} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        titleAr="البرامج"
        titleEn="Programs"
        descriptionAr="إدارة برامج ومبادرات المؤسسة"
        descriptionEn="Manage foundation programs and initiatives"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          برنامج جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card admin-form-inline">
          <h3 className="admin-card__title">برنامج جديد</h3>
          <div className="admin-form-stack">
            <div className="admin-field">
              <label>العنوان</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>الوصف</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <ImageUploader
              category="programs"
              label="صورة البرنامج"
              currentUrl={form.imageUrl}
              onUpload={(url) => setForm({ ...form, imageUrl: url })}
              onRemove={() => setForm({ ...form, imageUrl: null })}
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary">
              إضافة
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => setShowForm(false)}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="admin-programs-grid">
        {programs.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد برامج بعد</p>
          </div>
        ) : (
          programs.map((p) => (
            <div key={p.id} className="admin-program-card">
              <div className="admin-program-card__body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
              <button
                type="button"
                className="admin-btn-icon admin-btn-icon--danger"
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
