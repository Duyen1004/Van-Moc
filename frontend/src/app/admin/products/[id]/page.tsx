import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { id } = await params;

  return <AdminWorkspace role="admin" page="product-edit" productSlug={id} />;
}
