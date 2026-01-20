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
import { Input } from "@/components/ui/input";
import { ResetSchema } from "@/schemas";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useState } from "react";

import CardWrapper from "@/components/auth/card-wrapper";
import { useMutation } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import { AxiosError } from "axios";

const ForgotPassword = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof ResetSchema>) => {
      return customAxios.post("/auth/forgot-password", values);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error?.response?.status === 400) {
          return setError(error?.response?.data.message);
        }
        return setError(error.message);
      }
      setError(error.message);
    },
    onSuccess: () => {
      setSuccess(
        "Password reset email sent, please check your email. If you don't see it, check your spam folder."
      );
      form.reset();
    },
  });
  function onSubmit(values: z.infer<typeof ResetSchema>) {
    setError("");
    setSuccess("");
    mutate(values);
  }
  return (
    <CardWrapper
      backButtonLabel="Back to login"
      backButtonLink="/auth"
      headerLabel="Forgot your password?"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="janedoe@mail.com"
                    {...field}
                    type="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            send reset email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
export default ForgotPassword;
