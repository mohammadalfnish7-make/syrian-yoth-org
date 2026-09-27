"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Loader2, Plus, Trash2 } from "lucide-react";

type EventRow = {
  id: string;
  titleAr: string;
  cityAr: string;
  isRolling: boolean;
  startsAt: string | null;
};

const EMPTY = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  cityAr: "",
  cityEn: "",
  startsAt: "",
  isRolling: true,
  registerPath: "/get-involved",
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(EMPTY);
    setShowForm(false);
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
        descriptionAr="تاريخ ومدينة وطريقة التسجيل"
        descriptionEn="Date, city, and how to register"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          فعالية جديدة
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card admin-form-inline">
          <div className="admin-form-stack">
            <div className="admin-field">
              <label>العنوان</label>
              <input className="admin-field__input admin-field__input--plain" required value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Title</label>
              <input className="admin-field__input admin-field__input--plain" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>الوصف</label>
              <textarea className="admin-field__input admin-field__input--plain" required rows={3} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Description</label>
              <textarea className="admin-field__input admin-field__input--plain" rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>المدينة</label>
              <input className="admin-field__input admin-field__input--plain" required value={form.cityAr} onChange={(e) => setForm({ ...form, cityAr: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>City</label>
              <input className="admin-field__input admin-field__input--plain" value={form.cityEn} onChange={(e) => setForm({ ...form, cityEn: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>التاريخ</label>
              <input type="datetime-local" className="admin-field__input admin-field__input--plain" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <label className="admin-field">
              <input type="checkbox" checked={form.isRolling} onChange={(e) => setForm({ ...form, isRolling: e.target.checked })} />
              {" "}مستمر بلا تاريخ واحد
            </label>
            <div className="admin-field">
              <label>رابط التسجيل</label>
              <input className="admin-field__input admin-field__input--plain" value={form.registerPath} onChange={(e) => setForm({ ...form, registerPath: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary">إضافة</button>
            <button type="button" className="admin-btn-ghost" onClick={() => setShowForm(false)}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-programs-grid">
        {events.length === 0 ? (
          <div className="admin-empty-state"><p>لا توجد فعاليات بعد</p></div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="admin-program-card">
              <div className="admin-program-card__body">
                <h3>{event.titleAr}</h3>
                <p>{event.isRolling ? "مستمر" : event.startsAt ?? ""} · {event.cityAr}</p>
              </div>
              <button type="button" className="admin-btn-icon admin-btn-icon--danger" onClick={() => handleDelete(event.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
