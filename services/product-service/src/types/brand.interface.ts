export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  // Media
  logo?: string;
  banner?: string;

  // External Links
  website?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Settings
  isActive: boolean;
  displayOrder: number;

  // Products
  productCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBrandInput {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface IUpdateBrandInput extends Partial<ICreateBrandInput> {
  id: string;
}
