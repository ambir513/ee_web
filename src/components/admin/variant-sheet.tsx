import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageUpload } from "./image-uploader";
import { useState } from "react";

export function VariantSheet({
  isOpen,
  setIsOpen,
  productId,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productId?: string;
}) {
  const [variantData, setVariantData] = useState({
    color: "",
    size: "",
    stock: "",
  });

  

  const handleInputChange = (field: string, value: string | number) => {
    setVariantData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="default"
            className="w-full"
            onClick={() => setIsOpen(true)}
          />
        }
      >
        Add Variants
      </SheetTrigger>
      <SheetPopup variant="inset" className="max-w-3xl">
        <Form className="h-full gap-0">
          <SheetHeader>
            <SheetTitle>Edit Variant</SheetTitle>
            <SheetDescription>
              Make changes to your variant details here. Click save when
              you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="grid gap-4">
            {/* Color Input */}
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Input
                value={variantData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                placeholder="Enter color"
              />
            </Field>

            {/* Size Input */}
            <Field>
              <FieldLabel>Size</FieldLabel>
              <Input
                value={variantData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
                placeholder="Enter size"
              />
            </Field>

            {/* Stock Input */}
            <Field>
              <FieldLabel>Stock</FieldLabel>
              <Input
                type="number"
                value={variantData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="Enter stock quantity"
              />
            </Field>

            {/* Image Upload */}
            <ImageUpload />
          </SheetPanel>
          <SheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" onClick={() => setIsOpen(false)} />
              }
            >
              Cancel
            </SheetClose>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </Form>
      </SheetPopup>
    </Sheet>
  );
}
