import PDFDocument from "pdfkit";
import type { Adhesion } from "@/data/types";

const fmtDate = (d: string) => (d ? d.split("-").reverse().join("/") : "—");

/** PDF A4 paysage : en-tête, totaux, tableau paginé (en-têtes répétés), numéros de page. */
export function adhesionsPdf(list: Adhesion[], { filtre }: { filtre: string }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36, bufferPages: true, info: { Title: "Liste des adhésions — Obirin", Author: "Obirin" } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const green = "#0a2a1d";
    const soft = "#5b6660";
    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;
    const bottom = doc.page.height - doc.page.margins.bottom - 18;

    // En-tête du document
    doc.fillColor(green).font("Helvetica-Bold").fontSize(20).text("OBIRIN", left, 36, { characterSpacing: 3 });
    doc.font("Helvetica").fontSize(13).text("Liste des adhésions", left, 62);
    const now = new Date();
    doc
      .fontSize(8.5)
      .fillColor(soft)
      .text(`Exporté le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}${filtre ? ` — filtre : ${filtre}` : ""}`, left, 80);

    // Totaux
    const totals = [
      ["Adhésions", list.length],
      ["Adhérents ajoutés", list.reduce((n, a) => n + a.adherentsAjoutes, 0)],
      ["Produits achetés", list.reduce((n, a) => n + a.produitsAchetes, 0)],
    ] as const;
    let tx = left;
    for (const [label, value] of totals) {
      doc.roundedRect(tx, 98, 150, 40, 6).fillColor("#f1e9dc").fill();
      doc.fillColor(soft).fontSize(7.5).text(label.toUpperCase(), tx + 10, 105, { characterSpacing: 0.8 });
      doc.fillColor(green).font("Helvetica-Bold").fontSize(15).text(String(value), tx + 10, 117);
      doc.font("Helvetica");
      tx += 160;
    }

    // Tableau
    const cols = [
      { title: "Nom & prénom", w: 0.15 },
      { title: "Naissance", w: 0.08 },
      { title: "Pays", w: 0.09 },
      { title: "Téléphone(s)", w: 0.13 },
      { title: "E-mail(s)", w: 0.16 },
      { title: "Adresse", w: 0.16 },
      { title: "Adhésion", w: 0.08 },
      { title: "Adhérents", w: 0.075, right: true },
      { title: "Produits", w: 0.075, right: true },
    ].map((c) => ({ ...c, w: c.w * width }));
    const pad = 4;
    let y = 152;

    const drawHeader = () => {
      doc.rect(left, y, width, 18).fillColor(green).fill();
      let x = left;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#f8f4ec");
      for (const c of cols) {
        doc.text(c.title.toUpperCase(), x + pad, y + 5.5, { width: c.w - pad * 2, align: c.right ? "right" : "left", lineBreak: false });
        x += c.w;
      }
      doc.font("Helvetica");
      y += 18;
    };
    drawHeader();

    if (!list.length) {
      doc.fillColor(soft).fontSize(10).text("Aucune adhésion.", left, y + 12);
    }

    list.forEach((a, i) => {
      const cells = [
        `${a.nom.toUpperCase()} ${a.prenom}`,
        fmtDate(a.dateNaissance),
        a.pays,
        a.telephones.join("\n") || "—",
        a.emails.join("\n") || "—",
        a.adresse || "—",
        fmtDate(a.dateAdhesion),
        String(a.adherentsAjoutes),
        String(a.produitsAchetes),
      ];
      doc.fontSize(8);
      const h = Math.max(...cells.map((t, k) => doc.heightOfString(t, { width: cols[k].w - pad * 2 }))) + pad * 2;
      if (y + h > bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
      }
      if (i % 2 === 1) doc.rect(left, y, width, h).fillColor("#f8f4ec").fill();
      let x = left;
      cells.forEach((t, k) => {
        doc.fillColor(k === 0 ? green : "#13201a").font(k === 0 ? "Helvetica-Bold" : "Helvetica");
        doc.text(t, x + pad, y + pad, { width: cols[k].w - pad * 2, align: cols[k].right ? "right" : "left" });
        x += cols[k].w;
      });
      doc.font("Helvetica");
      y += h;
      doc.moveTo(left, y).lineTo(left + width, y).lineWidth(0.4).strokeColor("#d8cfbf").stroke();
    });

    // Numéros de page
    const range = doc.bufferedPageRange();
    for (let p = range.start; p < range.start + range.count; p++) {
      doc.switchToPage(p);
      // le pied de page est dans la marge basse : on la neutralise pour éviter que pdfkit crée une page vide
      const marginBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .fontSize(7.5)
        .fillColor(soft)
        .text(`Obirin — liste des adhésions — page ${p + 1}/${range.count}`, left, doc.page.height - marginBottom + 10, {
          width,
          align: "right",
          lineBreak: false,
        });
      doc.page.margins.bottom = marginBottom;
    }
    doc.end();
  });
}
