import {
  Angsuran,
  Area,
  Cabang,
  Dapem,
  Debitur,
  JenisPembiayaan,
  Keluarga,
  Pelunasan,
  Pencairan,
  PenyerahanBerkas,
  PenyerahanJaminan,
  ProdukPembiayaan,
  Role,
  Sumdan,
  User,
} from "@prisma/client";

export interface IUser extends User {
  Role: Role;
}
export interface IRole extends Role {
  User: User[];
}
export interface INotif {
  verif: number;
  slik: number;
  approv: number;
  akad: number;
  si: number;
  dropping: number;
  cpb: number;
  pb: number;
  ctbo: number;
  tbo: number;
  pelunasan: number;
}

export interface IPermission {
  name: string;
  path: string;
  access: string[];
}

export interface IViewFiles {
  open: boolean;
  data: { name: string; url: string }[];
}

export interface IActionTable<T> {
  openUpsert: boolean;
  selected: T | undefined;
  openDelete: boolean;
}

export interface IPageProps<T> {
  page: number;
  limit: number;
  search: string;
  total: number;
  data: T[];
  [key: string]: any;
}

export interface IUnit extends Area {
  Cabang: Cabang[];
}
export interface ICabang extends Cabang {
  Area: Area;
}
export interface IAO extends User {
  Role: Role;
  Cabang: ICabang;
}
export interface IDebitur extends Debitur {
  Keluarga: Keluarga[];
}
export interface IProdukPembiayaan extends ProdukPembiayaan {
  Sumdan: Sumdan;
}
export interface IDapem extends Dapem {
  Debitur: IDebitur;
  ProdukPembiayaan: IProdukPembiayaan;
  JenisPembiayaan: JenisPembiayaan;
  CreatedBy: User;
  AO: IAO;
  PenyerahanBerkas: PenyerahanBerkas;
  PenyerahanJaminan: PenyerahanJaminan;
  Pelunasan: Pelunasan;
  Angsuran: Angsuran[];
}

export interface IPencairan extends Pencairan {
  Dapem: IDapem[];
  Sumdan: Sumdan;
}
export interface IPenyerahanBerkas extends PenyerahanBerkas {
  Dapem: IDapem[];
  Sumdan: Sumdan;
}
export interface IPenyerahanJaminan extends PenyerahanJaminan {
  Dapem: IDapem[];
  Sumdan: Sumdan;
}

export interface IPelunasan extends Pelunasan {
  Dapem: IDapem;
}

export interface IDebitur extends Debitur {
  Keluarga: Keluarga[];
  Dapem: IDapem[];
}

export interface IAngsuran extends Angsuran {
  Dapem: IDapem;
}
