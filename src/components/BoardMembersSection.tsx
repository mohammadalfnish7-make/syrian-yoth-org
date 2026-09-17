import Image from "next/image";

export type PublicBoardMember = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  roleAr: string;
  roleEn: string | null;
  bioAr: string | null;
  bioEn: string | null;
  imageUrl: string | null;
};

type BoardMembersSectionProps = {
  members: PublicBoardMember[];
};

export function BoardMembersSection({ members }: BoardMembersSectionProps) {
  if (members.length === 0) return null;

  return (
    <div className="board-members-grid">
      {members.map((member) => (
        <article key={member.id} className="board-member-card">
          <div className="board-member-card__frame">
            <span className="board-member-card__accent" aria-hidden="true" />
            <div className="board-member-card__media">
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={member.nameAr}
                  fill
                  className="board-member-card__image"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={
                    member.imageUrl.startsWith("/api/uploads/") ||
                    member.imageUrl.startsWith("/images/managers/")
                  }
                />
              ) : (
                <div className="board-member-card__placeholder" aria-hidden="true">
                  {member.nameAr.charAt(0)}
                </div>
              )}
              <div className="board-member-card__overlay" aria-hidden="true" />
              <div className="board-member-card__content">
                <h3 className="board-member-card__name content-ar">{member.nameAr}</h3>
                <h3 className="board-member-card__name content-en">
                  {member.nameEn || member.nameAr}
                </h3>
                <p className="board-member-card__role content-ar">{member.roleAr}</p>
                <p className="board-member-card__role content-en">
                  {member.roleEn || member.roleAr}
                </p>
                {member.bioAr ? (
                  <p className="board-member-card__bio content-ar" dir="rtl">
                    {member.bioAr}
                  </p>
                ) : null}
                {member.bioEn || member.bioAr ? (
                  <p className="board-member-card__bio content-en" dir="ltr">
                    {member.bioEn || member.bioAr}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
