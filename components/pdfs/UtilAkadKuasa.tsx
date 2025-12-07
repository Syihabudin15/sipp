"use client";
import { IDapem } from "../IInterfaces";
import { getAngsuran, IDRFormat } from "../Utils";
import moment from "moment";
import { HeaderNoLogo, numberToWordsID } from "./UtilAkad";

export const DebetRekening = (data: IDapem) => {
  return `
    ${HeaderNoLogo(
      data,
      "SURAT PERNYATAAN DAN KUASA DEBET REKENING",
      `${data.id.replace("-", "")}/${
        process.env.NEXT_PUBLIC_APP_SHORTNAME
      }SPKDR/${data.AO.Cabang.Area.id.replace(
        "-",
        ""
      )}${data.AO.Cabang.id.replace("-", "")}/${moment(data.akad_date).format(
        "MMYYYY"
      )}`
    )}

    <p>Yang bertandatangan dibawah ini :</p>
    <div class="ml-5 my-5">
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

    <p>Sehubungan dengan ini saya menyatakan telah mendapat pembiayaan dari ${
      process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
    } Sebesar Rp. ${IDRFormat(data.plafond)},- (${numberToWordsID(
    data.plafond
  )} Rupiah), atau sejumlah yang disetujui oleh ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  } serta sesuai dengan surat Perjanjian Kredit/Pembiayaan nomor ${
    data.akad_nomor || "....................................."
  } yang telah saya tandatangani, yang pembayaran gaji pensiunnya dibayarkan di ${
    data.mutasi_ke || data.mutasi_from
  }, maka dengan ini saya menyatakan :</p>

    <ol class="list-decimal ml-5">
      <li>Pada saat dana pensiun saya sudah masuk ke rekening ${
        data.mutasi_ke || data.mutasi_from
      }, dengan ini saya memberi kuasa kepada ${
    data.mutasi_ke || data.mutasi_from
  }, untuk melakukan pemotongan dana pensiun saya untuk membayar angsuran sebesar Rp. ${IDRFormat(
    getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      data.pembulatan
    ).angsuran
  )},- (${numberToWordsID(
    getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      data.pembulatan
    ).angsuran
  )} Rupiah) sampai dengan pinjaman/kewajiban saya lunas dan hasil potongan tersebut disetorkan ke rekening ${
    process.env.NEXT_PUBLIC_APP_DROPPING_REK_BANK
  } a.n ${
    process.env.NEXT_PUBLIC_APP_DROPPING_REK_NAME
  } dengan nomor rekening ${process.env.NEXT_PUBLIC_APP_DROPPING_REK}.</li>
      <li>Bahwa sisa gaji saya sendiri pada saat ini dan seterusnya (sampai pembiayan saya lunas) benar-benar cukup untuk dipotong sejumhlah tersebut diatas, dan jika ternyata dikemudian hari gaji saya tidak cukup jumlahnya untuk dipotong karena sebab apapun, maka berarti saya telah melakukan tindakan pidana pemalsuan data/keterangan</li>
      <li>Bahwa sepenuhnya dari pembiayaan yang saya ambil/terima tersebut benar-benar saya pergunakan untuk keperluan saya sendiri dan saya tidak akan mengalihkan tempat pengambilan gaji pensiun saya ketempat lain sampai dengan pembiayaan saya lunas sepenuhnya.</li>
      <li>Bahwa saya sanggup melunasi pembiayaan saya kepada ${
        process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
      }, apabila saya melakukan pernikahan yang menyebabkan tunjangan pensiun (Janda/Duda**) hilang.</li>
    </ol>

    <div class="my-5">
      <p>Pemberian kuasa ini tidak otomatis melepaskan tanggungjawab saya terhadap kelancaran pembayaran angsuran pembiayaan tersebut sampai dengan lunas tepat waktunya, sehingga saya sebagai pihak pemberi kuasa bertanggung jawab penuh terhadap segala macam tindakan penerima kuasa yang berkaitan dengan Surat Kuasa ini. Dan saya memberikan wewenang kepada pihak ${
        process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
      }, untuk membantu melakukan penagihan apabila ada keterlambatan dalam penyerahan uang hasil pemotongan gaji pensiun saya tersebut.</p>
    </div>

    <p>Demikian Surat Pernyataan dan Kuasa ini dibuat dalam keadaan sadar dan tanpa paksaan dari pihak manapun, untuk dapat dipergunakan sebagaimana mestinya.</p>
      <p class="mt-8 mb-3">${data.Debitur.kota}, ${moment(
    data.akad_date
  ).format("DD-MM-YYYY")}</p>


    <div class="grid grid-cols-2 gap-14">
        <div class="text-center">
          <p class="font-semibold">Mengetahui</p>
          <p class="font-semibold">${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          }</p>
          <br /><br /><br /><br /><br />
          <div class="border border-b"></div>
        </div>
        <div class="text-center">
          <p class="font-semibold">Pemberi Kuasa</p>
          <br /><br /><br /></br /><br />
          <p >${data.Debitur.nama_penerima}</p>
          <div class="border border-b"></div>
        </div>
      </div>
  `;
};

export const FlaggingKantorBayar = (data: IDapem) => {
  return `
    ${HeaderNoLogo(
      data,
      "SURAT PERNYATAAN DEBITUR",
      `MITRA KERJA ${data.mutasi_ke || data.mutasi_from}`
    )}

    <p>Yang bertandatangan dibawah ini :</p>
    <div class="ml-5 my-5">
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

    <p>Sehubungan dengan ini saya menyatakan telah mendapat pembiayaan dari ${
      process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
    } Sebesar Rp. ${IDRFormat(data.plafond)},- (${numberToWordsID(
    data.plafond
  )} Rupiah), atau sejumlah yang disetujui oleh ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  } serta sesuai dengan surat Perjanjian Kredit/Pembiayaan nomor ${
    data.akad_nomor || "....................................."
  } yang telah saya tandatangani, yang pembayaran gaji pensiunnya dibayarkan di ${
    data.mutasi_ke || data.mutasi_from
  }, maka dengan ini saya menyatakan :</p>

    <ol class="list-decimal ml-5">
      <li>Pada saat penerimaan pembayaran Manfaat Tabungan Hari Tua (THT) dan/atau Pensiun saya setiap bulan dari <strong>${
        data.Debitur.kelompok_pensiun
      }</strong>, agar dibayarkan melalui rekening saya nomor ${
    data.Debitur.norek
  } atas nama ${data.Debitur.nama_penerima} pada ${
    data.Debitur.bank
  } sampai dengan kredit saya lunas.</li>
      <li>Memberi kuasa kepada ${
        data.mutasi_ke || data.mutasi_from
      }, untuk melakukan Pengecekan Data kepesertaan saya dan sekaligus untuk mendaftarkan Flagging Data saya pada ${
    data.Debitur.bank
  } selama jangka waktu kredit yang telah disetujui yaitu dari tanggal ${moment(
    data.akad_date
  ).format("LL")} sampai dengan ${moment(data.akad_date)
    .add(data.tenor, "month")
    .format("LL")}</li>
    </ol>

    <p class="mt-5">Demikian surat pernyataan dan kuasa ini saya buat, untuk dipergunakan sebagaimana mestinya.</p>

    <p class="mt-8 mb-3">${data.Debitur.kota}, ${moment(data.akad_date).format(
    "DD-MM-YYYY"
  )}</p>

    <div class="grid grid-cols-2 gap-14">
        <div class="text-center">
          <p class="font-semibold">Mengetahui</p>
          <p class="font-semibold">${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          }</p>
          <br /><br /><br /><br /><br />
          <div class="border border-b"></div>
        </div>
        <div class="text-center">
          <p class="font-semibold">Yang menyatakan</p>
          <br /><br /><br /></br /><br />
          <p >${data.Debitur.nama_penerima}</p>
          <div class="border border-b"></div>
        </div>
      </div>

      <div class="mt-8 opacity-80 italic">
        <p>Catatan : </p>
        <ol class="list-decimal ml-5">
          <li>Lembar 1 untuk ${data.Debitur.kelompok_pensiun}</li>
          <li>Lembar 2 untuk ${data.mutasi_ke || data.mutasi_from}</li>
          <li>Lembar 3 untuk Debitur (${data.Debitur.nama_penerima})</li>
          <li>Lembar 4 untuk arsip ${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          }</li>
        </ol>
      </div>
  `;
};

export const PemotonganDSR = (data: IDapem) => {
  return `
    ${HeaderNoLogo(data, "SURAT PERNYATAAN", "PEMOTONGAN GAJI DIATAS 70%")}

    <p>Yang bertandatangan dibawah ini :</p>
    <div class="ml-5 my-5">
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

    <p>Sehubungan saya memerlukan dana yang cukup besar, maka saya mengambil fasilitas pembiayaan dari ${
      process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
    } dan dengan ini menyatakan :</p>

    <ol class="list-decimal ml-5 my-5">
      <li>
        <p>Bersedia membayar angsuran pembiayaan diatas 70% dari gaji pensiun yang saya terima setiap bulan, karena :</p>
        <ul class="list-disc list-outside ml-8">
          <li>Saya memiliki penghasilan tetap dari usaha diluar gaji pensiun.*)</li>
          <li>Saya mendapat tunjangan dari keluarga (anak-anak) setiap bulan yang jumlahnya dapat menutupi kekurangan jika sisa gaji pensiun tidak mencukupi untuk kebutuhan sehari-hari.*)</li>
        </ul>
      </li>
      <li>
        Saya bertanggung jawab atas pengambilan sisa gaji saya setiap bulannya di Kantor Bayar Gaji yang ditunjuk oleh ${
          process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
        } yaitu ${data.mutasi_ke || data.mutasi_from} melalui ${
    data.Debitur.bank
  }.
      </li>
    </ol>

    <p class="mt-5">Demikian surat pernyataan ini dibuat dengan sebenarnya dengan dilandasi itikad baik tanpa paksaan dari siapapun dan pihak manapun.</p>

    <p class="mt-8 mb-3">${data.Debitur.kota}, ${moment(data.akad_date).format(
    "DD-MM-YYYY"
  )}</p>

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
  `;
};

export const Kesanggupan = (data: IDapem) => {
  return `
    ${HeaderNoLogo(
      data,
      "SURAT PERNYATAAN DAN KESANGGUPAN",
      "MEMATUHI SYARAT DAN KETENTUAN PEMBIAYAAN"
    )}

    <p>Yang bertandatangan dibawah ini :</p>
    <div class="ml-5 my-5">
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

    <p>Dengan ini saya menyatakan dan menyanggupi Syarat serta Ketentuan Pembiayaan yang berlaku dari ${
      process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
    } yaitu sebagai berikut :</p>

    <ol class="list-decimal ml-5 my-5">
      <li>Telah menerima fasilitas pembiayaan dari ${
        data.ProdukPembiayaan.Sumdan.name
      } melalui ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  } sebesar Rp. ${IDRFormat(data.plafond)},- (${numberToWordsID(
    data.plafond
  )} Rupiah) dengan besar angsuran setiap bulannya Rp. ${IDRFormat(
    getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      data.pembulatan
    ).angsuran
  )},- (${numberToWordsID(
    getAngsuran(
      data.plafond,
      data.tenor,
      data.margin + data.margin_sumdan,
      data.pembulatan
    ).angsuran
  )} Rupiah), selama ${data.tenor} bulan, terhitung mulai ${moment(
    data.akad_date
  ).format("LL")} sampai dengan ${moment(data.akad_date)
    .add(data.tenor, "month")
    .format("LL")}.</li>
      <li>Telah memperoleh penjelasan mengenai karakteristik Pembiayaan Pensiun serta telah mengerti dan memahami segala konsekuensinya, termasuk manfaat, resiko dan biaya – biaya yang timbul terkait dengan Pembiayaan Pensiun.</li>
      <li>
        Bersedia mematuhi dan menyetujui ketentuan pembatalan Pembiayaan sebagai berikut :
        <ol class="list-disc ml-8 list-outside">
          <li>Untuk pengajuan Kredit yang telah disetujui tetapi belum dilakukan pencairan dana dikenakan penalti biaya administrasi pembatalan sebesar 1% dari plafon yang disetujui.</li>
          <li>Untuk pengajuan yang telah disetujui dan telah dilakukan pencairan dana dikenakan penalti biaya administrasi dengan ketentuan jika pembatalan dilakukan :</li>
            <ul class="list-disc list-outside ml-11">
              <li>H+2 setelah pencairan denda penalti sebesar 1% dari plafon.</li>
              <li>Lewat bulan setelah pencairan denda penalti sebesar 5% dari plafon.</li>
              <li>Dana harus dikembalikan sejak pemberitahuan pembatalan sejumlah dana pencairan + penalti biaya administrasi.</li>
            </ul>
        </ol>
      </li>
      <li>
        <p>Bersedia mematuhi dan menyetujui ketentuan dan persyaratan pelunasan dipercepat (pelunasan lanjut) sebagai berikut :</p>
        <ol class="list-disc ml-8 list-outside">
          <li>Pelunasan Lanjut/Topup dapat dilakukan setelah angsuran ke 5 terproses autodebet.</li>
          <li>Nominal pelunasan dihitung dari sisa/saldo pokok angsuran terakhir yang terproses autodebet, ditambah tunggakan dan denda keterlambatan angsuran (jika ada).</li>
          <li>Batas waktu akhir pelunasan lanjut adalah tanggal 25 setiap bulannya.</li>
        </ol>
      </li>
      <li>
        <p>Bersedia mematuhi dan menyetujui ketentuan dan persyaratan pelunasan dipercepat (pelunasan lepas) sebagai berikut :</p>
        <ol class="list-disc ml-8 list-outside">
          <li>Pelunasan Lepas baru dapat dilakukan setelah angsuran ke 8 terproses autodebet.</li>
          <li>Biaya administrasi pelunasan lepas adalah 3x angsuran.</li>
          <li>Nominal pelunasan dihitung dari sisa/saldo pokok angsuran terakhir yang terproses autodebet, ditambah tunggakan dan denda keterlambatan angsuran (jika ada), ditambah biaya administrasi pelunasan lepas 3x angsuran.</li>
          <li>Batas waktu akhir pelunasan lepas adalah tanggal 25 setiap bulannya.</li>
          <li>Debitur diwajibkan melakukan konfirmasi ke Kantor Pusat seacara langsung maupun via telepon untuk mendapatkan nominal pelunasan serta data rekening ${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          } untuk penyetoran dana pelunasan, dan penyetoran uang pelunasan tersebut wajib disetorkan sendiri ke rekening ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  }.</li>
          <li>Pengambilan Surat Keputusan (SK) Pensiun Asli dapat dilakukan paling cepat tanggal 1 bulan berikutnya.</li>
          <li>Tidak diperkenankan melakukan penyetoran sejumlah uang pelunasan kepada petugas dilapangan. Apabila hal tersebut dilakukan, ${
            process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
          } tidak bertanggung jawab jika terjadi hal-hal yang tidak diinginkan.</li>
        </ol>
      </li>
      <li>Apabila diperlukan bersedia untuk dilakukan pemindahan Kantor Bayar Gaji Pensiun ke Kantor Bayar Gaji Pensiun yang ditunjuk oleh ${
        process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
      }.</li>
      <li>Terhitung mulai ${moment(data.akad_date).format(
        "LL"
      )}, apabila gaji pensiun saya tidak terpotong/terdebet oleh kantor bayar gaji pensiunan saya, maka saya akan melakukan penyetoran kewajiban angsuran saya secara tunai/transfer kepada ${
    process.env.NEXT_PUBLIC_APP_AKAD_COMPANY
  }.</li>
    </ol>

    <p class="mt-5">Demikian surat pernyataan ini dibuat dengan sebenarnya dengan dilandasi itikad baik tanpa paksaan dari siapapun dan pihak manapun.</p>

    <p class="mt-8 mb-3">${data.Debitur.kota}, ${moment(data.akad_date).format(
    "DD-MM-YYYY"
  )}</p>

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

      <p class="mt-8 italic opacity-70">Note : Dibuat rangkap 2 untuk Debitur dan Kreditur. Ditandatangani oleh Debitur disetiap halaman!</p>
  `;
};
