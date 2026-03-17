export interface ICategoryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  // Hierarchy
  parentId?: string;
  level: number;
  path: string[];

  // Display
  image?: ICategoryImage;
  icon?: string;
  color?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Settings
  isActive: boolean;
  displayOrder: number;
  showInNavbar: boolean;

  // Products
  productCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: ICategoryImage;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  displayOrder?: number;
  showInNavbar?: boolean;
}

export interface IUpdateCategoryInput extends Partial<ICreateCategoryInput> {
  id: string;
}
