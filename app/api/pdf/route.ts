import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  // Read uploaded PDF
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Extract text
  const parsed = await pdf(buffer);
  const text = parsed.text || "No text found";

  // 2. Create new PDF
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const lines = text.split("\n");
  let y = 800;

  for (const line of lines) {
    if (y < 50) {
      currentPage = pdfDoc.addPage([595, 842]); // ✅ Create and assign new page
      y = 800;
    }

    currentPage.drawText(line, {
      x: 40,
      y,
      size: 11,
      font,
    });

    y -= 14;
  }

  const outputPdf = await pdfDoc.save();
  const pdfBuffer = Buffer.from(outputPdf);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="output.pdf"',
    },
  });
}
