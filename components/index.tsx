"use client";
import dynamic from "next/dynamic";

export const ILayout = dynamic(() => import("./ILayout"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const FormInput = dynamic(
  () => import("./Utils").then((mod) => mod.FormInput),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

export const DetailDapem = dynamic(() => import("./DetailDapem"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
