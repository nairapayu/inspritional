import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryButtonsProps {
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const CategoryButtons = ({ selectedCategoryId, onSelectCategory }: CategoryButtonsProps) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array(6).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    );
  }
  
  if (!categories?.length) {
    return <p className="text-sm text-muted-foreground">No categories available</p>;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedCategoryId === null ? "default" : "outline"}
        className={`px-4 py-2 rounded-full cursor-pointer ${
          selectedCategoryId === null ? "bg-primary text-white" : "hover:bg-gray-50"
        }`}
        onClick={() => onSelectCategory(null)}
      >
        All
      </Badge>
      
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          className={`px-4 py-2 rounded-full cursor-pointer ${
            selectedCategoryId === category.id 
              ? "bg-primary text-white" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryButtons;
