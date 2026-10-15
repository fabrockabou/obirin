"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ImageAsset, PriceVariant } from "@/data/types";

type State = {
  images: ImageAsset[];
  index: number;
  setIndex: (i: number) => void;
  variants?: PriceVariant[];
  variant?: PriceVariant;
  selectVariant: (id: string) => void;
};

const Ctx = createContext<State | null>(null);

/** État partagé d'une fiche produit : image affichée dans la galerie et variante choisie. */
export function ProductStateProvider({
  images,
  variants,
  children,
}: {
  images: ImageAsset[];
  variants?: PriceVariant[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [variantId, setVariantId] = useState(variants?.[0]?.id);
  const value = useMemo<State>(() => {
    const variant = variants?.find((v) => v.id === variantId);
    return {
      images,
      index,
      setIndex: (i) => setIndex((i + images.length) % images.length),
      variants,
      variant,
      selectVariant: (id) => {
        setVariantId(id);
        const v = variants?.find((x) => x.id === id);
        const i = v ? images.findIndex((im) => im.src === v.image.src) : -1;
        if (i >= 0) setIndex(i);
      },
    };
  }, [images, index, variants, variantId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProductState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProductState doit être utilisé dans ProductStateProvider");
  return ctx;
}
