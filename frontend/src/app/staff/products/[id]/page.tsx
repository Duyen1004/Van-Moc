import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

type StaffProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffProductEditPage({ params }: StaffProductEditPageProps) {
  const { id } = await params;

  return <AdminWorkspace role="staff" page="product-edit" productSlug={id} />;
}
