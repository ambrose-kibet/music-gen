import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateSimpleSongSchema } from "@/schemas";
import { Switch } from "@/components/ui/switch";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { PiMusicNotesPlusFill } from "react-icons/pi";
import { clsx } from "clsx";
import STYLE_ITEMS from "@/lib/style-items";
import customAxios from "@/lib/axios-config";
import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const SimpleCreateSongForm: React.FC = () => {
  // disable submit when credits are 0
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const form = useForm({
    resolver: zodResolver(CreateSimpleSongSchema),
    defaultValues: {
      description: "",
      instrumental: false,
      inspiration: [""],
    },
  });
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateSimpleSongSchema>) => {
      const data = {
        fullyDescribedSong:
          values.description +
          ((values.inspiration || []).length > 0 &&
          (values.inspiration || [])[0] !== ""
            ? "\n\nInspiration: " + (values.inspiration || []).join(", ")
            : ""),
        instrumental: values.instrumental,
      };
      return await customAxios.post("/songs", data);
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["userSongs", "latest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userSongs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      setSuccess("Song created successfully!");
      form.setValue("inspiration", [""]);
      form.reset();
    },
    onError(error) {
      if (error instanceof AxiosError) {
        setError(
          "Error creating song: " +
            (error.response?.data?.message || error.message),
        );
      }
    },
  });
  async function onSubmit(values: z.infer<typeof CreateSimpleSongSchema>) {
    setError(undefined);
    setSuccess(undefined);
    mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="border-none"
                  placeholder="Enter song description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="instrumental"
            checked={form.watch("instrumental")}
            onCheckedChange={(checked) =>
              form.setValue("instrumental", checked)
            }
          />
          <Label htmlFor="instrumental">Instrumental</Label>
        </div>
        <hr />
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Inspiration (Optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {STYLE_ITEMS.map((item) => (
              <Button
                key={item}
                type="button"
                variant={
                  (form.watch("inspiration") || []).includes(item)
                    ? "ghost"
                    : "outline"
                }
                onClick={() => {
                  const current = form.getValues("inspiration") || [];
                  if (current.includes(item)) {
                    form.setValue(
                      "inspiration",
                      current.filter((i) => i !== item),
                    );
                  } else {
                    form.setValue("inspiration", [...current, item]);
                  }
                }}
                className={clsx(
                  "border-dashed rounded-full",
                  (form.watch("inspiration") || []).includes(item)
                    ? "border-primary "
                    : "border-muted-foreground",
                )}
              >
                {item}
                {(form.watch("inspiration") || []).includes(item) && (
                  <FaTimes className="ml-2" />
                )}
              </Button>
            ))}
          </div>
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          className="w-full rounded-full text-white cursor-pointer"
        >
          <PiMusicNotesPlusFill />
          Create Song
        </Button>
      </form>
    </Form>
  );
};
export default SimpleCreateSongForm;
