"use client";
import { Document, Page, PDFViewer, Text } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { IDapem } from "../IInterfaces";
import { HeaderTwoLogo } from "./Util";

const tw = createTw({
  colors: {
    custom: "#bada55",
  },
});

export default function Akad({ data }: { data: IDapem }) {
  return (
    <PDFViewer className="w-full h-[80vh]">
      <Document style={{ fontSize: 9, textAlign: "justify" }}>
        <Page size={"A4"} style={{ ...tw("py-8 px-16") }}>
          <HeaderTwoLogo
            logo={
              data.ProdukPembiayaan.Sumdan.logo ||
              process.env.NEXT_PUBLIC_APP_LOGO ||
              "/vercel.svg"
            }
            title={"PERJANJIAN KREDIT"}
            subtitle={data.akad_nomor || "001"}
          />
          <Text>
            Pada hari ini, Senin 20 Agustus 2025 (20/08/2025), telah dibuat dan
            ditandatangani Perjanjian Kredit (Selanjutnya disebut "PERJANJIAN")
            oleh dan antara:
          </Text>
        </Page>
      </Document>
    </PDFViewer>
  );
}
