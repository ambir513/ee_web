import EditProductCard from "@/components/admin/edit-product-card";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  return <EditProductCard productId={productId} />;
}
