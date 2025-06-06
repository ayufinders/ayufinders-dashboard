"use client";
import React from "react";
import { RecoilRoot } from "recoil";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

export default layout;
