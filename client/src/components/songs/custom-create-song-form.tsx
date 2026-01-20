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
import { CreateCustomSongSchema } from "@/schemas";
import { Switch } from "@/components/ui/switch";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { useState } from "react";
import { PiMusicNotesPlusFill } from "react-icons/pi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AxiosError } from "axios";
import customAxios from "@/lib/axios-config";
const CustomCreateSongForm: React.FC = () => {
  // disable submit when credits are 0
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const form = useForm({
    resolver: zodResolver(CreateCustomSongSchema),
    defaultValues: {
      lyrics: "",
      instrumental: false,
      prompt: "",
      lyricsType: "custom",
    },
  });
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateCustomSongSchema>) => {
      const data = {
        lyrics: values.lyricsType === "custom" ? values.lyrics : undefined,
        describedLyrics:
          values.lyricsType === "described" ? values.lyrics : undefined,
        instrumental: values.instrumental,
        prompt: values.prompt,
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
  async function onSubmit(values: z.infer<typeof CreateCustomSongSchema>) {
    setError(undefined);
    setSuccess(undefined);
    mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <RadioGroup
          defaultValue="custom"
          className="grid w-full grid-cols-2 gap-4"
          onValueChange={(value) =>
            form.setValue("lyricsType", value as "custom" | "described")
          }
        >
          <Label className="text-sm text-muted-foreground col-span-2">
            Lyrics Type
          </Label>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="r1" />
            <Label htmlFor="r1">Custom Lyrics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="described" id="r2" />
            <Label htmlFor="r2">Described Lyrics</Label>
          </div>
        </RadioGroup>
        <FormField
          control={form.control}
          name="lyrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-muted-foreground col-span-full">
                Lyrics
              </FormLabel>
              <FormControl>
                <Textarea
                  className="border-none"
                  placeholder={
                    form.watch("lyricsType") === "custom"
                      ? "(Verse 1)\nIts not just a dream, it’s the start of a way,\nBuilding the future where music will play.\nA model that listens, a model that grows,\nACE-Step is the rhythm the new world knows.\n\n(Chorus)\nACE-Step, the beat of tomorrow,\nCreating with passion, no time to borrow.\nFrom silence to sound, we’re breaking the mold,\nIn the heart of the music, our story is told."
                      : "A song about a journey through a magical forest"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-muted-foreground col-span-full">
                Prompt
              </FormLabel>
              <FormControl>
                <Textarea
                  className="border-none"
                  placeholder="country rock, folk rock, southern rock, bluegrass, pop"
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
export default CustomCreateSongForm;
