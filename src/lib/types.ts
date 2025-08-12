import { z } from 'zod';

// Theme preferences schema
export const ThemePrefSchema = z.enum(['light', 'dark', 'system']);
export type ThemePref = z.infer<typeof ThemePrefSchema>;

// List schema
export const ListSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'List name is required'),
  currency: z.string().default('EUR'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});
export type List = z.infer<typeof ListSchema>;

// Item schema  
export const ItemSchema = z.object({
  id: z.string(),
  listId: z.string(),
  name: z.string().min(1, 'Item name is required'),
  qty: z.number().min(1, 'Quantity must be at least 1').default(1),
  price: z.number().min(0, 'Price cannot be negative').default(0),
  purchased: z.boolean().default(false),
  icon: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  purchasedAt: z.date().optional(),
});
export type Item = z.infer<typeof ItemSchema>;

// Item categories
export const ITEM_CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat',
  'Bakery', 
  'Frozen',
  'Pantry',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household',
  'Other'
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

// Product statistics schema
export const ProductStatSchema = z.object({
  name: z.string(),
  usedCount: z.number().min(0).default(0),
  totalSpend: z.number().min(0).default(0),
  lastUsed: z.date().optional(),
  averagePrice: z.number().min(0).default(0),
  category: z.string().optional(),
});

// Shopping analytics schema
export const ShoppingAnalyticsSchema = z.object({
  totalSpent: z.number().min(0).default(0),
  totalItems: z.number().min(0).default(0),
  totalLists: z.number().min(0).default(0),
  averageListValue: z.number().min(0).default(0),
  topCategories: z.array(z.object({
    category: z.string(),
    count: z.number(),
    totalSpent: z.number()
  })).default([]),
  monthlySpending: z.array(z.object({
    month: z.string(),
    amount: z.number()
  })).default([]),
  frequentItems: z.array(z.object({
    name: z.string(),
    count: z.number(),
    totalSpent: z.number()
  })).default([]),
});
export type ShoppingAnalytics = z.infer<typeof ShoppingAnalyticsSchema>;

// Budget schema
export const BudgetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Budget name is required'),
  amount: z.number().min(0, 'Budget amount cannot be negative'),
  period: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
  categories: z.array(z.string()).default([]),
  spent: z.number().min(0).default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Budget = z.infer<typeof BudgetSchema>;
export type ProductStat = z.infer<typeof ProductStatSchema>;

// Profile settings schema
export const ProfileSettingsSchema = z.object({
  theme: ThemePrefSchema.default('system'),
  currency: z.string().default('EUR'),
  taxRate: z.number().min(0).max(1).default(0), // 0-1 representing 0%-100%
  hapticsEnabled: z.boolean().default(true),
});
export type ProfileSettings = z.infer<typeof ProfileSettingsSchema>;

// Form schemas for validation
export const CreateListFormSchema = z.object({
  name: z.string().min(1, 'List name is required'),
  currency: z.string().default('EUR'),
  initialItems: z.string().optional(), // comma-separated items
});
export type CreateListForm = z.infer<typeof CreateListFormSchema>;

export const ItemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  qty: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  category: z.string().optional(),
  notes: z.string().optional(),
});
export type ItemForm = z.infer<typeof ItemFormSchema>;