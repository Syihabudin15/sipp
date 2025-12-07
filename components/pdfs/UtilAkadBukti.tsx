"use client";
import { IDapem } from "../IInterfaces";
import { getAngsuran, IDRFormat } from "../Utils";
import moment from "moment";
import { HeaderTwoLogo } from "./UtilAkad";

export const PencairanPembiayaan = (data: IDapem) => {
  const angsuran = getAngsuran(
    data.plafond,
    data.tenor,
    data.margin + data.margin_sumdan,
    data.pembulatan
  ).angsuran;
  const admin = data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
  const asuransi = data.plafond * (data.c_asuransi / 100);
  const blokir = data.c_blokir * angsuran;

  const biayaTotal =
    admin +
    asuransi +
    data.c_tatalaksana +
    data.c_rekening +
    data.c_materai +
    data.c_mutasi +
    blokir;

  return `
    ${HeaderTwoLogo(data, "BUKTI PENCAIRAN PEMBIAYAAN")}

    <p>Yang bertandatangan dibawah ini :</p>
    <div class="ml-5 my-3">
      <div class="flex gap-4">
        <p class="w-44">Nama Lengkap</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.nama_penerima}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Nomor Pensiun</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.nopen}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Nomor NIK</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.nik}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Tempat, Tanggal Lahir</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.tempat_lahir}, ${moment(
    data.Debitur.tgl_lahir_penerima,
    "YYYY-MM-DD"
  ).format("DD-MM-YYYY")}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Nomor Telepon</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.no_telepon}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Alamat</p>
        <p class="w-4">:</p>
        <p class="flex-1">${data.Debitur.alm_peserta} Kelurahan ${
    data.Debitur.kelurahan
  } Kecamatan ${data.Debitur.kecamatan} Kota/Kabupaten ${
    data.Debitur.kota
  } Provinsi ${data.Debitur.provinsi} ${data.Debitur.kode_pos}</p>
      </div>
    </div>

    <p>Menyatakan dan menyetujui telah menerima Fasilitas Pembiayaan dari ${
      data.ProdukPembiayaan.Sumdan.name
    } melalui ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  } dengan rincian sebagai berikut :</p>

    <div class="flex gap-10 justify-between my-3 border-b">
      <div class="flex-1">
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
      </div>
      <div class="flex-1">
        <div class="flex gap-4">
          <p class="w-32">Margin Bunga</p>
          <p class="w-4">:</p>
          <p class="flex-1">${
            data.margin + data.margin_sumdan
          }% Efektif Pertahun</p>
        </div>
        <div class="flex gap-4">
          <p class="w-32">Angsuran Perbulan</p>
          <p class="w-4">:</p>
          <p class="flex-1">Rp. ${IDRFormat(angsuran)}</p>
        </div>
      </div>
    </div>
    
    <p class="font-semibold">RINCIAN BIAYA</p>
    <div>
      <div class="flex gap-4">
        <p class="w-44">Biaya Administrasi</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(admin)}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Biaya Asuransi</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(asuransi)}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Biaya Tatalaksana</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.c_tatalaksana)}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Biaya Buka Rekening</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.c_rekening)}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Biaya Mutasi</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.c_mutasi)}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-44">Blokir Angsuran (${data.c_blokir}x)</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(blokir)}</p>
      </div>
      <div class="flex gap-4 font-bold text-red-500">
        <p class="w-44">Total Biaya</p>
        <p class="w-4">:</p>
        <p class="flex-1 border-t border-gray-400">Rp. ${IDRFormat(
          biayaTotal
        )}</p>
      </div>
      <div class="flex gap-4 mt-4">
        <p class="w-44">Terima Kotor</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.plafond - biayaTotal)}</p>
      </div>
      <div class="flex gap-4 text-red-500">
        <p class="w-44">Nominal Takeover</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.c_pelunasan)}</p>
      </div>
      <div class="flex gap-4 font-bold text-green-500">
        <p class="w-44">Terima Bersih</p>
        <p class="w-4">:</p>
        <p class="flex-1 border-t border-gray-400">Rp. ${IDRFormat(
          data.plafond - (biayaTotal + data.c_pelunasan)
        )}</p>
      </div>
    </div>

    <p class="mt-5 mb-3">${data.Debitur.kota}, ${moment(data.akad_date).format(
    "DD-MM-YYYY"
  )}</p>

    <div class="grid grid-cols-2 gap-14 mb-4">
      <div class="text-center">
        <p>Diterima oleh</p>
        <br /><br /><br /><br />
        <p>${data.Debitur.nama_penerima}</p>
        <div class="border border-b"></div>
        <p>DEBITUR</p>
      </div>
      <div class="text-center">
        <p>Diberikan oleh</p>
        <br /><br /><br /></br /><br />
        <div class="border border-b"></div>
        <p>PETUGAS KANTOR LAYANAN</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-14">
      <div class="text-center">
        <p>Diperiksa oleh</p>
        <br /><br /><br /><br />
        <p>${process.env.NEXT_PUBLIC_APP_DROPPING_NAME}</p>
        <div class="border border-b"></div>
        <p>${process.env.NEXT_PUBLIC_APP_DROPPING_JABATAN}</p>
      </div>
      <div class="text-center">
        <p>Diotorisasi oleh</p>
        <br /><br /><br /></br />
        <p>${process.env.NEXT_PUBLIC_APP_AKAD_NAME}</p>
        <div class="border border-b"></div>
        <p>${(process.env.NEXT_PUBLIC_APP_AKAD_JABATAN || "").toUpperCase()}</p>
      </div>
    </div>

    <p class="italic opacity-70">Note : Dibuat rangkap 2 untuk Debitur dan Kreditur. Ditandatangani oleh Debitur disetiap halaman!</p>

  `;
};

export const PenyerahanJaminan = (data: IDapem) => {
  return `
    ${HeaderTwoLogo(data, "TANDA TERIMA PENYERAHAN JAMINAN")}
    
    <div class="flex gap-8 justify-between">
      <div class="flex-1">
        <div class="flex gap-2">
          <p class="w-36">Nama Lengkap</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nama_penerima}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor Pensiun</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nopen}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor NIK</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nik}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Tempat, Tanggal Lahir</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.tempat_lahir}, ${moment(
    data.Debitur.tgl_lahir_penerima,
    "YYYY-MM-DD"
  ).format("DD-MM-YYYY")}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor Telepon</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.no_telepon}</p>
        </div>
      </div>

      <div class="flex-1">
        <div class="flex gap-2">
          <p class="w-36">Nomor SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.no_skep}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Tangal SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${moment(
            data.Debitur.tgl_skep,
            "YYYY-MM-DD"
          ).format("DD-MM-YYYY")}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nama SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nama_skep}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Penerbit SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.penerbit_skep}</p>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <p class="w-36">Alamat</p>
      <p class="w-4">:</p>
      <p class="flex-1">${data.Debitur.alm_peserta} Kelurahan ${
    data.Debitur.kelurahan
  } Kecamatan ${data.Debitur.kecamatan} Kota/Kabupaten ${
    data.Debitur.kota
  } Provinsi ${data.Debitur.provinsi} ${data.Debitur.kode_pos}</p>
    </div>

    <div class="flex gap-4 mt-4">
      <p class="w-40">Tanggal Penyerahan</p>
      <p class="w-4">:</p>
      <p class="flex-1"></p>
    </div>
    <div class="flex gap-4">
      <p class="w-40">Tanggal Pengembalian</p>
      <p class="w-4">:</p>
      <p class="flex-1"></p>
    </div>

    <p class="text-center font-semibold">DISERAHKAN</p>
    <div class="grid grid-cols-2 gap-14">
      <div class="text-center">
        <br /><br /><br /><br /><br />
        <p>${data.Debitur.nama_penerima}</p>
        <div class="border border-b"></div>
        <p>DEBITUR</p>
      </div>
      <div class="text-center">
        <br /><br /><br /></br /><br /><br />
        <div class="border border-b"></div>
        <p>PETUGAS KANTOR LAYANAN</p>
      </div>
    </div>

    <p class="text-center font-semibold">DIKEMBALIKAN</p>
    <div class="grid grid-cols-2 gap-14">
      <div class="text-center">
        <br /><br /><br /></br /><br /><br />
        <div class="border border-b"></div>
        <p>PETUGAS KANTOR LAYANAN</p>
      </div>
      <div class="text-center">
        <br /><br /><br /><br /><br />
        <p>${data.Debitur.nama_penerima}</p>
        <div class="border border-b"></div>
        <p>DEBITUR</p>
      </div>
    </div>

  <div class="flex items-center gap-2 my-4">
    <div class="flex-1 border-t border-dashed"></div>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
    </svg>

    <div class="flex-1 border-t border-dashed"></div>
  </div>
    
     ${HeaderTwoLogo(data, "TANDA TERIMA PENYERAHAN JAMINAN")}
    
    <div class="flex gap-8 justify-between">
      <div class="flex-1">
        <div class="flex gap-2">
          <p class="w-36">Nama Lengkap</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nama_penerima}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor Pensiun</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nopen}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor NIK</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nik}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Tempat, Tanggal Lahir</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.tempat_lahir}, ${moment(
    data.Debitur.tgl_lahir_penerima,
    "YYYY-MM-DD"
  ).format("DD-MM-YYYY")}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nomor Telepon</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.no_telepon}</p>
        </div>
      </div>

      <div class="flex-1">
        <div class="flex gap-2">
          <p class="w-36">Nomor SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.no_skep}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Tangal SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${moment(
            data.Debitur.tgl_skep,
            "YYYY-MM-DD"
          ).format("DD-MM-YYYY")}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Nama SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.nama_skep}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-36">Penerbit SKEP</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.Debitur.penerbit_skep}</p>
        </div>
      </div>
    </div>
    <div class="flex gap-2">
      <p class="w-36">Alamat</p>
      <p class="w-4">:</p>
      <p class="flex-1">${data.Debitur.alm_peserta} Kelurahan ${
    data.Debitur.kelurahan
  } Kecamatan ${data.Debitur.kecamatan} Kota/Kabupaten ${
    data.Debitur.kota
  } Provinsi ${data.Debitur.provinsi} ${data.Debitur.kode_pos}</p>
    </div>

    <div class="flex gap-4 mt-4">
      <p class="w-40">Tanggal Penyerahan</p>
      <p class="w-4">:</p>
      <p class="flex-1"></p>
    </div>
    <div class="flex gap-4">
      <p class="w-40">Tanggal Pengembalian</p>
      <p class="w-4">:</p>
      <p class="flex-1"></p>
    </div>

    <p class="text-center font-semibold">DISERAHKAN</p>
    <div class="grid grid-cols-2 gap-14">
      <div class="text-center">
        <br /><br /><br /><br /><br />
        <p>${data.Debitur.nama_penerima}</p>
        <div class="border border-b"></div>
        <p>DEBITUR</p>
      </div>
      <div class="text-center">
        <br /><br /><br /></br /><br /><br />
        <div class="border border-b"></div>
        <p>PETUGAS KANTOR LAYANAN</p>
      </div>
    </div>

    <p class="text-center font-semibold">DIKEMBALIKAN</p>
    <div class="grid grid-cols-2 gap-14">
      <div class="text-center">
        <br /><br /><br /></br /><br /><br />
        <div class="border border-b"></div>
        <p>PETUGAS KANTOR LAYANAN</p>
      </div>
      <div class="text-center">
        <br /><br /><br /><br /><br />
        <p>${data.Debitur.nama_penerima}</p>
        <div class="border border-b"></div>
        <p>DEBITUR</p>
      </div>
    </div>
  `;
};
