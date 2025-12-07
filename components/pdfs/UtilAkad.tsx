"use client";
import { IDapem } from "../IInterfaces";
import { getAngsuran, getFullAge, IDRFormat } from "../Utils";
import moment from "moment";

export const numberToWordsID = (n: number): string => {
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  const toWords = (x: number): string => {
    x = Math.floor(x);
    if (x < 12) return satuan[x];
    if (x < 20) return toWords(x - 10) + " Belas";
    if (x < 100)
      return (
        toWords(Math.floor(x / 10)) +
        " Puluh" +
        (x % 10 ? " " + toWords(x % 10) : "")
      );
    if (x < 200) return "Seratus" + (x - 100 ? " " + toWords(x - 100) : "");
    if (x < 1000)
      return (
        toWords(Math.floor(x / 100)) +
        " Ratus" +
        (x % 100 ? " " + toWords(x % 100) : "")
      );
    if (x < 2000) return "Seribu" + (x - 1000 ? " " + toWords(x - 1000) : "");
    if (x < 1000000)
      return (
        toWords(Math.floor(x / 1000)) +
        " Ribu" +
        (x % 1000 ? " " + toWords(x % 1000) : "")
      );
    if (x < 1000000000)
      return (
        toWords(Math.floor(x / 1000000)) +
        " Juta" +
        (x % 1000000 ? " " + toWords(x % 1000000) : "")
      );
    if (x < 1000000000000)
      return (
        toWords(Math.floor(x / 1000000000)) +
        " Miliar" +
        (x % 1000000000 ? " " + toWords(x % 1000000000) : "")
      );
    return x.toString();
  };
  if (n === 0) return "Nol";
  return toWords(n);
};

export const HeaderTwoLogo = (data: IDapem, title?: string) => `
  <div class="page-header flex items-center justify-between mb-6 border-b pb-4">
    <img src="${
      process.env.NEXT_PUBLIC_APP_LOGO || "/app_logo.png"
    }" alt="Logo" class="h-16 mr-4" />
    <div class="text-center">
      <h2 class="text-center text-xl font-semibold mb-2 underline">${
        title || "PERJANJIAN KREDIT"
      }</h2>
      <p class="text-center ">${data.akad_nomor}</p>
    </div>
    <img src="${
      data.ProdukPembiayaan.Sumdan.logo ||
      process.env.NEXT_PUBLIC_APP_LOGO ||
      "/app_logo.png"
    }" alt="Logo BPR" class="h-16 mr-4" />
  </div>`;

export const HeaderOneLogo = (
  data: IDapem,
  title?: string,
  customNo?: string
) => `
  <div class="page-header flex items-center mb-6 border-b pb-4">
    <img src="${
      process.env.NEXT_PUBLIC_APP_LOGO || "/app_logo.png"
    }" alt="Logo" class="h-16 mr-4" />
    <div class="text-center">
      <h2 class="text-center text-xl font-semibold mb-2 underline">${
        title || "PERJANJIAN KREDIT"
      }</h2>
      <p class="text-center ">${customNo || data.akad_nomor}</p>
    </div>
  </div>`;

export const HeaderNoLogo = (data: IDapem, title?: string, customNo?: any) => `
  <div class="page-header flex items-center justify-center mb-6 border-b pb-4">
    <div class="text-center">
      <h2 class="text-center text-xl font-semibold mb-2 underline">${
        title || "PERJANJIAN KREDIT"
      }</h2>
      <p class="text-center text-xl">${customNo || data.akad_nomor}</p>
    </div>
  </div>`;

export const AnalisaPerhitungan = (data: IDapem) => {
  const age = getFullAge(
    data.Debitur.tgl_lahir_penerima,
    moment(data.created_at).format("YYYY-MM-DD")
  );
  const ageLunas = getFullAge(
    data.Debitur.tgl_lahir_penerima,
    moment(data.created_at).add(data.tenor, "month").format("YYYY-MM-DD")
  );
  const angsuran = getAngsuran(
    data.plafond,
    data.tenor,
    data.margin + data.margin_sumdan,
    data.pembulatan
  ).angsuran;

  const biayaAdm = data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
  const biayaAsuransi = data.plafond * (data.c_asuransi / 100);
  const blokir = angsuran * data.c_blokir;

  const biayaTotal =
    biayaAdm +
    biayaAsuransi +
    data.c_tatalaksana +
    data.c_rekening +
    data.c_materai +
    data.c_mutasi +
    blokir;

  return `
  ${HeaderTwoLogo(data, "ANALISA PERHITUNGAN PEMBIAYAAN")}
  
  <div class="mt-8"></div>
  <h3 class="font-semibold mb-2 text-center text-xl">DATA PERMOHONAN</h3>
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
        <p class="w-32">Tanggal Lahir</p>
        <p class="w-4">:</p>
        <p class="flex-1">${moment(
          data.Debitur.tgl_lahir_penerima,
          "YYYY-MM-DD"
        ).format("DD/MM/YYYY")}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-32">Gaji Pensiun</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(data.Debitur.gaji_pensiun)}</p>
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
      <div class="flex gap-4">
        <p class="w-32">Sisa Gaji</p>
        <p class="w-4">:</p>
        <p class="flex-1">Rp. ${IDRFormat(
          data.Debitur.gaji_pensiun - angsuran
        )}</p>
      </div>
      <div class="flex gap-4">
        <p class="w-32">Usia Saat Ini</p>
        <p class="w-4">:</p>
        <p class="flex-1">${age.year} Tahun ${age.month} Bulan ${
    age.day
  } Hari</p>
      </div>
      <div class="flex gap-4">
        <p class="w-32">Estimasi Usia Lunas</p>
        <p class="w-4">:</p>
        <p class="flex-1">${ageLunas.year} Tahun ${ageLunas.month} Bulan ${
    ageLunas.day
  } Hari</p>
      </div>
    </div>
  </div>

  <div class="border-b border-gray-300"></div>
  <div class="mt-8">
    <h3 class="font-semibold mb-2 text-center text-xl">RINCIAN BIAYA</h3>
    <div style="width:100%;display: flex; flex-direction: column; gap: 3px;">
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Administrasi</p>
        <p>Rp. ${IDRFormat(biayaAdm)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Asuransi</p>
        <p>Rp. ${IDRFormat(biayaAsuransi)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Tatalaksana</p>
        <p>Rp. ${IDRFormat(data.c_tatalaksana)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Buka Rekening</p>
        <p>Rp. ${IDRFormat(data.c_rekening)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Materai</p>
        <p>Rp. ${IDRFormat(data.c_materai)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Biaya Mutasi</p>
        <p>Rp. ${IDRFormat(data.c_mutasi)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <p>Blokir Angsuran   (${data.c_blokir}x)</p>
        <p>Rp. ${IDRFormat(blokir)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between; font-weight: bold;border-top: 1px solid #eee;color:red">
        <p>Total Biaya</p>
        <p >Rp. ${IDRFormat(biayaTotal)}</p>
      </div>
      <div class="mt-8"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between; font-weight: bold;color:blue">
        <p>Terima Kotor</p>
        <p >Rp. ${IDRFormat(data.plafond - biayaTotal)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;color:red">
        <p>Nominal Takeover</p>
        <p>Rp. ${IDRFormat(data.c_pelunasan)}</p>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between; font-weight: bold;color:green;border-top: 1px solid #eee;">
        <p>Terima Bersih</p>
        <p >Rp. ${IDRFormat(data.plafond - (data.c_pelunasan + biayaTotal))}</p>
      </div>
    </div>
  </div>
  <div class="mt-12"></div>
  <div class="italic opacity-80">
    <p class="font-semibold">Informasi Tambahan : </p>
    <p>Debt Service Ratio Sebesar : ${(
      (angsuran / data.Debitur.gaji_pensiun) *
      100
    ).toFixed(2)}%</p>
    ${
      data.JenisPembiayaan.status_pelunasan
        ? `<p>Nominal Takeover sebesar Rp. ${IDRFormat(
            data.c_pelunasan
          )} akan dibayarkan ke ${data.pelunasan_ke}.</p>`
        : ""
    }
    ${
      data.JenisPembiayaan.status_mutasi
        ? `<p>Mutasi Kantor Bayar dari ${data.mutasi_from} ke ${data.mutasi_ke}.</p>`
        : ""
    }
  </div>
`;
};

export const KartuAngsuran = (data: IDapem) => {
  return `
    ${HeaderTwoLogo(data, "KARTU ANGSURAN PEMBIAYAAN")}
    <div class="flex justify-between my-3 gap-4">
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
          <p class="w-32">Kantor Bayar</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.mutasi_ke || data.mutasi_from}</p>
        </div>
        <div class="flex gap-4">
          <p class="w-32">Area Pelayanan</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.AO.Cabang.name} - ${
    data.AO.Cabang.Area.name
  }</p>
        </div>
      </div>
      <div class="flex-1">
        <div class="flex gap-4">
          <p class="w-32">Plafond Pembiayaan</p>
          <p class="w-4">:</p>
          <p class="flex-1">Rp. ${IDRFormat(data.plafond)}</p>
        </div>
        <div class="flex gap-4">
          <p class="w-32">Tenor</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.tenor}</p>
        </div>
        <div class="flex gap-4">
          <p class="w-32">Margin Bunga</p>
          <p class="w-4">:</p>
          <p class="flex-1">${data.margin + data.margin_sumdan}%</p>
        </div>
        <div class="flex gap-4">
          <p class="w-32">Tanggal Akad</p>
          <p class="w-4">:</p>
          <p class="flex-1">${moment(data.akad_date).format("DD/MM/YYYY")}</p>
        </div>
      </div>
    </div>

    <p class="my-2 italic opacity-70">Note: dibuat rangkap 2 untuk Debitur dan Kreditur. Ditandatangani oleh Debitur disetiap halaman!</p>

    <table style="width:100%; border-collapse: collapse; margin-top:10px;">
      <thead>
        <tr>
          <th style="border: 1px solid #aaa; padding: 5px;">No.</th>
          <th style="border: 1px solid #aaa; padding: 5px;">Jatuh Tempo</th>
          <th style="border: 1px solid #aaa; padding: 5px;">Angsuran Pokok</th>
          <th style="border: 1px solid #aaa; padding: 5px;">Angsuran Bunga</th>
          <th style="border: 1px solid #aaa; padding: 5px;">Total Angsuran</th>
          <th style="border: 1px solid #aaa; padding: 5px;">Saldo Pokok</th>
        </tr>
      </thead>
      <tbody>
        ${data.Angsuran.map((a, index) => {
          const angsuran = getAngsuran(
            data.plafond,
            data.tenor,
            data.margin + data.margin_sumdan,
            data.pembulatan
          ).angsuran;
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
                angsuran
              )}</td>
              <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                a.sisa
              )}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
};

export const PerjanjianKredit = (data: IDapem) => {
  const angsuran = getAngsuran(
    data.plafond,
    data.tenor,
    data.margin + data.margin_sumdan,
    data.pembulatan
  ).angsuran;

  const biayaAdm = data.plafond * ((data.c_adm + data.c_adm_sumdan) / 100);
  const biayaAsuransi = data.plafond * (data.c_asuransi / 100);
  const blokir = angsuran * data.c_blokir;

  const biayaTotal =
    biayaAdm +
    biayaAsuransi +
    data.c_tatalaksana +
    data.c_rekening +
    data.c_materai +
    data.c_mutasi +
    blokir;

  return `
  ${HeaderTwoLogo(data, "PERJANJIAN KREDIT")}
      <p class="mb-4">
        Pada hari ini, <strong>${moment(
          data.akad_date || data.created_at
        ).format("dddd")}, ${moment(data.akad_date || data.created_at).format(
    "DD MMMM YYYY"
  )}</strong>, telah dibuat dan ditandatangani perjanjian kredit
        (selanjutnya disebut "Perjanjian") oleh dan antara:
      </p>

      <h3 class="font-semibold mb-1">I. KREDITUR</h3>
      <p class="mb-3 pl-4 text-justify">
        ${
          data.ProdukPembiayaan.Sumdan.sk_akad || "NO DATA SK AKAD"
        }. Dan dengan ini menunjuk ${
    process.env.NEXT_PUBLIC_APP_AKAD_NAME
  } selaku ${process.env.NEXT_PUBLIC_APP_AKAD_JABATAN} ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  } sebagai perwakilan dalam Pembiayaan Kredit ini. Selanjutnya disebut <strong>KREDITUR</strong>.
      </p>

      <h3 class="font-semibold mb-1">II. DEBITUR</h3>
      <p class="mb-3 pl-4 text-justify">
        <strong>${
          data.Debitur.nama_penerima
        }</strong> selaku Debitur/Pemohon Pembiayaan Kredit,
        lahir di ${data.Debitur.tempat_lahir} dan bertempat tinggal di ${
    data.Debitur.alm_peserta
  } Kelurahan ${data.Debitur.kelurahan} Kecamatan ${
    data.Debitur.kecamatan
  } Kota/Kabupaten ${data.Debitur.kota} Provinsi ${
    data.Debitur.provinsi
  } Kode Pos ${data.Debitur.kode_pos}, dengan
        nomor NIK <strong>${data.Debitur.nik}</strong>, nomor pensiun <strong>${
    data.Debitur.nopen
  }
        </strong>, dan nomor telepon <strong>${
          data.Debitur.no_telepon
        }</strong>,
        pada saat ini bertindak untuk dan atas nama dirinya sendiri
        . Selanjutnya disebut <strong>DEBITUR</strong>.
      </p>

      <p class="mb-4">
        <strong>KREDITUR</strong> dan <strong>DEBITUR</strong> secara bersama-sama disebut "PARA PIHAK". PARA PIHAK telah sepakat untuk membuat Perjanjian Kredit dengan ketentuan sebagai berikut:
      </p>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 1</p><p>FASILITAS KREDIT</p></h3>
      <p>Atas permohonan <strong>DEBITUR</strong>, dengan ini <strong>KREDITUR</strong> setuju memberikan fasilitas kredit kepada <strong>DEBITUR</strong> untuk keperluan ${
        data.penggunaan
      } sesuai dengan ketentuan sebagai berikut:</p>
      <ul class="list-disc list-outside mb-4">
        <li>Jumlah Plafond Kredit sebesar Rp. ${IDRFormat(
          data.plafond
        )} (${numberToWordsID(data.plafond)} Rupiah)</li>
        <li>Jumlah biaya yang dikenakan kepada <strong>DEBITUR</strong> sebesar Rp. ${IDRFormat(
          biayaTotal
        )} (${numberToWordsID(
    biayaTotal
  )} Rupiah) meliputi biaya administrasi, asuransi, tatalaksana, buka rekening, materai, mutasi, dan blokir angsuran ${
    data.c_blokir
  }x (${numberToWordsID(data.c_blokir)} Kali).</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 2</p><p>JANGKA WAKTU PINJAMAN DAN ANGSURAN</p></h3>
      <ul class="list-disc list-outside mb-4">
        <li>Jangka Waktu Kredit selama ${data.tenor} (${numberToWordsID(
    data.tenor
  )}) Bulan terhitung sejak tanggal akad kredit.</li>
        <li>Bunga Kredit sebesar ${
          data.margin + data.margin_sumdan
        }% (${numberToWordsID(
    data.margin + data.margin_sumdan
  )} persen) per tahun.</li>
        <li>Angsuran Pokok dan Bunga Kredit sebesar Rp. ${IDRFormat(
          angsuran
        )} (${numberToWordsID(angsuran)} Rupiah)</li>
        <li><strong>DEBITUR</strong> sewaktu-waktu dapat melunasi fasilitas kredit tersebut di atas dalam masa jangka waktu fasilitas yang telah ditetapkan dengan mem- bayar denda pinalti disesuaikan dengan ketentuan yang berlaku.</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 4</p><p>JAMINAN KREDIT</p></h3>
      <p>Untuk menjamin pembayaran hutang pokok, bunga dan pembayaran lainnya sebagaimana tercantum dalam Perjanjlan ini, <strong>DEBITUR</strong> setuju memberikan jaminan kepada <strong>KREDITUR</strong> berupa:</p>
      <ul class="list-disc list-outside mb-4">
        <li>Asli Surat Keputusan (SK) Pensiun: Nomor ${
          data.Debitur.no_skep
        } Tanggal ${moment(data.Debitur.tgl_skep, "YYYY-MM-DD").format(
    "DD-MM-YYYY"
  )} atas nama ${data.Debitur.nama_skep}</li>
        <li>Asli Surat Pernyataan Kuasa Potong Gaji atas nama : ${
          data.Debitur.nama_penerima
        }</li>
        <li><strong>DEBITUR</strong> memberi kuasa kepada <strong>KREDITUR</strong> untuk melakukan tindakan dan perbuatan hukum yang dianggap wajar dan perlu oleh <strong>KREDITUR</strong> yang berkaitan dengan pemberian jaminan tersebut diatas</li>
        <li><strong>DEBITUR</strong> dengan ini menyatakan dan menjamin bahwa JAMINAN tersebut diatas adalah benar dan milik <strong>DEBITUR</strong>, dan hanya <strong>DEBITUR</strong> sajalah yang berhak untuk menyerahkannya sebagai Jaminan, tidak sedang diberikan sebagai Jaminan untuk sesuatu hutang pada pihak lain dengan jalan bagaimanapun juga, tidak dalam keadaan sengketa serta bebas dari sitaan, serta belum dijual atau dijanjikan untuk dijual atau dialihkan kepada pihak lain dengan cara apapun juga.</li>
        <li><strong>DEBITUR</strong> menjamin bahwa mengenai hal – hal tersebut diatas, baik sekarang maupun dikemudian hari, <strong>KREDITUR</strong> tidak akan mendapat tuntutan atau gugatan dari pihak manapun juga yang menyatakan mempunyai hak terlebih dahulu atau turut mempunyai hak atas JAMINAN tersebut diatas.
        </li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 5</p><p>PEMBERIAN KUASA</p></h3>
      <ul class="list-disc list-outside mb-4">
        <li><strong>DEBITUR</strong> dengan ini memberikan kuasa kepada <strong>KREDITUR</strong> untuk mendebet dan menggunakan dana yang tersimpan pada <strong>KREDITUR</strong> baik dari rekening tabungan/deposito milik <strong>DEBITUR</strong> guna pembayaran angsuran pokok maupun bunga, denda, premi asuransi, blaya-biaya lalnnya yang mungkin timbul sehubungan dengan pemberlan fasilitas kredit ini dan segala yang terhutang berkenaan dengan pemberian fasilitas kredit berdasarkan perjanjian ini.</li>
        <li><strong>KREDITUR</strong> diberi kuasa oleh <strong>DEBITUR</strong> untuk menutup asuransi jiwa dan biaya premi yang menjadi beban <strong>DEBITUR</strong>, apabila <strong>DEBITUR</strong> meninggal dunia maka uang klaim asuransi digunakan untuk menjamin pelunasan seluruh kewajiban <strong>DEBITUR</strong>.</li>
        <li>Kuasa-kuasa yang diberikan <strong>DEBITUR</strong> kepada <strong>KREDITUR</strong> berdasarkan Perjanjian íni kata demi kata harus telah dianggap telah termaktub dalam Perjanjian inl dan merupakan satu kesatuan serta bagian yang tidak terpisahkan dengan Perjanjian ini yang tidak dibuat tanpa adanya kuasa tersebut dan oleh karenanya kuasa-kuasa tersebut tidak akan dicabut dan tidak akan berakhir oleh karena sebab apapun juga, termasuk oleh sebab-sebab berakhirnya kuasa sebagaimana dimaksud dalam Pasal 1813, 1814 dan 1816 kitab Undang-Undang Hukum Perdata. Namun demikian,  apabila ternyata terdapat suatu ketentuan hukum yang mengharuskan adanya suatu surat kuasa khusus untuk melaksanakan hak <strong>KREDITUR</strong> berdasarkan Perjanjian, maka <strong>DEBITUR</strong> atas permintaan dari <strong>KREDITUR</strong> wajib untuk memberikan kuasa khusus dimaksud kepada <strong>KREDITUR</strong>.</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 6</p><p>DENDA KETERLAMBATAN DAN PINALTY</p></h3>
      <ul class="list-disc list-outside mb-4">
        <li>Bahwa atas setiap keterlambatan pembayaran cicilan/angsuran oleh <strong>DEBITUR</strong> kepada <strong>KREDITUR</strong>, maka <strong>DEBITUR</strong> dikenakan denda menurut ketentuan <strong>KREDITUR</strong> yang berlaku pada saat ditandatanganinya Perjanjian ini, yaitu sebesar 0,3%,- (nol koma tiga persen) perhari.</li>
        <li>Pelunasan sebagian atau seluruh pinjaman sebelum jatuh tempo dapat dilakukan <strong>DEBITUR</strong> dengan ketentuan bahwa setiap pelunasan baik sebagian atau seluruh pinjaman tersebut <strong>DEBITUR</strong> dikenakan penalty sebesar 7% (tujuh persen) yang dihitung dari sisa Pokok Pinjaman <strong>DEBITUR</strong> yang tertera pada pembukuan pihak <strong>KREDITUR</strong>.</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 7</p><p>PERISTIWA CIDERA JANJI</p></h3>
      <p><strong>KREDITUR</strong> berhak untuk sewaktu-waktu dengan mengesampingkan ketentuan Pasal 1266 Kitab Undang-Undang Hukum Perdata, Khususnya ketentuan yang mengatur keharusan untuk mengajukan permohonan pembatalan Perjanjian melalui pengadilan sehingga tidak diperlukan suatu pemberitahuan (somasij) atau surat lain yang serupa dengan itu serta surat peringatan dari juru sita, menagih hutang <strong>DEBITUR</strong> berdasarkan Perjanjian ini atau sisanya, berikut bunga-bunga, denda-denda dan biaya yang lain yang timbul berdasarkan Perjanjian dan wajib dibayar oleh <strong>DEBITUR</strong> dengan seketika dan sekaligus lunas, apabila terjadi salah satu atau lebih kejadian-kejadian tersebut dibawah ini:</p>
      <ul class="list-disc list-outside mb-4">
        <li><strong>DEBITUR</strong> tidak atau lalai membayar lunas pada waktunya kepada <strong>KREDITUR</strong> baik angsuran pokok, bunga-bunga, denda-denda dan biaya lain yang sudah jatuh tempo berdasarkan Perjanjian.</li>
        <li><strong>DEBITUR</strong> meninggal dunia atau berada dibawah pengampuan.</li>
        <li><strong>DEBITUR</strong> dinyatakan pailit, diberikan penundaan membayar hutang-hutang (surseance van betaling) atau bilamana <strong>DEBITUR</strong> dan/atau orang/pihak lain mengajukan permohonan kepada instansi yang berwenang agar <strong>DEBITUR</strong> dinyatakan dalam keadaan pailit.</li>
        <li>Kekayaan <strong>DEBITUR</strong> baik sebagian maupun seluruhnya disita atau dinyatakan dalam sitaan oleh instansi yang berwenang.</li>
        <li><strong>DEBITUR</strong> lalai atau tidak memenuhi syarat-syarat dan ketentuan/kewajiban dalam Perjanjian ini dan setiap perubahannya.</li>
        <li><strong>DEBITUR</strong> lalai atau tidak memenuhi kewajibannya kepada pihak lain berdasarkan Perjanjian dengan pihak lain sehingga <strong>DEBITUR</strong> dinyatakan Cidera Janji</li>
        <li><strong>DEBITUR</strong> tersangkut dalam suatu perkara hukum yang dapat menghalangi <strong>DEBITUR</strong> memenuhi kewajiban berdasarkan Perjanjian ini sebagaimana mestinya.</li>
        <li>Apabila ternyata suatu pernyatəan-pernyataan atau dokumen-dokumen atau keterangan-keterangan yang diberikan <strong>DEBITUR</strong> kepada <strong>KREDITUR</strong> ternyata tidak benar atau tidak sesuai dengan kenyataan.</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 8</p><p>LAIN LAIN</p></h3>
      <ul class="list-disc list-outside mb-4">
        <li>Sebelum Akad ini ditandatangani oleh <strong>DEBITUR</strong>, <strong>DEBITUR</strong> mengakui dengan sebenarnya, bahwa telah membaca dengan cermat atau dibacakan kepada <strong>DEBITUR</strong>, sehingga oleh karena itu memahami sepenuhnya segala yang akan menjadi akibat hukum setelah menandatangani Perjanjian Kredit ini.</li>
        <li>Apabila ada hal-hal yang belum diatur atau belum cukup diatur dalam Perjanjian Kredit ini, maka <strong>DEBITUR</strong> dan <strong>KREDITUR</strong> akan mengaturnya Bersama secara musyawarah untuk mufakat dalam suatu Addendum.</li>
        <li>Setiap Addendum dari Perjanjian Kredit ini merupakan satu kesatuan yang tidak dapat dipisahkan dari Perjanjian Kredit ini.</li>
      </ul>


      <h3 class="font-semibold mt-4 mb-2 text-center"><p>PASAL 8</p><p>DOMISILI HUKUM</p></h3>
      <p>Mengenai perjanjian ini dan segala akibat serta pelaksanaannya, Para Pihak menerangkan telah memilih tempat kedudukan hukum yang tetap dan umum di Kantor Panitera Pengadilan Negeri Bandung, demikian dengan tidak mengurangi hak dari <strong>KREDITUR</strong> untuk memohon gugatan atau pelaksanaan eksekusi dari perjanjian ini melalui Peradilan lainnya dalam wilayah Republik Indonesia.</p>


      <div class="grid grid-cols-2 gap-14 mt-12">
        <div class="text-center">
          <p class="font-semibold">KREDITUR</p>
          <p class="mb-16 font-semibold">${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          }</p>
          <p class="mb-12 text-xs opacity-0">Materai</p>
          <p class="font-semibold w-[50%] border-b">${
            process.env.NEXT_PUBLIC_APP_AKAD_NAME
          }</p>
          <p>${(
            process.env.NEXT_PUBLIC_APP_AKAD_JABATAN || "DIREKTUR UTAMA"
          ).toUpperCase()}</p>
        </div>
        <div class="text-center">
          <p class="font-semibold">DEBITUR</p>
          <p class="mb-16 font-semibold h-6"></p>
          <p class="mb-12 text-xs opacity-50">Materai</p>
          <p class="font-semibold w-[50%] border-b">${
            data.Debitur.nama_penerima
          }</p>
          <p>DEBITUR</p>
        </div>
      </div>
  `;
};
