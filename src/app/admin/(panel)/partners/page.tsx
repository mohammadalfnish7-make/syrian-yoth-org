"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Loader2, Trash2 } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logoUrl: null as string | null,
    websiteUrl: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/partners");
    const data = await res.json();
    setPartners(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", logoUrl: null, websiteUrl: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الشريك؟")) return;
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
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
        titleAr="الشركاء"
        titleEn="Partners"
        descriptionAr="إدارة شعارات وروابط الشركاء"
        descriptionEn="Manage partner logos and links"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          إضافة شريك
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card admin-form-inline">
          <h3 className="admin-card__title">شريك جديد</h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>الاسم</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>الموقع الإلكتروني</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm({ ...form, websiteUrl: e.target.value })
                }
                dir="ltr"
              />
            </div>
          </div>
          <ImageUploader
            category="partners"
            label="الشعار"
            currentUrl={form.logoUrl}
            onUpload={(url) => setForm({ ...form, logoUrl: url })}
            onRemove={() => setForm({ ...form, logoUrl: null })}
          />
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

      <div className="admin-partners-grid">
        {partners.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا يوجد شركاء بعد</p>
          </div>
        ) : (
          partners.map((p) => (
            <div key={p.id} className="admin-partner-card">
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logoUrl} alt={p.name} className="admin-partner-card__logo" />
              ) : (
                <div className="admin-partner-card__placeholder">{p.name[0]}</div>
              )}
              <div className="admin-partner-card__info">
                <h3>{p.name}</h3>
                {p.websiteUrl && (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" dir="ltr">
                    {p.websiteUrl}
                  </a>
                )}
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
