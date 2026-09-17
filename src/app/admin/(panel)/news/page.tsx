"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  GovernorateSearchSelect,
  type GovernorateOption,
} from "@/components/admin/GovernorateSearchSelect";
import { Plus, Loader2, Trash2, Eye, EyeOff, Pencil, X } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  body: string;
  coverImageUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  governorate: { nameAr: string; nameEn: string | null };
};

type NewsForm = {
  title: string;
  body: string;
  coverImageUrl: string | null;
  status: "draft" | "published";
  governorateId: string;
};

type AdminSession = {
  role: "SUPER_ADMIN" | "GOVERNORATE_ADMIN";
  governorateId: string | null;
  username: string;
};

const EMPTY_FORM: NewsForm = {
  title: "",
  body: "",
  coverImageUrl: null,
  status: "draft",
  governorateId: "",
};

function formatAdminDate(date: string, locale: "ar" | "en") {
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-US");
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateOption[]>([]);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<NewsForm>(EMPTY_FORM);

  const isGovernorateAdmin = session?.role === "GOVERNORATE_ADMIN";
  const defaultGovernorateId = session?.governorateId ?? "";

  const loadNews = useCallback(async () => {
    const res = await fetch("/api/admin/news");
    const data = await res.json();
    setNews(Array.isArray(data) ? data : []);
  }, []);

  const loadPageData = useCallback(async () => {
    const [newsRes, govRes, sessionRes] = await Promise.all([
      fetch("/api/admin/news"),
      fetch("/api/admin/governorates"),
      fetch("/api/admin/session"),
    ]);

    const newsData = await newsRes.json();
    const govData = await govRes.json();
    const sessionData = await sessionRes.json();

    setNews(Array.isArray(newsData) ? newsData : []);
    setGovernorates(Array.isArray(govData) ? govData : []);
    if (sessionData?.role) {
      setSession(sessionData as AdminSession);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  function buildEmptyForm(): NewsForm {
    return {
      ...EMPTY_FORM,
      governorateId: defaultGovernorateId,
    };
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
    setForm(buildEmptyForm());
  }

  function openCreateForm() {
    setEditingId(null);
    setFormError("");
    setForm(buildEmptyForm());
    setShowForm(true);
  }

  function openEditForm(item: NewsItem) {
    setEditingId(item.id);
    setFormError("");
    setForm({
      title: item.title,
      body: item.body,
      coverImageUrl: item.coverImageUrl,
      status: item.status,
      governorateId: defaultGovernorateId,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    if (!editingId && !form.governorateId) {
      setFormError("يرجى اختيار المحافظة. / Please select a governorate.");
      setSaving(false);
      return;
    }

    const url = editingId ? `/api/admin/news/${editingId}` : "/api/admin/news";
    const method = editingId ? "PUT" : "POST";

    const payload = editingId
      ? {
          title: form.title,
          body: form.body,
          coverImageUrl: form.coverImageUrl,
          status: form.status,
        }
      : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      closeForm();
      loadNews();
    } else {
      setFormError(data.error || "فشل حفظ الخبر. / Failed to save news.");
    }

    setSaving(false);
  }

  async function togglePublish(item: NewsItem) {
    const newStatus = item.status === "published" ? "draft" : "published";
    await fetch(`/api/admin/news/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadNews();
  }

  async function handleDelete(id: string) {
    const confirmAr = "هل أنت متأكد من حذف هذا الخبر؟";
    const confirmEn = "Are you sure you want to delete this news item?";
    const isEnglish =
      (document.getElementById("admin-lang-en") as HTMLInputElement | null)?.checked ??
      false;
    if (!confirm(isEnglish ? confirmEn : confirmAr)) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    if (editingId === id) closeForm();
    loadNews();
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
        titleAr="الأخبار"
        titleEn="News"
        descriptionAr="إضافة وإدارة أخبار المحافظة"
        descriptionEn="Add and manage governorate news"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => (showForm && !editingId ? closeForm() : openCreateForm())}
        >
          <Plus size={18} />
          <span className="content-ar">خبر جديد</span>
          <span className="content-en">New Article</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form-inline">
          <div className="admin-card__title-row">
            <h3 className="admin-card__title">
              {editingId ? (
                <>
                  <span className="content-ar">تعديل الخبر</span>
                  <span className="content-en">Edit Article</span>
                </>
              ) : (
                <>
                  <span className="content-ar">إضافة خبر</span>
                  <span className="content-en">Add News</span>
                </>
              )}
            </h3>
            <button
              type="button"
              className="admin-btn-icon"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>
          <div className="admin-form-stack">
            {!editingId ? (
              <GovernorateSearchSelect
                governorates={governorates}
                value={form.governorateId}
                onChange={(governorateId) =>
                  setForm({ ...form, governorateId })
                }
                disabled={isGovernorateAdmin}
                required
              />
            ) : null}
            <div className="admin-field">
              <label>
                <span className="content-ar">العنوان</span>
                <span className="content-en">Title</span>
              </label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>
                <span className="content-ar">المحتوى</span>
                <span className="content-en">Content</span>
              </label>
              <textarea
                className="admin-field__input admin-field__input--plain"
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </div>
            <ImageUploader
              key={editingId ?? "new"}
              category="news"
              labelAr="صورة الغلاف"
              labelEn="Cover Image"
              currentUrl={form.coverImageUrl}
              onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
              onRemove={() => setForm({ ...form, coverImageUrl: null })}
            />
          </div>
          {formError ? <p className="admin-alert admin-alert--error">{formError}</p> : null}
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {editingId ? (
                <>
                  <span className="content-ar">{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                  <span className="content-en">{saving ? "Saving..." : "Save Changes"}</span>
                </>
              ) : (
                <>
                  <span className="content-ar">{saving ? "جاري الحفظ..." : "حفظ كمسودة"}</span>
                  <span className="content-en">{saving ? "Saving..." : "Save as Draft"}</span>
                </>
              )}
            </button>
            <button type="button" className="admin-btn-ghost" onClick={closeForm}>
              <span className="content-ar">إلغاء</span>
              <span className="content-en">Cancel</span>
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <span className="content-ar">العنوان</span>
                <span className="content-en">Title</span>
              </th>
              <th>
                <span className="content-ar">المحافظة</span>
                <span className="content-en">Governorate</span>
              </th>
              <th>
                <span className="content-ar">الحالة</span>
                <span className="content-en">Status</span>
              </th>
              <th>
                <span className="content-ar">التاريخ</span>
                <span className="content-en">Date</span>
              </th>
              <th>
                <span className="content-ar">إجراءات</span>
                <span className="content-en">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  <span className="content-ar">لا توجد أخبار بعد</span>
                  <span className="content-en">No news yet</span>
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>
                    <span className="content-ar">{item.governorate.nameAr}</span>
                    <span className="content-en">
                      {item.governorate.nameEn || item.governorate.nameAr}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${item.status === "published" ? "admin-badge--active" : "admin-badge--draft"}`}
                    >
                      {item.status === "published" ? (
                        <>
                          <span className="content-ar">منشور</span>
                          <span className="content-en">Published</span>
                        </>
                      ) : (
                        <>
                          <span className="content-ar">مسودة</span>
                          <span className="content-en">Draft</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    {item.publishedAt ? (
                      <>
                        <span className="content-ar">
                          {formatAdminDate(item.publishedAt, "ar")}
                        </span>
                        <span className="content-en">
                          {formatAdminDate(item.publishedAt, "en")}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => openEditForm(item)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => togglePublish(item)}
                      title={
                        item.status === "published" ? "Unpublish" : "Publish"
                      }
                    >
                      {item.status === "published" ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon admin-btn-icon--danger"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
