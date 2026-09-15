export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
};
