import {
  Area,
  Cabang,
  Dapem,
  Debitur,
  JenisPembiayaan,
  ProdukPembiayaan,
  Role,
  User,
} from "@prisma/client";

export interface IUser extends User {
  Role: Role;
}

export interface IPermission {
  name: string;
  path: string;
  access: string[];
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
interface ICabang extends Cabang {
  Area: Area;
}
export interface IAO extends User {
  Role: Role;
  Cabang: ICabang;
}
export interface IDapem extends Dapem {
  Debitur: Debitur;
  ProdukPembiayaan: ProdukPembiayaan;
  JenisPembiayaan: JenisPembiayaan;
  CreatedBy: User;
  AO: IAO;
}
