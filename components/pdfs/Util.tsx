"use client";
import { Image, Text, View } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

const tw = createTw({
  colors: {
    custom: "#bada55",
  },
});

export const HeaderTwoLogo = ({
  logo,
  title,
  subtitle,
}: {
  logo: string;
  title: string;
  subtitle?: string;
}) => {
  return (
    <View style={tw("flex flex-row justify-between items-center gap-4 mb-8")}>
      <Image
        src={process.env.NEXT_PUBLIC_APP_LOGO}
        style={{ width: 50, height: 50 }}
      />
      <View style={tw("flex flex-col items-center justify-center")}>
        <Text style={tw("font-bold text-base")}>{title}</Text>
        <Text style={tw("text-sm")}>{subtitle}</Text>
      </View>
      <Image src={logo} style={{ width: 50, height: 50 }} />
    </View>
  );
};
