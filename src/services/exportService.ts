import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Chapter, Character, Scene, BookMetadata } from '../types';

export class ExportService {
  private static instance: ExportService;

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Trigger browser download of blob
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private slugify(text: string): string {
    return text.trim().replace(/[^\w\u0600-\u06FF]+/g, '_') || 'book_export';
  }

  // 1. Export Markdown (.md)
  public exportMarkdown(
    bookMeta: BookMetadata,
    chapters: Chapter[],
    characters: Character[],
    includeCharacters = true
  ): void {
    const lines: string[] = [];

    lines.push('---');
    lines.push(`title: "${bookMeta.title}"`);
    lines.push(`author: "${bookMeta.author}"`);
    lines.push(`date: "${new Date().toISOString()}"`);
    lines.push(`synopsis: "${bookMeta.synopsis}"`);
    lines.push('---\n');

    lines.push(`# ${bookMeta.title}\n`);
    lines.push(`**المؤلف:** ${bookMeta.author}\n`);
    if (bookMeta.synopsis) {
      lines.push(`> ${bookMeta.synopsis}\n`);
    }

    lines.push('\n---\n');

    // Chapters
    chapters.forEach((chapter, index) => {
      lines.push(`## ${chapter.title}`);
      lines.push(`*الحالة: ${chapter.status} · عدد الكلمات: ${chapter.wordCount} · آخر تعديل: ${new Date(chapter.lastModified).toLocaleDateString('ar-EG')}*\n`);
      lines.push(chapter.documentJson || '_لا يوجد محتوى لهذا الفصل بعد_');
      lines.push('\n\n---\n');
    });

    // Codex Items (Characters, Places, Items, Magic, Factions)
    if (includeCharacters && characters.length > 0) {
      lines.push('## موسوعة الرواية وعناصر العالم (Codex & Lore)\n');
      
      const categories: { key: string; label: string }[] = [
        { key: 'شخصية', label: 'شخوص الرواية' },
        { key: 'مكان', label: 'المعالم والأماكن' },
        { key: 'غرض', label: 'الأغراض والعتاد' },
        { key: 'نظام_سحر', label: 'أنظمة السحر والقدرات' },
        { key: 'فصيل', label: 'الفصائل والجماعات' },
        { key: 'تاريخ_وعالم', label: 'التاريخ والأساطير' },
      ];

      categories.forEach(({ key, label }) => {
        const items = characters.filter((c) => (c.category || 'شخصية') === key);
        if (items.length > 0) {
          lines.push(`### ${label}\n`);
          items.forEach((char) => {
            lines.push(`#### ${char.name} (${char.role})`);
            lines.push(`- **الوصف:** ${char.description || '—'}`);
            if (char.personality) lines.push(`- **السمات والهالة:** ${char.personality}`);
            if (char.locationRegion) lines.push(`- **المنطقة:** ${char.locationRegion}`);
            if (char.powersOrRules) lines.push(`- **القوانين والقدرات:** ${char.powersOrRules}`);
            if (char.limitationsOrCost) lines.push(`- **المحددات والتكلفة:** ${char.limitationsOrCost}`);
            if (char.goal) lines.push(`- **الهدف والأهمية:** ${char.goal}`);
            if (char.conflict) lines.push(`- **الصراع والمخاطر:** ${char.conflict}`);
            if (char.backstory) lines.push(`- **التاريخ والماضي:** ${char.backstory}`);
            lines.push('\n');
          });
        }
      });
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    this.downloadBlob(blob, `${this.slugify(bookMeta.title)}.md`);
  }

  // 2. Export PDF
  public exportPdf(
    bookMeta: BookMetadata,
    chapters: Chapter[]
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 40;

    // Cover Page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(bookMeta.title, pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(bookMeta.author, pageWidth / 2, yPos, { align: 'center' });

    yPos += 25;
    if (bookMeta.synopsis) {
      doc.setFontSize(12);
      const splitSynopsis = doc.splitTextToSize(bookMeta.synopsis, contentWidth - 40);
      doc.text(splitSynopsis, pageWidth / 2, yPos, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}`, pageWidth / 2, 270, { align: 'center' });

    // Chapters
    chapters.forEach((chapter) => {
      doc.addPage();
      yPos = 30;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(chapter.title, pageWidth - margin, yPos, { align: 'right' });

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `الحالة: ${chapter.status}  |  الكلمات: ${chapter.wordCount}`,
        pageWidth - margin,
        yPos,
        { align: 'right' }
      );

      yPos += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      const paragraphs = (chapter.documentJson || '').split('\n').filter((p) => p.trim().length > 0);
      
      paragraphs.forEach((p) => {
        const lines = doc.splitTextToSize(p, contentWidth);
        if (yPos + lines.length * 7 > 275) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(lines, pageWidth - margin, yPos, { align: 'right' });
        yPos += lines.length * 7 + 4;
      });
    });

    doc.save(`${this.slugify(bookMeta.title)}.pdf`);
  }

  // 3. Export EPUB 3 standard structure
  public async exportEpub(
    bookMeta: BookMetadata,
    chapters: Chapter[]
  ): Promise<void> {
    const zip = new JSZip();

    // 1. mimetype (must be first and uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    zip.file('META-INF/container.xml', containerXml);

    // 3. OEBPS/styles.css
    const css = `
body {
  direction: rtl;
  text-align: right;
  font-family: 'Amiri', 'Traditional Arabic', serif;
  line-height: 1.8;
  font-size: 1.15em;
  padding: 5%;
  background: #fff;
  color: #121212;
}
h1, h2, h3 {
  text-align: center;
  font-family: 'Amiri', serif;
  margin-bottom: 0.8em;
  color: #222;
}
p {
  margin-bottom: 1em;
  text-indent: 1.5em;
}
.meta-info {
  text-align: center;
  font-size: 0.9em;
  color: #666;
  margin-bottom: 2em;
}
`;
    zip.file('OEBPS/styles.css', css);

    // 4. XHTML Chapter files
    const manifestItems: string[] = [];
    const spineItems: string[] = [];
    const navPoints: string[] = [];

    chapters.forEach((chapter, index) => {
      const id = `chapter_${index + 1}`;
      const filename = `${id}.xhtml`;

      manifestItems.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`);
      spineItems.push(`<itemref idref="${id}"/>`);

      navPoints.push(`
    <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
      <navLabel><text>${this.escapeXml(chapter.title)}</text></navLabel>
      <content src="${filename}"/>
    </navPoint>`);

      const paragraphs = (chapter.documentJson || '')
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => `<p>${this.escapeXml(p)}</p>`)
        .join('\n  ');

      const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" xml:lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <title>${this.escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>${this.escapeXml(chapter.title)}</h1>
  <div class="meta-info">الحالة: ${this.escapeXml(chapter.status)} · الكلمات: ${chapter.wordCount}</div>
  ${paragraphs || '<p>— بداية الفصل —</p>'}
</body>
</html>`;

      zip.file(`OEBPS/${filename}`, xhtml);
    });

    // 5. OEBPS/content.opf
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${this.escapeXml(bookMeta.title)}</dc:title>
    <dc:creator>${this.escapeXml(bookMeta.author)}</dc:creator>
    <dc:language>ar</dc:language>
    <dc:identifier id="BookID">urn:uuid:mirqam-${Date.now()}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="styles.css" media-type="text/css"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx" page-progression-direction="rtl">
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
    zip.file('OEBPS/content.opf', opf);

    // 6. OEBPS/toc.ncx
    const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="mirqam-${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${this.escapeXml(bookMeta.title)}</text></docTitle>
  <docAuthor><text>${this.escapeXml(bookMeta.author)}</text></docAuthor>
  <navMap>
    ${navPoints.join('\n')}
  </navMap>
</ncx>`;
    zip.file('OEBPS/toc.ncx', ncx);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    this.downloadBlob(blob, `${this.slugify(bookMeta.title)}.epub`);
  }

  // 4. Export Obsidian Vault zip structure
  public async exportObsidianZip(
    bookMeta: BookMetadata,
    chapters: Chapter[],
    scenes: Scene[],
    characters: Character[],
    includeCharacters = true,
    includeScenes = true
  ): Promise<void> {
    const zip = new JSZip();
    const folderName = this.slugify(bookMeta.title);
    const root = zip.folder(folderName);
    if (!root) return;

    // Overview file
    root.file(
      '00_الرواية_نظرة_عامة.md',
      `---
title: "${bookMeta.title}"
author: "${bookMeta.author}"
date: "${new Date().toISOString()}"
type: novel_root
---

# ${bookMeta.title}

**المؤلف:** ${bookMeta.author}

## نبذة عن العمل:
${bookMeta.synopsis || '—'}

## إحصاءات الرواية:
- إجمالي الفصول: ${chapters.length}
- إجمالي المشاهد: ${scenes.length}
- إجمالي الشخوص: ${characters.length}
`
    );

    // Chapters folder
    const chaptersFolder = root.folder('الفصول');
    chapters.forEach((ch, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const filename = `${num}_${this.slugify(ch.title)}.md`;
      const content = `---
title: "${ch.title}"
status: "${ch.status}"
wordCount: ${ch.wordCount}
lastModified: "${ch.lastModified}"
order: ${idx + 1}
---

# ${ch.title}

${ch.documentJson}
`;
      chaptersFolder?.file(filename, content);
    });

    // Scenes folder
    const scenesFolder = root.folder('المشاهد');
    scenes.forEach((sc, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const filename = `مشهد_${num}_${this.slugify(sc.title)}.md`;
      const content = `---
title: "${sc.title}"
status: "${sc.status}"
plotline: "${sc.plotline || ''}"
pov: "${sc.povCharacter || ''}"
location: "${sc.locationName || ''}"
---

# ${sc.title}

**الحبكة:** [[${sc.plotline || 'عام'}]]
**الشخصية:** [[${sc.povCharacter || 'غير محدد'}]]
**المكان:** ${sc.locationName || 'غير محدد'}

## الملاحظات والنص:
${sc.content}
`;
      scenesFolder?.file(filename, content);
    });

    // Codex folders by category (Characters, Places, Items, Magic, Factions, Lore)
    const categoryFolders: Record<string, string> = {
      شخصية: 'الشخصيات',
      مكان: 'الأماكن_والمعالم',
      غرض: 'الأغراض_والعتاد',
      نظام_سحر: 'أنظمة_السحر',
      فصيل: 'الفصائل_والتنظيمات',
      تاريخ_وعالم: 'التاريخ_والعالم',
    };

    characters.forEach((char) => {
      const cat = char.category || 'شخصية';
      const folderTitle = categoryFolders[cat] || 'الشخصيات';
      const folder = root.folder(folderTitle);

      const filename = `${this.slugify(char.name)}.md`;
      const content = `---
name: "${char.name}"
category: "${cat}"
role: "${char.role}"
---

# ${char.name}

> التصنيف: **${cat}** | الأهمية: **${char.role}**

${char.locationRegion ? `**المنطقة الجغرافية:** [[${char.locationRegion}]]\n` : ''}
${char.originOrCreator ? `**المنشأ / الصانع:** ${char.originOrCreator}\n` : ''}
${char.powersOrRules ? `**الخواص والقوانين:** ${char.powersOrRules}\n` : ''}
${char.limitationsOrCost ? `**المحددات والتكلفة:** ${char.limitationsOrCost}\n` : ''}

### الوصف
${char.description || '—'}

### السمات والطباع / الهالة
${char.personality || '—'}

### الخلفية والماضي
${char.backstory || '—'}

### الهدف والأهمية
- الهدف: ${char.goal || '—'}
- الصراع والمخاطر: ${char.conflict || '—'}
`;
      folder?.file(filename, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(blob, `${folderName}_Obsidian_Vault.zip`);
  }

  public async exportObsidianVault(
    bookMeta: BookMetadata,
    chapters: Chapter[],
    scenes: Scene[],
    characters: Character[],
    includeCharacters = true,
    includeScenes = true
  ): Promise<void> {
    return this.exportObsidianZip(
      bookMeta,
      chapters,
      scenes,
      characters,
      includeCharacters,
      includeScenes
    );
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
