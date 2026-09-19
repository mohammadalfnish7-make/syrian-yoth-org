"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      {/* Brand panel */}
      <div className="admin-login__brand">
        <div className="admin-login__brand-content">
          <Image
            src="/images/logo.png"
            alt="مؤسسة شباب سوريا"
            width={80}
            height={80}
            className="admin-login__logo"
            priority
          />
          <h1 className="admin-login__brand-title">مؤسسة شباب سوريا</h1>
          <p className="admin-login__brand-tagline">
            جيلٌ شابٌ متمكنٌ وقوي
          </p>
          <p className="admin-login__brand-desc">
            نصنع من طاقة الشباب السوري قيادةً تبني، لا فعاليات تمر.
          </p>
        </div>
        <div className="admin-login__brand-pattern" aria-hidden="true" />
      </div>

      {/* Form panel */}
      <div className="admin-login__form-panel">
        <div className="admin-login__form-wrapper">
          <div className="admin-login__form-header">
            <h2>تسجيل الدخول</h2>
            <p>أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="admin-field">
              <label htmlFor="username">اسم المستخدم</label>
              <div className="admin-field__input-wrap">
                <User size={18} className="admin-field__icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="admin"
                  className="admin-field__input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="password">كلمة المرور</label>
              <div className="admin-field__input-wrap">
                <Lock size={18} className="admin-field__icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="admin-field__input"
                />
              </div>
            </div>

            {error && (
              <div className="admin-login__error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary admin-login__submit"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
