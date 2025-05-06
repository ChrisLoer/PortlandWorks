"use client";

import dynamic from "next/dynamic";

const PerCapitaSunburstClient = dynamic(() => import("./PerCapitaSunburstClient"), { ssr: false });

export default PerCapitaSunburstClient; 
