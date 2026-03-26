"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CreateClientSchema: () => CreateClientSchema,
  CreateInvoiceSchema: () => CreateInvoiceSchema,
  DashboardQuerySchema: () => DashboardQuerySchema,
  InvoiceListQuerySchema: () => InvoiceListQuerySchema,
  LineItemSchema: () => LineItemSchema,
  LoginSchema: () => LoginSchema,
  PeriodFilterSchema: () => PeriodFilterSchema,
  UpdateClientSchema: () => UpdateClientSchema,
  UpdatePreferencesSchema: () => UpdatePreferencesSchema
});
module.exports = __toCommonJS(index_exports);

// src/schemas.ts
var import_zod = require("zod");
var LineItemSchema = import_zod.z.object({
  description: import_zod.z.string().min(1, "Description is required"),
  quantity: import_zod.z.number().positive("Quantity must be greater than 0"),
  unitPrice: import_zod.z.number().positive("Unit price must be greater than 0")
});
var CreateInvoiceSchema = import_zod.z.object({
  clientId: import_zod.z.string().optional(),
  clientData: import_zod.z.object({
    name: import_zod.z.string().min(1),
    businessName: import_zod.z.string().optional(),
    email: import_zod.z.string().email(),
    phone: import_zod.z.string().optional(),
    address: import_zod.z.string().optional(),
    taxId: import_zod.z.string().optional()
  }).optional(),
  lineItems: import_zod.z.array(LineItemSchema).min(1, "At least one line item is required"),
  issueDate: import_zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  dueDate: import_zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).refine(
  (data) => !!(data.clientId || data.clientData),
  { message: "Either clientId or clientData must be provided" }
);
var CreateClientSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Name is required"),
  businessName: import_zod.z.string().optional(),
  email: import_zod.z.string().email("Please enter a valid email address"),
  phone: import_zod.z.string().optional(),
  address: import_zod.z.string().optional(),
  taxId: import_zod.z.string().optional()
});
var UpdateClientSchema = CreateClientSchema.partial();
var LoginSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(1)
});
var PeriodFilterSchema = import_zod.z.enum([
  "this_month",
  "last_month",
  "last_3_months",
  "last_12_months",
  "custom"
]);
var UpdatePreferencesSchema = import_zod.z.object({
  defaultPeriod: PeriodFilterSchema.optional(),
  sidebarCollapsed: import_zod.z.boolean().optional()
});
var InvoiceListQuerySchema = import_zod.z.object({
  status: import_zod.z.enum(["paid", "unpaid", "overdue", "all"]).optional(),
  clientId: import_zod.z.string().optional(),
  period: PeriodFilterSchema.optional(),
  from: import_zod.z.string().optional(),
  to: import_zod.z.string().optional(),
  page: import_zod.z.coerce.number().int().positive().optional(),
  limit: import_zod.z.coerce.number().int().positive().max(100).optional()
});
var DashboardQuerySchema = import_zod.z.object({
  period: PeriodFilterSchema.optional(),
  clientId: import_zod.z.string().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateClientSchema,
  CreateInvoiceSchema,
  DashboardQuerySchema,
  InvoiceListQuerySchema,
  LineItemSchema,
  LoginSchema,
  PeriodFilterSchema,
  UpdateClientSchema,
  UpdatePreferencesSchema
});
