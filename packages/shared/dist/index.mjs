// src/schemas.ts
import { z } from "zod";
var LineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Unit price must be greater than 0")
});
var CreateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  clientData: z.object({
    name: z.string().min(1),
    businessName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional()
  }).optional(),
  lineItems: z.array(LineItemSchema).min(1, "At least one line item is required"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).refine(
  (data) => !!(data.clientId || data.clientData),
  { message: "Either clientId or clientData must be provided" }
);
var CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional()
});
var UpdateClientSchema = CreateClientSchema.partial();
var LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
var PeriodFilterSchema = z.enum([
  "this_month",
  "last_month",
  "last_3_months",
  "last_12_months",
  "custom"
]);
var UpdatePreferencesSchema = z.object({
  defaultPeriod: PeriodFilterSchema.optional(),
  sidebarCollapsed: z.boolean().optional()
});
var InvoiceListQuerySchema = z.object({
  status: z.enum(["paid", "unpaid", "overdue", "all"]).optional(),
  clientId: z.string().optional(),
  period: PeriodFilterSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});
var DashboardQuerySchema = z.object({
  period: PeriodFilterSchema.optional(),
  clientId: z.string().optional()
});
export {
  CreateClientSchema,
  CreateInvoiceSchema,
  DashboardQuerySchema,
  InvoiceListQuerySchema,
  LineItemSchema,
  LoginSchema,
  PeriodFilterSchema,
  UpdateClientSchema,
  UpdatePreferencesSchema
};
