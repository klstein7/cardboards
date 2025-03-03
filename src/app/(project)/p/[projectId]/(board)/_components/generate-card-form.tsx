"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

// Schema for AI prompt
const generateCardSchema = z.object({
  prompt: z.string().min(1, "Please provide a description for your card"),
});

type GenerateCardInput = z.infer<typeof generateCardSchema>;

interface GenerateCardFormProps {
  columnId: string;
  setOpen: (open: boolean) => void;
}

export function GenerateCardForm({ columnId, setOpen }: GenerateCardFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateCardInput>({
    resolver: zodResolver(generateCardSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleGenerateCard = async (data: GenerateCardInput) => {
    setIsGenerating(true);
    try {
      // This will be implemented later with actual AI generation
      console.log("Generate card with prompt:", data.prompt);
      console.log("For column:", columnId);

      // Simulate a delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success
      setOpen(false);
    } catch (error) {
      console.error("Error generating card:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleGenerateCard)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe the card you want to create</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Create a task for implementing user authentication with OAuth"
                  {...field}
                  rows={4}
                  className="mt-2"
                />
              </FormControl>
              <FormDescription className="mt-1">
                Provide details about what the card should include, its
                priority, deadlines, etc.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isGenerating}
            className="gap-2"
            isLoading={isGenerating}
          >
            {!isGenerating && <Sparkles className="size-4" />}
            Generate Card
          </Button>
        </div>
      </form>
    </Form>
  );
}
