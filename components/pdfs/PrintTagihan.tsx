"use client";
import { Angsuran } from "@prisma/client";
import moment from "moment";
import "moment/locale/id";
import { IDRFormat } from "../Utils";
import { IDapem } from "../IInterfaces";
import { HeaderTwoLogo } from "./UtilAkad";

moment.locale("id");

const generateAngsuran = (data: Angsuran[], dapem: IDapem) => {
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
      ${HeaderTwoLogo(dapem, "KARTU ANGSURAN PEMBIAYAAN")}

      
          <div class="flex justify-between my-3 gap-4">
            <div class="flex-1">
              <div class="flex gap-4">
                <p class="w-32">Nama Lengkap</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.Debitur.nama_penerima}</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Nomor Pensiun</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.Debitur.nopen}</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Kantor Bayar</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.mutasi_ke || dapem.mutasi_from}</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Area Pelayanan</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.AO.Cabang.name} - ${
    dapem.AO.Cabang.Area.name
  }</p>
              </div>
            </div>
            <div class="flex-1">
              <div class="flex gap-4">
                <p class="w-32">Plafond Pembiayaan</p>
                <p class="w-4">:</p>
                <p class="flex-1">Rp. ${IDRFormat(dapem.plafond)}</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Tenor</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.tenor}</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Margin Bunga</p>
                <p class="w-4">:</p>
                <p class="flex-1">${dapem.margin + dapem.margin_sumdan}%</p>
              </div>
              <div class="flex gap-4">
                <p class="w-32">Tanggal Akad</p>
                <p class="w-4">:</p>
                <p class="flex-1">${moment(dapem.akad_date).format(
                  "DD/MM/YYYY"
                )}</p>
              </div>
            </div>
          </div>


        <table style="width:100%; border-collapse: collapse; margin-top:10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #aaa; padding: 5px;">No.</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Jatuh Tempo</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Angsuran Pokok</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Angsuran Bunga</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Total Angsuran</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Saldo Pokok</th>
              <th style="border: 1px solid #aaa; padding: 5px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((a, index) => {
                return `
                <tr>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">${
                    a.ke
                  }</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">${moment(
                    a.jadwal_bayar
                  ).format("DD/MM/YYYY")}</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                    a.pokok
                  )}</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                    a.margin
                  )}</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                    a.margin + a.pokok
                  )}</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                    a.sisa
                  )}</td>
                  <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;${
                    a.tgl_bayar ? "color:green;" : "color: red;"
                  }">${a.tgl_bayar ? "PAID" : "UNPAID"}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

    </body>
  </html>
  `;

  return html;
};

export const printTagihan = (record: Angsuran[], dapem: IDapem) => {
  const htmlContent = generateAngsuran(record, dapem);

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
