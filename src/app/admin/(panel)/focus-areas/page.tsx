"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { FOCUS_AREA_ICONS } from "@/lib/focus-areas";
import { Plus, Loader2, Trash2, Pencil, Save } from "lucide-react";

type FocusAreaRow = {
  id: string;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string;
  descriptionEn: string | null;
  imageUrl: string | null;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

type SectionForm = {
  labelAr: string;
  labelEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

type AreaForm = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string | null;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

const emptySection: SectionForm = {
  labelAr: "",
  labelEn: "",
  titleAr: "",
  titleEn: "",
  descAr: "",
  descEn: "",
};

const emptyArea: AreaForm = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  imageUrl: null,
  icon: "leadership",
  sortOrder: 0,
  isActive: true,
};

const ICON_LABELS: Record<string, string> = {
  leadership: "قيادة",
  skills: "مهارات",
  initiatives: "مبادرات",
  community: "مجتمع",
  opportunities: "فرص",
};

export default function FocusAreasPage() {
  const [areas, setAreas] = useState<FocusAreaRow[]>([]);
  const [section, setSection] = useState<SectionForm>(emptySection);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AreaForm>(emptyArea);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [areasRes, sectionRes] = await Promise.all([
      fetch("/api/admin/focus-areas"),
      fetch("/api/admin/focus-areas/section"),
    ]);
    const areasData = await areasRes.json();
    const sectionData = await sectionRes.json();
    setAreas(Array.isArray(areasData) ? areasData : []);
    if (sectionData && typeof sectionData === "object" && !sectionData.error) {
      setSection(sectionData as SectionForm);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    setSavingSection(true);
    setMessage("");
    const res = await fetch("/api/admin/focus-areas/section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });
    const data = await res.json();
    setMessage(res.ok ? "تم حفظ إعدادات القسم" : data.error || "فشل الحفظ");
    setSavingSection(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyArea, sortOrder: areas.length });
    setShowForm(true);
  }

  function openEdit(area: FocusAreaRow) {
    setEditingId(area.id);
    setForm({
      titleAr: area.titleAr,
      titleEn: area.titleEn || "",
      descriptionAr: area.descriptionAr,
      descriptionEn: area.descriptionEn || "",
      imageUrl: area.imageUrl,
      icon: area.icon,
      sortOrder: area.sortOrder,
      isActive: area.isActive,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyArea);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      titleEn: form.titleEn || null,
      descriptionEn: form.descriptionEn || null,
    };

    if (editingId) {
      await fetch(`/api/admin/focus-areas/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/focus-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا المحور؟")) return;
    await fetch(`/api/admin/focus-areas/${id}`, { method: "DELETE" });
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
        titleAr="محاور العمل"
        titleEn="Focus Areas"
        descriptionAr="إدارة قسم «ماذا نفعل» والبطاقات الخمس"
        descriptionEn="Manage the What We Do section and focus cards"
        backHref="/admin/dashboard"
      />

      <form onSubmit={handleSaveSection} className="admin-card admin-form-stack">
        <h3 className="admin-card__title">عناوين القسم</h3>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>التسمية (عربي)</label>
            <input
              className="admin-field__input admin-field__input--plain"
              value={section.labelAr}
              onChange={(e) =>
                setSection({ ...section, labelAr: e.target.value })
              }
              required
            />
          </div>
          <div className="admin-field">
            <label>Label (English)</label>
            <input
              className="admin-field__input admin-field__input--plain"
              value={section.labelEn}
              onChange={(e) =>
                setSection({ ...section, labelEn: e.target.value })
              }
            />
          </div>
          <div className="admin-field">
            <label>العنوان (عربي)</label>
            <input
              className="admin-field__input admin-field__input--plain"
              value={section.titleAr}
              onChange={(e) =>
                setSection({ ...section, titleAr: e.target.value })
              }
              required
            />
          </div>
          <div className="admin-field">
            <label>Title (English)</label>
            <input
              className="admin-field__input admin-field__input--plain"
              value={section.titleEn}
              onChange={(e) =>
                setSection({ ...section, titleEn: e.target.value })
              }
            />
          </div>
        </div>
        <div className="admin-field">
          <label>الوصف (عربي)</label>
          <textarea
            className="admin-field__input admin-field__input--plain"
            rows={2}
            value={section.descAr}
            onChange={(e) => setSection({ ...section, descAr: e.target.value })}
            required
          />
        </div>
        <div className="admin-field">
          <label>Description (English)</label>
          <textarea
            className="admin-field__input admin-field__input--plain"
            rows={2}
            value={section.descEn}
            onChange={(e) => setSection({ ...section, descEn: e.target.value })}
          />
        </div>
        <button type="submit" className="admin-btn-primary" disabled={savingSection}>
          <Save size={16} />
          {savingSection ? "جاري الحفظ..." : "حفظ العناوين"}
        </button>
      </form>

      {message && (
        <div
          className={`admin-alert ${message.includes("تم") ? "admin-alert--success" : "admin-alert--error"}`}
        >
          {message}
        </div>
      )}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          <Plus size={18} />
          محور جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form-inline">
          <h3 className="admin-card__title">
            {editingId ? "تعديل المحور" : "محور جديد"}
          </h3>
          <div className="admin-form-stack">
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>العنوان (عربي)</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Title (English)</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-field">
              <label>الوصف (عربي)</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={3}
                value={form.descriptionAr}
                onChange={(e) =>
                  setForm({ ...form, descriptionAr: e.target.value })
                }
                required
              />
            </div>
            <div className="admin-field">
              <label>Description (English)</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={3}
                value={form.descriptionEn}
                onChange={(e) =>
                  setForm({ ...form, descriptionEn: e.target.value })
                }
              />
            </div>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>الأيقونة / اللون</label>
                <select
                  className="admin-field__input admin-field__input--plain"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                >
                  {FOCUS_AREA_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {ICON_LABELS[icon] ?? icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>الترتيب</label>
                <input
                  type="number"
                  className="admin-field__input admin-field__input--plain"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <ImageUploader
              category="focus-areas"
              label="صورة البطاقة"
              currentUrl={form.imageUrl}
              onUpload={(url) => setForm({ ...form, imageUrl: url })}
              onRemove={() => setForm({ ...form, imageUrl: null })}
            />
            <div className="admin-field admin-field--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                نشط على الموقع
              </label>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary">
              {editingId ? "حفظ" : "إضافة"}
            </button>
            <button type="button" className="admin-btn-ghost" onClick={closeForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="admin-programs-grid">
        {areas.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد محاور بعد — سيتم عرض البيانات الافتراضية على الموقع</p>
          </div>
        ) : (
          areas.map((area) => (
            <div key={area.id} className="admin-program-card">
              <div className="admin-program-card__body">
                <h3>{area.titleAr}</h3>
                <p>{area.descriptionAr}</p>
                <small>
                  {ICON_LABELS[area.icon] ?? area.icon} · ترتيب {area.sortOrder}
                  {!area.isActive ? " · مخفي" : ""}
                </small>
              </div>
              <div className="admin-board-card__actions">
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => openEdit(area)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="admin-btn-icon admin-btn-icon--danger"
                  onClick={() => handleDelete(area.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
