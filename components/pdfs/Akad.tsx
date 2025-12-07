"use client";
import { IDapem } from "../IInterfaces";
import {
  AnalisaPerhitungan,
  KartuAngsuran,
  PerjanjianKredit,
} from "./UtilAkad";
import moment from "moment";
import "moment/locale/id";
import {
  DebetRekening,
  FlaggingKantorBayar,
  Kesanggupan,
  PemotonganDSR,
} from "./UtilAkadKuasa";
import { PencairanPembiayaan, PenyerahanJaminan } from "./UtilAkadBukti";
import { FormChecklist } from "./UtilAkadDoc";

moment.locale("id");

const generateContractHtml = (record: IDapem) => {
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
      <div class="page" style="font-size: 12px;">
        ${AnalisaPerhitungan(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;">
        ${KartuAngsuran(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;">
        ${KartuAngsuran(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${PerjanjianKredit(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${DebetRekening(record)}
      </div>
      
      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${FlaggingKantorBayar(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${PemotonganDSR(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${Kesanggupan(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${Kesanggupan(record)}
      </div>

      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${PencairanPembiayaan(record)}
      </div>
      
      <div class="page-break"></div>
      <div class="page" style="font-size: 12px;text-align: justify">
        ${PencairanPembiayaan(record)}
      </div>

      <div class="page-break"></div>
      <div style="font-size: 12px;text-align: justify;line-height:1.2">
        ${PenyerahanJaminan(record)}
      </div>

      <div class="page-break"></div>
      <div style="font-size: 12px;text-align: justify;">
        ${FormChecklist(record)}
      </div>

    </body>
  </html>
  `;

  return html;
};

export const printContract = (record: IDapem) => {
  const htmlContent = generateContractHtml(record);

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
