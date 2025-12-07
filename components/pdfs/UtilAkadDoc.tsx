"use client";
import { IDapem } from "../IInterfaces";
import { getAngsuran, IDRFormat } from "../Utils";
import moment from "moment";
import { HeaderTwoLogo } from "./UtilAkad";

export const FormChecklist = (data: IDapem) => {
  const angsuran = getAngsuran(
    data.plafond,
    data.tenor,
    data.margin + data.margin_sumdan,
    data.pembulatan
  ).angsuran;

  return `
    ${HeaderTwoLogo(data, "CHECKLIST KELENGKAPAN BERKAS")}

    <div class="flex gap-10 justify-between my-3 border-b">
        <div class="flex-1">
          <div class="flex gap-4">
            <p class="w-32">Nama Lengkap</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.Debitur.nama_penerima}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Nomor Pensiun</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.Debitur.nopen}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Nomor NIK</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.Debitur.nik}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tanggal Lahir</p>
            <p class="w-4">:</p>
            <p class="flex-1">${moment(
              data.Debitur.tgl_lahir_penerima,
              "YYYY-MM-DD"
            ).format("DD/MM/YYYY")}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Produk Pembiayaan</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.ProdukPembiayaan.name}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Jenis Pembiayaan</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.JenisPembiayaan.name}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Plafond Pembiayaan</p>
            <p class="w-4">:</p>
            <p class="flex-1">Rp. ${IDRFormat(data.plafond)}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tenor/Jangka Waktu</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.tenor} Bulan</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Angsuran Perbulan</p>
            <p class="w-4">:</p>
            <p class="flex-1">Rp. ${IDRFormat(angsuran)}</p>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex gap-4">
            <p class="w-32">Nama SKEP</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.Debitur.nama_skep}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Nomor SKEP</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.Debitur.no_skep}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tanggal SKEP</p>
            <p class="w-4">:</p>
            <p class="flex-1">${moment(
              data.Debitur.tgl_skep,
              "YYYY-MM-DD"
            ).format("DD/MM/YYYY")}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Area Pelayanan</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.AO.Cabang.name} - ${
    data.AO.Cabang.Area.name
  }</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Admin Input</p>
            <p class="w-4">:</p>
            <p class="flex-1">${data.CreatedBy.fullname}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tanggal Permohonan</p>
            <p class="w-4">:</p>
            <p class="flex-1">${moment(data.created_at).format(
              "DD/MM/YYYY"
            )}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tanggal Akad</p>
            <p class="w-4">:</p>
            <p class="flex-1">${moment(data.akad_date).format("DD/MM/YYYY")}</p>
          </div>
          <div class="flex gap-4">
            <p class="w-32">Tanggal Dropping</p>
            <p class="w-4">:</p>
            <p class="flex-1">${
              data.final_at && moment(data.final_at).format("DD/MM/YYYY")
            }</p>
          </div>
        </div>
      </div>

      <p class="text-center font-semibold">CHECKLIST KELENGKAPAN DOKUMEN PERMOHONAN PEMBIAYAAN</p>

      <table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">No.</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;width: 200px;">Dokumen</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check Admin/Petugas
              <div class="grid grid-cols-2 divide-x">
                <div>Asli</div>
                <div>Copy</div>
              </div>
            </th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check Kantor Pusat
            <div class="grid grid-cols-2 divide-x">
              <div>Asli</div>
              <div>Copy</div>
            </div></th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check ${
              data.ProdukPembiayaan.Sumdan.code
            }
            <div class="grid grid-cols-2 divide-x">
              <div>Asli</div>
              <div>Copy</div>
            </div></th>
          </tr>
        </thead>
        <tbody>
          ${berkasPermohonan
            .map(
              (b, i) => `
              <tr>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">${
                  i + 1
                }</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;">${b}</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>

      <p class="text-center font-semibold mt-5">CHECKLIST KELENGKAPAN DOKUMEN AKAD, DROPPING & JAMINAN</p>
      <table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">No.</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;width: 200px;">Dokumen</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check Admin/Petugas
              <div class="grid grid-cols-2 divide-x">
                <div>Asli</div>
                <div>Copy</div>
              </div>
            </th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check Kantor Pusat
            <div class="grid grid-cols-2 divide-x">
              <div>Asli</div>
              <div>Copy</div>
            </div></th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align:center;">Check ${
              data.ProdukPembiayaan.Sumdan.code
            }
            <div class="grid grid-cols-2 divide-x">
              <div>Asli</div>
              <div>Copy</div>
            </div></th>
          </tr>
        </thead>
        <tbody>
          ${berkasAkadDropping
            .map(
              (b, i) => `
              <tr>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">${
                  i + 1
                }</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;">${b}</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;">
                  <div class="grid grid-cols-2 divide-x">
                    <div class="border-r h-4"></div>
                    <div></div>
                  </div>
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>

  `;
};

const berkasPermohonan = [
  "KTP Pemohon",
  "KTP Pasangan/Ahli waris",
  "KTP Keluarga",
  "Surat Nikah",
  "Surat Kematian",
  "NPWP",
  "KARIP/Buku ASABRI",
  "Mutasi Rekening 3 Bulan Terakhir",
  "IDPB/SKPP",
  "Analisa Perhitungan",
  "Form Permohonan",
  "Surat Keterangan Perbedaan Identitas",
  "Foto Debitur",
];
const berkasAkadDropping = [
  "Analisa Perhitungan",
  "Kartu Angsuran",
  "Perjanjian Kredit",
  "Surat Kuasa Debet Rekening",
  "Form Mutasi/Flagging",
  "Surat Pernyataan DSR > 70%",
  "Surat Pernyataan & Kesanggupan Mematuhi S&K Pembiayaan",
  "Bukti Pencairan Pembiayaan",
  "Tanda Terima Penyerahan Jaminan",
  "Surat Keputusan (SK) Pensiun",
];
