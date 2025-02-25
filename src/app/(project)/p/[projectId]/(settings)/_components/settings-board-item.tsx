"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown } from "lucide-react";
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
import { Separator } from "~/components/ui/separator";
import { useDeleteBoard, useUpdateBoard } from "~/lib/hooks";
import {
  type BoardUpdatePayload,
  BoardUpdatePayloadSchema,
} from "~/server/zod";

import { SettingsColumnList } from "./settings-column-list";

interface SettingsBoardItemProps {
  board: Board;
}

export function SettingsBoardItem({ board }: SettingsBoardItemProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<BoardUpdatePayload>({
    resolver: zodResolver(BoardUpdatePayloadSchema),
    defaultValues: board,
  });

  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();

  const onSubmit = async (data: BoardUpdatePayload) => {
    await updateBoardMutation.mutateAsync({
      boardId: board.id,
      data,
    });
    toast.success("Board updated!");
    setOpen(false);
  };

  return (
    <div className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: board.color }}
              />
              <h4 className="font-medium">{board.name}</h4>
            </div>
            <ChevronsUpDown className="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="mt-3 space-y-10 rounded-lg border p-3">
            <Form {...form}>
              <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>The name of the board.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <ColorPicker {...field} color={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>The color of the board.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" isLoading={updateBoardMutation.isPending}>
                  Save
                </Button>
              </form>
            </Form>

            <div className="space-y-6">
              <div className="space-y-4 rounded-lg border bg-secondary/25 p-4">
                <div>
                  <h3 className="text-lg font-medium">Columns</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage the columns of the board.
                  </p>
                </div>

                <Separator />

                <SettingsColumnList boardId={board.id} />
              </div>

              <div>
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Irreversible and destructive actions
                </p>
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg border border-destructive/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Delete Board</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this board and all of its data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Board</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the board &quot;{board.name}&quot; and all of
                          its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteBoardMutation.mutateAsync(board.id);
                            setOpen(false);
                          }}
                        >
                          Delete Board
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
