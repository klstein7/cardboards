import { atom } from "jotai";

import { type Card } from "../../../../_types";

export const activeCardAtom = atom<Card | null>(null);
