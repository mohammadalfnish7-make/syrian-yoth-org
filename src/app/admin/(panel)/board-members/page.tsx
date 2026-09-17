"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";

type BoardMember = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  roleAr: string;
  roleEn: string | null;
  bioAr: string | null;
  bioEn: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  nameAr: "",
  nameEn: "",
  roleAr: "",
  roleEn: "",
  bioAr: "",
  bioEn: "",
  imageUrl: null as string | null,
  sortOrder: 0,
  isActive: true,
};

export default function BoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/board-members");
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(member: BoardMember) {
    setEditingId(member.id);
    setForm({
      nameAr: member.nameAr,
      nameEn: member.nameEn || "",
      roleAr: member.roleAr,
      roleEn: member.roleEn || "",
      bioAr: member.bioAr || "",
      bioEn: member.bioEn || "",
      imageUrl: member.imageUrl,
      sortOrder: member.sortOrder,
      isActive: member.isActive,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nameAr: form.nameAr,
      nameEn: form.nameEn || null,
      roleAr: form.roleAr,
      roleEn: form.roleEn || null,
      bioAr: form.bioAr || null,
      bioEn: form.bioEn || null,
      imageUrl: form.imageUrl,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    if (editingId) {
      await fetch(`/api/admin/board-members/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/board-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا العضو؟")) return;
    await fetch(`/api/admin/board-members/${id}`, { method: "DELETE" });
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
        titleAr="أعضاء الإدارة"
        titleEn="Board Members"
        descriptionAr="إضافة وإدارة أعضاء مجلس الإدارة وصورهم"
        descriptionEn="Add and manage board members and their photos"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          <Plus size={18} />
          إضافة عضو
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form-inline">
          <h3 className="admin-card__title">
            {editingId ? "تعديل عضو الإدارة" : "عضو إدارة جديد"}
          </h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>الاسم (عربي)</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>الاسم (English)</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="admin-field">
              <label>المنصب (عربي)</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.roleAr}
                onChange={(e) => setForm({ ...form, roleAr: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>المنصب (English)</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.roleEn}
                onChange={(e) => setForm({ ...form, roleEn: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="admin-field admin-form-grid__full">
              <label>نبذة (عربي)</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={3}
                value={form.bioAr}
                onChange={(e) => setForm({ ...form, bioAr: e.target.value })}
                placeholder="معلومات مختصرة عن العضو تظهر على البطاقة"
              />
            </div>
            <div className="admin-field admin-form-grid__full">
              <label>نبذة (English)</label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={3}
                value={form.bioEn}
                onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
                dir="ltr"
                placeholder="Short bio shown on the card"
              />
            </div>
            <div className="admin-field">
              <label>ترتيب العرض</label>
              <input
                type="number"
                min={0}
                className="admin-field__input admin-field__input--plain"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </div>
            {editingId && (
              <div className="admin-field admin-field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  ظاهر على الموقع
                </label>
              </div>
            )}
          </div>
          <ImageUploader
            category="managers"
            label="الصورة الشخصية"
            currentUrl={form.imageUrl}
            onUpload={(url) => setForm({ ...form, imageUrl: url })}
            onRemove={() => setForm({ ...form, imageUrl: null })}
          />
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary">
              {editingId ? "حفظ التعديلات" : "إضافة"}
            </button>
            <button type="button" className="admin-btn-ghost" onClick={closeForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="admin-board-grid">
        {members.length === 0 ? (
          <div className="admin-empty-state">
            <p>لا يوجد أعضاء إدارة بعد</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className={`admin-board-card ${!member.isActive ? "admin-board-card--inactive" : ""}`}
            >
              {member.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.imageUrl}
                  alt={member.nameAr}
                  className="admin-board-card__photo"
                />
              ) : (
                <div className="admin-board-card__placeholder">
                  {member.nameAr.charAt(0)}
                </div>
              )}
              <div className="admin-board-card__info">
                <h3>{member.nameAr}</h3>
                <p>{member.roleAr}</p>
                {member.bioAr && (
                  <p className="admin-board-card__bio">{member.bioAr}</p>
                )}
                {!member.isActive && (
                  <span className="admin-board-card__badge">مخفي</span>
                )}
              </div>
              <div className="admin-board-card__actions">
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => openEdit(member)}
                  aria-label="Edit member"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="admin-btn-icon admin-btn-icon--danger"
                  onClick={() => handleDelete(member.id)}
                  aria-label="Delete member"
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
