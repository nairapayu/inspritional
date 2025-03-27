import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertQuoteSchema } from "@shared/schema";
import type { QuoteWithCategory, Category } from "@shared/schema";

const formSchema = insertQuoteSchema.extend({
  categoryId: z.number().nullable(),
});

interface QuoteFormProps {
  quote?: QuoteWithCategory | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const QuoteForm = ({ quote, categories, onSubmit, isSubmitting = false }: QuoteFormProps) => {
  const defaultValues = quote
    ? {
        text: quote.text,
        author: quote.author,
        categoryId: quote.categoryId,
        backgroundUrl: quote.backgroundUrl,
        isAiGenerated: quote.isAiGenerated
      }
    : {
        text: "",
        author: "",
        categoryId: null,
        backgroundUrl: "",
        isAiGenerated: false
      };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter quote text"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Enter author name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))}
                value={field.value?.toString() || "0"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="backgroundUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isAiGenerated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">AI Generated</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Mark this quote as AI generated
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white"
          >
            {quote ? "Update Quote" : "Add Quote"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuoteForm;
