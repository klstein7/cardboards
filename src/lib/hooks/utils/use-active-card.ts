import { useAtom } from "jotai";

import { activeCardAtom } from "~/app/(project)/p/[projectId]/(board)/_atoms";

export function useActiveCard() {
  const [activeCard, setActiveCard] = useAtom(activeCardAtom);
  return { activeCard, setActiveCard };
}
