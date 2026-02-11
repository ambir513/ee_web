"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CREATEADDRESSSANITIZE } from "@/type";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react";

const MAX_ADDRESSES = 2;

interface AddressData {
  _id: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  phoneNo: string;
  isDefault: boolean;
}

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "UAE",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(30),
  addressLine1: z.string().min(1, "Address Line 1 is required").max(100),
  addressLine2: z.string().min(1, "Area/Landmark is required").max(100),
  addressLine3: z.string().min(1, "Taluka/District is required").max(100),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pinCode: z.string().min(6, "Pin Code must be 6 digits").max(6, "Pin Code must be 6 digits"),
  phoneNo: z.string().min(10, "Phone Number must be 10 digits").max(10, "Phone Number must be 10 digits"),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const emptyAddress: AddressFormValues = {
  label: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  city: "",
  state: "",
  country: "India",
  pinCode: "",
  phoneNo: "",
  isDefault: false,
};

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
}: {
  address: AddressData;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
}) {
  const lines = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {address.label || "Address"}
          </h3>
          {address.isDefault && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onSetDefault}
              title="Set as default"
            >
              <Star className="h-4 w-4" />
              <span className="sr-only">Set as default</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            title="Edit address"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit address</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete address"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Delete address</span>
          </Button>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          {address.city}
          {address.state ? `, ${address.state}` : ""} - {address.pinCode}
        </p>
        <p>{address.country}</p>
        {address.phoneNo && (
          <p className="mt-1.5 text-foreground">Phone: {address.phoneNo}</p>
        )}
      </div>
    </div>
  );
}

function AddressForm({
  initialData,
  onSave,
  onCancel,
  isNew,
  isSaving,
}: {
  initialData: Omit<AddressData, "_id">;
  onSave: (data: Omit<AddressData, "_id">) => void;
  onCancel: () => void;
  isNew: boolean;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: AddressFormValues) => {
    onSave(data as Omit<AddressData, "_id">);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground">
        {isNew ? "Add New Address" : "Edit Address"}
      </h3>
      <Separator className="my-4" />
      <input type="hidden" {...register("country")} />
      <input type="hidden" {...register("isDefault")} />
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Label */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label
            htmlFor="label"
            className="text-sm font-medium text-foreground"
          >
            Label <span className="text-destructive">*</span>
          </Label>
          <Input
            id="label"
            {...register("label")}
            placeholder="e.g. Home, Office, Parents"
          />
          {errors.label && (
            <p className="text-xs text-destructive">{errors.label.message}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label
            htmlFor="addressLine1"
            className="text-sm font-medium text-foreground"
          >
            Room No/Flat No/Building Name/Chawl <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine1"
            {...register("addressLine1")}
            placeholder="Room/Flat/Building/Chawl"
          />
          {errors.addressLine1 && (
            <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="addressLine2"
            className="text-sm font-medium text-foreground"
          >
            Area/Land Mark <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine2"
            {...register("addressLine2")}
            placeholder="Area/Landmark"
          />
          {errors.addressLine2 && (
            <p className="text-xs text-destructive">{errors.addressLine2.message}</p>
          )}
        </div>

        {/* Address Line 3 */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="addressLine3"
            className="text-sm font-medium text-foreground"
          >
            Taluka/District <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine3"
            {...register("addressLine3")}
            placeholder="Taluka/District"
          />
          {errors.addressLine3 && (
            <p className="text-xs text-destructive">{errors.addressLine3.message}</p>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="city"
            className="text-sm font-medium text-foreground"
          >
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            {...register("city")}
            placeholder="City"
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="state"
            className="text-sm font-medium text-foreground"
          >
            State <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && (
            <p className="text-xs text-destructive">{errors.state.message}</p>
          )}
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-foreground"
          >
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id="country"
            value="India"
            disabled
            className="bg-muted cursor-not-allowed"
          />
        </div>

        {/* Pin Code */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="pinCode"
            className="text-sm font-medium text-foreground"
          >
            Pin Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pinCode"
            {...register("pinCode")}
            placeholder="6-digit PIN code"
            maxLength={6}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              e.target.value = value;
            }}
          />
          {errors.pinCode && (
            <p className="text-xs text-destructive">{errors.pinCode.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="phoneNo"
            className="text-sm font-medium text-foreground"
          >
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="flex items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
              +91
            </div>
            <Input
              id="phoneNo"
              {...register("phoneNo")}
              placeholder="10-digit mobile number"
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
              }}
            />
          </div>
          {errors.phoneNo && (
            <p className="text-xs text-destructive">{errors.phoneNo.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? "Save Address" : "Update Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressTab() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [limitError, setLimitError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch addresses from API via TanStack Query
  const {
    data: addressData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getAddress"],
    queryFn: async () => {
      const response = await api.get("/account/address", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: false, // Don't refetch on every tab switch
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Transform addresses data: convert numbers to strings for form compatibility
  const addresses: AddressData[] = (addressData?.data || []).map((addr: any) => ({
    ...addr,
    pinCode: addr.pinCode?.toString() || "",
    phoneNo: addr.phoneNo?.toString() || "",
  }));
  const canAddMore = addresses.length < MAX_ADDRESSES;

  // Create address mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<AddressData, "_id">) => {
      return api.post("/account/address/create", data, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAddress"] });
      setIsAdding(false);
    },
  });

  // Edit address mutation
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Omit<AddressData, "_id">;
    }) => {
      return api.patch(`/account/address/edit/${id}`, data, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAddress"] });
      setEditingId(null);
    },
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/account/address/delete/${id}`, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAddress"] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleStartAdding = () => {
    if (!canAddMore) {
      setLimitError(true);
      setTimeout(() => setLimitError(false), 4000);
      return;
    }
    setLimitError(false);
    setIsAdding(true);
  };

  const handleAdd = (data: Omit<AddressData, "_id">) => {
    // Convert pinCode and phoneNo to numbers for backend
    const transformedData = {
      ...data,
      pinCode: parseInt(data.pinCode, 10),
      phoneNo: parseInt(data.phoneNo, 10),
    };
    createMutation.mutate(transformedData as any);
  };

  const handleEdit = (id: string, data: Omit<AddressData, "_id">) => {
    // Convert pinCode and phoneNo to numbers for backend
    const transformedData = {
      ...data,
      pinCode: parseInt(data.pinCode, 10),
      phoneNo: parseInt(data.phoneNo, 10),
    };
    editMutation.mutate({ id, data: transformedData as any });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleSetDefault = (id: string) => {
    // Optionally implement set-default via API
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading addresses...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-3 text-sm text-muted-foreground">
            Failed to load addresses. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (isAdding) {
    return (
      <AddressForm
        initialData={emptyAddress}
        onSave={handleAdd}
        onCancel={() => setIsAdding(false)}
        isNew
        isSaving={createMutation.isPending}
      />
    );
  }

  if (editingId) {
    const addressToEdit = addresses.find((a) => a._id === editingId);
    if (addressToEdit) {
      return (
        <AddressForm
          initialData={addressToEdit}
          onSave={(data) => handleEdit(editingId, data)}
          onCancel={() => setEditingId(null)}
          isNew={false}
          isSaving={editMutation.isPending}
        />
      );
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Shipping Addresses
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your saved delivery addresses.
          </p>
        </div>
        <Button size="sm" onClick={handleStartAdding}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {limitError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            You can only save up to {MAX_ADDRESSES} addresses. Please remove an
            existing address before adding a new one.
          </p>
        </div>
      )}

      <Separator className="my-5" />

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            No addresses saved
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a shipping address to speed up checkout.
          </p>
          <Button className="mt-4" onClick={handleStartAdding}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={() => setEditingId(address._id)}
              onDelete={() => handleDelete(address._id)}
              onSetDefault={() => handleSetDefault(address._id)}
              isDeleting={deletingId === address._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

