import type { Metadata } from "next";

type SeoOptions = {
  title: string;
  description?: string;
};

export function createSeo({ title, description }: SeoOptions): Metadata {
  return {
    title,
    description,
  };
}
