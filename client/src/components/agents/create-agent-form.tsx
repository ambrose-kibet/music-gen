import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Switch } from "@/components/ui/switch";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FaTimes, FaFacebook, FaYoutube } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { frequencyItems, ShareToItems } from "@/lib/style-items";
import audius from "@/assets/audius.svg";
import CircularProgress from "../circular-progress-bar";
import { CreateBeatBotSchema } from "@/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import { useParams } from "react-router-dom";

type AgentValues = z.infer<typeof CreateBeatBotSchema>;

// Small inline circular progress component (SVG)

const stepFields: Array<Array<keyof AgentValues>> = [
  ["title", "description"],
  ["promptDetails"],
  ["frequency", "isActive"],
];

const CreateAgentForm: React.FC<{
  isEditMode?: boolean;
  defaultValues?: Partial<AgentValues>;
}> = ({ defaultValues, isEditMode = false }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<number>(0);
  const queryClient = useQueryClient();
  const params = useParams();
  const agentId = params.agentId;

  const form = useForm<AgentValues>({
    resolver: zodResolver(CreateBeatBotSchema) as any,
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      promptDetails: defaultValues?.promptDetails ?? [
        { prompt: "", shareTo: [] },
      ],
      frequency: defaultValues?.frequency ?? ["monday"],
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "promptDetails",
  });
  const next = async () => {
    const fields = stepFields[step] || [];
    const ok = await form.trigger(fields as any);
    if (ok) setStep((s) => Math.min(s + 1, stepFields.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));
  const { mutate: botMutation } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateBeatBotSchema>) => {
      const formattedData = {
        name: values.title,
        description: values.description,
        frequency: values.frequency,
        isActive: values.isActive,
        requests: JSON.stringify(values.promptDetails),
      };

      if (isEditMode && agentId) {
        // Handle edit mode submission
        const response = await customAxios.patch(
          `/bots/${agentId}`,
          formattedData
        );
        return response.data;
      }
      const response = await customAxios.post("/bots", formattedData);
      return response.data;
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message ||
          `An error occurred while ${isEditMode ? "updating" : "creating"} bot.`
      );
    },
    onSuccess: () => {
      setSuccess(`Bot ${isEditMode ? "updated" : "created"} successfully!`);
      setStep(0);
      if (!isEditMode) {
        form.reset();
      } else {
        queryClient.invalidateQueries({
          queryKey: ["user-bot", agentId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["user-bots"],
      });
    },
  });
  async function handleSubmit(values: AgentValues) {
    setError(undefined);
    setSuccess(undefined);
    botMutation(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 max-h-[67vh] overflow-y-auto "
      >
        {/* Progress indicator: circular + step label */}
        <div className="flex items-center justify-center mx-auto">
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center">
              <CircularProgress
                percent={Math.round(((step + 1) / stepFields.length) * 100)}
                size={60}
                strokeWidth={6}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Step {step + 1}/{stepFields.length}
              </div>
            </div>
          </div>
        </div>
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Basic info</h3>
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Beat bot title" {...field} />
                  </FormControl>
                  <FormMessage className="text-left" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="border-none"
                      placeholder="Short description of the agent's purpose"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left" />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Prompt & Sharing</h3>
            </div>
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="border p-4 rounded-md relative bg-secondary"
              >
                {fields.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-600"
                    onClick={() => remove(index)}
                  >
                    <FaTimes />
                  </Button>
                )}
                <FormField
                  control={form.control}
                  name={`promptDetails.${index}.prompt` as const}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-sm text-muted-foreground">
                        Prompt
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          className="border-none"
                          placeholder="Enter the prompt for the agent"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-sm  mb-2">
                    Share To (optional)
                  </FormLabel>
                  <FormDescription className="text-xs text-left -mt-2">
                    where should the generated content be shared?
                  </FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {ShareToItems.map((item) => (
                      <div
                        key={`${index}-${item.value}`}
                        className="flex items-center"
                      >
                        {/* use checkbox */}
                        <FormField
                          control={form.control}
                          name={`promptDetails.${index}.shareTo` as const}
                          render={() => {
                            const current =
                              form.getValues(
                                `promptDetails.${index}.shareTo`
                              ) || [];
                            const isChecked = current.includes(item.value);
                            return (
                              <Checkbox
                                id={`${index}-${item.value}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    // add item
                                    form.setValue(
                                      `promptDetails.${index}.shareTo`,
                                      [...current, item.value]
                                    );
                                  } else {
                                    // remove item
                                    form.setValue(
                                      `promptDetails.${index}.shareTo`,
                                      current.filter((d) => d !== item.value)
                                    );
                                  }
                                }}
                              />
                            );
                          }}
                        />
                        <Label
                          htmlFor={`${index}-${item.value}`}
                          className="ml-2 flex items-center space-x-1"
                        >
                          {item.value === "facebook" && (
                            <FaFacebook className="text-blue-600" />
                          )}
                          {item.value === "youtube" && (
                            <FaYoutube className="text-red-600" />
                          )}
                          {item.value === "whatsapp" && <IoLogoWhatsapp />}
                          {item.value === "audius" && (
                            <img
                              src={audius}
                              alt="Audius"
                              className="w-4 h-4"
                            />
                          )}
                          <span>{item.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {fields.length < 5 && (
              <Button
                variant="outline"
                type="button"
                onClick={() => append({ prompt: "", shareTo: [] })}
              >
                Add Another Prompt
              </Button>
            )}
            {form.formState.errors.promptDetails && (
              <p className="text-sm text-red-600">
                {form.formState.errors.promptDetails.message as string}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2"></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 flex flex-col w-full">
            <h3 className="text-lg font-medium">Run Frequency & Status</h3>
            {frequencyItems.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={() => {
                    const current = form.getValues("frequency") || [];
                    const isChecked = current.includes(day as any);
                    return (
                      <Checkbox
                        id={day}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // add day
                            form.setValue("frequency", [
                              ...current,
                              day as any,
                            ]);
                          } else {
                            // remove day
                            form.setValue(
                              "frequency",
                              current.filter((d) => d !== day)
                            );
                          }
                        }}
                      />
                    );
                  }}
                />
                <Label htmlFor={day} className="capitalize">
                  {day}
                </Label>
              </div>
            ))}
            {form.formState.errors.frequency && (
              <p className="text-sm text-red-600 text-left">
                {form.formState.errors.frequency.message as string}
              </p>
            )}
            <hr />
            <div className="grid grid-cols-2 gap-4">
              {isEditMode && (
                <div className="flex flex-col">
                  <h4 className="font-medium mb-2">Bot Status</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) =>
                        form.setValue("isActive", checked)
                      }
                    />
                    <Label htmlFor="isActive">
                      {form.watch("isActive") ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={back} type="button">
              Back
            </Button>
          )}

          {step < stepFields.length - 1 && (
            <Button className="ml-auto" type="button" onClick={next}>
              Next
            </Button>
          )}

          {step === stepFields.length - 1 && (
            <Button type="submit" className="ml-auto  rounded-full text-white">
              {isEditMode ? "Save Changes" : "Create Bot"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateAgentForm;
