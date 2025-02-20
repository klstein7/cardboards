import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useGenerateBoard } from "~/lib/hooks";

interface GenerateBoardFormProps {
  projectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function GenerateBoardForm({
  projectId,
  open,
  setOpen,
}: GenerateBoardFormProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");

  const generateBoardMutation = useGenerateBoard();

  const handleGenerate = async () => {
    const board = await generateBoardMutation.mutateAsync({
      projectId,
      prompt,
    });

    setOpen(false);

    router.push(`/p/${projectId}/b/${board.id}`);
  };

  useEffect(() => {
    if (!open) {
      setPrompt("");
    }
  }, [open]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Textarea
          value={prompt}
          placeholder="E.g. I want to create a board to track my marketing campaign"
          className="resize-none"
          rows={4}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          onClick={handleGenerate}
          isLoading={generateBoardMutation.isPending}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
