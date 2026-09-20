"use client";

import { useState } from "react";
import { InvolveCardIcon } from "@/components/InvolveCardIcon";
import { RequestModal } from "@/components/RequestModal";
import type { InvolveCard, InvolveCardIconKey } from "@/lib/site-content";

type Governorate = { id: string; nameAr: string };

type Props = {
  cards: InvolveCard[];
  governorates: Governorate[];
};

export function InvolveSectionClient({ cards, governorates }: Props) {
  const [modalType, setModalType] = useState<InvolveCardIconKey | null>(null);

  return (
    <>
      <div className="involve-grid" id="opportunities">
        {cards.map((card) => (
          <button
            key={card.title.en}
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
          </button>
        ))}
      </div>

      <RequestModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType}
        governorates={governorates}
      />
    </>
  );
}
