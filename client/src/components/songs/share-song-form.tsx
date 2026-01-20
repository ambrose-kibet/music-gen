import { ShareSongSchema } from "@/schemas";
import customAxios from "@/lib/axios-config";
import { AxiosError, isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { FaShareFromSquare } from "react-icons/fa6";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { Button } from "../ui/button";

const ShareSongForm: React.FC<{
  defaultValues: ("facebook" | "whatsapp" | "audius" | "youtube")[];
  songId: string;
}> = ({ defaultValues = [], songId }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const form = useForm({
    resolver: zodResolver(ShareSongSchema),
    defaultValues: {
      shareTo: defaultValues,
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation<
    void,
    AxiosError,
    z.infer<typeof ShareSongSchema>
  >({
    mutationFn: async (data) => {
      await customAxios.post(`/songs/distribute/${songId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song", songId] });
      setSuccess("Song queued successfully!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        setError(
          (error.response?.data as any)?.message ||
            "An error occurred while sharing."
        );
      } else {
        setError("An error occurred while sharing.");
      }
    },
  });
  async function onSubmit(values: z.infer<typeof ShareSongSchema>) {
    setError(undefined);
    setSuccess(undefined);
    mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="shareTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg mx-auto text-primary">
                Share Song To
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-3 mt-2">
                  <Label className="flex items-center gap-3">
                    <Switch
                      checked={field.value?.includes("audius")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), "audius"]);
                        } else {
                          field.onChange(
                            (field.value || []).filter(
                              (item) => item !== "audius"
                            )
                          );
                        }
                      }}
                    />
                    Audius
                  </Label>
                  <Label className="flex items-center gap-3">
                    <Switch
                      checked={field.value?.includes("youtube")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), "youtube"]);
                        } else {
                          field.onChange(
                            (field.value || []).filter(
                              (item) => item !== "youtube"
                            )
                          );
                        }
                      }}
                    />
                    YouTube
                  </Label>
                  <Label className="flex items-center gap-3">
                    <Switch
                      checked={field.value?.includes("facebook")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), "facebook"]);
                        } else {
                          field.onChange(
                            (field.value || []).filter(
                              (item) => item !== "facebook"
                            )
                          );
                        }
                      }}
                    />
                    Facebook
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          className="w-full rounded-full text-white cursor-pointer"
        >
          <FaShareFromSquare size={18} />
          Share Song
        </Button>
      </form>
    </Form>
  );
};
export default ShareSongForm;
