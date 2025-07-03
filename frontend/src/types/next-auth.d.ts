// types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** your custom fields */
      id: string;
      role: string;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** returned from your authorize() */
    id: string;
    role: string;
    accessToken: string;
  }
}
// next-auth.d.ts

import NextAuth, { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** id user (dari token.sub) */
      id: string;
      /** nama user */
      name: string;
      /** role user */
      role: string;
      /** token dari backend */
      accessToken: string;
    } & Omit<DefaultSession["user"], "name">;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** simpan accessToken di sini */
    accessToken?: string;
    /** role agar bisa dicek di authorized callback */
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** carried through in the token */
    sub: string;
    role: string;
    accessToken: string;
  }
}

// declare module "next-auth" {
//   interface User {
//     id: string;
//     name: string;
//     email: string;
//     accessToken?: string;
//     role: string;
//   }
//   interface Session {
//     user: User;
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    accessToken?: string;
    role: string;
  }

  interface User {
    profile: {
      id: string;
      role_id: number;
      role_name: string;
      role_code: string;
      role: string;
    };
    token: string;
  }
  interface Session {
    user: User.profile;
    accessToken: string;
  }

  interface Token {
    accessToken: string;
    user: User.profile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role_id: number;
    role_name: string;
    role_code: string;
  }
}

export interface Notification {
  id: number;
  message: string;
  type: string;
}

export interface Endpoints {
  lookup: string;
  list: string;
  create: string;
  update: string;
  delete: string;
  detail: string;
}

export interface UrlConfig {
  list: string;
  create: string;
  update: string;
  delete: string;
  detail: string;
}

export interface ActionConfig {
  create: boolean;
  update: boolean;
  delete: boolean;
  detail: boolean;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

export interface Products {
  label: string;
  endpoints: Endpoints;
  url: UrlConfig;
  actionConfig: ActionConfig;
  createConfig: FieldConfig[];
  updateConfig: FieldConfig[];
  listConfig: FieldConfig[];
  detailConfig: FieldConfig[];
  beforeInsert: (data: any) => any;
  afterInsert: (data: any) => any;
  beforeUpdate: (data: any) => any;
  afterUpdate: (data: any) => any;
}

export interface ProductCategories {
  label: string;
  endpoints: Endpoints;
  url: UrlConfig;
  actionConfig: ActionConfig;
  createConfig: FieldConfig[];
  updateConfig: FieldConfig[];
  listConfig: FieldConfig[];
  detailConfig: FieldConfig[];
  beforeInsert: (data: any) => any;
  afterInsert: (data: any) => any;
  beforeUpdate: (data: any) => any;
  afterUpdate: (data: any) => any;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

export interface IndexProps {
  label: string;
  changeData: (key: string, value: any) => void;
  data: Record<string, any>;
  models: {
    createConfig: FieldConfig[];
  };
}
