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
import { ResetPasswordSchema } from "@/schemas";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useState } from "react";
import CardWrapper from "@/components/auth/card-wrapper";
import { useSearchParams } from "react-router-dom";
import { Checkbox } from "../ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import { AxiosError } from "axios";

const ResetPasswordForm = () => {
  const [useParams] = useSearchParams();
  const token = useParams.get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
      isShowPassword: false,
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof ResetPasswordSchema>) => {
      return customAxios.post("/auth/reset-password", values);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return setError(error?.response?.data.message);
      }
      setError(error.message);
    },
    onSuccess: () => {
      setSuccess("Password reset successful, please login to continue");
      form.reset();
    },
  });
  function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    setError("");
    setSuccess("");
    mutate(values);
  }
  return (
    <CardWrapper
      backButtonLabel="Back to login"
      backButtonLink="/auth"
      headerLabel="Enter your new password"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="******"
                    {...field}
                    type={form.watch("isShowPassword") ? "text" : "password"}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="******"
                    {...field}
                    type={form.watch("isShowPassword") ? "text" : "password"}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isShowPassword"
            render={({ field }) => (
              <FormItem className="col-span-full flex flex-row items-center space-x-3 space-y-0 rounded-md shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Show Password?</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
export default ResetPasswordForm;
