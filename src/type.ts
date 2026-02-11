import { z } from "zod";

/**
 * This is SignUpSanitize schema to validate user signup data.
 * It ensures that the name, email, and password fields meet specific criteria.
 * - Name: Required, max 25 characters.
 * - Email: Required, valid email format, max 50 characters.
 * - Password: Required, min 8 characters, max 16 characters, must include uppercase, lowercase, number, and special character.
 *  @module SignUpSanitize
 * @returns {ZodObject} Zod schema object for signup data validation.
 */

export const SIGNUPSANITIZE = z.object({
  name: z
    .string()
    .min(1, { message: "full name is required" })
    .max(25, { message: "lastname must be in 25 character only" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .max(50, { message: "email must be in 50 character only" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must include a special character",
    })
    .max(16, { message: "email must be in 16 character only" }),
});

/**
 * This is VerifyEmailSanitize schema to validate email verification data.
 * It ensures that the email and OTP code fields meet specific criteria.
 * - Email: Required, valid email format, max 50 characters.
 * - Code: Required, max 6 characters.
 * @module VerifyEmailSanitize
 * @returns {ZodObject} Zod schema object for email verification data validation.
 */

export const VERIFYEMAILSANITIZE = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .max(50, { message: "email must be in 50 character only" }),
  code: z
    .string()
    .min(1, { message: "OTP is required" })
    .max(6, { message: "OTP must be 6 characters long" }),
});

/**
 * This is LoginSanitize schema to validate user login data.
 * It ensures that the email and password fields meet specific criteria.
 * - Email: Required, valid email format, max 50 characters.
 * - Password: Required, min 8 characters, max 16 characters, must include uppercase, lowercase, number, and special character.
 * @module LoginSanitize
 * @returns {ZodObject} Zod schema object for login data validation.
 */
export const LOGINSANITIZE = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .max(50, { message: "email must be in 50 character only" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must include a special character",
    })
    .max(16, { message: "email must be in 16 character only" }),
});

/** * This is ForgotPasswordSanitize schema to validate forgot password data.
 * It ensures that the email field meets specific criteria.
 * - Email: Required, valid email format, max 50 characters.
 * @module ForgotPasswordSanitize
 * @returns {ZodObject} Zod schema object for forgot password data validation.
 **/

export const FORGOTPASSWORDSANITIZE = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .max(50, { message: "email must be in 50 character only" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must include a special character",
    })
    .max(16, { message: "email must be in 16 character only" }),
});

/**
 * This is AddProductSanitize schema to validate product creation data.
 * It ensures that the product fields meet specific criteria.
 * - Name: Required, max 100 characters.
 * - Description: Required, max 1000 characters.
 * - Product Information: Required, max 2000 characters.
 * - Category: Required, max 50 characters.
 * - Sub-Category: Required, max 50 characters.
 * - Price: Required, must be a number, minimum 0.
 * - MRP: Required, must be a number, minimum 0.
 * - isActive: Optional, boolean.
 * @module AddProductSanitize
 * @returns {ZodObject} Zod schema object for product creation data validation.
 */
export const ADDPRODUCTSANITIZE = z.object({
  name: z
    .string()
    .min(10, { message: "Product name must be more than 10 characters" })
    .max(100, { message: "Product name must be less than 100 characters" }),

  description: z
    .string()
    .min(1, { message: "Product description is required" })
    .max(1000, {
      message: "Product description must be less than 1000 characters",
    }),

  productInformation: z
    .string()
    .min(1, { message: "Product information is required" })
    .max(2000, {
      message: "Product information must be less than 2000 characters",
    }),

  category: z
    .string()
    .min(1, { message: "Product category is required" })
    .max(50, { message: "Category must be less than 50 characters" }),

  subCategory: z
    .string()
    .min(1, { message: "Product sub-category is required" })
    .max(50, { message: "Sub-category must be less than 50 characters" }),
  design: z.string().min(1, { message: "Design is required" }),
  price: z
    .number({ message: "Price must be a number" })
    .min(100, { message: "Price must be at least 100" }),
  sku: z
    .string()
    .min(1, { message: "SKU is required" })
    .max(30, { message: "SKU must be less than 30 characters" }),
  label: z
    .string()
    .min(1, { message: "Label is required" })
    .max(30, { message: "Label must be less than 30 characters" }),
  mrp: z
    .number({ message: "MRP must be a number" })
    .min(500, { message: "MRP must be at least 500" }),

  isActive: z.boolean().optional(),
});

const SizeSchema = z.object({
  size: z
    .string()
    .min(1, { message: "Size is required" })
    .max(10, { message: "Size must be less than 10 characters" }),

  stock: z
    .number({ message: "Stock must be a number" })
    .int({ message: "Stock must be an integer" })
    .min(0, { message: "Stock cannot be negative" }),
});

/**
 * This is AddVariantsSanitize schema to validate product variant data.
 * It ensures that the variant fields meet specific criteria.
 * - Color: Required, max 30 characters.
 * - Images: Required, array of strings, min 1, max 5.
 * - Size: Required, array of size objects.
 * Each size object contains:
 * - Size: Required, max 10 characters.
 * - Stock: Required, must be a number, integer, minimum 0.
 * @module AddVariantsSanitize
 * @returns {ZodObject} Zod schema object for product variant data validation.
 */
export const ADDVARIANTSSANITIZE = z.object({
  color: z
    .string()
    .min(1, { message: "Color is required" })
    .max(30, { message: "Color must be less than 30 characters" }),

  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required" })
    .max(5, { message: "No more than 5 images are allowed" }),

  size: z
    .array(SizeSchema)
    .min(1, { message: "At least one size is required" }),
});

/**
 * This is CreateCouponSanitize schema to validate coupon creation data.
 * It ensures that the coupon fields meet specific criteria.
 * - Code: Required, max 20 characters.
 * - Discount: Required, must be a number, minimum 0.
 * - MinOrderValue: Required, must be a number, minimum 0.
 * - UsageLimit: Required, must be a number, integer, minimum 1.
 * - ValidFrom: Required, string (date).
 * - ValidTill: Required, string (date).
 * - isActive: Required, boolean.
 * - ApplicableTo: Required, array of strings.
 * @module CreateCouponSanitize
 * @returns {ZodObject} Zod schema object for coupon creation data validation.
 */
export const CREATECOUPONSANITIZE = z.object({
  code: z
    .string()
    .min(1, { message: "Coupon code is required" })
    .max(20, { message: "Coupon code must be less than 20 characters" }),
  discount: z
    .number({ message: "Discount must be a number" })
    .min(0, { message: "Discount must be at least 0" }),
  minOrderValue: z
    .number({ message: "Minimum order value must be a number" })
    .min(0, { message: "Minimum order value must be at least 0" }),
  usageLimit: z
    .number({ message: "Usage limit must be a number" })
    .int({ message: "Usage limit must be an integer" })
    .min(1, { message: "Usage limit must be at least 1" }),
  validFrom: z.string(),
  validTill: z.string(),
  isActive: z.boolean(),
  applicableTo: z.array(z.string()),
});

/**
 * This is CreateAddressSanitize schema to validate address creation data.
 * It ensures that the address fields meet specific criteria.
 * - AddressLine1: Required, max 100 characters.
 * - AddressLine2: Optional, max 100 characters.
 * - AddressLine3: Optional, max 100 characters.
 * - City: Required.
 * - State: Required.
 * - Country: Optional.
 * - PinCode: Required, must be a number, 6 digits.
 * - PhoneNo: Required, must be a number, 10 digits.
 * @module CreateAddressSanitize
 * @returns {ZodObject} Zod schema object for address creation data validation.
 */
export const CREATEADDRESSSANITIZE = z.object({
  label: z
    .string()
    .min(1, { message: "Label is required" })
    .max(30, { message: "Label must be less than 30 characters" }),
  addressLine1: z
    .string()
    .min(1, { message: "Address Line 1 is required" })
    .max(100, { message: "Address Line 1 must be less than 100 characters" }),
  addressLine2: z
    .string()
    .min(1, { message: "Area/Landmark is required" })
    .max(100, { message: "Area/Landmark must be less than 100 characters" }),
  addressLine3: z
    .string()
    .min(1, { message: "Taluka/District is required" })
    .max(100, { message: "Taluka/District must be less than 100 characters" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  country: z.string().min(1, { message: "Country is required" }).optional(),
  pinCode: z
    .number()
    .min(100000, { message: "Pin Code must be at least 6 digits" })
    .max(999999, { message: "Pin Code must be at most 6 digits" }),
  phoneNo: z
    .number()
    .min(1000000000, { message: "Phone Number must be at least 10 digits" })
    .max(9999999999, { message: "Phone Number must be at most 10 digits" }),
});
