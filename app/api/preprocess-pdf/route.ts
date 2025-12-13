import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 6 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    // Dynamically import to avoid build-time issues
    const mod = await import("node:module");
    const createRequire = mod.createRequire ?? mod.default?.createRequire;

    if (!createRequire) {
      throw new Error("createRequire not available in this runtime");
    }

    const require = createRequire(import.meta.url);

    (global as any).DOMMatrix = class {};
    (global as any).ImageData = class {};
    (global as any).Path2D = class {};
    // Load pdf-parse at runtime
    const pdfParseModule = require("pdf-parse");
    const pdfParse =
      typeof pdfParseModule === "function"
        ? pdfParseModule
        : pdfParseModule.default;

    if (typeof pdfParse !== "function") {
      throw new Error("pdf-parse did not resolve to a function");
    }
    const { PDFDocument, StandardFonts } = await import("pdf-lib");

    const form = await req.formData();
    const file = form.get("file") as File;
    const title = form.get("title") as string;
    const week = form.get("week_number") as string;
    const hash = form.get("hash_value") as string;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    let fileBuffer = Buffer.from(await file.arrayBuffer());
    let fileType = file.type;
    let fileName = file.name;

    // Process large PDFs
    if (file.size > MAX_SIZE && file.type === "application/pdf") {
      console.log(`📄 Processing large PDF: ${file.name} (${file.size} bytes)`);

      const parsed = await pdfParse(fileBuffer);
      const text = parsed.text || "";

      const pdfDoc = await PDFDocument.create();
      let currentPage = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let y = 800;
      const lines = text.split("\n");

      for (const line of lines) {
        if (y < 50) {
          currentPage = pdfDoc.addPage([595, 842]);
          y = 800;
        }
        currentPage.drawText(line, { x: 40, y, size: 11, font });
        y -= 14;
      }

      fileBuffer = Buffer.from(await pdfDoc.save());
      fileType = "application/pdf";
      fileName = file.name.replace(".pdf", "_text.pdf");

      console.log(`✅ Processed PDF size: ${fileBuffer.length} bytes`);

      if (fileBuffer.length > MAX_SIZE) {
        return NextResponse.json(
          { error: "File too large even after text extraction" },
          { status: 413 }
        );
      }
    }

    // Forward to Amplify backend
    const amplifyForm = new FormData();
    amplifyForm.append(
      "file",
      new Blob([fileBuffer], { type: fileType }),
      fileName
    );
    amplifyForm.append("title", title);
    amplifyForm.append("week_number", week);
    amplifyForm.append("hash_value", hash);

    // ✅ Fix 2: Only include Authorization header if present
    const headers: Record<string, string> = {};
    const auth = req.headers.get("authorization");
    if (auth) {
      headers.Authorization = auth;
    }

    const amplifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/content-upload`,
      {
        method: "POST",
        headers,
        body: amplifyForm,
      }
    );

    const responseText = await amplifyRes.text();

    // ✅ Fix 1: Forward Amplify's headers instead of forcing JSON
    return new Response(responseText, {
      status: amplifyRes.status,
      headers: amplifyRes.headers,
    });
  } catch (error: any) {
    console.error("❌ PDF processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
