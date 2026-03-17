'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewList } from './ReviewList';

interface ProductTabsProps {
  product: {
    description: string;
    attributes?: any[];
    tags?: string[];
    id: string;
  };
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {product.description}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="specs" className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Specifications</h3>
        {product.attributes && product.attributes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.attributes
              .filter((attr) => attr.visible)
              .map((attribute, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 pb-3"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {attribute.name}
                  </span>
                  <p className="font-medium">
                    {Array.isArray(attribute.value)
                      ? attribute.value.join(', ')
                      : attribute.value}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No specifications available.
          </p>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <ReviewList productId={product.id} />
      </TabsContent>
    </Tabs>
  );
}
