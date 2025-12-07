import moment from "moment";
import { IPencairan } from "../IInterfaces";
import { IDRFormat } from "../Utils";

export const HeaderTwoLogoCustom = (data: any, title?: string) => {
  return `
    <div class="page-header flex items-center justify-between mb-6 border-b pb-4">
      <img src="${
        process.env.NEXT_PUBLIC_APP_LOGO || "/app_logo.png"
      }" alt="Logo" class="h-16 mr-4" />
      <div class="text-center">
        <h2 class="text-center text-xl font-semibold mb-2 underline">${
          title || "PERJANJIAN KREDIT"
        }</h2>
        <p class="text-center ">${data.id}</p>
      </div>
      <img src="${
        data.Sumdan.logo || process.env.NEXT_PUBLIC_APP_LOGO || "/app_logo.png"
      }" alt="Logo BPR" class="h-16 mr-4" />
    </div>
  `;
};
export const PermohonanDropping = (data: IPencairan) => {
  return `
    ${HeaderTwoLogoCustom(data, "PERMOHONAN DROPPING DANA")}

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
        <p>Permohonan Dropping Dana Pembiayaan</p>
      </div>
    </div>
    
    <div class="my-5">
      <p>Kepada Yth</p>
      <p>Direktur <strong>${data.Sumdan.name}</strong></p>
      <p>Di tempat</p>
    </div>

    <div class="my-5">
      <p>Bersama surat ini, kami ${
        process.env.NEXT_PUBLIC_APP_AKAD_NAME
      } mengajukan permohonan Dropping Dana Pembiayaan atas permohonan kredit yang telah disetujui oleh Komite ${
    data.Sumdan.name
  }. Adapun rekap Dropping Dana Pembiayaan tersebut adalah sebagai berikut :</p>

      <div class="my-5">
        <div class="flex gap-2">
          <p class="w-44">Jumlah End user</p>
          <p class="w-4">:</p>
          <p>${data.Dapem.length}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-44">Nominal Plafond</p>
          <p class="w-4">:</p>
          <p>Rp. ${IDRFormat(
            data.Dapem.reduce((acc, cur) => acc + cur.plafond, 0)
          )}</p>
        </div>
        <div class="flex gap-2">
          <p class="w-44">Nominal Dropping</p>
          <p class="w-4">:</p>
          <p>Rp. ${IDRFormat(
            data.Dapem.reduce(
              (acc, cur) =>
                acc +
                (cur.plafond -
                  (cur.plafond * (cur.c_adm_sumdan / 100) + cur.c_rekening)),
              0
            )
          )}</p>
        </div>
        <div class="flex gap-2 italic opacity-80">
          <p class="w-44">Note</p>
          <p class="w-4">:</p>
          <p>Rincian data kami lampirkan bersama dengan surat ini pada halaman 2 (lampiran).</p>
        </div>
      </div>
      
      <div class="my-5">
        
        <p>Debitur-debitur tersebut telah memenuhi seluruh persyaratan administrasi serta dinyatakan layak untuk pencairan berdasarkan hasil verifikasi dan kelengkapan berkas yang telah disetujui sebelumnya oleh pihak ${
          data.Sumdan.name
        }.</p>
        <p>Sehubung dengan hal tersebut, kami memohon agar pihak ${
          data.Sumdan.name
        } dapat melakukan Dropping Dana Pembiayaan sesuai ketentuan yang berlaku dan mentransfer ke rekening ${
    process.env.NEXT_PUBLIC_APP_AKAD_NAME
  } sebagai berikut :</p>
        <ul class="list-disc list-outside mb-4 mt-2">
          <li class="flex">
            <p class="w-44">Nama Bank</p>
            <p class="w-4">:</p>
            <p>${process.env.NEXT_PUBLIC_APP_DROPPING_REK_BANK}</p>
          </li>
          <li class="flex">
            <p class="w-44">No. Rekening</p>
            <p class="w-4">:</p>
            <p>${process.env.NEXT_PUBLIC_APP_DROPPING_REK}</p>
          </li>
          <li class="flex">
            <p class="w-44">Atas Nama</p>
            <p class="w-4">:</p>
            <p>${process.env.NEXT_PUBLIC_APP_DROPPING_REK_NAME}</p>
          </li>
        </ul>
      </div>
      <p>Dana tersebut selanjutnya akan kami teruskan kepada debitur sesuai prosedur dan perjanjian kerja sama yang berlaku. Demikian Permohonan Dropping Dana Pembiayaan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>

      <div class="my-10">
        <p>Bandung, ${moment(data.created_at).format("LL")}</p>
        <p>Hormat kami</p>
        <br /><br /><br /><br /><br />
        <p class="font-semibold underline">${
          process.env.NEXT_PUBLIC_APP_DROPPING_NAME
        }</p>
        <p class="font-semibold">${(
          process.env.NEXT_PUBLIC_APP_DROPPING_JABATAN || ""
        ).toUpperCase()}</p>
      </div>
  `;
};

export const LampiranDropping = (data: IPencairan) => {
  return `
    ${HeaderTwoLogoCustom(data, "LAMPIRAN DROPPING DANA")}

    <div class="my-10">
      <p>Lampiran Permohonan Dropping Dana Pembiayaan Nomor ${data.id}</p>
    </div>

    <div class="my-10">
      <table style="width:100%; border-collapse: collapse; margin-top:20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #aaa; padding: 5px; text-align: center;">No</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Pemohon</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Produk Pembiayaan</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Nominal Plafond</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Biaya Administrasi</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Biaya Buka Rekening</th>
            <th style="border: 1px solid #aaa; padding: 5px;text-align: center;">Nominal Dropping</th>
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
                  <p class="text-sm opacity-80">${a.JenisPembiayaan.name}</p>
                </td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                  a.plafond
                )}</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                  a.plafond * (a.c_adm_sumdan / 100)
                )}</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                  a.c_rekening
                )}</td>
                <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
                  a.plafond -
                    (a.plafond * (a.c_adm_sumdan / 100) + a.c_rekening)
                )}</td>
              </tr>
            `;
          }).join("")}
          <tr class="font-semibold">
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;"></td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;"></td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: center;"></td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
              data.Dapem.reduce((sum, a) => sum + a.plafond, 0)
            )}</td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
              data.Dapem.reduce(
                (sum, a) => sum + a.plafond * (a.c_adm_sumdan / 100),
                0
              )
            )}</td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
              data.Dapem.reduce((sum, a) => sum + a.c_rekening, 0)
            )}</td>
            <td style="border: 1px solid #aaa; padding: 1px 3px;text-align: right;">${IDRFormat(
              data.Dapem.reduce(
                (sum, a) =>
                  sum +
                  a.plafond -
                  (a.plafond * (a.c_adm_sumdan / 100) + a.c_rekening),
                0
              )
            )}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};
