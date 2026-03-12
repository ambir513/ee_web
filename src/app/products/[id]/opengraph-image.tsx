import { ImageResponse } from "next/og";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

export const runtime = "edge";
export const alt = "Product Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let name = "Ethnic Elegance";
  let price = "";
  let mrp = "";
  let imageUrl = "";
  let category = "";

  try {
    const res = await api.get<{ status: boolean; data?: Product }>(
      `/product/${encodeURIComponent(id)}`,
    );
    if (res?.status && res.data) {
      const product = res.data;
      name = product.name;
      price = `₹${product.price.toLocaleString("en-IN")}`;
      mrp =
        product.mrp > product.price
          ? `₹${product.mrp.toLocaleString("en-IN")}`
          : "";
      imageUrl = product.variants?.[0]?.images?.[0] || "";
      category = product.subCategory || product.category || "";
    }
  } catch {
    // fallback to defaults
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#faf7f5",
        fontFamily: "sans-serif",
      }}
    >
      {/* Product image - left side */}
      <div
        style={{
          width: "420px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0ece8",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            width={420}
            height={630}
            style={{ objectFit: "cover", width: "420px", height: "630px" }}
          />
        ) : (
          <div
            style={{
              fontSize: 48,
              color: "#a08c7a",
              display: "flex",
            }}
          >
            EE
          </div>
        )}
      </div>

      {/* Details - right side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 56px",
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: "3px",
            color: "#a08c7a",
            textTransform: "uppercase",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          Ethnic Elegance
        </div>

        {/* Category */}
        {category && (
          <div
            style={{
              fontSize: 14,
              letterSpacing: "2px",
              color: "#b0a090",
              textTransform: "uppercase",
              marginBottom: "12px",
              display: "flex",
            }}
          >
            {category}
          </div>
        )}

        {/* Product name */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.2,
            marginBottom: "24px",
            display: "flex",
          }}
        >
          {name}
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {price && (
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              {price}
            </span>
          )}
          {mrp && (
            <span
              style={{
                fontSize: 24,
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              {mrp}
            </span>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "auto",
            borderTop: "1px solid #e8e0d8",
            paddingTop: "20px",
            fontSize: 14,
            color: "#a08c7a",
          }}
        >
          <span>ethnicelegance.store</span>
          <span style={{ margin: "0 4px" }}>•</span>
          <span>Free Shipping</span>
          <span style={{ margin: "0 4px" }}>•</span>
          <span>COD Available</span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
