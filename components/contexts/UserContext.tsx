"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IUser } from "../IInterfaces";

const userContext = createContext<IUser | undefined>(undefined);
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>();
  const pathname = usePathname();

  const getData = () => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          setUser({
            id: res.data.id,
            fullname: res.data.fullname,
            username: res.data.username,
            password: "",
            email: res.data.email,
            phone: res.data.phone,
            nip: res.data.nip,
            target: res.data.target,
            cabangId: res.data.cabangId,
            sumdanId: res.data.sumdanId,

            status: res.data.status,
            created_at: res.data.created_at,
            updated_at: res.data.updated_at,
            Role: res.data.Role,
            roleId: res.data.roleId,
          });
        } else {
          if (pathname !== "/") {
            window && window.location.replace("/");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <userContext.Provider value={user as IUser}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
