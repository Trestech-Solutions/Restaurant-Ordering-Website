import React, { Suspense, ReactElement } from "react";
import Loader from "../src/component/loader";

export const withSuspense = (element) => (
  <Suspense fallback={<Loader />}>
    {element}
  </Suspense>
);