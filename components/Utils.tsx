"use client";

import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Select, Upload, UploadProps } from "antd";
import moment from "moment";
import { useState } from "react";
// const { PV } = require("@formulajs/formulajs");
import { PV } from "@formulajs/formulajs";

export interface IFormInput {
  label: string;
  value?: any;
  onChange?: Function;
  prefix?: any;
  suffix?: any;
  mode?: "vertical" | "horizontal";
  type?:
    | "text"
    | "number"
    | "select"
    | "date"
    | "textarea"
    | "password"
    | "upload";
  options?: Array<{ label: string; value: any }>;
  disabled?: boolean;
  required?: boolean;
  labelIcon?: any;
  class?: any;
  accept?: string;
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
      {data.type === "upload" && (
        <UploadComponents
          accept={data.accept || ""}
          file={data.value}
          setFile={(e: string) => data.onChange && data.onChange(e)}
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
  const tmp = max_usia - usia_tahun;
  const max_tenor = usia_tahun <= max_usia ? tmp * 12 - (usia_bulan + 1) : 0;
  return max_tenor;
}

export function getMaxPlafond(
  mg_bunga: number,
  tenor: number,
  max_angsuran: number
) {
  const maxPlafond =
    Number(PV(mg_bunga / 100 / 12, tenor, max_angsuran, 0, 0)) * -1;
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

const UploadComponents = ({
  file,
  setFile,
  accept,
}: {
  file: string | undefined;
  setFile: Function;
  accept: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (resData.secure_url) {
        setFile(resData.secure_url);
      } else {
        setError(resData.error.message);
      }
    } catch (err) {
      console.log(err);
      setError("Internal Server Error");
    }
  };

  const handleDeleteFiles = async () => {
    setLoading(true);
    await fetch("/api/upload", {
      method: "DELETE",
      body: JSON.stringify({ publicId: file }),
    })
      .then(() => {
        setFile(undefined);
      })
      .catch((err) => {
        console.log(err);
        setError("Gagal hapus file!.");
      });
    setLoading(false);
  };

  const props: UploadProps = {
    beforeUpload: async (file) => {
      setLoading(true);
      await handleUpload(file);
      setLoading(false);
      return false; // prevent automatic upload
    },
    showUploadList: false, // sembunyikan default list
    accept: accept,
  };

  return (
    <div>
      {file ? (
        <div className="flex gap-2 items-center">
          <p>{file.substring(0, 50) + "..."}</p>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteFiles()}
            loading={loading}
          ></Button>
        </div>
      ) : (
        <div>
          <Upload {...props}>
            <Button
              size="small"
              icon={<CloudUploadOutlined />}
              loading={loading}
            >
              Upload Berkas
            </Button>
          </Upload>
          {error && <p className="italic text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};
