"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import {
  VOLUNTEER_COLLEGES,
  VOLUNTEER_CV_TEMPLATE_URL,
  VOLUNTEER_EDUCATION_LEVELS,
  VOLUNTEER_EMPLOYMENT_STATUSES,
  VOLUNTEER_GENDERS,
  VOLUNTEER_HOBBIES,
  VOLUNTEER_STUDY_YEARS,
  VOLUNTEER_UNIVERSITIES,
} from "@/lib/volunteer-form";

type Governorate = { id: string; nameAr: string };

type VolunteerRequestFormProps = {
  governorates: Governorate[];
  onSubmit: (formData: FormData) => Promise<void>;
  submitting: boolean;
  error: string;
};

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  boxSizing: "border-box",
  color: "#000",
  backgroundColor: "white",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  marginBottom: "0.25rem",
  color: "#374151",
  fontWeight: 600,
};

const hintStyle: CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "0.35rem",
  lineHeight: 1.5,
};

export function VolunteerRequestForm({
  governorates,
  onSubmit,
  submitting,
  error,
}: VolunteerRequestFormProps) {
  const [educationLevel, setEducationLevel] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);

  function toggleHobby(hobby: string) {
    setHobbies((current) =>
      current.includes(hobby)
        ? current.filter((item) => item !== hobby)
        : [...current, hobby]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("hobbies", JSON.stringify(hobbies));
    await onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="volunteer-form"
      encType="multipart/form-data"
    >
      {error ? (
        <div className="volunteer-form__error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="volunteer-form__section">
        <h3 className="volunteer-form__section-title content-ar">
          القسم 1: تحديث بيانات وتقييم مهارات كوادر المؤسسة السورية للشباب
        </h3>
        <h3 className="volunteer-form__section-title content-en">
          Section 1: Staff data and skills assessment
        </h3>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            الاسم الثلاثي *
          </label>
          <label style={labelStyle} className="content-en">
            Full name *
          </label>
          <input required name="fullName" style={fieldStyle} />
        </div>

        <fieldset className="volunteer-form__fieldset">
          <legend style={labelStyle} className="content-ar">
            الجنس *
          </legend>
          <legend style={labelStyle} className="content-en">
            Gender *
          </legend>
          <div className="volunteer-form__options">
            {VOLUNTEER_GENDERS.map((gender) => (
              <label key={gender} className="volunteer-form__option">
                <input required type="radio" name="gender" value={gender} />
                <span>{gender}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            المواليد *
          </label>
          <label style={labelStyle} className="content-en">
            Date of birth *
          </label>
          <input required type="date" name="dateOfBirth" style={fieldStyle} />
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            المحافظة *
          </label>
          <label style={labelStyle} className="content-en">
            Governorate *
          </label>
          <select required name="governorateId" style={fieldStyle}>
            <option value="">--</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameAr}
              </option>
            ))}
          </select>
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            عنوان السكن *
          </label>
          <label style={labelStyle} className="content-en">
            Address *
          </label>
          <span style={hintStyle} className="content-ar">
            مثال: إدلب - منطقة معرة النعمان - مدينة جرجناز
          </span>
          <span style={hintStyle} className="content-en">
            Example: Idlib - Maarat al-Numan - Jirjnaz
          </span>
          <input required name="address" style={fieldStyle} />
        </div>

        <div className="volunteer-form__grid">
          <div className="volunteer-form__field">
            <label style={labelStyle} className="content-ar">
              رقم الهاتف (واتساب) *
            </label>
            <label style={labelStyle} className="content-en">
              WhatsApp phone *
            </label>
            <span style={hintStyle} className="content-ar">
              يجب أن يبدأ بـ 00963
            </span>
            <span style={hintStyle} className="content-en">
              Must start with 00963
            </span>
            <input
              required
              name="phone"
              dir="ltr"
              placeholder="00963XXXXXXXX"
              pattern="00963[0-9]+"
              title="يجب أن يبدأ بـ 00963"
              style={fieldStyle}
            />
          </div>
          <div className="volunteer-form__field">
            <label style={labelStyle} className="content-ar">
              معرف التلغرام الخاص بك *
            </label>
            <label style={labelStyle} className="content-en">
              Telegram username *
            </label>
            <span style={hintStyle} className="content-ar">
              يجب أن يبدأ بـ @
            </span>
            <span style={hintStyle} className="content-en">
              Must start with @
            </span>
            <input
              required
              name="telegram"
              dir="ltr"
              placeholder="@username"
              pattern="@[A-Za-z0-9_]{3,}"
              title="يجب أن يبدأ بـ @"
              style={fieldStyle}
            />
          </div>
        </div>

        <fieldset className="volunteer-form__fieldset">
          <legend style={labelStyle} className="content-ar">
            هل لديك حساب على منصة LinkedIn *
          </legend>
          <legend style={labelStyle} className="content-en">
            Do you have a LinkedIn account? *
          </legend>
          <div className="volunteer-form__options">
            {(["نعم", "لا"] as const).map((value) => (
              <label key={value} className="volunteer-form__option">
                <input required type="radio" name="hasLinkedIn" value={value} />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            ما حالتك الوظيفية؟ *
          </label>
          <label style={labelStyle} className="content-en">
            Employment status *
          </label>
          <select required name="employmentStatus" style={fieldStyle}>
            <option value="">--</option>
            {VOLUNTEER_EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            أين تعمل؟ وما منصبك الوظيفي؟
          </label>
          <label style={labelStyle} className="content-en">
            Where do you work, and what is your role?
          </label>
          <input name="workplacePosition" style={fieldStyle} />
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            ما أعلى مؤهل علمي حصلت عليه *
          </label>
          <label style={labelStyle} className="content-en">
            Highest education level *
          </label>
          <select
            required
            name="educationLevel"
            style={fieldStyle}
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            <option value="">--</option>
            {VOLUNTEER_EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {educationLevel === "أخرى" ? (
          <div className="volunteer-form__field">
            <label style={labelStyle} className="content-ar">
              حدد المؤهل العلمي *
            </label>
            <label style={labelStyle} className="content-en">
              Specify education level *
            </label>
            <input required name="educationLevelOther" style={fieldStyle} />
          </div>
        ) : null}

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            ما جامعتك أو مكان دراستك الحالي *
          </label>
          <label style={labelStyle} className="content-en">
            University or current place of study *
          </label>
          <select required name="university" style={fieldStyle}>
            <option value="">--</option>
            {VOLUNTEER_UNIVERSITIES.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </select>
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            ما الكلية أو المعهد الذي تدرس فيه (أو تخرجت منه) *
          </label>
          <label style={labelStyle} className="content-en">
            College or institute *
          </label>
          <select required name="college" style={fieldStyle}>
            <option value="">--</option>
            {VOLUNTEER_COLLEGES.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            في أي سنة دراسية أنت حالياً *
          </label>
          <label style={labelStyle} className="content-en">
            Current study year *
          </label>
          <select
            required
            name="studyYear"
            style={fieldStyle}
            value={studyYear}
            onChange={(e) => setStudyYear(e.target.value)}
          >
            <option value="">--</option>
            {VOLUNTEER_STUDY_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {studyYear === "أخرى" ? (
          <div className="volunteer-form__field">
            <label style={labelStyle} className="content-ar">
              حدد السنة الدراسية *
            </label>
            <label style={labelStyle} className="content-en">
              Specify study year *
            </label>
            <input required name="studyYearOther" style={fieldStyle} />
          </div>
        ) : null}

        <fieldset className="volunteer-form__fieldset">
          <legend style={labelStyle} className="content-ar">
            ما هواياتك واهتماماتك الشخصية ؟ *
          </legend>
          <legend style={labelStyle} className="content-en">
            Hobbies and interests *
          </legend>
          <div className="volunteer-form__checkboxes">
            {VOLUNTEER_HOBBIES.map((hobby) => (
              <label key={hobby} className="volunteer-form__checkbox">
                <input
                  type="checkbox"
                  checked={hobbies.includes(hobby)}
                  onChange={() => toggleHobby(hobby)}
                />
                <span>{hobby}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {hobbies.includes("أخرى") ? (
          <div className="volunteer-form__field">
            <label style={labelStyle} className="content-ar">
              حدد الهواية الأخرى *
            </label>
            <label style={labelStyle} className="content-en">
              Specify other hobby *
            </label>
            <input required name="hobbiesOther" style={fieldStyle} />
          </div>
        ) : null}
      </section>

      <section className="volunteer-form__section">
        <h3 className="volunteer-form__section-title content-ar">
          القسم 2: الوثائق الرسمية والسيرة الذاتية
        </h3>
        <h3 className="volunteer-form__section-title content-en">
          Section 2: Official documents and CV
        </h3>
        <p className="volunteer-form__lede content-ar">
          يرجى إرفاق الوثائق الرسمية المطلوبة بدقة ووضوح، وتحميل وتعبئة نموذج
          السيرة الذاتية المعتمد لضمان توحيد بيانات الفريق.
        </p>
        <p className="volunteer-form__lede content-en">
          Please attach the required documents clearly, and fill the approved CV
          template so team data stays consistent.
        </p>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            من فضلك قم برفع صورة لهويتك الشخصية *
          </label>
          <label style={labelStyle} className="content-en">
            Upload your ID document *
          </label>
          <span style={hintStyle} className="content-ar">
            يرجى أن يكون الوجه الأمامي والوجه الخلفي بصورة واحدة، ويمكن رفع أي
            وثيقة رسمية عند غياب الهوية.
          </span>
          <span style={hintStyle} className="content-en">
            Front and back in one image. Any official document is accepted if ID
            is unavailable.
          </span>
          <input
            required
            type="file"
            name="idDocument"
            accept="image/jpeg,image/png,image/webp"
            style={fieldStyle}
          />
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            من فضلك قم برفع صورة شخصية رسمية *
          </label>
          <label style={labelStyle} className="content-en">
            Upload an official personal photo *
          </label>
          <span style={hintStyle} className="content-ar">
            يجب أن تكون الصورة رسمية ذات خلفية بيضاء. للفتيات: بإمكانك رفع أي
            صورة رسمية بخلفية بيضاء تمثلك ولا تجدين حرجاً بمشاركتها معنا (صورة
            الهوية، أفاتار، أو صورة رسمية بالنقاب).
          </span>
          <span style={hintStyle} className="content-en">
            Official photo with a white background. Any respectful official
            representation with a white background is accepted.
          </span>
          <input
            required
            type="file"
            name="personalPhoto"
            accept="image/jpeg,image/png,image/webp"
            style={fieldStyle}
          />
        </div>

        <div className="volunteer-form__cv-note">
          <p className="content-ar">
            يرجى تحميل نموذج السيرة الذاتية المعتمد من خلال الرابط التالي:
          </p>
          <p className="content-en">
            Download the approved CV template from this link:
          </p>
          <a
            href={VOLUNTEER_CV_TEMPLATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            {VOLUNTEER_CV_TEMPLATE_URL}
          </a>
        </div>

        <div className="volunteer-form__field">
          <label style={labelStyle} className="content-ar">
            يرجى رفع السيرة الذاتية بعد استكمال بياناتها *
          </label>
          <label style={labelStyle} className="content-en">
            Upload the completed CV *
          </label>
          <input
            required
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={fieldStyle}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting || hobbies.length === 0}
        className="volunteer-form__submit"
      >
        {submitting ? (
          <>
            <span className="content-ar">جاري الإرسال...</span>
            <span className="content-en">Submitting...</span>
          </>
        ) : (
          <>
            <span className="content-ar">إرسال الطلب</span>
            <span className="content-en">Submit Request</span>
          </>
        )}
      </button>
    </form>
  );
}
