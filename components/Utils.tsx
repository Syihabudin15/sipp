"use client";

import { Input, Select } from "antd";
import moment from "moment";
const { PV } = require("@formulajs/formulajs");

export interface IFormInput {
  label: string;
  value?: any;
  onChange?: Function;
  prefix?: any;
  suffix?: any;
  mode?: "vertical" | "horizontal";
  type?: "text" | "number" | "select" | "date" | "textarea" | "password";
  options?: Array<{ label: string; value: any }>;
  disabled?: boolean;
  required?: boolean;
  labelIcon?: any;
  class?: any;
}

export const FormInput = ({ data }: { data: IFormInput }) => {
  return (
    <div
      className={`flex ${
        data.mode === "vertical" ? "flex-col" : "items-center"
      } gap-2 mb-1 ${data.class}`}
    >
      <p className="w-52">
        {data.labelIcon && <span className="mr-1">{data.labelIcon}</span>}
        {data.label}
        {data.required && <span style={{ color: "red" }}>*</span>}
      </p>
      {data.type === "text" && (
        <Input
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
          prefix={data.prefix}
          suffix={data.suffix}
          disabled={data.disabled}
          required={data.required}
        />
      )}
      {data.type === "date" && (
        <Input
          type={"date"}
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
          prefix={data.prefix}
          suffix={data.suffix}
          disabled={data.disabled}
          required={data.required}
        />
      )}
      {data.type === "number" && (
        <Input
          type={"number"}
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
          prefix={data.prefix}
          suffix={data.suffix}
          disabled={data.disabled}
          required={data.required}
        />
      )}
      {data.type === "textarea" && (
        <Input.TextArea
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
          prefix={data.prefix}
          disabled={data.disabled}
          required={data.required}
        />
      )}
      {data.type === "select" && (
        <Select
          options={data.options}
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e)}
          prefix={data.prefix}
          suffix={data.suffix}
          disabled={data.disabled}
          allowClear
          style={{ width: "100%" }}
        />
      )}
      {data.type === "password" && (
        <Input.Password
          value={data.value}
          onChange={(e) => data.onChange && data.onChange(e.target.value)}
          prefix={data.prefix}
          suffix={data.suffix}
          disabled={data.disabled}
          required={data.required}
        />
      )}
    </div>
  );
};

export const IDRFormat = (number: number) => {
  const temp = new Intl.NumberFormat("de-DE", {
    style: "decimal",
    currency: "IDR",
  }).format(number);
  return temp;
};

export const IDRToNumber = (str: string) => {
  return parseInt(str.replace(/\D/g, ""));
};

export function getFullAge(startDate: string, endDate: string) {
  const momentBirthdate = moment(startDate, "YYYY-MM-DD");
  const dateNow = moment(endDate);

  const durasi = moment.duration(dateNow.diff(momentBirthdate));

  const year = durasi.years();
  const month = durasi.months();
  const day = durasi.days();

  return { year, month, day };
}

export function getMaxTenor(
  max_usia: number,
  usia_tahun: number,
  usia_bulan: number
) {
  let tmp = max_usia - usia_tahun;
  const max_tenor = usia_tahun <= max_usia ? tmp * 12 - (usia_bulan + 1) : 0;
  return max_tenor;
}

export function getMaxPlafond(
  mg_bunga: number,
  tenor: number,
  max_angsuran: number
) {
  const maxPlafond = PV(mg_bunga / 100 / 12, tenor, max_angsuran, 0, 0) * -1;
  return maxPlafond;
}

export const getAngsuran = (
  plafond: number,
  tenor: number,
  bunga: number,
  rounded: number
) => {
  const r = bunga / 12 / 100;

  const angsuran =
    (plafond * (r * Math.pow(1 + r, tenor))) / (Math.pow(1 + r, tenor) - 1);
  const pokok = plafond / tenor;
  const margin = angsuran - pokok;

  return {
    angsuran: Math.ceil(angsuran / rounded) * rounded,
    pokok,
    margin,
  };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
