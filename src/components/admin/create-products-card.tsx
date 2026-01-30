"use client";

import React, { Activity, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Field,
  FieldLabel,
  FieldItem,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { VariantSheet } from "./variant-sheet";

export default function CreateProductCard() {
  const [data, setData] = useState<Record<string, any>>({
    name: "",
    description: "",
    productInformation: "",
    category: "",
    subCategory: "",
    price: "",
    mrp: "",
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<{ id: string }>({
    id: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalData = {
      ...data,
      price: Number(data.price),
      mrp: Number(data.mrp),
      category: data.category?.toString().toUpperCase(),
      subCategory: data.subCategory?.toString().toUpperCase(),
    };
    console.log(finalData);
    setIsLoading(true);
    setIsSuccess(true);
    setIsOpen(true);
  };

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-2xl">
      <CardHeader>
        <CardTitle>Create Product</CardTitle>
        <CardDescription>Fill in the product details below.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          {/* Category */}
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <FieldItem className="w-full">
              <Select
                name="category"
                defaultValue="MEN"
                value={data.category}
                onValueChange={(value) => setData({ ...data, category: value })}
              >
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="KIDS">Kids</SelectItem>
                </SelectPopup>
              </Select>
            </FieldItem>
            <FieldDescription>Select the main category.</FieldDescription>
          </Field>

          {/* Sub Category */}
          <Field>
            <FieldLabel htmlFor="subCategory">Sub Category</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="subCategory"
                name="subCategory"
                placeholder="Enter sub-category"
                value={data.subCategory}
                onChange={(e) =>
                  setData({ ...data, subCategory: e.target.value })
                }
              />
            </FieldItem>
            <FieldDescription>Choose the product type.</FieldDescription>
          </Field>

          {/* Name */}
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="name"
                name="name"
                placeholder="Classic Cotton T-Shirt"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </FieldItem>
          </Field>

          {/* Description */}
          <Field className="sm:col-span-2 ">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="description"
                name="description"
                placeholder="Soft and breathable cotton t-shirt for daily wear."
                value={data.description}
                className="w-full"
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          {/* Product Information */}
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="productInformation">
              Product Information
            </FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="productInformation"
                name="productInformation"
                placeholder="100% cotton, machine washable, regular fit."
                value={data.productInformation}
                onChange={(e) =>
                  setData({ ...data, productInformation: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          {/* Price */}
          <Field>
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="price"
                name="price"
                type="number"
                onChange={(e) => setData({ ...data, price: e.target.value })}
                min={0}
                placeholder="799"
                value={data.price}
              />
            </FieldItem>
          </Field>

          {/* MRP */}
          <Field>
            <FieldLabel htmlFor="mrp">MRP</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="mrp"
                name="mrp"
                type="number"
                min={0}
                placeholder="999"
                value={data.mrp}
                onChange={(e) => setData({ ...data, mrp: e.target.value })}
              />
            </FieldItem>
          </Field>

          <div className="my-3 gap-y-4 flex flex-col w-full items-center justify-between col-span-2">
            {isSuccess ? (
              <VariantSheet
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                productId={response.id}
              />
            ) : (
              <Button type="submit" className="w-full">
                Create Product
              </Button>
            )}
          </div>
        </Form>
      </CardPanel>
    </Card>
  );
}
