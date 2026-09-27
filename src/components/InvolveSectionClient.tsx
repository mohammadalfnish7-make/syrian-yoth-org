"use client";

import { useState } from "react";
import { InvolveCardIcon } from "@/components/InvolveCardIcon";
import { RequestModal } from "@/components/RequestModal";
import type { InvolveCard, InvolveCardIconKey } from "@/lib/site-content";

type Governorate = { id: string; nameAr: string };

type Props = {
  cards: InvolveCard[];
  governorates: Governorate[];
  initialProgramName?: string;
  openProgram?: boolean;
};

export function InvolveSectionClient({
  cards,
  governorates,
  initialProgramName = "",
  openProgram = false,
}: Props) {
  const [modalType, setModalType] = useState<InvolveCardIconKey | null>(
    openProgram ? "program" : null
  );

  return (
    <>
      <div className="involve-grid" id="opportunities">
        {cards.map((card) => (
          <button
            key={card.title.en}
            id={card.icon}
            type="button"
            onClick={() => setModalType(card.icon)}
            className="involve-card text-right hover:scale-[1.02] transition-transform cursor-pointer block w-full appearance-none bg-transparent border-0"
            style={{ textAlign: "inherit" }}
          >
            <div className={`involve-card__icon involve-card__icon--${card.icon}`}>
              <InvolveCardIcon name={card.icon} />
            </div>
            <h3 className="involve-card__title content-ar">{card.title.ar}</h3>
            <h3 className="involve-card__title content-en">{card.title.en}</h3>
            <p className="involve-card__desc content-ar">{card.description.ar}</p>
            <p className="involve-card__desc content-en">{card.description.en}</p>
            <p className="involve-card__meta content-ar">
              <strong>الوقت: </strong>
              {card.commitment.ar}
            </p>
            <p className="involve-card__meta content-en">
              <strong>Time: </strong>
              {card.commitment.en}
            </p>
            <p className="involve-card__meta content-ar">
              <strong>المطلوب: </strong>
              {card.skills.ar}
            </p>
            <p className="involve-card__meta content-en">
              <strong>You need: </strong>
              {card.skills.en}
            </p>
          </button>
        ))}
      </div>

      <RequestModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType}
        governorates={governorates}
        initialProgramName={initialProgramName}
      />
    </>
  );
}
