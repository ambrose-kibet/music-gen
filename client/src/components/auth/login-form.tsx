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
import { LoginSchema } from "@/schemas";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { useState } from "react";

import { Checkbox } from "../ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import { AxiosError } from "axios";
import { setLocalStorageItem } from "@/utils/local-storage";
import useUserStore from "@/store/user-store";

const LoginForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      isShowPassword: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: z.infer<typeof LoginSchema>) => {
      return customAxios.post("/auth/login", values);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return setError(error?.response?.data.message);
      }
      setError(error.message);
    },
    onSuccess: async ({ data }) => {
      setUser(data);
      setLocalStorageItem("user", JSON.stringify(data));

      setSuccess("Authentication successful, redirecting to dashboard...");
      form.reset();
      navigate("/");
    },
  });

  function onSubmit(values: z.infer<typeof LoginSchema>) {
    setError("");
    setSuccess("");
    mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <>
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
                <Button
                  size={"sm"}
                  variant={"link"}
                  asChild
                  className="px-0 font-normal"
                >
                  <Link to="/auth/forgot-password">Forgot Password?</Link>
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </>

        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit" className="w-full" disabled={isPending}>
          Login
        </Button>
      </form>
    </Form>
  );
};
export default LoginForm;
