"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type EventRow = {
  id: string;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string;
  descriptionEn: string | null;
  cityAr: string;
  cityEn: string | null;
  startsAt: string | null;
  isRolling: boolean;
  registerPath: string;
  imageUrl: string | null;
  isActive: boolean;
};

type EventForm = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  cityAr: string;
  cityEn: string;
  startsAt: string;
  isRolling: boolean;
  registerPath: string;
  imageUrl: string | null;
  isActive: boolean;
};

const EMPTY: EventForm = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  cityAr: "",
  cityEn: "",
  startsAt: "",
  isRolling: false,
  registerPath: "/get-involved",
  imageUrl: null,
  isActive: true,
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(event: EventRow) {
  if (event.isRolling) return "مستمر";
  if (!event.startsAt) return "بدون تاريخ";
  return new Date(event.startsAt).toLocaleString("ar-SY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<EventForm>(EMPTY);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setMessage("");
    setShowForm(true);
  }

  function openEdit(event: EventRow) {
    setEditingId(event.id);
    setForm({
      titleAr: event.titleAr,
      titleEn: event.titleEn || "",
      descriptionAr: event.descriptionAr,
      descriptionEn: event.descriptionEn || "",
      cityAr: event.cityAr,
      cityEn: event.cityEn || "",
      startsAt: toDatetimeLocal(event.startsAt),
      isRolling: event.isRolling,
      registerPath: event.registerPath,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
    });
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    setMessage("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch(
      editingId ? `/api/admin/events/${editingId}` : "/api/admin/events",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startsAt: form.isRolling ? "" : form.startsAt,
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "فشل الحفظ");
      return;
    }
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه الفعالية؟")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
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
        titleAr="الفعاليات"
        titleEn="Events"
        descriptionAr="عدّل العنوان والوصف والمدينة والتاريخ من لوحة التحكم"
        descriptionEn="Edit the title, description, city, and date from the admin panel"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          <Plus size={18} />
          فعالية جديدة
        </button>
      </div>

      {message && !showForm ? (
        <div className="admin-alert admin-alert--error" role="status">
          {message}
        </div>
      ) : null}

      <AdminFormDialog
        open={showForm}
        title={editingId ? "تعديل الفعالية" : "فعالية جديدة"}
        onClose={closeForm}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-stack">
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>العنوان (عربي)</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  required
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
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
                required
                rows={3}
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label>Description (English)</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={3}
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              />
            </div>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>المدينة (عربي)</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  required
                  value={form.cityAr}
                  onChange={(e) => setForm({ ...form, cityAr: e.target.value })}
                />
              </div>
              <div className="admin-field">
                <label>City (English)</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  value={form.cityEn}
                  onChange={(e) => setForm({ ...form, cityEn: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-field">
              <label>التاريخ</label>
              <input
                type="datetime-local"
                className="admin-field__input admin-field__input--plain"
                value={form.startsAt}
                disabled={form.isRolling}
                onChange={(e) =>
                  setForm({ ...form, startsAt: e.target.value, isRolling: false })
                }
              />
            </div>
            <label className="admin-field">
              <input
                type="checkbox"
                checked={form.isRolling}
                onChange={(e) => setForm({ ...form, isRolling: e.target.checked })}
              />{" "}
              مستمر بلا تاريخ محدد
            </label>
            <div className="admin-field">
              <label>رابط التسجيل</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.registerPath}
                onChange={(e) => setForm({ ...form, registerPath: e.target.value })}
              />
            </div>
            <label className="admin-field">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />{" "}
              ظاهرة في الموقع
            </label>
            <ImageUploader
              category="events"
              label="صورة الفعالية"
              currentUrl={form.imageUrl}
              onUpload={(url) => setForm({ ...form, imageUrl: url })}
              onRemove={() => setForm({ ...form, imageUrl: null })}
            />
            {message ? (
              <div className="admin-alert admin-alert--error" role="status">
                {message}
              </div>
            ) : null}
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة"}
            </button>
            <button type="button" className="admin-btn-ghost" onClick={closeForm}>
              إلغاء
            </button>
          </div>
        </form>
      </AdminFormDialog>

      <div className="admin-programs-grid">
        {events.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا توجد فعاليات بعد</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="admin-program-card">
              <div className="admin-program-card__body">
                <h3>{event.titleAr}</h3>
                {event.titleEn ? <p>{event.titleEn}</p> : null}
                <p>
                  {formatWhen(event)} · {event.cityAr}
                  {event.isActive ? "" : " · مخفية"}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={() => openEdit(event)}
                aria-label="تعديل"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="admin-btn-icon admin-btn-icon--danger"
                onClick={() => handleDelete(event.id)}
                aria-label="حذف"
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
