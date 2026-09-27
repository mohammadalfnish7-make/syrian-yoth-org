"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Loader2, Trash2 } from "lucide-react";

type Program = {
  id: string;
  title: string;
  titleEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  audienceAr?: string | null;
  audienceEn?: string | null;
  scheduleAr?: string | null;
  scheduleEn?: string | null;
  whereAr?: string | null;
  whereEn?: string | null;
  outcomesAr?: string | null;
  outcomesEn?: string | null;
  slug?: string | null;
  imageUrl: string | null;
};

const EMPTY_FORM = {
  title: "",
  titleEn: "",
  description: "",
  descriptionEn: "",
  audienceAr: "",
  audienceEn: "",
  scheduleAr: "",
  scheduleEn: "",
  whereAr: "",
  whereEn: "",
  outcomesAr: "",
  outcomesEn: "",
  slug: "",
  imageUrl: null as string | null,
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

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
    setForm(EMPTY_FORM);
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
              <label>العنوان بالإنجليزية / English title</label>
              <input className="admin-field__input admin-field__input--plain" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>المسار في الرابط (slug)</label>
              <input className="admin-field__input admin-field__input--plain" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="qaid" />
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
            <div className="admin-field">
              <label>لمن البرنامج</label>
              <input className="admin-field__input admin-field__input--plain" value={form.audienceAr} onChange={(e) => setForm({ ...form, audienceAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Who it is for</label>
              <input className="admin-field__input admin-field__input--plain" value={form.audienceEn} onChange={(e) => setForm({ ...form, audienceEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>أين ومتى</label>
              <input className="admin-field__input admin-field__input--plain" value={form.whereAr} onChange={(e) => setForm({ ...form, whereAr: e.target.value })} />
              <input className="admin-field__input admin-field__input--plain" value={form.scheduleAr} onChange={(e) => setForm({ ...form, scheduleAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Where and when</label>
              <input className="admin-field__input admin-field__input--plain" value={form.whereEn} onChange={(e) => setForm({ ...form, whereEn: e.target.value })} />
              <input className="admin-field__input admin-field__input--plain" value={form.scheduleEn} onChange={(e) => setForm({ ...form, scheduleEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>ماذا يغادر به المشارك</label>
              <textarea className="admin-field__input admin-field__input--plain" rows={3} value={form.outcomesAr} onChange={(e) => setForm({ ...form, outcomesAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>What they leave with</label>
              <textarea className="admin-field__input admin-field__input--plain" rows={3} value={form.outcomesEn} onChange={(e) => setForm({ ...form, outcomesEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>الوصف بالإنجليزية</label>
              <textarea className="admin-field__input admin-field__input--plain" rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
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
