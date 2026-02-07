import EditCouponCard from "@/components/admin/edit-coupon-card";

interface EditCouponPageProps {
  params: Promise<{ couponId: string }>;
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const { couponId } = await params;
  return <EditCouponCard couponId={couponId} />;
}
