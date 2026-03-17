import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { getPublicProductBySlug } from '@/lib/api-client';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getPublicProductBySlug(slug);
  const product = result.data;

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Product Info */}
        <ProductInfo product={product} />
      </div>

      {/* Product Tabs (Description, Reviews, Specs) */}
      <ProductTabs product={product} />
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getPublicProductBySlug(slug);
  const product = result.data;

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription || product.shortDescription,
    keywords: product.metaKeywords?.join(', '),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map((img: any) => img.url),
    },
  };
}
