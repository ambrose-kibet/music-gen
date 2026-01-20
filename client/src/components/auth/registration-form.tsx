import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { RegistrationSchema, AccountVerificationSchema } from "@/schemas";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import { AxiosError } from "axios";

import { useNavigate } from "react-router-dom";
import { setLocalStorageItem } from "@/utils/local-storage";
import useUserStore from "@/store/user-store";
import type { User } from "@/utils/types";

const RegistrationForm: React.FC<{
  isVerifying: boolean;
  setIsVerifying: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isVerifying, setIsVerifying }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const form = useForm<z.infer<typeof RegistrationSchema>>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      isShowPassword: false,
      code: undefined,
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof RegistrationSchema>) => {
      return customAxios.post("/auth/register", values);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return setError(error?.response?.data.message || error.message);
      }
      setError(error.message);
    },
    onSuccess: () => {
      setSuccess(
        "Registration successful please check your email to verify your account",
      );
      setIsVerifying(true);
    },
  });
  const { mutate: verifyMutation, isPending: isAccountVerifying } = useMutation(
    {
      mutationFn: (values: z.infer<typeof AccountVerificationSchema>) => {
        return customAxios.post("/auth/verify", values);
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          return setError(error?.response?.data.message || error.message);
        }
        setError(error.message);
      },
      onSuccess: (data) => {
        setUser(data as unknown as User);
        setLocalStorageItem("user", JSON.stringify(data));
        setSuccess(
          "Account verified successfully. Redirecting to dashboard...",
        );
        form.reset();
        setIsVerifying(false);
        navigate("/");
      },
    },
  );

  function onSubmit(
    values:
      | z.infer<typeof RegistrationSchema>
      | z.infer<typeof AccountVerificationSchema>,
  ) {
    setError("");
    setSuccess("");
    if (isVerifying) {
      const result = AccountVerificationSchema.safeParse(values);
      if (!result.success) {
        setError(result.error.issues.map((e) => e.message).join(", "));
        return;
      }
      verifyMutation(result.data);
    } else {
      const result = RegistrationSchema.safeParse(values);
      if (!result.success) {
        setError(result.error.issues.map((e) => e.message).join(", "));
        return;
      }
      mutate(result.data);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className={isVerifying ? "hidden" : "space-y-5"}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="jane doe" {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    type={
                      form.watch("isShowPassword") === true
                        ? "text"
                        : "password"
                    }
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
              <FormItem className="col-span-full flex flex-row items-center space-x-3 space-y-0 rounded-md">
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
        </div>
        <div
          className={
            isVerifying
              ? "space-y-5 flex align-center justify-center"
              : "hidden"
          }
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />{" "}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || isAccountVerifying}
        >
          {isVerifying ? "Verify Account" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};
export default RegistrationForm;
