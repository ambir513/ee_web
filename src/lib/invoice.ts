import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceOrderItem {
    name?: string;
    color?: string;
    size?: string;
    quantity?: number;
    price?: number;
}

export interface InvoiceAddress {
    label?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    state?: string;
    pinCode?: number | string;
    phoneNo?: string | number;
}

export interface InvoiceOrder {
    _id: string;
    amount: number;
    currency?: string;
    receipt?: string;
    status?: string;
    createdAt?: string;
    paymentId?: string;
    razorpayOrderId?: string;
    userId?: {
        name?: string;
        email?: string;
    };
    productId?: {
        name?: string;
        sku?: string;
    };
    notes?: {
        name?: string;
        email?: string;
        products?: InvoiceOrderItem[];
        address?: InvoiceAddress;
    };
    latestStatus?: string;
}

function formatCurrency(amount: number, currency = "INR") {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
}

function getFullName(order: InvoiceOrder) {
    return (
        order.notes?.name || order.userId?.name || order.notes?.email || order.userId?.email || "Customer"
    );
}

function getContactEmail(order: InvoiceOrder) {
    return order.notes?.email || order.userId?.email || "-";
}

function buildAddressLines(address?: InvoiceAddress) {
    if (!address) return ["-"];

    const street = [address.addressLine1, address.addressLine2, address.addressLine3]
        .filter(Boolean)
        .join(", ");
    const locality = [address.city, address.state, address.pinCode]
        .filter(Boolean)
        .join(", ");

    return [address.label, street, locality, address.phoneNo ? `Phone: ${address.phoneNo}` : null].filter(
        Boolean,
    ) as string[];
}

async function loadLogoDataUrl() {
    try {
        const response = await fetch("/logo.jpeg");
        if (!response.ok) return null;

        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Unable to read logo"));
                }
            };
            reader.onerror = () => reject(new Error("Unable to read logo"));
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function getInvoiceItems(order: InvoiceOrder) {
    const products = Array.isArray(order.notes?.products) ? order.notes?.products ?? [] : [];

    if (products.length > 0) {
        return products.map((item, index) => {
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(item.price || 0);
            return {
                srNo: index + 1,
                name: item.name || "Product",
                color: item.color || "-",
                size: item.size || "-",
                quantity,
                unitPrice,
                amount: unitPrice > 0 ? unitPrice * quantity : order.amount,
            };
        });
    }

    return [
        {
            srNo: 1,
            name: order.productId?.name || "Product",
            color: "-",
            size: "-",
            quantity: 1,
            unitPrice: order.amount,
            amount: order.amount,
        },
    ];
}

export async function generateInvoicePdf(order: InvoiceOrder) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const brand = "Ethnic Elegance";
    const invoiceNo = order.receipt || order._id;
    const invoiceDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    doc.setProperties({
        title: `Invoice-${invoiceNo}`,
        subject: `Invoice for ${invoiceNo}`,
        author: brand,
    });

    doc.setDrawColor(210, 167, 63);
    doc.setFillColor(255, 250, 242);
    doc.roundedRect(margin, margin, pageWidth - margin * 2, 36, 3, 3, "FD");

    const logoDataUrl = await loadLogoDataUrl();
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "JPEG", margin + 3, margin + 4, 24, 24);
    }

    doc.setTextColor(53, 36, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(brand, margin + 32, margin + 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Where tradition meets style", margin + 32, margin + 18);
    doc.text("www.ethnicelegance.store", margin + 32, margin + 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TAX INVOICE", pageWidth - margin - 2, margin + 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoiceNo}`, pageWidth - margin - 2, margin + 16, { align: "right" });
    doc.text(`Invoice Date: ${invoiceDate}`, pageWidth - margin - 2, margin + 22, { align: "right" });
    doc.text(`Status: ${order.latestStatus || order.status || "Paid"}`, pageWidth - margin - 2, margin + 28, {
        align: "right",
    });

    const customerY = margin + 46;
    const addressLines = buildAddressLines(order.notes?.address);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bill To", margin, customerY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(getFullName(order), margin, customerY + 6);
    doc.text(getContactEmail(order), margin, customerY + 12);
    addressLines.forEach((line, index) => {
        doc.text(line, margin, customerY + 18 + index * 5);
    });

    const metaX = pageWidth - margin - 70;
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", metaX, customerY);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt: ${order.receipt || "-"}`, metaX, customerY + 6);
    doc.text(`Order ID: ${order._id}`, metaX, customerY + 12);
    doc.text(`Payment ID: ${order.paymentId || "-"}`, metaX, customerY + 18);
    doc.text(`Currency: ${order.currency || "INR"}`, metaX, customerY + 24);

    const items = getInvoiceItems(order);
    const rows = items.map((item) => [
        String(item.srNo),
        item.name,
        item.color,
        item.size,
        String(item.quantity),
        formatCurrency(item.unitPrice, order.currency || "INR"),
        formatCurrency(item.amount, order.currency || "INR"),
    ]);

    autoTable(doc, {
        startY: customerY + 34,
        head: [["#", "Item", "Color", "Size", "Qty", "Rate", "Amount"]],
        body: rows,
        styles: {
            fontSize: 8.5,
            cellPadding: 2.2,
            textColor: [40, 30, 20],
            lineColor: [220, 214, 205],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [73, 44, 24],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [250, 247, 243],
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 8 },
            4: { halign: "center", cellWidth: 12 },
            5: { halign: "right", cellWidth: 24 },
            6: { halign: "right", cellWidth: 24 },
        },
    });

    const tableEndY = (doc as any).lastAutoTable?.finalY || customerY + 60;
    const totalsY = tableEndY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Summary", pageWidth - margin - 50, totalsY);

    const summaryRows = [
        ["Subtotal", formatCurrency(order.amount, order.currency || "INR")],
        ["Delivery", "Free"],
        ["Grand Total", formatCurrency(order.amount, order.currency || "INR")],
    ];

    autoTable(doc, {
        startY: totalsY + 3,
        body: summaryRows,
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: 1.6,
            textColor: [40, 30, 20],
        },
        columnStyles: {
            0: { fontStyle: "bold" },
            1: { halign: "right" },
        },
        margin: { left: pageWidth - margin - 80, right: margin },
    });

    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setDrawColor(230, 224, 214);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(8.5);
    doc.setTextColor(90, 80, 70);
    doc.text(
        "Thank you for shopping with Ethnic Elegance.",
        pageWidth / 2,
        footerY,
        { align: "center" },
    );

    const fileName = `invoice-${invoiceNo}.pdf`;
    const blobUrl = doc.output("bloburl");
    const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
        doc.save(fileName);
    }
}