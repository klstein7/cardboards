"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  LayoutGrid,
  Loader2,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { type Board } from "~/app/(project)/_types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ColorPicker } from "~/components/ui/color-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  useCardCountByBoardId,
  useColumns,
  useDeleteBoard,
  useUpdateBoard,
} from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";
import {
  type BoardUpdatePayload,
  BoardUpdatePayloadSchema,
} from "~/server/zod";

interface SettingsBoardItemProps {
  board: Board;
}

export function SettingsBoardItem({ board }: SettingsBoardItemProps) {
  const [open, setOpen] = useState(false);
  const columns = useColumns(board.id);
  const cardCount = useCardCountByBoardId(board.id);
  const isAdmin = useIsAdmin();

  const columnsCount = columns.data?.length ?? 0;
  const cardsCount = cardCount.data ?? 0;

  const form = useForm<BoardUpdatePayload>({
    resolver: zodResolver(BoardUpdatePayloadSchema),
    defaultValues: board,
  });

  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();

  const onSubmit = async (data: BoardUpdatePayload) => {
    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        data,
      });
      toast.success("Board updated successfully");
    } catch (error) {
      toast.error("Failed to update board");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoardMutation.mutateAsync(board.id);
      toast.success("Board deleted successfully");
    } catch (error) {
      toast.error("Failed to delete board");
      console.error(error);
    }
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "overflow-hidden transition-all duration-300",
        open ? "bg-muted/50" : "hover:bg-muted/30",
      )}
    >
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex flex-1 items-center gap-2 overflow-hidden sm:gap-3">
            <div
              className="h-3 w-3 shrink-0 rounded-full sm:h-4 sm:w-4"
              style={{ backgroundColor: board.color }}
            />
            <span className="truncate font-medium">{board.name}</span>

            <div className="ml-1 flex flex-wrap items-center gap-1 sm:ml-2 sm:gap-2">
              <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-xs">
                <LayoutGrid className="h-3 w-3" />
                <span>{columnsCount}</span>
              </Badge>

              <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-xs">
                <FileText className="h-3 w-3" />
                <span>{cardsCount}</span>
              </Badge>

              <Badge
                variant="secondary"
                className="hidden gap-1 px-1.5 py-0 text-xs sm:flex"
              >
                <Calendar className="h-3 w-3" />
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
              </Badge>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {updateBoardMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t px-3 py-3 sm:px-4 sm:py-4">
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-base font-medium sm:text-lg">
                Board Settings
              </h3>
              <div className="rounded-lg border bg-card p-3 sm:p-4">
                <Form {...form}>
                  <form
                    className="space-y-3 sm:space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Board name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter board name"
                              {...field}
                              disabled={!isAdmin}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            This is how the board will appear in your project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Board color
                          </FormLabel>
                          <FormControl>
                            <ColorPicker
                              {...field}
                              color={field.value ?? ""}
                              disabled={!isAdmin}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            This color will be used for board visualization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              type="button"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              <Trash className="mr-1.5 h-4 w-4 sm:mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete board &quot;{board.name}&quot;?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this board and remove all
                                associated columns and cards.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                              <AlertDialogCancel className="w-full sm:w-auto">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
                              >
                                {deleteBoardMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin sm:mr-2" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete board"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {isAdmin && (
                        <Button
                          type="submit"
                          size="sm"
                          className="w-full sm:w-auto"
                          disabled={
                            !form.formState.isDirty ||
                            updateBoardMutation.isPending
                          }
                        >
                          {updateBoardMutation.isPending ? (
                            <>
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin sm:mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save changes"
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
