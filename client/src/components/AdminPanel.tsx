import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Edit, Trash2, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import QuoteForm from "./QuoteForm";
import { QuoteWithCategory, Category } from "@shared/schema";

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [page, setPage] = useState(1);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteWithCategory | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch quotes
  const { 
    data: quotes = [], 
    isLoading: isLoadingQuotes,
    refetch: refetchQuotes
  } = useQuery<QuoteWithCategory[]>({
    queryKey: ['/api/quotes', page],
  });
  
  // Fetch categories
  const { 
    data: categories = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Add quote mutation
  const addQuoteMutation = useMutation({
    mutationFn: (quoteData: any) => {
      return apiRequest('POST', '/api/quotes', quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setIsAddQuoteOpen(false);
      toast({
        title: "Quote added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update quote mutation
  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => {
      return apiRequest('PUT', `/api/quotes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setEditingQuote(null);
      toast({
        title: "Quote updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setDeletingQuoteId(null);
      toast({
        title: "Quote deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: (name: string) => {
      return apiRequest('POST', '/api/categories', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setNewCategoryName("");
      toast({
        title: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle quote submission from form
  const handleQuoteSubmit = (data: any) => {
    if (editingQuote) {
      updateQuoteMutation.mutate({ id: editingQuote.id, data });
    } else {
      addQuoteMutation.mutate(data);
    }
  };
  
  // Handle creating a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addCategoryMutation.mutate(newCategoryName);
  };
  
  // Confirm and delete a quote
  const confirmDeleteQuote = () => {
    if (deletingQuoteId !== null) {
      deleteQuoteMutation.mutate(deletingQuoteId);
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-custom shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-xl font-medium">Admin Panel</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <Tabs defaultValue="quotes" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="border-b border-gray-200 w-full justify-start rounded-none">
                <TabsTrigger value="quotes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Manage Quotes
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Categories
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  AI Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="quotes" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">All Quotes</h3>
                  <Button 
                    onClick={() => setIsAddQuoteOpen(true)}
                    className="bg-primary text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Quote
                  </Button>
                </div>

                {/* Quote Table */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingQuotes ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm">Loading quotes...</td>
                        </tr>
                      ) : quotes.length > 0 ? (
                        quotes.map((quote) => (
                          <tr key={quote.id}>
                            <td className="px-6 py-4 whitespace-normal text-sm max-w-[250px] truncate">
                              "{quote.text}"
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{quote.author}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{quote.categoryName || "Uncategorized"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button 
                                variant="ghost" 
                                className="text-primary hover:text-opacity-80 mr-2"
                                onClick={() => setEditingQuote(quote)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="text-red-500 hover:text-opacity-80"
                                onClick={() => setDeletingQuoteId(quote.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm">No quotes found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-secondary">
                    {quotes.length > 0 ? `Showing ${(page - 1) * 10 + 1}-${(page - 1) * 10 + quotes.length} quotes` : "No quotes found"}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant={page === 1 ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPage(1)}
                    >
                      1
                    </Button>
                    {quotes.length === 10 && (
                      <Button 
                        variant={page === 2 ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPage(2)}
                      >
                        2
                      </Button>
                    )}
                    {quotes.length === 10 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Add New Category</h3>
                      <div className="flex gap-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                        <Button 
                          onClick={handleAddCategory}
                          disabled={addCategoryMutation.isPending}
                          className="bg-primary text-white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Existing Categories</h3>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote Count</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {isLoadingCategories ? (
                              <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-sm">Loading categories...</td>
                              </tr>
                            ) : categories.length > 0 ? (
                              categories.map((category) => (
                                <tr key={category.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">{category.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {quotes.filter(quote => quote.categoryId === category.id).length}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-sm">No categories found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">AI Quote Generation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure how AI-generated quotes are created and displayed within the app.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key">OpenAI API Key</Label>
                        <Input id="api-key" type="password" placeholder="Enter your OpenAI API key" />
                        <p className="text-xs text-gray-500">
                          This key is used for generating AI quotes. Keep it secure.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ai-model">AI Model</Label>
                        <Select defaultValue="gpt-4o">
                          <SelectTrigger id="ai-model">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ai-prompt">Default AI Prompt</Label>
                        <Textarea 
                          id="ai-prompt" 
                          placeholder="Enter default prompt for AI quote generation"
                          className="min-h-[100px]"
                          defaultValue="Create a motivational quote that inspires action and positive change."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-primary text-white">
                    Save AI Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Quote Dialog */}
      <Dialog 
        open={isAddQuoteOpen || editingQuote !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddQuoteOpen(false);
            setEditingQuote(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Edit Quote" : "Add New Quote"}
            </DialogTitle>
          </DialogHeader>
          
          <QuoteForm 
            quote={editingQuote} 
            categories={categories} 
            onSubmit={handleQuoteSubmit}
            isSubmitting={addQuoteMutation.isPending || updateQuoteMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deletingQuoteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingQuoteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteQuote}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminPanel;
