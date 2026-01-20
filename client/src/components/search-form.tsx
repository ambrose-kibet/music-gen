import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";

const SearchSchema = z.object({
  query: z.string().optional(),
});

type SearchValues = z.infer<typeof SearchSchema>;

const SearchForm: React.FC<{
  onSubmit: (values: SearchValues) => void;
  defaultValues?: Partial<SearchValues>;
}> = ({ onSubmit, defaultValues }) => {
  const form = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { query: "", ...(defaultValues ?? {}) },
  });

  const handle = (values: SearchValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="w-full">
        <div className="flex w-full gap-0 rounded-full ">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Search"
                    {...field}
                    className="rounded-l-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="rounded-r-full ">
            <FaSearch />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SearchForm;
