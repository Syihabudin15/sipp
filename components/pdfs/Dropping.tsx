"use client";
import { IPencairan } from "../IInterfaces";
import moment from "moment";
import "moment/locale/id";
import { LampiranDropping, PermohonanDropping } from "./UtilDropping";

moment.locale("id");

const generateDropping = (record: IPencairan) => {
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        html, body {
          height: 100%;
          font-family: Cambria, Georgia, 'Times New Roman', Times, serif;
          font-size: 14px;
        }

        /* Pemisah halaman */
        .page-break {
          page-break-before: always;
          break-before: page;
          display: block;
          height: 0;
          border: none;
        }
          @media print {
            .page {
              position: relative;
              min-height: 95vh;    /* atau height A4 jika untuk print */
              padding-top: 80px;    /* ruang untuk header */
              page-break-after: always;
              text-align: justify;
            }
    
            .page .page-header {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              padding: 10px;
              text-align: center;
              background: white;
              border-bottom: 1px solid #ccc;
            }
          }
      </style>
    </head>
    <body class="bg-white text-gray-800 leading-relaxed p-8 max-w-[800px]">
      <div class="page" style="font-size: 13px;">
        ${PermohonanDropping(record)}
      </div>

      <div class="page" style="font-size: 13px;">
        ${LampiranDropping(record)}
      </div>

    </body>
  </html>
  `;

  return html;
};

export const printSI = (record: IPencairan) => {
  const htmlContent = generateDropping(record);

  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) {
    alert("Popup diblokir. Mohon izinkan popup dari situs ini.");
    return;
  }

  w.document.open();
  w.document.write(htmlContent);
  w.document.close();
  w.onload = function () {
    setTimeout(() => {
      w.print();
    }, 200);
  };
};
