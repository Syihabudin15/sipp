"use client";
import { IPenyerahanBerkas } from "../IInterfaces";
import moment from "moment";
import "moment/locale/id";
import { HeaderTwoLogoCustom } from "./UtilDropping";

moment.locale("id");

const generatePB = (data: IPenyerahanBerkas) => {
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
        ${HeaderTwoLogoCustom(data, "TANDA TERIMA PENYERAHAN BERKAS")}
        
        <div class="my-5">
          <div class="flex gap-2">
            <p class="w-44">Nomor</p>
            <p class="w-4">:</p>
            <p>${data.id}</p>
          </div>
          <div class="flex gap-2">
            <p class="w-44">Lampiran</p>
            <p class="w-4">:</p>
            <p>1 (satu) Lembar</p>
          </div>
          <div class="flex gap-2">
            <p class="w-44">Perihal</p>
            <p class="w-4">:</p>
            <p>Penyerahan Berkas Kredit Debitur</p>
          </div>
        </div>

      <div class="my-5">
        <p>Kepada Yth</p>
        <p>Pimpinan Bagian Pemberkasan</p>
        <p><strong>${data.Sumdan.name}</strong></p>
        <p>Di tempat</p>
      </div>
  
      <div class="my-10">
        <p>Bersama surat ini kami ${
          process.env.NEXT_PUBLIC_APP_AKAD_NAME
        } informasikan penyerahan berkas-berkas kredit debitur yang telah mendapat dana Dropping dari ${
    data.Sumdan.name
  }. Adapun rincian data penyerahan berkas tersebut kami lampirkan bersama dengan surat ini pada halaman 2 (lampiran).</p>
        <div class="my-5"></div>
        <p>Kami berharap berkas tersebut dapat diproses sesuai prosedur dan ketentuan yang berlaku. Apabila diperlukan informasi tambahan, kami siap memberikan keterangan lebih lanjut.</p>
        <p>Demikian surat Penyerahan Berkas ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
  
        <div class="my-20 flex justify-between gap-20">
          <div class="flex-1">
            <p>Bandung, ${moment(data.created_at).format("LL")}</p>
            <p>Pengirim</p>
            <br /><br /><br /><br /><br />
            <p class="font-semibold underline">${
              process.env.NEXT_PUBLIC_APP_BERKAS_NAME
            }</p>
            <p class="font-semibold">${(
              process.env.NEXT_PUBLIC_APP_BERKAS_JABATAN || ""
            ).toUpperCase()}</p>
          </div>
          <div class="flex-1">
            <p class="mt-5">Penerima</p>
            <br /><br /><br /><br /><br />
            <div class="border-b border-gray-900 w-30 mt-7">
            </div>
          </div>
        </div>
      </div>


      <div class="page-break"></div>
      <div class="page">
      
        ${HeaderTwoLogoCustom(data, "LAMPIRAN PENYERAHAN BERKAS")}

          <div class="my-10">
            <p>Lampiran Penyerahan Berkas Nomor ${data.id}</p>
          </div>
          <div class="my-5">
            <table style="width:100%; border-collapse: collapse; margin-top:20px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #aaa; padding: 5px; text-align: center;">No</th>
                  <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Pemohon</th>
                  <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Produk Pembiayaan</th>
                  <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Nomor Akad</th>
                  <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Nomor SK Pensiun</th>
                </tr>
              </thead>
              <tbody>
                ${data.Dapem.map((a, index) => {
                  return `
                    <tr>
                      <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">${
                        index + 1
                      }</td>
                      <td style="border: 1px solid #aaa; padding: 1px 3px;line-height: 1;">
                        <p>${a.Debitur.nama_penerima}</p>
                        <p class="text-sm opacity-80">${a.Debitur.nopen}</p>
                      </td>
                      <td style="border: 1px solid #aaa; padding: 1px 3px;line-height: 1;">
                        <p>${a.ProdukPembiayaan.name}</p>
                        <p class="text-sm opacity-80">${
                          a.JenisPembiayaan.name
                        }</p>
                      </td>
                      <td style="border: 1px solid #aaa; padding: 1px 3px;line-height: 1;">
                        ${
                          a.akad_nomor
                            ? `
                          <p>${a.akad_nomor}</p>
                          <p class="text-sm opacity-80">${moment(
                            a.akad_date
                          ).format("DD/MM/YYYY")}</p>
                          `
                            : ""
                        }
                      </td>
                      <td style="border: 1px solid #aaa; padding: 1px 3px;">${
                        a.Debitur.no_skep
                      }</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </body>
  </html>
  `;

  return html;
};

export const printPB = (record: IPenyerahanBerkas) => {
  const htmlContent = generatePB(record);

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
