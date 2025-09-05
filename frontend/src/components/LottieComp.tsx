import React, { Suspense } from "react";

// Ladda lottie-react dynamiskt
const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  style?: object;
}

export default function LottieComp({ animationData, loop, autoplay, style }: Props) {
  return (
    <Suspense fallback={<div />}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} style={style} />
    </Suspense>
  );
}
